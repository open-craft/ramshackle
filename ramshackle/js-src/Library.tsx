import * as React from "react";
import { match, Link } from "react-router-dom";

import {libClient, LibraryMetadata, LibraryBlockMetadata} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


export class Library extends React.PureComponent<LibraryMetadata&{blocks: LibraryBlockMetadata[]}> {
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
                                            <Link to="/" className="btn btn-sm btn-outline-success mr-2">Publish</Link>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    }
}


export class LibraryWrapper extends React.PureComponent<
    {match: match<{id: string}>},
    {data?: LibraryMetadata, blocks?: LibraryBlockMetadata[], status: LoadingStatus}
> {
    constructor(props) {
        super(props);
        this.state = {
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        try {
            const [data, blocks] = await Promise.all([
                libClient.getLibrary(this.props.match.params.id),
                libClient.getLibraryBlocks(this.props.match.params.id),
            ]);
            this.setState({data, blocks, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <Library {...this.state.data} blocks={this.state.blocks}/>
        </LoadingWrapper>;
    }
}