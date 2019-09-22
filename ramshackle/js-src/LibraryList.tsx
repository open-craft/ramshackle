import * as React from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

import {libClient, LibraryMetadata, IS_REMOTE_SERVER} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


class _LibraryList extends React.PureComponent<{libraries: LibraryMetadata[]}&RouteComponentProps> {
    render() {
        if (IS_REMOTE_SERVER) {
            return <>
                <h1>Remote Content Libraries</h1>
                <p>You cannot list the libraries on a remote server. Enter a library ID to access it:</p>
                <input type="text" id="library-manual-id-input" />
                <button onClick={this.handleManualAccessButton}>Access</button>
            </>;
        }
        return <>
            <h1>All Content Libraries</h1>
            <p>There are {this.props.libraries.length} content libraries:</p>
            <ul>
                {this.props.libraries.map(lib => (
                    <li key={lib.id}>
                        <Link to={`/lib/${lib.id}`}>{lib.title}</Link>
                    </li>
                ))}
            </ul>
            <Link to="/add/" className="btn btn-primary">Add New Library</Link>
        </>
    }

    handleManualAccessButton = () => {
        const libId = (document.getElementById('library-manual-id-input') as HTMLInputElement).value;
        this.props.history.push(`/lib/${libId}`);
    }
}

export const LibraryList = withRouter(_LibraryList);


export class LibraryListWrapper extends React.PureComponent<any, {libraryList: LibraryMetadata[], status: LoadingStatus}> {
    constructor(props) {
        super(props);
        this.state = {
            libraryList: [],
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        try {
            const libraryList = await libClient.listLibraries();
            this.setState({
                libraryList,
                status: LoadingStatus.Ready,
            });
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <LibraryList libraries={this.state.libraryList}/>
        </LoadingWrapper>;
    }
}