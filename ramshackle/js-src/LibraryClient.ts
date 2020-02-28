type FetchOptions = Parameters<typeof fetch>[1];
interface RequestArgs extends FetchOptions {
    data?: any;
}

export const LMS_BASE_URL = window['ramshackle-config-lms-url'] || 'http://localhost:18000';
export const STUDIO_BASE_URL = window['ramshackle-config-studio-url'] || '';
export const STUDIO_LIBRARY_API_ROOT = STUDIO_BASE_URL + '/api/libraries/v2';
export const IS_REMOTE_SERVER = STUDIO_LIBRARY_API_ROOT.includes('http');

/**
 * Metadata about a content library
 */
export interface LibraryMetadata {
    id: string;
    org: string;
    slug: string;
    bundle_uuid: string;
    title: string;
    description: string;
    version: number;
    has_unpublished_changes: boolean;
    has_unpublished_deletes: boolean;
}
export type LibraryCreateData = Pick<LibraryMetadata, 'org'|'slug'|'title'|'description'>&{collection_uuid: string};

/**
 * Metadata about a content library XBlock
 */
export interface LibraryBlockMetadata {
    id: string;
    def_key: string;
    block_type: string;
    display_name: string;
    has_unpublished_changes: boolean;
}

/**
 * Data about each type of XBlock that can be added to a content library
 */
export interface LibraryXBlockType {
    block_type: string;
    display_name: string;
}

/**
 * Data about a link to another blockstore bundle (which may be a content library)
 */
export interface LibraryBundleLink {
    id: string;
    bundle_uuid: string;
    version: number;
    latest_version: number;
    opaque_key: string; // May be empty string
}

/**
 * Data required to create an XBlock in a content library
 */
export interface LibraryBlockCreate {
    block_type: string;
    slug: string;
}

/**
 * Data about a static asset file associated with an XBlock
 */
export interface LibraryXBlockAssetFile {
    path: string;
    url: string;
    size: number;
}


/**
 * A simple API client for the Open edX content libraries API
 */
class LibraryClient {

