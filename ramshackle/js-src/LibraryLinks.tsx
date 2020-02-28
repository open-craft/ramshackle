import * as React from "react";
import { NavLink } from "react-router-dom";

import {libClient, LibraryBundleLink} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';

interface Props {
    libraryId: string;
    /** The list of bundles that this library links to */
    links: LibraryBundleLink[];
    onDeleteLink: (linkId: string) => void;
    onUpdateLink: (linkId: string) => void;
    onCreateLink: (linkId: string, libKey: string) => void;
}
interface State {
    newLinkId: string;
    newLinkTarget: string;
    // If the user clicks "Delete" on a link, this is used to show a confirmation button:
    clickedDeleteOnLink: string;
}


export class LibraryLinks extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {newLinkId: '', newLinkTarget: '', clickedDeleteOnLink: ''};
    }
    render() {
        return <>
            <h2>Library Links</h2>
            <ul>
                {this.props.links.map((link) => {
                    let desc: React.ReactNode = `Bundle ${link.bundle_uuid}`;
                    if (link.opaque_key && link.opaque_key.startsWith('lib:')) {
                        desc = <NavLink to={`/lib/${link.opaque_key}`}>{link.opaque_key}</NavLink>
                    }
                    return <li key={link.id}>
                        <strong>{link.id}</strong>:{' '}
                        {desc} (version {link.version})
                        {link.latest_version > link.version ?
                            <button className='btn btn-small btn-link'
                                onClick={() => { this.props.onUpdateLink(link.id); }}
                            >Update to latest version ({link.latest_version})</button>
                        : null}
                        {/* Show the "Delete" button, or if the user clicked it already, show "Are you sure?" */}
                        {link.id === this.state.clickedDeleteOnLink ?
                            <>
                                Are you sure? {' '}
                                <button className='btn btn-sm btn-danger'
                                    onClick={() => { this.props.onUpdateLink(link.id); }}
                                >Delete</button>
                                <button className='btn btn-sm btn-link' onClick={() => {
                                    this.setState({clickedDeleteOnLink: ''});
                                }}>Cancel</button>
                            </>
                        :
                            <button className='btn btn-sm btn-link' onClick={() => {
                                this.setState({clickedDeleteOnLink: link.id});
                            }}>Delete</button>
                        }
                    </li>;
                })}
                <li>
                    Add a new link to library: {' '}
                    <input
                        type='text' placeholder='link_id' size={10}
                        value={this.state.newLinkId}
                        onChange={this.newLinkIdChanged}
                    />
                    <input
                        type='text' placeholder={this.props.libraryId}
                        value={this.state.newLinkTarget}
                        onChange={this.newLinkTargetChanged}
                    />
                    <button
                        className='btn btn-sm btn-primary'
                        disabled={!this.state.newLinkId || !this.state.newLinkTarget}
                        onClick={this.createNewLink}
                    >Add</button>
                </li>
            </ul>
        </>
    }
    private newLinkIdChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newLinkId: event.target.value});
    }
    private newLinkTargetChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newLinkTarget: event.target.value});
    }
    private createNewLink = () => {
        this.props.onCreateLink(this.state.newLinkId, this.state.newLinkTarget);
        this.setState({newLinkId: '', newLinkTarget: ''});
    }
}


export class LibraryLinksWrapper extends React.PureComponent<
    {libraryId: string, onLibraryChanged: () => void},
    {links?: LibraryBundleLink[], status: LoadingStatus}
> {
    constructor(props) {
        super(props);
        this.state = {
            links: [],
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        this.fetchLibraryLinks();
    }
    public componentDidUpdate(prevProps) {
        if (this.props.libraryId !== prevProps.libraryId) {
            this.setState({status: LoadingStatus.Loading});
            this.fetchLibraryLinks();
        }
    }

    fetchLibraryLinks = async () => {
        const libraryId = this.props.libraryId;
        try {
            const links = await libClient.getLibraryLinks(libraryId);
            links.sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID
            this.setState({links, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <LibraryLinks
                libraryId={this.props.libraryId}
                links={this.state.links}
                onUpdateLink={this.onUpdateLink}
                onDeleteLink={this.onDeleteLink}
                onCreateLink={this.onCreateLink}
            />
        </LoadingWrapper>;
    }

    private onUpdateLink = async (linkId: string) => {
        await libClient.updateLibraryLink(this.props.libraryId, linkId, null);
        this.fetchLibraryLinks();
        this.props.onLibraryChanged();
    }

    private onDeleteLink = async (linkId: string) => {
        await libClient.deleteLibraryLink(this.props.libraryId, linkId);
        this.fetchLibraryLinks();
        this.props.onLibraryChanged();
    }

    private onCreateLink = async (linkId: string, libKey: string) => {
        await libClient.createLibraryLink(this.props.libraryId, linkId, libKey, null);
        this.fetchLibraryLinks();
        this.props.onLibraryChanged();
    }
}
