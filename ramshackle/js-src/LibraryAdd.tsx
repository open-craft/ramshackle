import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import {libClient, LibraryCreateData} from './LibraryClient';


export class LibraryAddForm extends React.PureComponent<RouteComponentProps, LibraryCreateData> {
    constructor(props) {
        super(props);
        this.state = {
            org: '',
            slug: '',
            collection_uuid: '',
            title: '',
            description: '',
        };
    }
    render() {
        return <>
            <h1>Add a new content library</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="newLibraryOrg">Organization ID</label>
                    <input type="text" className="form-control" id="newLibraryOrg" placeholder="edX" value={this.state.org} onChange={this.handleChangeOrg}/>
                    <small>You can see/edit the organizations <a href="http://localhost:18000/admin/organizations/organization/">via the Django admin</a> or <a href="http://localhost:18000/api/organizations/v0/organizations/">API</a>. Enter the "Short Name" here.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="newLibrarySlug">Slug</label>
                    <input type="text" className="form-control" id="newLibrarySlug" placeholder="my-lib" value={this.state.slug} onChange={this.handleChangeSlug}/>
                </div>
                <div className="form-group">
                    <label htmlFor="newLibraryTitle">Title</label>
                    <input type="text" className="form-control" id="newLibraryTitle" placeholder="My New Library" value={this.state.title} onChange={this.handleChangeTitle}/>
                </div>
                <div className="form-group">
                    <label htmlFor="newLibraryDescription">Description</label>
                    <input type="text" className="form-control" id="newLibraryDescription" placeholder="Describe your library" value={this.state.description} onChange={this.handleChangeDescription}/>
                </div>
                <div className="form-group">
                    <label htmlFor="newLibraryCollectionUUID">Collection UUID</label>
                    <input type="text" style={{fontFamily: "monospace"}} className="form-control" id="newLibraryCollectionUUID" placeholder="11111111-1111-1111-1111-111111111111" maxLength={36} value={this.state.collection_uuid} onChange={this.handleChangeCollectionUUID}/>
                    <small>You can see all the collection UUIDs <a href="http://localhost:18250/api/v1/collections">via the Blockstore API</a>.</small>
                </div>
                <button type="submit" disabled={!this.canSubmit} className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
                <Link to="/" className="btn btn-secondary">Cancel</Link>
            </form>
        </>
    }

    // Event handlers:
    handleChangeOrg = (event: React.ChangeEvent<HTMLInputElement>) => { this.setState({org: event.target.value}); }
    handleChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => { this.setState({slug: event.target.value}); }
    handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => { this.setState({title: event.target.value}); }
    handleChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => { this.setState({description: event.target.value}); }
    handleChangeCollectionUUID = (event: React.ChangeEvent<HTMLInputElement>) => { this.setState({collection_uuid: event.target.value}); }
    handleSubmit = async (event: React.MouseEvent) => {
        event.preventDefault();
        const newLibrary = await libClient.createLibrary(this.state);
        this.props.history.push(`/lib/${newLibrary.id}`);
    }

    get canSubmit() {
        return this.state.slug && this.state.collection_uuid;
    }
}
