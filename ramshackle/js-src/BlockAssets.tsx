import * as React from 'react';
import {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';

import {libClient, LibraryXBlockAssetFile} from './LibraryClient';
import {LoadingStatus, LoadingWrapper} from './LoadingWrapper';


/**
 * Display the static assets associated with an XBlock
 */
const BlockAssets: React.FunctionComponent<{
    assetList: LibraryXBlockAssetFile[],
    onDropFiles: (acceptedFiles: File[]) => void,
    onDeleteFile: (filename: string) => void,
}> = (props) => {

    const onDrop = useCallback(props.onDropFiles, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    return <>
        <h1 className={`float-right`}>🗃<span className='sr-only'>Static Assets</span></h1>
        <p>There are {props.assetList.length} static asset files for this XBlock:</p>
        <ul>
            {
                props.assetList.map(assetFile =>
                    <li key={assetFile.path}>
                        <a href={assetFile.url}>{assetFile.path}</a> {' '}
                        ({Math.round(assetFile.size / 1024.0)} KB)
                        (<button onClick={() => props.onDeleteFile(assetFile.path)} className={`btn btn-link p-0`} title="Delete this file">x</button>)
                    </li>
                )
            }
        </ul>
        <div {...getRootProps()} style={{lineHeight: '150px', border: '3px solid #ddd', textAlign: 'center', backgroundColor: isDragActive ? '#90ee90' : '#fbfbfb', marginBottom: '1em', }}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                <span>➕ Drop the files here ...</span> :
                <span>➕ Drag and drop some files here to upload them, or click here to select files.</span>
            }
        </div>
        <p>Tip: set the filenames carefully <em>before</em> uploading, as there is no rename tool.</p>
    </>;
}


export class BlockAssetsWrapper extends React.PureComponent<{blockId: string, onBlockChanged: () => void}, {assetList: LibraryXBlockAssetFile[], status: LoadingStatus}> {
    constructor(props) {
        super(props);
        this.state = {
            assetList: [],
            status: LoadingStatus.Loading,
        };
    }
    
    async componentDidMount() {
        try {
            const files = await libClient.getLibraryBlockAssets(this.props.blockId);
            this.setState({assetList: files, status: LoadingStatus.Ready});
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    render() {
        return <LoadingWrapper status={this.state.status}>
            <BlockAssets assetList={this.state.assetList} onDropFiles={this.uploadAssetFiles} onDeleteFile={this.deleteAssetFile} />
        </LoadingWrapper>;
    }

    /**
     * Do something, then update the list of assets.
     */
    async doThenRefresh(someThingToDo: Promise<any>) {
        this.setState({status: LoadingStatus.Loading});
        try {
            await someThingToDo;
            const assetList = await libClient.getLibraryBlockAssets(this.props.blockId);
            this.setState({assetList, status: LoadingStatus.Ready});
            this.props.onBlockChanged();
        } catch (err) {
            console.error(err);
            this.setState({status: LoadingStatus.Error});
        }
    }

    /**
     * Upload new files to the content library
     */
    uploadAssetFiles = async (files: File[]) => {
        this.doThenRefresh(
            (async () => {
                for (const file of files) {
                    // Upload each file to this block's static assets:
                    await libClient.addLibraryBlockAsset(this.props.blockId, file.name, file);
                }
            })()
            // The following parallelized implementation is faster but currently
            // doesn't work due to a race condition in blockstore.
            // // For each file in files:
            // Promise.all(files.map(file =>
            //     // Upload the file to this block's static assets:
            //     libClient.addLibraryBlockAsset(this.props.blockId, file.name, file),
            // ))
        );
    }

    deleteAssetFile = async (filePath: string) => {
        if (confirm(`Are you sure you want to delete ${filePath}?`)) {
            this.doThenRefresh(
                libClient.deleteLibraryBlockAsset(this.props.blockId, filePath),
            );
        }
    }
}
