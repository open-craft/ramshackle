import * as React from "react";
import { withRouter, Switch, Route, Link, RouteComponentProps } from "react-router-dom";

import {libClient, LibraryMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';
import { LibraryBlocksWrapper } from "./LibraryBlocks";
import { BlockPageWrapper } from "./BlockPage";

interface LibraryProps extends LibraryMetadata, RouteComponentProps<{libId: string}> {
    onLibraryChanged: () => void;
}

export class _Library extends React.PureComponent<LibraryProps> {
    constructor(props) {
        super(props);
        this.state = {newBlockType: 'html', newBlockSlug: ''};
    }
    render() {
        return <Switch>
            <Route path={`${this.props.match.path}blocks/:blockId`}>
                <h1>{this.props.title}</h1>
                <Link to={this.props.match.url}>Back to Library</Link><br/><br/>
                <BlockPageWrapper onBlockChanged={this.props.onLibraryChanged}/>
            </Route>
            <Route exact path={this.props.match.path}>
                <h1>{this.props.title}</h1>
                <p>Version: {this.props.version}</p>
                <p>Description: {this.props.description}</p>
                <p>Bundle: {this.props.bundle_uuid}</p>
                <p>
                    (<a href={`http://localhost:18010/admin/content_libraries/contentlibrary/?slug=${this.props.slug}`}>Library Django admin</a>)
                    (<a href={`http://localhost:18250/admin/bundles/bundle/?uuid=${this.props.bundle_uuid}`}>Bundle Django admin</a>)
                    (<a href={`http://localhost:18250/api/v1/bundles/${this.props.bundle_uuid}`}>Bundle API</a>)
                </p>
                {
                    this.props.has_unpublished_changes ? <>
                        <h2>Unpublished Changes</h2>
                        {this.props.has_unpublished_deletes ? <p>Has unpublished changes, including deleted XBlocks.</p> : <p>Has unpublished changes.</p>} 
                        <button onClick={this.handlePublishChanges} className="btn btn-success mb-2 mr-2">Publish Changes</button>
                        <button onClick={this.handleRevertChanges} className="btn btn-outline-danger mb-2 mr-2">Discard Changes</button>
                    </> : <p>No unpublished changes.</p>
                }
                <LibraryBlocksWrapper libraryId={this.props.id} onLibraryChanged={this.props.onLibraryChanged}/>
            </Route>
            <Route>
                Not found.
            </Route>
        </Switch>
    }

    /** Publish/commit all pending changes to this content library */
    handlePublishChanges = async () => {
        await libClient.commitLibraryChanges(this.props.id);
        this.props.onLibraryChanged();
        window.location.reload(); // Todo: Tell <LibraryBlocksWrapper> to refresh instead of reloading the page
    }

    /** Revert all pending changes to this content library */
    handleRevertChanges = async () => {
        await libClient.revertLibraryChanges(this.props.id);
        this.props.onLibraryChanged();
        window.location.reload(); // Todo: Tell <LibraryBlocksWrapper> to refresh instead of reloading the page
    }
}
export const Library = withRouter(_Library);


export class LibraryWrapper extends React.PureComponent<
    RouteComponentProps<{libId: string}>,
    {data?: LibraryMetadata, status: LoadingStatus}
> {
    constructor(props) {
        super(props);
        this.state = {status: LoadingStatus.Loading};
    }
    
    async componentDidMount() {
        this.fetchLibraryData();
    }

    fetchLibraryData = async () => {
        const libraryId = this.props.match.params.libId;
        try {
            const data = await libClient.getLibrary(libraryId);
            this.setState({data, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <Library {...this.state.data} onLibraryChanged={this.fetchLibraryData}/>
        </LoadingWrapper>;
    }
}