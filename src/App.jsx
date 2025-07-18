// src/App.jsx
import React, { useState } from "react";
import DrugLookup from './components/DrugLookup.jsx';
import DrugInfo from './components/DrugInfo.jsx';
import "./App.css";

function App() {
    const [ndc1, setNdc1] = useState("");
    const [ndc2, setNdc2] = useState("");
    const [matchStatus, setMatchStatus] = useState(null);

    const handleReset = () => {
        setNdc1("");
        setNdc2("");
        setMatchStatus(null);
    };

    return (
        <div className="App">
            <h1>NDC Comparison Tool</h1>
            <DrugLookup
                ndc1={ndc1}
                ndc2={ndc2}
                setNdc1={setNdc1}
                setNdc2={setNdc2}
                setMatchStatus={setMatchStatus}
            />
            {matchStatus && (
                <div className="match-status bg-green-100 text-green-800 p-2 mt-2 rounded shadow">
                    {matchStatus}
                </div>
            )}
            {(ndc1 || ndc2) && (
                <div className="drug-info-section mt-6 space-y-6">
                    {ndc1 && <DrugInfo ndc={ndc1} label="Drug 1" />}
                    {ndc2 && <DrugInfo ndc={ndc2} label="Drug 2" />}
                    <button
                        onClick={handleReset}
                        className="reset-button mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