    async _call(url: string, args: RequestArgs = {}): Promise<any> {
        if (args.data) {
            args.body = JSON.stringify(args.data);
            delete args.data;
        }
        const combinedArgs: FetchOptions = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            ...args,
        };
        if (window['ramshackle-config-access-token']) {
            combinedArgs.headers['Authorization'] = `Bearer ${window['ramshackle-config-access-token']}`;
        } else {
            // For connecting to local Studio we need CSRF:
            combinedArgs.headers['X-CSRFToken'] = getCookie('csrftoken');
        }
        const result = await fetch(`${STUDIO_LIBRARY_API_ROOT}${url}`, combinedArgs);
        if (result.status < 200 || result.status >= 300) {
            try {
                console.error(await result.json());
            } catch {}
            throw new Error(result.statusText);
        }
        return await result.json();
    }

    async listLibraries(): Promise<LibraryMetadata[]> {
        if (IS_REMOTE_SERVER) {
            return []; // Don't allow listing all libraries on a remote server
        }
        return this._call('/');
    }

    async getLibrary(id: string): Promise<LibraryMetadata> {
        return this._call(`/${id}/`);
    }

    /** Commit draft changes to the given library */
    async commitLibraryChanges(id: string): Promise<void> {
        return (await this._call(`/${id}/commit/`, {method: 'POST'}));
    }

    /** Revert draft changes to the given library */
    async revertLibraryChanges(id: string): Promise<void> {
        return (await this._call(`/${id}/commit/`, {method: 'DELETE'}));
    }

    async createLibrary(data: LibraryCreateData): Promise<LibraryMetadata> {
        return this._call(`/`, {method: 'POST', data: data});
    }

    async getLibraryBlocks(id: string): Promise<LibraryBlockMetadata[]> {
        return this._call(`/${id}/blocks/`);
    }

    async getLibraryLinks(id: string): Promise<LibraryBundleLink[]> {
        return this._call(`/${id}/links/`);
    }

    /** Modify the library 'libraryId' to include a new link to the specified library */
    async createLibraryLink(libraryId: string, linkId: string, targetLibId: string, version: number|null): Promise<void> {
        return this._call(`/${libraryId}/links/`, {method: 'POST', data: {
            id: linkId,
            opaque_key: targetLibId,
            version,
        }});
    }

    /** Change the version of an existing library link. Set version=null to use latest version. */
    async updateLibraryLink(libraryId: string, linkId: string, version: number|null): Promise<void> {
        return this._call(`/${libraryId}/links/${linkId}/`, {method: 'PATCH', data: {version}});
    }

    /** Delete a link from the specified library. */
    async deleteLibraryLink(libraryId: string, linkId: string): Promise<void> {
        return this._call(`/${libraryId}/links/${linkId}/`, {method: 'DELETE'});
    }

    /** Get the list of block types that can be added to the given library */
    async getLibraryBlockTypes(id: string): Promise<LibraryXBlockType[]> {
        return this._call(`/${id}/block_types/`);
    }

    async getLibraryBlock(id: string): Promise<LibraryBlockMetadata> {
        return this._call(`/blocks/${id}/`);
    }

    async createLibraryBlock(libraryId: string, blockType: string, slug: string): Promise<LibraryBlockMetadata> {
        return this._call(`/${libraryId}/blocks/`, {method: 'POST', data: {
            block_type: blockType,
            definition_id: slug,
        }});
    }

    async deleteLibraryBlock(id: string): Promise<void> {
        await this._call(`/blocks/${id}/`, {method: 'DELETE'});
    }

    /** Get the OLX source code of the given block */
    async getLibraryBlockOlx(id: string): Promise<string> {
        return (await this._call(`/blocks/${id}/olx/`)).olx;
    }

    /** Set the OLX source code of the given block */
    async setLibraryBlockOlx(id: string, newOlx: string): Promise<void> {
        await this._call(`/blocks/${id}/olx/`, {method: 'POST', data: {olx: newOlx}});
    }

    /** Get the static asset files of the given block */
    async getLibraryBlockAssets(id: string): Promise<LibraryXBlockAssetFile[]> {
        return (await this._call(`/blocks/${id}/assets/`)).files;
    }

    /** Add a static asset file to the given block */
    async addLibraryBlockAsset(id: string, fileName: string, fileData: File): Promise<LibraryXBlockAssetFile> {
        const requestData = new FormData();
        requestData.set('content', fileData, fileName);
        return (await this._call(`/blocks/${id}/assets/${fileName}`, {
            method: 'PUT',
            body: requestData,
            headers: {/* Clear the Content-Type header so FormData can set it correctly */},
        }));
    }

    /** Delete a static asset file from the given block */
    async deleteLibraryBlockAsset(id: string, fileName: string): Promise<void> {
        return (await this._call(`/blocks/${id}/assets/${fileName}`, {method: 'DELETE'}));
    }
}
export const libClient = new LibraryClient();


/**
 * A simple API client for the Open edX XBlock API
 */
class XBlockClient {

    public readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;  // Set to the base URL of either the LMS or Studio
    }

    async _call(url: string, args: RequestArgs = {}): Promise<any> {
        if (args.data) {
            args.body = JSON.stringify(args.data);
            delete args.data;
        }
        const combinedArgs: FetchOptions = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            ...args,
        };
        if (window['ramshackle-config-access-token']) {
            combinedArgs.headers['Authorization'] = `Bearer ${window['ramshackle-config-access-token']}`;
        } else {
            // For connecting to local Studio we need CSRF:
            combinedArgs.headers['X-CSRFToken'] = getCookie('csrftoken');
        }
        const result = await fetch(`${this.baseUrl}/api/xblock/v2${url}`, combinedArgs);
        if (result.status < 200 || result.status >= 300) {
            try {
                console.error(await result.json());
            } catch {}
            throw new Error(result.statusText);
        }
        return await result.json();
    }

    async getMetadata(id: string): Promise<any> {
        return this._call(`/xblocks/${id}/`);
    }

    async renderView(id: string, viewName: string): Promise<any> {
        return this._call(`/xblocks/${id}/view/${viewName}/`);
    }

    async getHandlerUrl(id: string, handlerName: string): Promise<any> {
        const result = await this._call(`/xblocks/${id}/handler_url/${handlerName}/`);
        return result.handler_url;
    }
}
export const studioXBlockClient = new XBlockClient(STUDIO_BASE_URL);
export const lmsXBlockClient = new XBlockClient(LMS_BASE_URL);

/**
 * JS Cookie parser from Django docs
 * https://docs.djangoproject.com/en/2.2/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
 * @param name Name of the cookie to get
 */
function getCookie(name: string) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
