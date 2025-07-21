// components/DrugLookup.jsx

import React, { useEffect, useState } from 'react';
import DrugInfo from './DrugInfo';
import { getRxCui } from '../utils/rxnorm';

const DrugLookup = ({ ndc1, ndc2 }) => {
    const [rxCui1, setRxCui1] = useState(null);
    const [rxCui2, setRxCui2] = useState(null);
    const [matchMessage, setMatchMessage] = useState('');

    useEffect(() => {
        async function compareRxCuis() {
            if (!ndc1) return;

            const first = await getRxCui(ndc1);
            const second = ndc2 ? await getRxCui(ndc2) : null;

            setRxCui1(first);
            setRxCui2(second);

            if (first && second) {
                setMatchMessage(first === second
                    ? '✅ RX Match by RxCUI'
                    : '❌ Different drugs by RxCUI');
            } else {
                setMatchMessage('');
            }
        }

        compareRxCuis();
    }, [ndc1, ndc2]);

    return (
        <div>
            {matchMessage && (
                <div className="match-status">
                    {matchMessage}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 border p-4 bg-white shadow">
                    <h2 className="font-bold mb-2">Drug 1</h2>
                    <DrugInfo ndc={ndc1} />
                </div>

                {ndc2 && (
                    <div className="flex-1 border p-4 bg-white shadow">
                        <h2 className="font-bold mb-2">Drug 2</h2>
                        <DrugInfo ndc={ndc2} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrugLookup;
