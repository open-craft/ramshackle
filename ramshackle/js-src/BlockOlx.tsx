import * as React from "react";

import {libClient} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


/**
 * Display the OLX source of an XBlock.
 *
 * When in "edit mode", the OLX is editable.
 */
class BlockOlx extends React.PureComponent<{olx: string, onUpdateOlx: (olx: string) => void}, {newOlx: string, isEditing: boolean}> {
    constructor(props) {
        super(props);
        this.state = {newOlx: this.props.olx, isEditing: false};
    }

    render() {
        if (this.state.isEditing) {
            return <>
                <textarea value={this.state.newOlx} onChange={this.updateNewOlx} style={{display: 'block', fontFamily: 'monospace', width: '100%', height: '400px'}} />
                <br/>
                <button onClick={this.cancelEditMode} className="btn btn-outline-secondary">Cancel</button>
                <button onClick={this.applyNewOlx} className="btn btn-primary">Save Changes</button>
            </>;
        } else {
            return <>
                <pre>{this.props.olx}</pre><br/>
                <button onClick={this.showEditMode} className="btn btn-outline-secondary">Edit OLX</button>
            </>;
        }
    }

    showEditMode = () => { this.setState({isEditing: true}); }

    cancelEditMode = () => { this.setState({isEditing: false, newOlx: this.props.olx}); }

    updateNewOlx = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({newOlx: event.target.value});
    }

    applyNewOlx = () => {
        this.props.onUpdateOlx(this.state.newOlx);
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
            <BlockOlx olx={this.state.olx} onUpdateOlx={this.applyNewOlx} />
        </LoadingWrapper>;
    }

    /**
     * If the user has made edits to the OLX, save them when they hit "Save":
     */
    applyNewOlx = async (newOlx: string) => {
        this.setState({status: LoadingStatus.Loading});
        try {
            await libClient.setLibraryBlockOlx(this.props.blockId, newOlx);
            this.setState({olx: newOlx, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }
}
