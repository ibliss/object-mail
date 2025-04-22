import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import MIMEParser from 'emailjs-mime-parser';
import { config } from '../config';

function EmailList({ onSelectEmail }) {
    const [emails, setEmails] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [error, setError] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('all');

    useEffect(() => {
        AWS.config.update({
            region: config.aws.region,
            credentials: new AWS.Credentials(config.aws.accessKeyId, config.aws.secretAccessKey)
        });

        const s3 = new AWS.S3();
        const params = {
            Bucket: config.s3.bucketName,
        };

        s3.listObjectsV2(params, async (err, data) => {
            if (err) {
                console.error('Error fetching email list:', err);
                setError('Error fetching email list');
                return;
            }

            if (!data.Contents || data.Contents.length === 0) {
                console.log('No emails found in the bucket');
                setEmails([]);
                setFilteredEmails([]);
                return;
            }

            // Create array of email objects with key and lastModified
            const emailObjects = data.Contents.map(item => ({
                key: item.Key,
                lastModified: new Date(item.LastModified)
            }));

            // Sort emails by lastModified date, newest first
            const sortedEmails = emailObjects.sort((a, b) => 
                b.lastModified - a.lastModified
            );

            // Fetch and parse each email to get to address and subject
            const emailsWithDetails = await Promise.all(sortedEmails.map(async (email) => {
                try {
                    const s3 = new AWS.S3();
                    const data = await s3.getObject({
                        Bucket: config.s3.bucketName,
                        Key: email.key
                    }).promise();
                    
                    const content = data.Body.toString('utf-8');
                    const parsed = MIMEParser(content);
                    
                    return {
                        ...email,
                        to: parsed.headers.to?.[0]?.value?.[0]?.address || 'Unknown',
                        subject: parsed.headers.subject?.[0]?.value || 'No Subject'
                    };
                } catch (error) {
                    console.error('Error parsing email:', error);
                    return {
                        ...email,
                        to: 'Error parsing email',
                        subject: 'Error parsing email'
                    };
                }
            }));

            setEmails(emailsWithDetails);
            setFilteredEmails(emailsWithDetails);
        });
    }, []);

    const handleFilterChange = (e) => {
        const address = e.target.value;
        setSelectedAddress(address);
        
        if (address === 'all') {
            setFilteredEmails(emails);
        } else {
            setFilteredEmails(emails.filter(email => email.to === address));
        }
    };

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

    // Get unique email addresses for the dropdown
    const uniqueAddresses = [...new Set(emails.map(email => email.to))].sort();

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="email-list">
            <h2>Emails</h2>
            <div className="email-filter">
                <label htmlFor="email-filter">Filter by recipient: </label>
                <select 
                    id="email-filter" 
                    value={selectedAddress}
                    onChange={handleFilterChange}
                >
                    <option value="all">All Emails</option>
                    {uniqueAddresses.map(address => (
                        <option key={address} value={address}>
                            {address}
                        </option>
                    ))}
                </select>
            </div>
            {filteredEmails.length === 0 ? (
                <p>No emails found or still loading...</p>
            ) : (
                filteredEmails.map((email) => (
                    <div
                        key={email.key}
                        className="email-item"
                        onClick={() => handleEmailSelect(email)}
                    >
                        <div className="email-info">
                            <div className="email-to"><strong>To:</strong> {email.to}</div>
                            <div className="email-subject"><strong>Subject:</strong> {email.subject}</div>
                        </div>
                        <div className="email-date">
                            {email.lastModified.toLocaleString()}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default EmailList;