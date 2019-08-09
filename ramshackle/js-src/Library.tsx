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
                <LibraryBlocksWrapper libraryId={this.props.id} onLibraryChanged={this.props.onLibraryChanged}/>
            </Route>
            <Route>
                Not found.
            </Route>
        </Switch>
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