import * as React from "react";

export const enum LoadingStatus {
    Loading,
    Ready,
    Error,
}

export class LoadingWrapper extends React.PureComponent<{status: LoadingStatus}> {
    render() {
        if (this.props.status === LoadingStatus.Ready) {
            return this.props.children;
        } else if (this.props.status === LoadingStatus.Loading) {
            return <p>Loading...</p>;
        } else {
            return <p>An error occurred</p>;
        }
    }
}
