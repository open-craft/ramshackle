import * as React from "react";
import { NavLink, Switch, Route, withRouter, RouteComponentProps } from "react-router-dom";

import {libClient, LibraryBlockMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';
import { Block, XBlockNotification, System } from "./Block/Block";
import { BlockAssetsWrapper } from "./BlockAssets";
import { BlockOlxWrapper } from "./BlockOlx";

type RouteProps = RouteComponentProps<{libId: string, blockId: string}>;
interface BlockPageProps extends LibraryBlockMetadata, RouteProps {
    onBlockChanged: () => void;
}
/**
 * Main page that has different tabs for viewing and editing an XBlock.
 */
class _BlockPage extends React.PureComponent<BlockPageProps> {
    render() {
        return <>
            <h2>{this.props.display_name}</h2>
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
                        <li className="nav-item">
                            <NavLink to={`${this.baseHref}/learn`} className='nav-link' activeClassName="active">Learn</NavLink>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <Switch>
                        <Route exact path={`${this.props.match.path}`}>
                            <Block usageKey={this.props.id} />
                        </Route>
                        <Route exact path={`${this.props.match.path}/edit`}>
                            <Block usageKey={this.props.id} viewName="studio_view" onNotification={this.handleEditNotification} />
                        </Route>
                        <Route exact path={`${this.props.match.path}/assets`}>
                            <BlockAssetsWrapper blockId={this.props.id} onBlockChanged={this.props.onBlockChanged} />
                        </Route>
                        <Route exact path={`${this.props.match.path}/source`}>
                            <BlockOlxWrapper blockId={this.props.id} onBlockChanged={this.props.onBlockChanged} />
                        </Route>
                        <Route exact path={`${this.props.match.path}/actions`}>
                            <section>
                                <h1>Actions</h1>
                                <button onClick={this.handleDeleteBlock} className="btn btn-outline-danger mb-2 mr-2">Delete this XBlock</button>
                            </section>
                        </Route>
                        <Route exact path={`${this.props.match.path}/learn`}>
                            <p>This tab uses the LMS APIs so it shows the published version only and will save user state.</p>
                            <Block usageKey={this.props.id} system={System.LMS} />
                        </Route>
                        <Route>Invalid tab / URL.</Route>
                    </Switch>
                </div>
            </div>
        </>
    }

    get baseHref() {
        return this.props.match.url;
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

    handleDeleteBlock = async () => {
        if (confirm("Are you sure you want to delete this XBlock? There is no undo.")) {
            await libClient.deleteLibraryBlock(this.props.id);
            // Leave this page:
            this.props.history.push(`/lib/${this.props.match.params.libId}/`);
            // And make sure the list of blocks in the library is refreshed:
            this.props.onBlockChanged();
        }
    }
}
export const BlockPage = withRouter(_BlockPage);


class _BlockPageWrapper extends React.PureComponent<
    RouteProps & {onBlockChanged: () => void},
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
            const data = await libClient.getLibraryBlock(this.props.match.params.blockId);
            this.setState({data, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    handleBlockChanged = () => {
        this.refreshBlockData();
        this.props.onBlockChanged();
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <BlockPage {...this.state.data} onBlockChanged={this.handleBlockChanged} />
        </LoadingWrapper>;
    }
}

export const BlockPageWrapper = withRouter(_BlockPageWrapper);
