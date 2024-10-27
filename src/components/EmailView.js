import React from 'react';

function EmailView({ email }) {
    if (!email || !email.content) {
        return <div>Select an email to view its content.</div>;
    }

    return (
        <div className="email-view">
            <h2>{email.key}</h2>
            <pre>{email.content}</pre>
        </div>
    );
}

export default EmailView;