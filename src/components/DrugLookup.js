import React from 'react';
import { getRxCui } from '../utils/rxnorm';

function DrugLookup({ ndc1, ndc2, setNdc1, setNdc2, setResults, setMatchStatus }) {
    const [error, setError] = React.useState('');

    const fetchDailyMedDetails = async (rxCui) => {
        try {
            const response = await fetch(`/.netlify/functions/getDailyMedDetails?rxcui=${rxCui}`);
            if (!response.ok) {
                throw new Error(`DailyMed API returned status ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`Failed to fetch DailyMed details for RxCUI ${rxCui}:`, err);
            return null;
        }
    };

    const handleCompare = async () => {
        setError('');
        setMatchStatus(null);

        if (!ndc1 && !ndc2) {
            setError('Please enter at least one NDC.');
            return;
        }

        try {
            const rx1 = ndc1 ? await getRxCui(ndc1) : null;
            const rx2 = ndc2 ? await getRxCui(ndc2) : null;

            const results = [];

            if (ndc1 && rx1) {
                const dailyMed1 = await fetchDailyMedDetails(rx1);
                results.push({
                    ndc: ndc1,
                    rxCui: rx1,
                    ...dailyMed1
                });
            }

            if (ndc2 && rx2) {
                const dailyMed2 = await fetchDailyMedDetails(rx2);
                results.push({
                    ndc: ndc2,
                    rxCui: rx2,
                    ...dailyMed2
                });
            }

            setResults(results);

            if (rx1 && rx2) {
                setMatchStatus(rx1 === rx2
                    ? '✅ RX Match by RxCUI'
                    : '⚠️ Different RxCUI — may still be clinically equivalent'
                );
            } else if (rx1 || rx2) {
                setMatchStatus('ℹ️ Partial match — only one valid RxCUI found');
            } else {
                setMatchStatus('❌ No RxCUI found for either NDC');
            }
        } catch (err) {
            console.error(err);
            setError('Error during comparison: ' + err.message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleCompare();
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
            <button onClick={handleCompare}>Compare</button>

            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default DrugLookup;
