import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { LibraryWrapper } from './Library';
import { LibraryListWrapper } from './LibraryList';

class Ramshackle extends React.Component {
    render() {
        return (
            <Router basename="/ramshackle/">
                <Route path="/" exact component={LibraryListWrapper}/>
                <Route path="/lib/:id/" exact component={LibraryWrapper}/>

                <footer style={{marginTop: "1em", borderTop: "1px solid #ddd"}}>
                    <Link to="/">All libraries</Link>
                </footer>
            </Router>
        );
    }
}

ReactDOM.render(<Ramshackle/>, document.getElementById("ramshackle-root"));
