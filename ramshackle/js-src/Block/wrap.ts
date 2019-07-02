/**
 * Code to wrap an XBlock so that we can embed it in an IFrame
 */
const LMS_BASE_URL = 'http://localhost:18000';

/**
 * Given an XBlock's fragment data (HTML plus CSS and JS URLs), return the
 * inner HTML that should go into an IFrame in order to display that XBlock
 * and interact with the surrounding LabXchange UI and with the LMS.
 * @param html The XBlock's HTML (Fragment.content)
 * @param jsUrls A list of any JavaScript URLs the XBlock may require
 * @param cssUrls A list of any CSS URLs the XBlock may require
 */
export function wrapBlockHtmlForIFrame(html: string, jsUrls: string[], cssUrls: string[]): string {
    const jsTags = jsUrls.map((url) => `<script src="${url}"><\/script>`).join('\n');
    const cssTags = cssUrls.map((url) => `<link rel="stylesheet" href="${url}">`).join('\n');
    const lmsBaseUrl = LMS_BASE_URL;
    const result = `
        <!DOCTYPE html>
        <html>
        <head>
            <!-- Open links in a new tab, not this iframe -->
            <base target="_blank">
            <meta charset="UTF-8">
            <!--
                JS Compatibility hacks.
                Note: ALL XBlocks should be re-written to fully provide their own JS dependencies.
                Each of the following is a hack to work around broken XBlocks that make assumptions
                about the presence of JS libraries in the global scope.

                Over time as we fix the upstream XBlock code, we should remove libraries/hacks from here.
            -->
            <!-- gettext & XBlock JS i18n code -->
            <script type="text/javascript" src="${lmsBaseUrl}/static/js/i18n/en/djangojs.js"><\/script>
            <!-- Most XBlocks require jQuery: -->
            <script src="https://code.jquery.com/jquery-2.2.4.min.js"><\/script>
            <!-- The Video XBlock requires "ajaxWithPrefix" -->
            <script type="text/javascript">
                $.postWithPrefix = $.post;
                $.getWithPrefix = $.get;
                $.ajaxWithPrefix = $.ajax;
            <\/script>
            <!-- The Video XBlock requires "Slider" from jQuery-UI: -->
            <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"><\/script>
            <!-- The video XBlock depends on Underscore.JS -->
            <script type="text/javascript" src="${lmsBaseUrl}/static/common/js/vendor/underscore.js"><\/script>
            <!-- The video XBlock depends on jquery-cookie -->
            <script type="text/javascript" src="${lmsBaseUrl}/static/js/vendor/jquery.cookie.js"><\/script>
            <!-- The video XBlock has an undeclared dependency on edX HTML Utils -->
            <script type="text/javascript" src="${lmsBaseUrl}/static/edx-ui-toolkit/js/utils/global-loader.js"><\/script>
            <script type="text/javascript" src="${lmsBaseUrl}/static/edx-ui-toolkit/js/utils/html-utils.js"><\/script>
            <!--The Video XBlock has an undeclared dependency on 'Logger' -->
            <script>
                window.Logger = { log: function() { } };
            <\/script>
            <!-- Builtin XBlock types depend on RequireJS -->
            <script type="text/javascript" src="${lmsBaseUrl}/static/common/js/vendor/require.js"><\/script>
            <script type="text/javascript" src="${lmsBaseUrl}/static/js/RequireJS-namespace-undefine.js"><\/script>
            <script>
                // The minimal RequireJS configuration required for common LMS building XBlock types to work:
                (function (require, define) {
                    require.config({
                        baseUrl: "${lmsBaseUrl}/static/",
                        paths: {
                            draggabilly: 'js/vendor/draggabilly',
                            hls: 'common/js/vendor/hls',
                            moment: 'common/js/vendor/moment-with-locales',
                        },
                    });
                    define('gettext', [], function() { return window.gettext; });
                    define('jquery', [], function() { return window.jQuery; });
                    define('jquery-migrate', [], function() { return window.jQuery; });
                    define('underscore', [], function() { return window._; });
                }).call(this, require || RequireJS.require, define || RequireJS.define);
            <\/script>
            <!-- The video XBlock (and perhaps others?) expect this global: -->
            <script>
            window.onTouchBasedDevice = function() { return navigator.userAgent.match(/iPhone|iPod|iPad|Android/i); };
            <\/script>
            <!-- At least one XBlock (drag and drop v2) expects Font Awesome -->
            <link rel="stylesheet"
                href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
            ${cssTags}
        </head>
        <body>
            ${html}
            ${jsTags}
            <script>
                window.addEventListener('load', (${blockFrameJS.toString()}));
            <\/script>
        </body>
        </html>
    `;
    return result;
}

