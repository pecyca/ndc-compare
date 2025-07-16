import React, { useState } from 'react';
import DrugInfo from './DrugInfo';
import { getRxcuiFromNdc } from '../utils/rxnorm';

function DrugLookup() {
    const [ndc1, setNdc1] = useState('');
    const [ndc2, setNdc2] = useState('');
    const [rxcui1, setRxcui1] = useState(null);
    const [rxcui2, setRxcui2] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [matchMessage, setMatchMessage] = useState('');

    const handleCompare = async () => {
        setError('');
        setMatchMessage('');
        setSubmitted(false);

        if (!ndc1 && !ndc2) {
            setError('Please enter at least one NDC.');
            return;
        }

        try {
            const rx1 = ndc1 ? await getRxcuiFromNdc(ndc1) : null;
            const rx2 = ndc2 ? await getRxcuiFromNdc(ndc2) : null;

            setRxcui1(rx1);
            setRxcui2(rx2);

            if (rx1 && rx2) {
                if (rx1 === rx2) {
                    setMatchMessage('✅ RX Match by RxCUI');
                } else {
                    setMatchMessage('⚠️ Different RxCUI — may still be clinically equivalent');
                }
            }

            if (!rx1 && ndc1) {
                setError(`No RxCUI found for NDC 1 (${ndc1})`);
                return;
            }

            if (!rx2 && ndc2) {
                setError(`No RxCUI found for NDC 2 (${ndc2})`);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError('Error during comparison: ' + err.message);
        }
    };

    const handleReset = () => {
        setNdc1('');
        setNdc2('');
        setRxcui1(null);
        setRxcui2(null);
        setSubmitted(false);
        setError('');
        setMatchMessage('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCompare();
        }
    };

    return (
        <div className="lookup-form">
            <h2>NDC Comparison & Drug Lookup</h2>
            <p>Enter one or two NDCs to look up or compare.</p>
            <input
                type="text"
                value={ndc1}
                placeholder="Enter NDC 1"
                onChange={(e) => setNdc1(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <input
                type="text"
                value={ndc2}
                placeholder="Enter NDC 2 (optional)"
                onChange={(e) => setNdc2(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button onClick={handleCompare}>Compare or Lookup</button>
            <button onClick={handleReset}>Reset</button>

            {error && <p className="error">{error}</p>}
            {matchMessage && <p className="match-message">{matchMessage}</p>}

            {submitted && (
                <div className="result-container">
                    {rxcui1 && (
                        <DrugInfo
                            ndc={ndc1}
                            rxcui={rxcui1}
                            label="🧾 Drug Information (NDC 1)"
                        />
                    )}
                    {rxcui2 && (
                        <DrugInfo
                            ndc={ndc2}
                            rxcui={rxcui2}
                            label="🧾 Drug Information (NDC 2)"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default DrugLookup;
