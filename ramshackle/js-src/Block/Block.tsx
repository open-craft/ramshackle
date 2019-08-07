import * as React from 'react';

import { xblockClient } from '../LibraryClient';
import {LoadingStatus, LoadingWrapper} from '../LoadingWrapper';
import { wrapBlockHtmlForIFrame } from './wrap';

// The xblock-bootstrap.html file must be hosted on a completely unique domain name.
// The domain below may be used for development but not production.
const SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL = '//d3749cj02gkez2.cloudfront.net/xblock-bootstrap.html';
// URLs to the LMS and CMS. These are required because XBlocks have a _lot_ of messy undeclared
// dependencies on certain JS/CSS in the global scope.
const LMS_BASE_URL = 'http://localhost:18000';

/**
 * Event signals that may be sent by XBlocks to the parent application.
 * Typically these are only used by the studio_view.
 */
export type XBlockNotification = (
    | {eventType: 'save', state: 'end'}
    | {eventType: 'save', state: 'start', message?: string}
    | {eventType: 'error', title?: string, message?: string}
    | {eventType: 'cancel'}
);

interface BlockProps {
    usageKey: string;
    viewName: string;
    onNotification?: (event: XBlockNotification) => void;
}

interface BlockState {
    loadingState: LoadingStatus;
    initialHtml: string;
    iFrameHeight: number;
}

/**
 * React component that displays an XBlock in a sandboxed IFrame.
 *
 * The IFrame is resized responsively so that it fits the content height.
 *
 * We use an IFrame so that the XBlock code, including user-authored HTML,
 * cannot access things like the user's cookies, nor can it make GET/POST
 * requests as the user. However, it is allowed to call any XBlock handlers.
 */
export class Block extends React.Component<BlockProps, BlockState> {

    static defaultProps = {
        viewName: 'student_view',
    };

    private iframeRef: React.RefObject<HTMLIFrameElement>;

    constructor(props: BlockProps) {
        super(props);
        this.iframeRef = React.createRef();
        this.state = {
            iFrameHeight: 400,
            initialHtml: '',
            loadingState: LoadingStatus.Loading,
        };
    }

    /**
     * Load the XBlock data from the LMS and then inject it into our IFrame.
     */
    public componentDidMount() {
        // Prepare to receive messages from the IFrame.
        // Messages are the only way that the code in the IFrame can communicate
        // with the surrounding UI.
        window.addEventListener('message', this.receivedWindowMessage);
        // Load the XBlock HTML:
        this.loadXBlockHtml();
    }

    public componentDidUpdate(prevProps: BlockProps, prevState, snapshot) {
        if (prevProps.usageKey !== this.props.usageKey || prevProps.viewName !== this.props.viewName) {
            // The XBlock ID or view name has changed, so we need to [re]load the IFrame.
            // (The actual HTML will be identical, so if it weren't for this method, React would
            // not do anything).
            this.setState({initialHtml: '', loadingState: LoadingStatus.Loading, iFrameHeight: 400});
            this.loadXBlockHtml();
        }
    }

    private async loadXBlockHtml() {
        try {
            // First load the XBlock fragment data:
            const data = await xblockClient.renderView(this.props.usageKey, this.props.viewName);
            const urlResources = data.resources.filter((r) => r.kind === 'url');
            const html = wrapBlockHtmlForIFrame(
                data.content,
                urlResources.filter((r) => r.mimetype === 'application/javascript').map((r) => r.data),
                urlResources.filter((r) => r.mimetype === 'text/css').map((r) => r.data),
                LMS_BASE_URL,
            );
            // Load the XBlock HTML into the IFrame:
            this.setState({initialHtml: html, loadingState: LoadingStatus.Ready});
        } catch (err) {
            console.error(err); // tslint:disable-line:no-console
            this.setState({loadingState: LoadingStatus.Error});
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('message', this.receivedWindowMessage);
    }

    public render() {
        return <LoadingWrapper status={this.state.loadingState}>
            <div style={{
                height: `${this.state.iFrameHeight}px`,
                boxSizing: 'content-box',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '200px',
            }}>
                <iframe
                    ref={this.iframeRef}
                    src={SECURE_ORIGIN_XBLOCK_BOOTSTRAP_HTML_URL}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        minHeight: '200px',
                        border: '0 none',
                        backgroundColor: 'white',
                    }}
                    sandbox={[
                        'allow-forms',
                        'allow-modals',
                        'allow-popups',
                        'allow-popups-to-escape-sandbox',
                        'allow-presentation',
                        'allow-same-origin',  // This is only secure IF the IFrame source
                                              // is served from a completely different domain name
                                              // e.g. labxchange-xblocks.net vs www.labxchange.org
                        'allow-scripts',
                        'allow-top-navigation-by-user-activation',
                    ].join(' ')}
                />
            </div>
        </LoadingWrapper>
    }

    /**
     * Handle any messages we receive from the XBlock Runtime code in the IFrame.
     * See wrap.ts to see the code that sends these messages.
     */
    receivedWindowMessage = async (event: MessageEvent) => {
        if (this.iframeRef.current === null || event.source !== this.iframeRef.current.contentWindow) {
            return; // This is some other random message.
        }
        const {method, replyKey, ...args} = event.data;
        const frame = this.iframeRef.current.contentWindow!;
        const sendReply = async (data: any) => {
            frame.postMessage({...data, replyKey}, '*');
        };
        if (method === 'bootstrap') {
            sendReply({initialHtml: this.state.initialHtml});
        } else if (method === 'get_handler_url') {
            sendReply({
                handlerUrl: await this.getSecureHandlerUrl(args.usageId),
            });
        } else if (method === 'update_frame_height') {
            this.setState({iFrameHeight: args.height});
        } else if (method.indexOf('xblock:') === 0) {
            // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
            if (this.props.onNotification) {
                this.props.onNotification({
                    eventType: method.substr(7), // Remove the 'xblock:' prefix that we added in wrap.ts
                    ...args,
                });
            }
        }
    }

    /**
     * Helper method which gets a "secure handler URL" from the LMS/Studio
     * A "secure handler URL" is a URL that the XBlock runtime can use even from
     * within its sandboxed IFrame. (The IFrame is considered a different origin,
     * and normally, cross-origin handler requests would be blocked).
     *
     * @param uageKey The usage key of the XBlock whose handlers you want to call.
     */
    private async getSecureHandlerUrl(usageKey: string) {
        // We request the URL of a fake handler called 'handler_name' and then
        // substitute the name of the real handler later, without any further calls.
        return await xblockClient.getHandlerUrl(usageKey, 'handler_name');
    }
}
