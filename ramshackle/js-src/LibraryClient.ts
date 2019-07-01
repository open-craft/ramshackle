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

/**
 * A simple API client for the Open edX content libraries API
 */
class LibraryClient {

    async _call(url: string, args: RequestArgs = {}) {
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
        const result = await fetch(`/api/libraries/v2${url}`, combinedArgs);
        return await result.json();
    }

    async listLibraries(): Promise<LibraryMetadata[]> {
        return this._call('/');
    }

    async getLibrary(id: string): Promise<LibraryMetadata> {
        return this._call(`/${id}/`);
    }
}
export const libClient = new LibraryClient();
