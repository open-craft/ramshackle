import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import { LibraryWrapper } from './Library';
import { LibraryAddForm } from './LibraryAdd';
import { LibraryListWrapper } from './LibraryList';
import { SimpleBlockPage } from "./SimpleBlockPage";

class Ramshackle extends React.Component {
    render() {
        return (
            <Router basename="/ramshackle/">
                <Switch>
                    <Route path="/" exact component={LibraryListWrapper}/>
                    <Route path="/add/" exact component={LibraryAddForm}/>
                    <Route path="/lib/:libId/" component={LibraryWrapper}/>
                    <Route path="/simple-block/:id/" component={SimpleBlockPage}/>
                    <Route component={() => ( <p>Not found.</p> )}/>
                </Switch>

                <footer style={{marginTop: "1em", borderTop: "1px solid #ddd"}}>
                    <Link to="/">All libraries</Link>
                </footer>
            </Router>
        );
    }
}

ReactDOM.render(<Ramshackle/>, document.getElementById("ramshackle-root"));
