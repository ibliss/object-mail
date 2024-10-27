import React, { useState } from 'react';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import './App.css';

function App() {
    const [selectedEmail, setSelectedEmail] = useState(null);

    return (
        <div className="App">
            <h1>Email Viewer</h1>
            <div className="container">
                <EmailList onSelectEmail={setSelectedEmail} />
                {selectedEmail && <EmailView email={selectedEmail} />}
            </div>
        </div>
    );
}

export default App;
