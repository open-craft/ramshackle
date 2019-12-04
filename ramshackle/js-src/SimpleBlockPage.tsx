import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { Block, System } from "./Block/Block";


/**
 * A simple page that _just_ shows an XBlock that can be interacted with.
 * This only uses the XBlock API and no content library APIs.
 * The main use case is for opening this in an incognito window (it does
 * not require any authentication) to test anonymous usage of XBlocks.
 */
export class SimpleBlockPage extends React.PureComponent<RouteComponentProps<{id: string}>> {
    render() {
        return <>
            <p>This simple block page supports both anonymous and registered user views of an XBlock, unlike the rest of Ramshackle which only works for registered users.</p>
            <Block usageKey={this.props.match.params.id} system={System.LMS} />
        </>
    }

}
