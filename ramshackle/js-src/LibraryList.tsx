import * as React from "react";

import {libClient} from './LibraryClient';


export class LibraryList extends React.PureComponent<{libraries: any[]}> {
    render() {
        return <ul>
            {this.props.libraries.map(lib => {
                return <li key={lib.key}>{lib.title}</li>
            })}
        </ul>;
    }
}


export class LibraryListWrapper extends React.PureComponent<any, {libraryList: any[]|null, loading: boolean}> {
    constructor(props) {
        super(props);
        this.state = {
            libraryList: null,
            loading: true,
        };
    }
    
    async componentDidMount() {
        try {
            const libraryList = await libClient.listLibraries();
            this.setState({
                libraryList,
                loading: false,
            });
        } catch (err) {
            console.error(err);
            this.setState({loading: false});
        }
    }

    render() {
        if (this.state.loading) {
            return <p>Loading...</p>;
        } else if (this.state.libraryList) {
            return <LibraryList libraries={this.state.libraryList}/>;
        } else {
            return <p>Unable to load libraries</p>;
        }
    }
}