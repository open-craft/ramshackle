import * as React from "react";
import { match, Link, NavLink, Switch, Route } from "react-router-dom";

import {libClient, LibraryMetadata, LibraryBlockMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


type MatchProps = {match: match<{lib_id: string, id: string}>};

/**
 * Main page that has different tabs for viewing and editing an XBlock.
 */
export class BlockPage extends React.PureComponent<LibraryBlockMetadata & MatchProps> {
    render() {
        const baseHref = `/lib/${this.props.match.params.lib_id}/blocks/${this.props.match.params.id}`;
        return <>
            <h1>{this.props.display_name}</h1>
            <div className="card">
                <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <NavLink exact to={`${baseHref}`} className='nav-link' activeClassName="active">View</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={`${baseHref}/edit`} className='nav-link' activeClassName="active">Edit</NavLink>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <Switch>
                        <Route exact path={`${baseHref}`}>
                            View
                        </Route>
                        <Route exact path={`${baseHref}/edit`}>
                            Edit
                        </Route>
                    </Switch>
                </div>
            </div>
        </>
    }
}


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
            <BlockPage {...this.state.data} match={this.props.match}/>
        </LoadingWrapper>;
    }
}
