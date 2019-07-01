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
                    } }, args);
                const result = yield fetch(`/api/libraries/v2${url}`, combinedArgs);
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
    }
    exports.libClient = new LibraryClient();
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
define("Library", ["require", "exports", "react", "LibraryClient", "LoadingWrapper"], function (require, exports, React, LibraryClient_1, LoadingWrapper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Library extends React.PureComponent {
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement("h1", null, this.props.title),
                React.createElement("p", null,
                    "This is a content library (key: ",
                    this.props.id,
                    ")."));
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
                    const data = yield LibraryClient_1.libClient.getLibrary(this.props.match.params.id);
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
                React.createElement(Library, Object.assign({}, this.state.data)));
        }
    }
    exports.LibraryWrapper = LibraryWrapper;
});
define("LibraryList", ["require", "exports", "react", "react-router-dom", "LibraryClient", "LoadingWrapper"], function (require, exports, React, react_router_dom_1, LibraryClient_2, LoadingWrapper_2) {
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
                    React.createElement(react_router_dom_1.Link, { to: `/lib/${lib.id}` }, lib.title))))),
                React.createElement("button", { className: "btn btn-primary" }, "Add New Library"));
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
                    const libraryList = yield LibraryClient_2.libClient.listLibraries();
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
            return React.createElement(LoadingWrapper_2.LoadingWrapper, { status: this.state.status },
                React.createElement(LibraryList, { libraries: this.state.libraryList }));
        }
    }
    exports.LibraryListWrapper = LibraryListWrapper;
});
define("ramshackle", ["require", "exports", "react", "react-dom", "react-router-dom", "Library", "LibraryList"], function (require, exports, React, ReactDOM, react_router_dom_2, Library_1, LibraryList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ramshackle extends React.Component {
        render() {
            return (React.createElement(react_router_dom_2.BrowserRouter, { basename: "/ramshackle/" },
                React.createElement(react_router_dom_2.Route, { path: "/", exact: true, component: LibraryList_1.LibraryListWrapper }),
                React.createElement(react_router_dom_2.Route, { path: "/lib/:id/", exact: true, component: Library_1.LibraryWrapper }),
                React.createElement("footer", { style: { marginTop: "1em", borderTop: "1px solid #ddd" } },
                    React.createElement(react_router_dom_2.Link, { to: "/" }, "All libraries"))));
        }
    }
    ReactDOM.render(React.createElement(Ramshackle, null), document.getElementById("ramshackle-root"));
});
