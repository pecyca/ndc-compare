// App.jsx

import React, { useState } from 'react';
import DrugInfo from './components/DrugInfo';
import './App.css';
import './components/DrugInfo.css';

function App() {
    const [ndc, setNdc] = useState('');
    const [ndc2, setNdc2] = useState('');
    const [submittedNdc, setSubmittedNdc] = useState('');
    const [submittedNdc2, setSubmittedNdc2] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ndc.trim()) {
            setSubmittedNdc(ndc.trim());
            setSubmittedNdc2(ndc2.trim());
        }
    };

    const handleReset = () => {
        setNdc('');
        setNdc2('');
        setSubmittedNdc('');
        setSubmittedNdc2('');
        setSearchTerm('');
    };

    return (
        <div className={`app-container ${darkMode ? 'dark' : ''}`}>
            <div className="header-controls">
                <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                    <input
                        type="text"
                        value={ndc}
                        onChange={(e) => setNdc(e.target.value)}
                        placeholder="Enter NDC #1 (e.g. 59762-3722-01)"
                    />
                    <input
                        type="text"
                        value={ndc2}
                        onChange={(e) => setNdc2(e.target.value)}
                        placeholder="Enter NDC #2 (optional)"
                    />
                    <button type="submit">Lookup</button>
                    <button type="button" onClick={handleReset}>
                        Reset
                    </button>
                </form>

                <input
                    type="text"
                    placeholder="Search drug info..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <label className="toggle-container">
                    Dark Mode
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode((prev) => !prev)}
                    />
                </label>
            </div>

            {submittedNdc && (
                <DrugInfo
                    ndc={submittedNdc}
                    ndc2={submittedNdc2}
                    searchTerm={searchTerm}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
}

export default App;
