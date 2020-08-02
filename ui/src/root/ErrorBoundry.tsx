import React from 'react';
import { reportFrontEndError, sendMail } from '../api/http';
import { store } from '../index';
import { EmailMessage } from '../shared/models/system/email';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null, email: '', userText: '', mailResponse: '' };
    }

    state = { error: null, errorInfo: null, userText: '', mailResponse: '', email: '' };
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
        console.error(err);
    };

    handleChange = (event) => {
        this.setState({ userText: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const message: EmailMessage = {
            email: this.state.email,
            body: `***USER_MESSAGE***\n${this.state.userText}`,
            subject: 'UI Error',
        };
        sendMail(
            message,
            () => this.setState({ mailResponse: 'Thank you. Our team is on the case!' }),
            () => this.setState({ mailResponse: 'Uh Oh... We could not send the message 🤦‍♂️.' }),
        );
    };

    render() {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div style={{ margin: 12 }}>
                    <h1 style={{ fontFamily: 'Futura, san-serif', margin: 12 }}>Something went wrong.</h1>
                    <h3 style={{ fontFamily: 'Futura, san-serif', margin: 12 }}>
                        Please describe what happened leading up to the error.
                    </h3>
                    <h3 style={{ fontFamily: 'Futura, san-serif', margin: 12 }}>
                        This will help our developent team fix the bug as quickly as possible.
                    </h3>

                    <form onSubmit={this.handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="text"
                            placeholder="Your Contact (if you want to help us debug)"
                            value={this.state.email}
                            onChange={(event) => this.setState({ email: event.target.value })}
                            style={{
                                fontFamily: 'Futura, san-serif',
                                margin: 12,
                                fontSize: 16,
                                width: 600,
                                height: 50,
                            }}
                        />
                        <textarea
                            value={this.state.userText}
                            onChange={this.handleChange}
                            placeholder="What Happened?"
                            style={{
                                fontFamily: 'Futura, san-serif',
                                margin: 12,
                                fontSize: 18,
                                width: 600,
                                height: 300,
                            }}
                        />
                        {this.state.mailResponse ? (
                            <h2 style={{ fontFamily: 'Futura, san-serif', margin: 12 }}>{this.state.mailResponse}</h2>
                        ) : (
                            <input
                                type="submit"
                                value="Submit"
                                style={{
                                    fontFamily: 'Futura, san-serif',
                                    margin: 24,
                                    fontSize: 24,
                                    cursor: 'pointer',
                                    width: 600,
                                }}
                            />
                        )}
                    </form>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;
