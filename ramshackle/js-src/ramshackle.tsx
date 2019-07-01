import * as React from "react";
import * as ReactDOM from "react-dom";

import { LibraryListWrapper } from './LibraryList';

class Ramshackle extends React.Component {
    render() {
        return (
            <LibraryListWrapper/>
        );
    }
}

ReactDOM.render(<Ramshackle/>, document.getElementById("ramshackle-root"));

