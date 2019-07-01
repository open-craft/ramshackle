type FetchOptions = Parameters<typeof fetch>[1];
interface RequestArgs extends FetchOptions {
    data?: any;
}

/**
 * Metadata about a content library
 */
export interface LibraryMetadata {
    id: string;
    slug: string;
    bundle_uuid: string;
    title: string;
    description: string;
    version: number;
}
export type LibraryCreateData = Pick<LibraryMetadata, 'slug'|'title'|'description'>&{collection_uuid: string};

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
 * Data required to create an XBlock in a content library
 */
export interface LibraryBlockCreate {
    block_type: string;
    slug: string;
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
                'X-CSRFToken': getCookie('csrftoken'),
            },
            ...args,
        };
        const result = await fetch(`/api/libraries/v2${url}`, combinedArgs);
        if (result.status < 200 || result.status >= 300) {
            try {
                console.error(await result.json());
            } catch {}
            throw new Error(result.statusText);
        }
        return await result.json();
    }

    async listLibraries(): Promise<LibraryMetadata[]> {
        return this._call('/');
    }

    async getLibrary(id: string): Promise<LibraryMetadata> {
        return this._call(`/${id}/`);
    }

    async createLibrary(data: LibraryCreateData): Promise<LibraryMetadata> {
        return this._call(`/`, {method: 'POST', data: data});
    }

    async getLibraryBlocks(id: string): Promise<LibraryBlockMetadata[]> {
        return this._call(`/${id}/blocks/`);
    }

    async getLibraryBlock(id: string): Promise<LibraryBlockMetadata> {
        // Temporary implementation:
        const libraryId = 'lib:' + id.split(':')[1];
        const blocks = await this.getLibraryBlocks(libraryId);
        for (const block of blocks) {
            if (block.id === id) {
                return block;
            }
        }
        throw new Error("Block not found.");
    }
}
export const libClient = new LibraryClient();


/**
 * A simple API client for the Open edX XBlock API
 */
class XBlockClient {

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
                'X-CSRFToken': getCookie('csrftoken'),
            },
            ...args,
        };
        const result = await fetch(`/api/xblock/v2${url}`, combinedArgs);
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
export const xblockClient = new XBlockClient();

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
