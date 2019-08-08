import * as React from "react";
import { match, NavLink, Switch, Route, Redirect, withRouter, RouteComponentProps } from "react-router-dom";

import {libClient, LibraryBlockMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';
import { Block, XBlockNotification } from "./Block/Block";
import { BlockOlxWrapper } from "./BlockOlx";


type MatchProps = {match: match<{lib_id: string, id: string}>};

/**
 * Main page that has different tabs for viewing and editing an XBlock.
 */
class _BlockPage extends React.PureComponent<LibraryBlockMetadata & MatchProps & RouteComponentProps & {onBlockChanged: () => void}> {
    render() {
        return <>
            <h1>{this.props.display_name}</h1>
            <div className="card">
                <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <NavLink exact to={`${this.baseHref}`} className='nav-link' activeClassName="active">View</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={`${this.baseHref}/edit`} className='nav-link' activeClassName="active">Edit</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={`${this.baseHref}/assets`} className='nav-link' activeClassName="active">Assets</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={`${this.baseHref}/source`} className='nav-link' activeClassName="active">Source</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={`${this.baseHref}/actions`} className='nav-link' activeClassName="active">Actions</NavLink>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <Switch>
                        <Route exact path={`${this.baseHref}`}>
                            <Block usageKey={this.props.id} />
                        </Route>
                        <Route exact path={`${this.baseHref}/edit`}>
                            <Block usageKey={this.props.id} viewName="studio_view" onNotification={this.handleEditNotification} />
                        </Route>
                        <Route exact path={`${this.baseHref}/assets`}>
                            <p>Todo in the future: list all asset in this XBlock's bundle folder. Allow uploading, replacing, and deleting any in the `static` subfolder.</p>
                        </Route>
                        <Route exact path={`${this.baseHref}/source`}>
                            <BlockOlxWrapper blockId={this.props.id} />
                        </Route>
                        <Route exact path={`${this.baseHref}/actions`}>
                            <section>
                                <h1>Publish Changes</h1>
                                <button onClick={this.handlePublishChanges} className="btn btn-success mb-2 mr-2" disabled={!this.props.has_unpublished_changes}>Publish Changes</button>
                                <button onClick={this.handleDiscardChanges} className="btn btn-outline-danger mb-2 mr-2" disabled={!this.props.has_unpublished_changes}>Discard Changes</button>
                                {this.props.has_unpublished_changes ? "Discarding changes is not yet implemented in Blockstore." : "No changes to publish."}
                                <br />
                                <br />
                            </section>
                        </Route>
                        <Route>Invalid tab / URL.</Route>
                    </Switch>
                </div>
            </div>
        </>
    }

    get baseHref() {
        return `/lib/${this.props.match.params.lib_id}/blocks/${this.props.match.params.id}`;
    }

    handleEditNotification = (event: XBlockNotification) => {
        if (event.eventType === 'cancel') {
            // Cancel editing. In normal Studio, this closes the modal.
            // We're not using a modal, but we can go back to the 'view' tab.
            this.props.history.push(this.baseHref);
        } else if (event.eventType === 'save' && event.state === 'end') {
            // It's saved!
            this.props.history.push(this.baseHref);
        } else if (event.eventType === 'error') {
            alert((event.title || 'Error') + ': ' + event.message);
        } else {
            console.error("Unknown XBlock runtime event: ", event);
        }
    }

    handlePublishChanges = async () => {
        await libClient.commitLibraryBlock(this.props.id);
        this.props.onBlockChanged();
    }

    handleDiscardChanges = async () => {
        alert("Discarding changes is not yet implemented in Blockstore.")
    }
}
export const BlockPage = withRouter(_BlockPage);


export class BlockPageWrapper extends React.PureComponent<
    MatchProps,
    {data?: LibraryBlockMetadata, status: LoadingStatus}
> {
    constructor(props) {
        super(props);
        this.state = {
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        this.refreshBlockData();
    }

    /**
     * Load or reload the data about this block.
     */
    refreshBlockData = async () => {
        try {
            const data = await libClient.getLibraryBlock(this.props.match.params.id);
            this.setState({data, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <BlockPage {...this.state.data} onBlockChanged={this.refreshBlockData} />
        </LoadingWrapper>;
    }
}
