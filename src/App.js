// src/App.js
import React, { useState } from "react";
import DrugLookup from "./components/DrugLookup";
import DrugInfo from "./components/DrugInfo";
import "./App.css";

function App() {
    const [ndc1, setNdc1] = useState("");
    const [ndc2, setNdc2] = useState("");
    const [results, setResults] = useState(null);
    const [matchStatus, setMatchStatus] = useState(null);

    const handleReset = () => {
        setNdc1("");
        setNdc2("");
        setResults(null);
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
                setResults={setResults}
                setMatchStatus={setMatchStatus}
            />
            {matchStatus && <div className="match-status">{matchStatus}</div>}
            {results && (
                <>
                    <DrugInfo
                        ndc={results[0]?.ndc}
                        rxCui={results[0]?.rxCui}
                        compareTo={results[1]?.ndc}
                        label="Drug 1"
                    />
                    {ndc2 && results[1] && (
                        <DrugInfo
                            ndc={results[1]?.ndc}
                            rxCui={results[1]?.rxCui}
                            compareTo={results[0]?.ndc}
                            label="Drug 2"
                        />
                    )}
                    <button onClick={handleReset} className="reset-button">
                        Reset
                    </button>
                </>
            )}

        </div>
    );
}

export default App;
