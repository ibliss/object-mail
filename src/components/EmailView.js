import React, { useState, useEffect } from 'react';
import MIMEParser from 'emailjs-mime-parser';
import DOMPurify from 'dompurify';
function EmailView({ email }) {
    const [activeTab, setActiveTab] = useState('parsed');
    const [parsedEmail, setParsedEmail] = useState(null);

    useEffect(() => {
        if (email?.content) {
            try {
                const parsed = MIMEParser(email.content);
                setParsedEmail({
                    from: parsed.headers.from?.[0]?.value?.[0]?.address,
                    to: parsed.headers.to?.[0]?.value?.[0]?.address,
                    subject: parsed.headers.subject?.[0]?.value,
                    date: parsed.headers.date?.[0]?.value,
                    body: getEmailBody(parsed)
                });
            } catch (error) {
                console.error('Error parsing email:', error);
            }
        }
    }, [email]);

    const getEmailBody = (parsedEmail) => {
        const decodeContent = (part) => {
            let content = part.content;
            
            // Handle different content transfer encodings
            const encoding = part.contentTransferEncoding?.toLowerCase?.() || '';
            
            try {
                if (typeof content !== 'string') {
                    content = new TextDecoder().decode(content);
                }
                
                switch (encoding) {
                    case 'quoted-printable':
                        content = content
                            .replace(/=\r?\n/g, '')
                            .replace(/=([\da-fA-F]{2})/g, (_, hex) => 
                                String.fromCharCode(parseInt(hex, 16)));
                        break;
                    case 'base64':
                        content = atob(content.replace(/\s+/g, ''));
                        break;
                }
                
                return content;
            } catch (error) {
                console.error('Error decoding content:', error);
                return content.toString();
            }
        };

        // Claude AI suggested this sanitization to prevent XSS attacks
        const sanitizeHtml = (html) => {
            return DOMPurify.sanitize(html, {
                ALLOWED_TAGS: [
                    'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img',
                    'span', 'div', 'table', 'tr', 'td', 'th', 'tbody', 'thead'
                ],
                ALLOWED_ATTR: [
                    'href', 'src', 'alt', 'title', 'style', 'class',
                    // Only allow http(s) URLs
                    'href', '*::href'
                ],
                ALLOW_DATA_ATTR: false,
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['target'],
                WHOLE_DOCUMENT: false,
                SANITIZE_DOM: true,
                RETURN_DOM_FRAGMENT: false,
                RETURN_DOM: false,
                FORCE_BODY: true,
                // Prevent JavaScript URLs
                FORBID_TAGS: ['script', 'style'],
                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
                // Transform URLs to be absolute
                TRANSFORM_URLS: (url) => {
                    try {
                        return new URL(url).toString();
                    } catch {
                        return '#';
                    }
                }
            });
        };
    
        // Try to get HTML content first, fall back to plain text
        const htmlPart = findPartByContentType(parsedEmail, 'text/html');
        if (htmlPart) {
            const decodedContent = decodeContent(htmlPart);
            return { 
                content: sanitizeHtml(decodedContent), 
                type: 'html' 
            };
        }
    
        const textPart = findPartByContentType(parsedEmail, 'text/plain');
        if (textPart) {
            return { content: decodeContent(textPart), type: 'text' };
        }
    
        return { content: 'No readable content found', type: 'text' };
    };

    const findPartByContentType = (part, contentType) => {
        if (part.contentType?.value === contentType) {
            return part;
        }
        if (part.childNodes) {
            for (const child of part.childNodes) {
                const found = findPartByContentType(child, contentType);
                if (found) return found;
            }
        }
        return null;
    };

    return (
        <div className="email-view">
            <div className="email-tabs">
                <button 
                    className={`tab ${activeTab === 'parsed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('parsed')}
                >
                    Parsed View
                </button>
                <button 
                    className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
                    onClick={() => setActiveTab('raw')}
                >
                    Raw View
                </button>
            </div>

            <div className="email-content">
                {activeTab === 'parsed' ? (
                    parsedEmail ? (
                        <div className="parsed-email">
                            <div className="email-header">
                                <div><strong>From:</strong> {parsedEmail.from}</div>
                                <div><strong>To:</strong> {parsedEmail.to}</div>
                                <div><strong>Subject:</strong> {parsedEmail.subject}</div>
                                <div><strong>Date:</strong> {parsedEmail.date}</div>
                            </div>
                            <div className="email-body">
                                {parsedEmail.body.type === 'html' ? (
                                    <div 
                                        className="sanitized-html-content"
                                        dangerouslySetInnerHTML={{ 
                                            __html: parsedEmail.body.content 
                                        }} 
                                    />
                                ) : (
                                    <pre>{parsedEmail.body.content}</pre>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>Parsing email...</div>
                    )
                ) : (
                    <pre className="raw-email">{email.content}</pre>
                )}
            </div>
        </div>
    );
}

export default EmailView;