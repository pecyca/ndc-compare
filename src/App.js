import React, { useState } from "react";
import DrugInfo from "./components/DrugInfo";
import "./App.css";

function App() {
    const [ndc1, setNdc1] = useState("");
    const [ndc2, setNdc2] = useState("");
    const [showResults, setShowResults] = useState(false);

    const handleCompare = (e) => {
        e.preventDefault();
        if (!ndc1.trim()) return;
        setShowResults(true);
    };

    const handleReset = () => {
        setNdc1("");
        setNdc2("");
        setShowResults(false);
    };

    return (
        <div className="app">
            <h1>NDC Comparison Tool</h1>
            <form onSubmit={handleCompare}>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Enter NDC 1"
                        value={ndc1}
                        onChange={(e) => setNdc1(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter NDC 2 (optional)"
                        value={ndc2}
                        onChange={(e) => setNdc2(e.target.value)}
                    />
                </div>
                <div className="button-group">
                    <button type="submit">Compare</button>
                    <button type="button" onClick={handleReset}>Reset</button>
                </div>
            </form>

            {showResults && (
                <div className="results-section">
                    <DrugInfo ndc1={ndc1} ndc2={ndc2} />
                </div>
            )}
        </div>
    );
}

export default App;
