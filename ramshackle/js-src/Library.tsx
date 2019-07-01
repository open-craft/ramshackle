import * as React from "react";
import { match } from "react-router-dom";

import {libClient, LibraryMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


export class Library extends React.PureComponent<LibraryMetadata> {
    render() {
        return <>
            <h1>{this.props.title}</h1>
            <p>This is a content library (key: {this.props.id}).</p>
        </>
    }
}


export class LibraryWrapper extends React.PureComponent<
    {match: match<{id: string}>},
    {data?: LibraryMetadata, status: LoadingStatus}
> {
    constructor(props) {
        super(props);
        this.state = {
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        try {
            const data = await libClient.getLibrary(this.props.match.params.id);
            this.setState({data, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <Library {...this.state.data}/>
        </LoadingWrapper>;
    }
}