/**
 * The JavaScript code which runs inside our IFrame and is responsible
 * for communicating with the parent window.
 *
 * This cannot use any imported functions because it runs in the IFrame,
 * not in our app webpack bundle.
 */
function blockFrameJS() {
    interface XBlockJS {
        element: XBlockElement;
    }

    const CHILDREN_KEY = '_jsrt_xb_children'; // JavaScript RunTime XBlock children
    const USAGE_ID_KEY = '_jsrt_xb_usage_id';
    const HANDLER_URL = '_jsrt_xb_handler_url';
    /**
     * In order to implement the XBlock JavaScript runtime API,
     * we need to store some data in the DOM on the XBlock DOM
     * element itself. This interface defines that data.
     */
    interface XBlockElement extends Element {
        [CHILDREN_KEY]: XBlockJS[];
        [USAGE_ID_KEY]: string;
        // A URL template like
        // 'http://localhost:4556/api/v1/xblocks/secure-handler/d0389377759f2b48a9d9094f1ffca699582fd4c0/handler_name/'
        // That can be used even from within an IFrame (cross-origin friendly).
        // The URL is specific to this XBlock and user.
        [HANDLER_URL]: string;
    }

    /**
     * The JavaScript runtime for any XBlock in the IFrame
     */
    const runtime = {
        /**
         * An obscure and little-used API that retrieves a particular
         * XBlock child using its 'data-name' attribute
         * @param block The root DIV element of the XBlock calling this method
         * @param childName The value of the 'data-name' attribute of the root
         *    DIV element of the XBlock child in question.
         */
        childMap: (block: XBlockElement, childName: string) => {
            return runtime.children(block).find((child) => child.element.getAttribute('data-name') === childName);
        },
        children: (block: XBlockElement) => {
            return block[CHILDREN_KEY];
        },
        /**
         * Get the URL for the specified handler. This method must be synchronous, so
         * cannot make HTTP requests.
         */
        handlerUrl: (block: XBlockElement, handlerName: string, suffix?: string, query?: string): string => {
            let url = block[HANDLER_URL].replace('handler_name', handlerName);
            if (suffix) {
                url += `${suffix}/`;
            }
            if (query) {
                url += `?${query}`;
            }
            return url;
        },
        /**
         * Pass an arbitrary message from the XBlock to the parent application.
         * This is mostly used by the studio_view to inform the user of save events.
         * Standard events are as follows:
         *
         * save: {state: 'start'|'end', message: string}
         * -> Displays a "Saving..." style message + animation to the user until called
         *    again with {state: 'end'}. Then closes the modal holding the studio_view.
         *
         * error: {title: string, message: string}
         * -> Displays an error message to the user
         *
         * cancel: {}
         * -> Close the modal holding the studio_view
         */
        notify: (eventType: string, params: any) => {
            params.method = 'xblock:' + eventType;
            postMessageToParent(params);
        },
    };

    // Recursively initialize the JavaScript code of each XBlock:
    function initializeXBlockAndChildren(element: XBlockElement, callback: (blockJS: XBlockJS) => void) {
        // The newer/pure/Blockstore runtime uses the 'data-usage' attribute, while the LMS uses 'data-usage-id'
        const usageId = element.getAttribute('data-usage') || element.getAttribute('data-usage-id');
        if (usageId !== null) {
            element[USAGE_ID_KEY] = usageId;
        } else {
            throw new Error('XBlock is missing a usage ID attribute on its root HTML node.');
        }

        const version = element.getAttribute('data-runtime-version');
        if (version !== '1') {
            throw new Error('Unsupported XBlock runtime version requirement.');
        }

        // Recursively initialize any children first:
        // We need to find all div.xblock-v1 children, unless they're grandchilden
        // So we build a list of all div.xblock-v1 descendants that aren't descendants
        // of an already-found descendant:
        const childNodesFound: XBlockElement[] = [];
        [].forEach.call(element.querySelectorAll('.xblock, .xblock-v1'), (childNode: Element) => {
            if (!childNodesFound.find((el) => el.contains(childNode))) {
                childNodesFound.push(childNode as XBlockElement);
            }
        });

        // This code is awkward because we can't use promises (IE11 etc.)
        let childrenInitialized = -1;
        function initNextChild() {
            childrenInitialized++;
            if (childrenInitialized < childNodesFound.length) {
                const childNode = childNodesFound[childrenInitialized];
                initializeXBlockAndChildren(childNode, initNextChild);
            } else {
                // All children are initialized:
                initializeXBlock(element, callback);
            }
        }
        initNextChild();
    }

    /**
     * Initialize an XBlock. This function should only be called by initializeXBlockAndChildren
     * because it assumes that function has already run.
     */
    function initializeXBlock(element: XBlockElement, callback: (blockJS: XBlockJS) => void) {
        const usageId = element[USAGE_ID_KEY];
        // Check if the XBlock has an initialization function:
        const initFunctionName = element.getAttribute('data-init');
        if (initFunctionName !== null) {
            // Since this block has an init function, it may need to call handlers,
            // so we first have to generate a secure handler URL for it:
            postMessageToParent({method: 'get_handler_url', usageId}, (handlerData: any) => {
                element[HANDLER_URL] = handlerData.handlerUrl;
                // Now proceed with initializing the block's JavaScript:
                const initFunction = (window as any)[initFunctionName];
                // Does the XBlock HTML contain arguments to pass to the initFunction?
                let data: any = {};
                [].forEach.call(element.children, (childNode: Element) => {
                    // The newer/pure/Blockstore runtime uses 'xblock_json_init_args'
                    // while the LMS runtime uses 'xblock-json-init-args'.
                    if (
                        childNode.matches('script.xblock_json_init_args') ||
                        childNode.matches('script.xblock-json-init-args')
                    ) {
                        data = JSON.parse(childNode.textContent as string);
                    }
                });
                const blockJS: XBlockJS = new initFunction(runtime, element, data) || {};
                blockJS.element = element;
                callback(blockJS);
            });
        } else {
            const blockJS: XBlockJS = {element};
            callback(blockJS);
        }
    }

    const uniqueKeyPrefix = `k${+Date.now()}-${Math.floor(Math.random() * 1e10)}-`;
    let messageCount = 0;
    /**
     * A helper method for sending messages to the parent window of this IFrame
     * and getting a reply, even when the IFrame is securely sandboxed.
     * @param messageData The message to send. Must be an object, as we add a key/value pair to it.
     * @param callback The callback to call when the parent window replies
     */
    function postMessageToParent(messageData: any, callback?: (data: any) => void) {
        const messageReplyKey = uniqueKeyPrefix + (messageCount++);
        messageData.replyKey = messageReplyKey;
        if (callback !== undefined) {
            const handleResponse = (event: MessageEvent) => {
                if (event.source === window.parent && event.data.replyKey === messageReplyKey) {
                    callback(event.data);
                    window.removeEventListener('message', handleResponse);
                }
            };
            window.addEventListener('message', handleResponse);
        }
        window.parent.postMessage(messageData, '*');
    }

    // Find the root XBlock node.
    // The newer/pure/Blockstore runtime uses '.xblock-v1' while the LMS runtime uses '.xblock'.
    const rootNode = document.querySelector('.xblock, .xblock-v1'); // will always return the first matching element
    initializeXBlockAndChildren(rootNode as XBlockElement, () => {
        // When done, tell the parent window the size of this block:
        postMessageToParent({
            height: document.body.scrollHeight,
            method: 'update_frame_height',
        });
        postMessageToParent({method: 'init_done'});
    });

    let lastHeight = -1;
    function checkFrameHeight() {
        const newHeight = document.documentElement!.scrollHeight;
        if (newHeight !== lastHeight) {
            postMessageToParent({method: 'update_frame_height', height: newHeight});
            lastHeight = newHeight;
        }
    }
    // Check the size whenever the DOM changes:
    new MutationObserver(checkFrameHeight).observe(document.body, {attributes: true, childList: true, subtree: true});
    // And whenever the IFrame is resized
    window.addEventListener('resize', checkFrameHeight);
}
