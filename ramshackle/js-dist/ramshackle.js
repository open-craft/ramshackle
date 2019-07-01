var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("LibraryClient", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A simple API client for the Open edX content libraries API
     */
    class LibraryClient {
        _call(url, args = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                if (args.data) {
                    args.body = JSON.stringify(args.data);
                    delete args.data;
                }
                const combinedArgs = Object.assign({ method: 'GET', credentials: 'include', headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    } }, args);
                const result = yield fetch(`/api/libraries/v2${url}`, combinedArgs);
                if (result.status < 200 || result.status >= 300) {
                    try {
                        console.error(yield result.json());
                    }
                    catch (_a) { }
                    throw new Error(result.statusText);
                }
                return yield result.json();
            });
        }
        listLibraries() {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call('/');
            });
        }
        getLibrary(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/${id}/`);
            });
        }
        createLibrary(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/`, { method: 'POST', data: data });
            });
        }
        getLibraryBlocks(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._call(`/${id}/blocks/`);
            });
        }
        getLibraryBlock(id) {
            return __awaiter(this, void 0, void 0, function* () {
                // Temporary implementation:
                const libraryId = 'lib:' + id.split(':')[1];
                const blocks = yield this.getLibraryBlocks(libraryId);
                for (const block of blocks) {
                    if (block.id === id) {
                        return block;
                    }
                }
                throw new Error("Block not found.");
            });
        }
    }
    exports.libClient = new LibraryClient();
    /**
     * JS Cookie parser from Django docs
     * https://docs.djangoproject.com/en/2.2/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
     * @param name Name of the cookie to get
     */
    function getCookie(name) {
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
});
define("LoadingWrapper", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LoadingWrapper extends React.PureComponent {
        render() {
            if (this.props.status === 1 /* Ready */) {
                return this.props.children;
            }
            else if (this.props.status === 0 /* Loading */) {
                return React.createElement("p", null, "Loading...");
            }
            else {
                return React.createElement("p", null, "An error occurred");
            }
        }
    }
    exports.LoadingWrapper = LoadingWrapper;
});
define("BlockPage", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper"], function (require, exports, React, react_router_dom_1, LibraryClient_1, LoadingWrapper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Main page that has different tabs for viewing and editing an XBlock.
     */
    class BlockPage extends React.PureComponent {
        render() {
            const baseHref = `/lib/${this.props.match.params.lib_id}/blocks/${this.props.match.params.id}`;
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, this.props.display_name),
                React.createElement("div", { className: "card" },
                    React.createElement("div", { className: "card-header" },
                        React.createElement("ul", { className: "nav nav-tabs card-header-tabs" },
                            React.createElement("li", { className: "nav-item" },
                                React.createElement(react_router_dom_1.NavLink, { exact: true, to: `${baseHref}`, className: 'nav-link', activeClassName: "active" }, "View")),
                            React.createElement("li", { className: "nav-item" },
                                React.createElement(react_router_dom_1.NavLink, { to: `${baseHref}/edit`, className: 'nav-link', activeClassName: "active" }, "Edit")))),
                    React.createElement("div", { className: "card-body" },
                        React.createElement(react_router_dom_1.Switch, null,
                            React.createElement(react_router_dom_1.Route, { exact: true, path: `${baseHref}` }, "View"),
                            React.createElement(react_router_dom_1.Route, { exact: true, path: `${baseHref}/edit` }, "Edit")))));
        }
    }
    exports.BlockPage = BlockPage;
    class BlockPageWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const data = yield LibraryClient_1.libClient.getLibraryBlock(this.props.match.params.id);
                    this.setState({ data, status: 1 /* Ready */ });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
            });
        }
        render() {
            return React.createElement(LoadingWrapper_1.LoadingWrapper, { status: this.state.status },
                React.createElement(BlockPage, Object.assign({}, this.state.data, { match: this.props.match })));
        }
    }
    exports.BlockPageWrapper = BlockPageWrapper;
});
define("Library", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper"], function (require, exports, React, react_router_dom_2, LibraryClient_2, LoadingWrapper_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Library extends React.PureComponent {
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, this.props.title),
                React.createElement("p", null,
                    "Version: ",
                    this.props.version),
                React.createElement("p", null,
                    "Description: ",
                    this.props.description),
                React.createElement("h2", null, "Library Blocks"),
                React.createElement("div", { className: "row" }, this.props.blocks.map((block) => (React.createElement("div", { className: "col-sm-4 mb-4", key: block.id },
                    React.createElement("div", { className: "card" },
                        React.createElement("div", { className: "card-body" },
                            React.createElement("h3", { className: "card-title" }, block.display_name),
                            React.createElement("p", null,
                                block.block_type,
                                React.createElement("br", null),
                                React.createElement("small", { className: "text-muted" }, block.id)),
                            block.has_unpublished_changes ? React.createElement("p", { className: "badge badge-info" }, "Unpublished Changes") : null),
                        React.createElement("div", { className: "card-footer" },
                            React.createElement(react_router_dom_2.Link, { to: `/lib/${this.props.id}/blocks/${block.id}`, className: "btn btn-sm btn-outline-primary mr-2" }, "View"),
                            React.createElement(react_router_dom_2.Link, { to: `/lib/${this.props.id}/blocks/${block.id}/edit`, className: "btn btn-sm btn-outline-secondary mr-2" }, "Edit"),
                            block.has_unpublished_changes ?
                                React.createElement(react_router_dom_2.Link, { to: "/", className: "btn btn-sm btn-outline-success mr-2" }, "Publish")
                                : null)))))));
        }
    }
    exports.Library = Library;
    class LibraryWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const [data, blocks] = yield Promise.all([
                        LibraryClient_2.libClient.getLibrary(this.props.match.params.id),
                        LibraryClient_2.libClient.getLibraryBlocks(this.props.match.params.id),
                    ]);
                    this.setState({ data, blocks, status: 1 /* Ready */ });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
            });
        }
        render() {
            return React.createElement(LoadingWrapper_2.LoadingWrapper, { status: this.state.status },
                React.createElement(Library, Object.assign({}, this.state.data, { blocks: this.state.blocks })));
        }
    }
    exports.LibraryWrapper = LibraryWrapper;
});
define("LibraryAdd", ["require", "exports", "react", "react-router-dom", "LibraryClient"], function (require, exports, React, react_router_dom_3, LibraryClient_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LibraryAddForm extends React.PureComponent {
        constructor(props) {
            super(props);
            // Event handlers:
            this.handleChangeSlug = (event) => { this.setState({ slug: event.target.value }); };
            this.handleChangeTitle = (event) => { this.setState({ title: event.target.value }); };
            this.handleChangeDescription = (event) => { this.setState({ description: event.target.value }); };
            this.handleChangeCollectionUUID = (event) => { this.setState({ collection_uuid: event.target.value }); };
            this.handleSubmit = (event) => __awaiter(this, void 0, void 0, function* () {
                event.preventDefault();
                const newLibrary = yield LibraryClient_3.libClient.createLibrary(this.state);
                this.props.history.push(`/lib/${newLibrary.id}`);
            });
            this.state = {
                slug: '',
                collection_uuid: '',
                title: '',
                description: '',
            };
        }
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, "Add a new content library"),
                React.createElement("form", null,
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibrarySlug" }, "Slug"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newLibrarySlug", placeholder: "my-lib", value: this.state.slug, onChange: this.handleChangeSlug })),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibraryTitle" }, "Title"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newLibraryTitle", placeholder: "My New Library", value: this.state.title, onChange: this.handleChangeTitle })),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibraryDescription" }, "Description"),
                        React.createElement("input", { type: "text", className: "form-control", id: "newLibraryDescription", placeholder: "Describe your library", value: this.state.description, onChange: this.handleChangeDescription })),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "newLibraryCollectionUUID" }, "Collection UUID"),
                        React.createElement("input", { type: "text", style: { fontFamily: "monospace" }, className: "form-control", id: "newLibraryCollectionUUID", placeholder: "11111111-1111-1111-1111-111111111111", maxLength: 36, value: this.state.collection_uuid, onChange: this.handleChangeCollectionUUID }),
                        React.createElement("small", null,
                            "You can see all the collection UUIDs ",
                            React.createElement("a", { href: "http://localhost:18250/api/v1/collections" }, "via the Blockstore API"),
                            ".")),
                    React.createElement("button", { type: "submit", disabled: !this.canSubmit, className: "btn btn-primary", onClick: this.handleSubmit }, "Submit"),
                    React.createElement(react_router_dom_3.Link, { to: "/", className: "btn btn-secondary" }, "Cancel")));
        }
        get canSubmit() {
            return this.state.slug && this.state.collection_uuid;
        }
    }
    exports.LibraryAddForm = LibraryAddForm;
});
define("LibraryList", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper"], function (require, exports, React, react_router_dom_4, LibraryClient_4, LoadingWrapper_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LibraryList extends React.PureComponent {
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, "All Content Libraries"),
                React.createElement("p", null,
                    "There are ",
                    this.props.libraries.length,
                    " content libraries:"),
                React.createElement("ul", null, this.props.libraries.map(lib => (React.createElement("li", { key: lib.id },
                    React.createElement(react_router_dom_4.Link, { to: `/lib/${lib.id}` }, lib.title))))),
                React.createElement(react_router_dom_4.Link, { to: "/add/", className: "btn btn-primary" }, "Add New Library"));
        }
    }
    exports.LibraryList = LibraryList;
    class LibraryListWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                libraryList: [],
                status: 0 /* Loading */,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const libraryList = yield LibraryClient_4.libClient.listLibraries();
                    this.setState({
                        libraryList,
                        status: 1 /* Ready */,
                    });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ status: 2 /* Error */ });
                }
            });
        }
        render() {
            return React.createElement(LoadingWrapper_3.LoadingWrapper, { status: this.state.status },
                React.createElement(LibraryList, { libraries: this.state.libraryList }));
        }
    }
    exports.LibraryListWrapper = LibraryListWrapper;
});
define("ramshackle", ["require", "exports", "react", "react-dom", "react-router-dom", "Library", "LibraryAdd", "LibraryList", "BlockPage"], function (require, exports, React, ReactDOM, react_router_dom_5, Library_1, LibraryAdd_1, LibraryList_1, BlockPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ramshackle extends React.Component {
        render() {
            return (React.createElement(react_router_dom_5.BrowserRouter, { basename: "/ramshackle/" },
                React.createElement(react_router_dom_5.Switch, null,
                    React.createElement(react_router_dom_5.Route, { path: "/", exact: true, component: LibraryList_1.LibraryListWrapper }),
                    React.createElement(react_router_dom_5.Route, { path: "/add/", exact: true, component: LibraryAdd_1.LibraryAddForm }),
                    React.createElement(react_router_dom_5.Route, { path: "/lib/:id/", exact: true, component: Library_1.LibraryWrapper }),
                    React.createElement(react_router_dom_5.Route, { path: "/lib/:lib_id/blocks/:id/edit", exact: true, component: BlockPage_1.BlockPageWrapper }),
                    React.createElement(react_router_dom_5.Route, { path: "/lib/:lib_id/blocks/:id", exact: true, component: BlockPage_1.BlockPageWrapper }),
                    React.createElement(react_router_dom_5.Route, { component: () => (React.createElement("p", null, "Not found.")) })),
                React.createElement("footer", { style: { marginTop: "1em", borderTop: "1px solid #ddd" } },
                    React.createElement(react_router_dom_5.Link, { to: "/" }, "All libraries"))));
        }
    }
    ReactDOM.render(React.createElement(Ramshackle, null), document.getElementById("ramshackle-root"));
});
