import React from 'react';
import { reportFrontEndError } from '../api/http';
import { store } from '../index';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    state = { error: null, errorInfo: null };
    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });
        let reduxStore: any = '**could not get store**';
        try {
            reduxStore = store.getState();
        } catch (error) {}
        const report = {
            DATE: new Date().toUTCString(),
            LOCATION: window.location,
            ERROR: error.toString(),
            ERROR_INFO: errorInfo,
            STORE: reduxStore,
        };

        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error(report);
        } else {
            reportFrontEndError(report, this.onReportSuccess, this.onReportFailure);
        }
    }

    onReportSuccess = (response) => {};

    onReportFailure = (err) => {
        console.log(err);
    };

    render() {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div>
                    <h2 style={{ fontFamily: 'Futura, san-serif', margin: 24 }}>Something went wrong.</h2>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;
