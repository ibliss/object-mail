import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { config } from '../config';

function EmailList({ onSelectEmail }) {
    const [emails, setEmails] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        AWS.config.update({
            region: config.aws.region,
            credentials: new AWS.Credentials(config.aws.accessKeyId, config.aws.secretAccessKey)
        });

        const s3 = new AWS.S3();
        const params = {
            Bucket: config.s3.bucketName,
            // Prefix: 'emails/',
        };

        s3.listObjectsV2(params, (err, data) => {
            if (err) {
                console.error('Error fetching email list:', err);
                setError('Error fetching email list');
                return;
            }

            if (!data.Contents || data.Contents.length === 0) {
                console.log('No emails found in the bucket');
                setEmails([]);
                return;
            }

            const emailKeys = data.Contents.map(item => item.Key);
            setEmails(emailKeys.map(key => ({ key })));
        });
    }, []);

    const handleEmailSelect = (email) => {
        const s3 = new AWS.S3();
        s3.getObject({
            Bucket: config.s3.bucketName,
            Key: email.key
        }, (err, data) => {
            if (err) {
                console.error('Error fetching email content:', err);
                setError('Error fetching email content');
                return;
            }
            const content = data.Body.toString('utf-8');
            onSelectEmail({ ...email, content });
        });
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="email-list">
            <h2>Emails</h2>
            {emails.length === 0 ? (
                <p>No emails found or still loading...</p>
            ) : (
                emails.map((email) => (
                    <div
                        key={email.key}
                        className="email-item"
                        onClick={() => handleEmailSelect(email)}
                    >
                        <strong>{email.key}</strong>
                    </div>
                ))
            )}
        </div>
    );
}

export default EmailList;