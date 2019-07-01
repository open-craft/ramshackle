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
    }
    exports.libClient = new LibraryClient();
});
define("LibraryList", ["require", "exports", "react", "LibraryClient"], function (require, exports, React, LibraryClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LibraryList extends React.PureComponent {
        render() {
            return React.createElement("ul", null, this.props.libraries.map(lib => {
                return React.createElement("li", { key: lib.key }, lib.title);
            }));
        }
    }
    exports.LibraryList = LibraryList;
    class LibraryListWrapper extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                libraryList: null,
                loading: true,
            };
        }
        componentDidMount() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const libraryList = yield LibraryClient_1.libClient.listLibraries();
                    this.setState({
                        libraryList,
                        loading: false,
                    });
                }
                catch (err) {
                    console.error(err);
                    this.setState({ loading: false });
                }
            });
        }
        render() {
            if (this.state.loading) {
                return React.createElement("p", null, "Loading...");
            }
            else if (this.state.libraryList) {
                return React.createElement(LibraryList, { libraries: this.state.libraryList });
            }
            else {
                return React.createElement("p", null, "Unable to load libraries");
            }
        }
    }
    exports.LibraryListWrapper = LibraryListWrapper;
});
define("ramshackle", ["require", "exports", "react", "react-dom", "LibraryList"], function (require, exports, React, ReactDOM, LibraryList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ramshackle extends React.Component {
        render() {
            return (React.createElement(LibraryList_1.LibraryListWrapper, null));
        }
    }
    ReactDOM.render(React.createElement(Ramshackle, null), document.getElementById("ramshackle-root"));
});
