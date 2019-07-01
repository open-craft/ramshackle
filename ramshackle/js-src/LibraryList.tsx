import * as React from "react";
import { Link } from "react-router-dom";

import {libClient, LibraryMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


export class LibraryList extends React.PureComponent<{libraries: LibraryMetadata[]}> {
    render() {
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
}


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