import * as React from "react";

import {libClient} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


/**
 * Display the OLX source of an XBlock
 */
class BlockOlx extends React.PureComponent<{olx: string}> {
    render() {
        return <pre>
            {this.props.olx}
        </pre>
    }
}


export class BlockOlxWrapper extends React.PureComponent<{blockId: string}, {olx: string, status: LoadingStatus}> {
    constructor(props) {
        super(props);
        this.state = {
            olx: '',
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        try {
            const olx = await libClient.getLibraryBlockOlx(this.props.blockId);
            this.setState({olx, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <BlockOlx olx={this.state.olx} />
        </LoadingWrapper>;
    }
}
