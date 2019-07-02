var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
define("LibraryClient", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A simple API client for the Open edX content libraries API
     */
    class LibraryClient {
        _call(url, args = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                if (args.data) {
                    args.body = JSON.stringify(args.data);
                    delete args.data;
                }
                const combinedArgs = Object.assign({ method: 'GET', credentials: 'include', headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    } }, args);
                const result = yield fetch(`/api/libraries/v2${url}`, combinedArgs);
                if (result.status < 200 || result.status >= 300) {
                    try {
                        console.error(yield result.json());
                    }
                    catch (_a) { }
                    throw new Error(result.statusText);
                }
                return yield result.json();
            });
        }
        listLibraries() {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call('/');
            });
        }
        getLibrary(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/${id}/`);
            });
        }
        createLibrary(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/`, { method: 'POST', data: data });
            });
        }
        getLibraryBlocks(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/${id}/blocks/`);
            });
        }
        /** Get the list of block types that can be added to the given library */
        getLibraryBlockTypes(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/${id}/block_types/`);
            });
        }
        getLibraryBlock(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/blocks/${id}/`);
            });
        }
        createLibraryBlock(libraryId, blockType, slug) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/${libraryId}/blocks/`, { method: 'POST', data: {
                        block_type: blockType,
                        definition_id: slug,
                    } });
            });
        }
        /** Get the OLX source code of the given block */
        getLibraryBlockOlx(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return (yield this._call(`/blocks/${id}/olx/`)).olx;
            });
        }
    }
    exports.libClient = new LibraryClient();
    /**
     * A simple API client for the Open edX XBlock API
     */
    class XBlockClient {
        _call(url, args = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                if (args.data) {
                    args.body = JSON.stringify(args.data);
                    delete args.data;
                }
                const combinedArgs = Object.assign({ method: 'GET', credentials: 'include', headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    } }, args);
                const result = yield fetch(`/api/xblock/v2${url}`, combinedArgs);
                if (result.status < 200 || result.status >= 300) {
                    try {
                        console.error(yield result.json());
                    }
                    catch (_a) { }
                    throw new Error(result.statusText);
                }
                return yield result.json();
            });
        }
        getMetadata(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/xblocks/${id}/`);
            });
        }
        renderView(id, viewName) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/xblocks/${id}/view/${viewName}/`);
            });
        }
        getHandlerUrl(id, handlerName) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this._call(`/xblocks/${id}/handler_url/${handlerName}/`);
                return result.handler_url;
            });
        }
    }
    exports.xblockClient = new XBlockClient();
    /**
     * JS Cookie parser from Django docs
     * https://docs.djangoproject.com/en/2.2/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
     * @param name Name of the cookie to get
     */
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
define("LoadingWrapper", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LoadingWrapper extends React.PureComponent {
        render() {
            if (this.props.status === 1 /* Ready */) {
                return this.props.children;
            }
            else if (this.props.status === 0 /* Loading */) {
                return React.createElement("p", null, "Loading...");
            }
            else {
                return React.createElement("p", null, "An error occurred");
            }
        }
    }
    exports.LoadingWrapper = LoadingWrapper;
});
define("BlockOlx", ["require", "exports", "react", "LibraryClient", "LoadingWrapper"], function (require, exports, React, LibraryClient_1, LoadingWrapper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Display the OLX source of an XBlock
     */
    class BlockOlx extends React.PureComponent {
        render() {
            return React.createElement("pre", null, this.props.olx);
        }
    }
    class BlockOlxWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                olx: '',
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const olx = yield LibraryClient_1.libClient.getLibraryBlockOlx(this.props.blockId);
                    this.setState({ olx, status: 1 /* Ready */ });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
            });
        }
        render() {
            return React.createElement(LoadingWrapper_1.LoadingWrapper, { status: this.state.status },
                React.createElement(BlockOlx, { olx: this.state.olx }));
        }
    }
    exports.BlockOlxWrapper = BlockOlxWrapper;
});
define("Block/wrap", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    function wrapBlockHtmlForIFrame(html, jsUrls, cssUrls) {
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
            <!-- 
                common.js: Webpack Loader and various JS bundles that may or may not be required
                Note: This is only needed for (former) XModules that are part of edx-platform and
                which use add_webpack_to_fragment(), such as 'problem'.
            -->
            <script type="text/javascript" src="${lmsBaseUrl}/static/xmodule_js/common_static/bundles/commons.js"><\/script>
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
    exports.wrapBlockHtmlForIFrame = wrapBlockHtmlForIFrame;
    /**
     * The JavaScript code which runs inside our IFrame and is responsible
     * for communicating with the parent window.
     *
     * This cannot use any imported functions because it runs in the IFrame,
     * not in our app webpack bundle.
     */
    function blockFrameJS() {
        const CHILDREN_KEY = '_jsrt_xb_children'; // JavaScript RunTime XBlock children
        const USAGE_ID_KEY = '_jsrt_xb_usage_id';
        const HANDLER_URL = '_jsrt_xb_handler_url';
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
            childMap: (block, childName) => {
                return runtime.children(block).find((child) => child.element.getAttribute('data-name') === childName);
            },
            children: (block) => {
                return block[CHILDREN_KEY];
            },
            /**
             * Get the URL for the specified handler. This method must be synchronous, so
             * cannot make HTTP requests.
             */
            handlerUrl: (block, handlerName, suffix, query) => {
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
            notify: (eventType, params) => {
                params.method = 'xblock:' + eventType;
                postMessageToParent(params);
            },
        };
        // Recursively initialize the JavaScript code of each XBlock:
        function initializeXBlockAndChildren(element, callback) {
            // The newer/pure/Blockstore runtime uses the 'data-usage' attribute, while the LMS uses 'data-usage-id'
            const usageId = element.getAttribute('data-usage') || element.getAttribute('data-usage-id');
            if (usageId !== null) {
                element[USAGE_ID_KEY] = usageId;
            }
            else {
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
            const childNodesFound = [];
            [].forEach.call(element.querySelectorAll('.xblock, .xblock-v1'), (childNode) => {
                if (!childNodesFound.find((el) => el.contains(childNode))) {
                    childNodesFound.push(childNode);
                }
            });
            // This code is awkward because we can't use promises (IE11 etc.)
            let childrenInitialized = -1;
            function initNextChild() {
                childrenInitialized++;
                if (childrenInitialized < childNodesFound.length) {
                    const childNode = childNodesFound[childrenInitialized];
                    initializeXBlockAndChildren(childNode, initNextChild);
                }
                else {
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
        function initializeXBlock(element, callback) {
            const usageId = element[USAGE_ID_KEY];
            // Check if the XBlock has an initialization function:
            const initFunctionName = element.getAttribute('data-init');
            if (initFunctionName !== null) {
                // Since this block has an init function, it may need to call handlers,
                // so we first have to generate a secure handler URL for it:
                postMessageToParent({ method: 'get_handler_url', usageId }, (handlerData) => {
                    element[HANDLER_URL] = handlerData.handlerUrl;
                    // Now proceed with initializing the block's JavaScript:
                    const initFunction = window[initFunctionName];
                    // Does the XBlock HTML contain arguments to pass to the initFunction?
                    let data = {};
                    [].forEach.call(element.children, (childNode) => {
                        // The newer/pure/Blockstore runtime uses 'xblock_json_init_args'
                        // while the LMS runtime uses 'xblock-json-init-args'.
                        if (childNode.matches('script.xblock_json_init_args') ||
                            childNode.matches('script.xblock-json-init-args')) {
                            data = JSON.parse(childNode.textContent);
                        }
                    });
                    const blockJS = new initFunction(runtime, element, data) || {};
                    blockJS.element = element;
                    callback(blockJS);
                });
            }
            else {
                const blockJS = { element };
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
        function postMessageToParent(messageData, callback) {
            const messageReplyKey = uniqueKeyPrefix + (messageCount++);
            messageData.replyKey = messageReplyKey;
            if (callback !== undefined) {
                const handleResponse = (event) => {
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
        initializeXBlockAndChildren(rootNode, () => {
            // When done, tell the parent window the size of this block:
            postMessageToParent({
                height: document.body.scrollHeight,
                method: 'update_frame_height',
            });
            postMessageToParent({ method: 'init_done' });
        });
        let lastHeight = -1;
        function checkFrameHeight() {
            const newHeight = document.documentElement.scrollHeight;
            if (newHeight !== lastHeight) {
                postMessageToParent({ method: 'update_frame_height', height: newHeight });
                lastHeight = newHeight;
            }
        }
        // Check the size whenever the DOM changes:
        new MutationObserver(checkFrameHeight).observe(document.body, { attributes: true, childList: true, subtree: true });
        // And whenever the IFrame is resized
        window.addEventListener('resize', checkFrameHeight);
    }
});
define("Block/Block", ["require", "exports", "react", "LibraryClient", "LoadingWrapper", "Block/wrap"], function (require, exports, React, LibraryClient_2, LoadingWrapper_2, wrap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // The xblock-bootstrap.html file must be hosted on a completely unique domain name.
    // The domain below may be used for development but not production.
    const SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL = 'https://d3749cj02gkez2.cloudfront.net/xblock-bootstrap.html';
    /**
     * React component that displays an XBlock in a sandboxed IFrame.
     *
     * The IFrame is resized responsively so that it fits the content height.
     *
     * We use an IFrame so that the XBlock code, including user-authored HTML,
     * cannot access things like the user's cookies, nor can it make GET/POST
     * requests as the user. However, it is allowed to call any XBlock handlers.
     */
    class Block extends React.Component {
        constructor(props) {
            super(props);
            /**
             * Handle any messages we receive from the XBlock Runtime code in the IFrame.
             * See wrap.ts to see the code that sends these messages.
             */
            this.receivedWindowMessage = (event) => __awaiter(this, void 0, void 0, function* () {
                if (this.iframeRef.current === null || event.source !== this.iframeRef.current.contentWindow) {
                    return; // This is some other random message.
                }
                const _a = event.data, { method, replyKey } = _a, args = __rest(_a, ["method", "replyKey"]);
                const frame = this.iframeRef.current.contentWindow;
                const sendReply = (data) => __awaiter(this, void 0, void 0, function* () {
                    frame.postMessage(Object.assign({}, data, { replyKey }), '*');
                });
                if (method === 'bootstrap') {
                    sendReply({ initialHtml: this.state.initialHtml });
                }
                else if (method === 'get_handler_url') {
                    sendReply({
                        handlerUrl: yield this.getSecureHandlerUrl(args.usageId),
                    });
                }
                else if (method === 'update_frame_height') {
                    this.setState({ iFrameHeight: args.height });
                }
                else if (method.indexOf('xblock:') === 0) {
                    // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
                    if (this.props.onNotification) {
                        this.props.onNotification(Object.assign({ eventType: method.substr(7) }, args));
                    }
                }
            });
            this.iframeRef = React.createRef();
            this.state = {
                iFrameHeight: 400,
                initialHtml: '',
                loadingState: 0 /* Loading */,
            };
        }
        /**
         * Load the XBlock data from the LMS and then inject it into our IFrame.
         */
        componentDidMount() {
            // Prepare to receive messages from the IFrame.
            // Messages are the only way that the code in the IFrame can communicate
            // with the surrounding UI.
            window.addEventListener('message', this.receivedWindowMessage);
            // Load the XBlock HTML:
            this.loadXBlockHtml();
        }
        componentDidUpdate(prevProps, prevState, snapshot) {
            if (prevProps.usageKey !== this.props.usageKey || prevProps.viewName !== this.props.viewName) {
                // The XBlock ID or view name has changed, so we need to [re]load the IFrame.
                // (The actual HTML will be identical, so if it weren't for this method, React would
                // not do anything).
                this.setState({ initialHtml: '', loadingState: 0 /* Loading */, iFrameHeight: 400 });
                this.loadXBlockHtml();
            }
        }
        loadXBlockHtml() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // First load the XBlock fragment data:
                    const data = yield LibraryClient_2.xblockClient.renderView(this.props.usageKey, this.props.viewName);
                    const urlResources = data.resources.filter((r) => r.kind === 'url');
                    const html = wrap_1.wrapBlockHtmlForIFrame(data.content, urlResources.filter((r) => r.mimetype === 'application/javascript').map((r) => r.data), urlResources.filter((r) => r.mimetype === 'text/css').map((r) => r.data));
                    // Load the XBlock HTML into the IFrame:
                    this.setState({ initialHtml: html, loadingState: 1 /* Ready */ });
                }
                catch (err) {
                    console.error(err); // tslint:disable-line:no-console
                    this.setState({ loadingState: 2 /* Error */ });
                }
            });
        }
        componentWillUnmount() {
            window.removeEventListener('message', this.receivedWindowMessage);
        }
        render() {
            return React.createElement(LoadingWrapper_2.LoadingWrapper, { status: this.state.loadingState },
                React.createElement("div", { style: {
                        height: `${this.state.iFrameHeight}px`,
                        boxSizing: 'content-box',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '200px',
                    } },
                    React.createElement("iframe", { ref: this.iframeRef, src: SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL, style: {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            minHeight: '200px',
                            border: '0 none',
                            backgroundColor: 'white',
                        }, sandbox: [
                            'allow-forms',
                            'allow-modals',
                            'allow-popups',
                            'allow-popups-to-escape-sandbox',
                            'allow-presentation',
                            'allow-same-origin',
                            // is served from a completely different domain name
                            // e.g. labxchange-xblocks.net vs www.labxchange.org
                            'allow-scripts',
                            'allow-top-navigation-by-user-activation',
                        ].join(' ') })));
        }
        /**
         * Helper method which gets a "secure handler URL" from the LMS/Studio
         * A "secure handler URL" is a URL that the XBlock runtime can use even from
         * within its sandboxed IFrame. (The IFrame is considered a different origin,
         * and normally, cross-origin handler requests would be blocked).
         *
         * @param uageKey The usage key of the XBlock whose handlers you want to call.
         */
        getSecureHandlerUrl(usageKey) {
            return __awaiter(this, void 0, void 0, function* () {
                // We request the URL of a fake handler called 'handler_name' and then
                // substitute the name of the real handler later, without any further calls.
                return yield LibraryClient_2.xblockClient.getHandlerUrl(usageKey, 'handler_name');
            });
        }
    }
    Block.defaultProps = {
        viewName: 'student_view',
    };
    exports.Block = Block;
});
define("BlockPage", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper", "Block/Block", "BlockOlx"], function (require, exports, React, react_router_dom_1, LibraryClient_3, LoadingWrapper_3, Block_1, BlockOlx_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Main page that has different tabs for viewing and editing an XBlock.
     */
    class _BlockPage extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.handleEditNotification = (event) => {
                if (event.eventType === 'cancel') {
                    // Cancel editing. In normal Studio, this closes the modal.
                    // We're not using a modal, but we can go back to the 'view' tab.
                    this.props.history.push(this.baseHref);
                }
                else if (event.eventType === 'save' && event.state === 'end') {
                    // It's saved!
                    this.props.history.push(this.baseHref);
                }
                else if (event.eventType === 'error') {
                    alert((event.title || 'Error') + ': ' + event.message);
                }
                else {
                    console.error("Unknown XBlock runtime event: ", event);
                }
            };
        }
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, this.props.display_name),
                React.createElement("div", { className: "card" },
                    React.createElement("div", { className: "card-header" },
                        React.createElement("ul", { className: "nav nav-tabs card-header-tabs" },
                            React.createElement("li", { className: "nav-item" },
                                React.createElement(react_router_dom_1.NavLink, { exact: true, to: `${this.baseHref}`, className: 'nav-link', activeClassName: "active" }, "View")),
                            React.createElement("li", { className: "nav-item" },
                                React.createElement(react_router_dom_1.NavLink, { to: `${this.baseHref}/edit`, className: 'nav-link', activeClassName: "active" }, "Edit")),
                            React.createElement("li", { className: "nav-item" },
                                React.createElement(react_router_dom_1.NavLink, { to: `${this.baseHref}/assets`, className: 'nav-link', activeClassName: "active" }, "Assets")),
                            React.createElement("li", { className: "nav-item" },
                                React.createElement(react_router_dom_1.NavLink, { to: `${this.baseHref}/source`, className: 'nav-link', activeClassName: "active" }, "Source")))),
                    React.createElement("div", { className: "card-body" },
                        React.createElement(react_router_dom_1.Switch, null,
                            React.createElement(react_router_dom_1.Route, { exact: true, path: `${this.baseHref}` },
                                React.createElement(Block_1.Block, { usageKey: this.props.id })),
                            React.createElement(react_router_dom_1.Route, { exact: true, path: `${this.baseHref}/edit` },
                                React.createElement(Block_1.Block, { usageKey: this.props.id, viewName: "studio_view", onNotification: this.handleEditNotification })),
                            React.createElement(react_router_dom_1.Route, { exact: true, path: `${this.baseHref}/assets` },
                                React.createElement("p", null, "Todo in the future: list all asset files in this XBlock's bundle folder.")),
                            React.createElement(react_router_dom_1.Route, { exact: true, path: `${this.baseHref}/source` },
                                React.createElement(BlockOlx_1.BlockOlxWrapper, { blockId: this.props.id })),
                            React.createElement(react_router_dom_1.Route, null, "Invalid tab / URL.")))));
        }
        get baseHref() {
            return `/lib/${this.props.match.params.lib_id}/blocks/${this.props.match.params.id}`;
        }
    }
    exports.BlockPage = react_router_dom_1.withRouter(_BlockPage);
    class BlockPageWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const data = yield LibraryClient_3.libClient.getLibraryBlock(this.props.match.params.id);
                    this.setState({ data, status: 1 /* Ready */ });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
            });
        }
        render() {
            return React.createElement(LoadingWrapper_3.LoadingWrapper, { status: this.state.status },
                React.createElement(exports.BlockPage, Object.assign({}, this.state.data)));
        }
    }
    exports.BlockPageWrapper = BlockPageWrapper;
});
define("Library", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper"], function (require, exports, React, react_router_dom_2, LibraryClient_4, LoadingWrapper_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class _Library extends React.PureComponent {
        constructor(props) {
            super(props);
            this.handleChangeNewBlockType = (event) => {
                this.setState({ newBlockType: event.target.value });
            };
            this.handleChangeNewBlockSlug = (event) => {
                this.setState({ newBlockSlug: event.target.value });
            };
            this.handleAddNewBlock = (event) => __awaiter(this, void 0, void 0, function* () {
                event.preventDefault();
                const data = yield LibraryClient_4.libClient.createLibraryBlock(this.props.id, this.state.newBlockType, this.state.newBlockSlug);
                this.props.history.push(`/lib/${this.props.id}/blocks/${data.id}`);
            });
            this.state = { newBlockType: 'html', newBlockSlug: '' };
        }
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, this.props.title),
                React.createElement("p", null,
                    "Version: ",
                    this.props.version),
                React.createElement("p", null,
                    "Description: ",
                    this.props.description),
                React.createElement("h2", null, "Library Blocks"),
                React.createElement("div", { className: "row" }, this.props.blocks.map((block) => (React.createElement("div", { className: "col-sm-4 mb-4", key: block.id },
                    React.createElement("div", { className: "card" },
                        React.createElement("div", { className: "card-body" },
                            React.createElement("h3", { className: "card-title" }, block.display_name),
                            React.createElement("p", null,
                                block.block_type,
                                React.createElement("br", null),
                                React.createElement("small", { className: "text-muted" }, block.id)),
                            block.has_unpublished_changes ? React.createElement("p", { className: "badge badge-info" }, "Unpublished Changes") : null),
                        React.createElement("div", { className: "card-footer" },
                            React.createElement(react_router_dom_2.Link, { to: `/lib/${this.props.id}/blocks/${block.id}`, className: "btn btn-sm btn-outline-primary mr-2" }, "View"),
                            React.createElement(react_router_dom_2.Link, { to: `/lib/${this.props.id}/blocks/${block.id}/edit`, className: "btn btn-sm btn-outline-secondary mr-2" }, "Edit"),
                            block.has_unpublished_changes ?
                                React.createElement(react_router_dom_2.Link, { to: "/", className: "btn btn-sm btn-outline-success mr-2" }, "Publish")
                                : null)))))),
                React.createElement("h2", null, "Add a new block"),
                React.createElement("form", null,
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newBlockType" }, "Type"),
                        React.createElement("select", { className: "form-control", id: "newBlockType", value: this.state.newBlockType, onChange: this.handleChangeNewBlockType }, this.props.newBlockTypes.map(blockType => (React.createElement("option", { value: blockType.block_type, key: blockType.block_type },
                            blockType.block_type,
                            " (",
                            blockType.display_name,
                            ")"))))),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newBlockSlug" }, "Slug"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newBlockSlug", placeholder: `${this.state.newBlockType}1`, value: this.state.newBlockSlug, onChange: this.handleChangeNewBlockSlug }),
                        React.createElement("small", null, "This becomes part of the usage ID and definition ID, and cannot be changed.")),
                    React.createElement("button", { type: "submit", disabled: !this.state.newBlockType || !this.state.newBlockSlug, className: "btn btn-primary", onClick: this.handleAddNewBlock }, "Add Block")));
        }
    }
    exports._Library = _Library;
    exports.Library = react_router_dom_2.withRouter(_Library);
    class LibraryWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                blockTypes: [{ block_type: 'html', display_name: 'Text' }],
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                const libraryId = this.props.match.params.id;
                try {
                    const [data, blocks] = yield Promise.all([
                        LibraryClient_4.libClient.getLibrary(libraryId),
                        LibraryClient_4.libClient.getLibraryBlocks(libraryId),
                    ]);
                    this.setState({ data, blocks, status: 1 /* Ready */ });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
                const blockTypes = yield LibraryClient_4.libClient.getLibraryBlockTypes(libraryId);
                this.setState({ blockTypes: blockTypes });
            });
        }
        render() {
            return React.createElement(LoadingWrapper_4.LoadingWrapper, { status: this.state.status },
                React.createElement(exports.Library, Object.assign({}, this.state.data, { blocks: this.state.blocks, newBlockTypes: this.state.blockTypes })));
        }
    }
    exports.LibraryWrapper = LibraryWrapper;
});
define("LibraryAdd", ["require", "exports", "react", "react-router-dom", "LibraryClient"], function (require, exports, React, react_router_dom_3, LibraryClient_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LibraryAddForm extends React.PureComponent {
        constructor(props) {
            super(props);
            // Event handlers:
            this.handleChangeSlug = (event) => { this.setState({ slug: event.target.value }); };
            this.handleChangeTitle = (event) => { this.setState({ title: event.target.value }); };
            this.handleChangeDescription = (event) => { this.setState({ description: event.target.value }); };
            this.handleChangeCollectionUUID = (event) => { this.setState({ collection_uuid: event.target.value }); };
            this.handleSubmit = (event) => __awaiter(this, void 0, void 0, function* () {
                event.preventDefault();
                const newLibrary = yield LibraryClient_5.libClient.createLibrary(this.state);
                this.props.history.push(`/lib/${newLibrary.id}`);
            });
            this.state = {
                slug: '',
                collection_uuid: '',
                title: '',
                description: '',
            };
        }
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, "Add a new content library"),
                React.createElement("form", null,
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibrarySlug" }, "Slug"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newLibrarySlug", placeholder: "my-lib", value: this.state.slug, onChange: this.handleChangeSlug })),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibraryTitle" }, "Title"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newLibraryTitle", placeholder: "My New Library", value: this.state.title, onChange: this.handleChangeTitle })),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibraryDescription" }, "Description"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newLibraryDescription", placeholder: "Describe your library", value: this.state.description, onChange: this.handleChangeDescription })),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibraryCollectionUUID" }, "Collection UUID"),
                        React.createElement("input", { type: "text", style: { fontFamily: "monospace" }, className: "form-control", id: "newLibraryCollectionUUID", placeholder: "11111111-1111-1111-1111-111111111111", maxLength: 36, value: this.state.collection_uuid, onChange: this.handleChangeCollectionUUID }),
                        React.createElement("small", null,
                            "You can see all the collection UUIDs ",
                            React.createElement("a", { href: "http://localhost:18250/api/v1/collections" }, "via the Blockstore API"),
                            ".")),
                    React.createElement("button", { type: "submit", disabled: !this.canSubmit, className: "btn btn-primary", onClick: this.handleSubmit }, "Submit"),
                    React.createElement(react_router_dom_3.Link, { to: "/", className: "btn btn-secondary" }, "Cancel")));
        }
        get canSubmit() {
            return this.state.slug && this.state.collection_uuid;
        }
    }
    exports.LibraryAddForm = LibraryAddForm;
});
define("LibraryList", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper"], function (require, exports, React, react_router_dom_4, LibraryClient_6, LoadingWrapper_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LibraryList extends React.PureComponent {
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, "All Content Libraries"),
                React.createElement("p", null,
                    "There are ",
                    this.props.libraries.length,
                    " content libraries:"),
                React.createElement("ul", null, this.props.libraries.map(lib => (React.createElement("li", { key: lib.id },
                    React.createElement(react_router_dom_4.Link, { to: `/lib/${lib.id}` }, lib.title))))),
                React.createElement(react_router_dom_4.Link, { to: "/add/", className: "btn btn-primary" }, "Add New Library"));
        }
    }
    exports.LibraryList = LibraryList;
    class LibraryListWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                libraryList: [],
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const libraryList = yield LibraryClient_6.libClient.listLibraries();
                    this.setState({
                        libraryList,
                        status: 1 /* Ready */,
                    });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
            });
        }
        render() {
            return React.createElement(LoadingWrapper_5.LoadingWrapper, { status: this.state.status },
                React.createElement(LibraryList, { libraries: this.state.libraryList }));
        }
    }
    exports.LibraryListWrapper = LibraryListWrapper;
});
define("ramshackle", ["require", "exports", "react", "react-dom", "react-router-dom", "Library", "LibraryAdd", "LibraryList", "BlockPage"], function (require, exports, React, ReactDOM, react_router_dom_5, Library_1, LibraryAdd_1, LibraryList_1, BlockPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ramshackle extends React.Component {
        render() {
            return (React.createElement(react_router_dom_5.BrowserRouter, { basename: "/ramshackle/" },
                React.createElement(react_router_dom_5.Switch, null,
                    React.createElement(react_router_dom_5.Route, { path: "/", exact: true, component: LibraryList_1.LibraryListWrapper }),
                    React.createElement(react_router_dom_5.Route, { path: "/add/", exact: true, component: LibraryAdd_1.LibraryAddForm }),
                    React.createElement(react_router_dom_5.Route, { path: "/lib/:id/", exact: true, component: Library_1.LibraryWrapper }),
                    React.createElement(react_router_dom_5.Route, { path: "/lib/:lib_id/blocks/:id", component: BlockPage_1.BlockPageWrapper }),
                    React.createElement(react_router_dom_5.Route, { component: () => (React.createElement("p", null, "Not found.")) })),
                React.createElement("footer", { style: { marginTop: "1em", borderTop: "1px solid #ddd" } },
                    React.createElement(react_router_dom_5.Link, { to: "/" }, "All libraries"))));
        }
    }
    ReactDOM.render(React.createElement(Ramshackle, null), document.getElementById("ramshackle-root"));
});
