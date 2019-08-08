import * as React from "react";
import { match, Link, withRouter, RouteComponentProps } from "react-router-dom";

import {libClient, LibraryMetadata, LibraryBlockMetadata, LibraryXBlockType} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';

interface Props extends LibraryMetadata, RouteComponentProps {
    /** The list of XBlocks that are currently in this library */
    blocks: LibraryBlockMetadata[];
    /** A list of XBlock types that *can* be added to this library. */
    newBlockTypes: LibraryXBlockType[];
    /** Event to notify that the library has been updated. */
    onLibraryChanged: () => void;
}
interface State {
    newBlockType: string;
    newBlockSlug: string;
}


export class _Library extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {newBlockType: 'html', newBlockSlug: ''};
    }
    render() {
        return <>
            <h1>{this.props.title}</h1>
            <p>Version: {this.props.version}</p>
            <p>Description: {this.props.description}</p>
            <h2>Library Blocks</h2>
            <div className="row">
                {
                    this.props.blocks.map((block) => (
                        <div className="col-sm-4 mb-4" key={block.id}>
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="card-title">{block.display_name}</h3>
                                    <p>
                                        {block.block_type}<br/>
                                        <small className="text-muted">{block.id}</small>
                                    </p>
                                    {
                                        block.has_unpublished_changes ? <p className="badge badge-info">Unpublished Changes</p> : null
                                    }
                                </div>
                                <div className="card-footer">
                                    <Link to={`/lib/${this.props.id}/blocks/${block.id}`} className="btn btn-sm btn-outline-primary mr-2">View</Link>
                                    <Link to={`/lib/${this.props.id}/blocks/${block.id}/edit`} className="btn btn-sm btn-outline-secondary mr-2">Edit</Link>
                                    {
                                        block.has_unpublished_changes ?
                                            <button onClick={() => {this.handlePublishBlock(block.id)}} className="btn btn-sm btn-outline-success mr-2">Publish</button>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <h2>Add a new block</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="newBlockType">Type</label>
                    <select className="form-control" id="newBlockType" value={this.state.newBlockType} onChange={this.handleChangeNewBlockType}>
                        {this.props.newBlockTypes.map(blockType => (
                            <option value={blockType.block_type} key={blockType.block_type}>{blockType.block_type} ({blockType.display_name})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="newBlockSlug">Slug</label>
                    <input type="text" className="form-control" id="newBlockSlug" placeholder={`${this.state.newBlockType}1`} value={this.state.newBlockSlug} onChange={this.handleChangeNewBlockSlug}/>
                    <small>This becomes part of the usage ID and definition ID, and cannot be changed.</small>
                </div>
                <button type="submit" disabled={!this.state.newBlockType || !this.state.newBlockSlug} className="btn btn-primary" onClick={this.handleAddNewBlock}>Add Block</button>
            </form>
        </>
    }

    handleChangeNewBlockType = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({newBlockType: event.target.value});
    }

    handleChangeNewBlockSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newBlockSlug: event.target.value});
    }

    handleAddNewBlock = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const data = await libClient.createLibraryBlock(this.props.id, this.state.newBlockType, this.state.newBlockSlug);
        this.props.history.push(`/lib/${this.props.id}/blocks/${data.id}`);
    }

    handlePublishBlock = async (blockId: string) => {
        event.preventDefault();
        await libClient.commitLibraryBlock(blockId);
        this.props.onLibraryChanged();
    } 
}
export const Library = withRouter(_Library);


export class LibraryWrapper extends React.PureComponent<
    {match: match<{id: string}>},
    {data?: LibraryMetadata, blocks?: LibraryBlockMetadata[], blockTypes: LibraryXBlockType[], status: LoadingStatus}
> {
    constructor(props) {
        super(props);
        this.state = {
            blockTypes: [{block_type: 'html', display_name: 'Text'}],
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        this.fetchLibraryData();
        const libraryId = this.props.match.params.id;
        const blockTypes = await libClient.getLibraryBlockTypes(libraryId);
        this.setState({blockTypes: blockTypes});
    }

    fetchLibraryData = async () => {
        const libraryId = this.props.match.params.id;
        try {
            const [data, blocks] = await Promise.all([
                libClient.getLibrary(libraryId),
                libClient.getLibraryBlocks(libraryId),
            ]);
            this.setState({data, blocks, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <Library {...this.state.data} blocks={this.state.blocks} newBlockTypes={this.state.blockTypes} onLibraryChanged={this.fetchLibraryData}/>
        </LoadingWrapper>;
    }
}