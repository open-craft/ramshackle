import * as React from "react";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";

import {libClient, LibraryBlockMetadata, LibraryXBlockType} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';

interface Props extends RouteComponentProps {
    libraryId: string;
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


export class _LibraryBlocks extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {newBlockType: 'html', newBlockSlug: ''};
    }
    render() {
        return <>
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
                                    <Link to={`/lib/${this.props.libraryId}/blocks/${block.id}`} className="btn btn-sm btn-outline-primary mr-2">View</Link>
                                    <Link to={`/lib/${this.props.libraryId}/blocks/${block.id}/edit`} className="btn btn-sm btn-outline-secondary mr-2">Edit</Link>
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
        const data = await libClient.createLibraryBlock(this.props.libraryId, this.state.newBlockType, this.state.newBlockSlug);
        this.props.history.push(`/lib/${this.props.libraryId}/blocks/${data.id}`);
    }
}
export const LibraryBlocks = withRouter(_LibraryBlocks);


export class LibraryBlocksWrapper extends React.PureComponent<
    {libraryId: string, onLibraryChanged: () => void},
    {blocks?: LibraryBlockMetadata[], blockTypes: LibraryXBlockType[], status: LoadingStatus}
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
        const libraryId = this.props.libraryId;
        const blockTypes = await libClient.getLibraryBlockTypes(libraryId);
        this.setState({blockTypes: blockTypes});
    }

    fetchLibraryData = async () => {
        const libraryId = this.props.libraryId;
        try {
            const blocks = await libClient.getLibraryBlocks(libraryId);
            this.setState({blocks, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    handleLibraryChanged = () => {
        this.fetchLibraryData();
        this.props.onLibraryChanged();
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <LibraryBlocks
                libraryId={this.props.libraryId}
                blocks={this.state.blocks}
                newBlockTypes={this.state.blockTypes}
                onLibraryChanged={this.handleLibraryChanged}
            />
        </LoadingWrapper>;
    }
}
