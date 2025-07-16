import React, { useEffect, useState } from 'react';
import {
    getRxCui,
    getBrandName,
    getFormDescription,
    isRxCuiMatch
} from '../utils/rxnorm';
import { fetchDailyMedInfo } from '../utils/dailymed';
import { getShortageInfo } from '../utils/shortages';
import ImageGallery from './ImageGallery';

function DrugInfo({ ndc, compareTo }) {
    const [rxCui, setRxCui] = useState(null);
    const [brand, setBrand] = useState('Loading...');
    const [form, setForm] = useState('Loading...');
    const [dailyMedInfo, setDailyMedInfo] = useState({});
    const [shortage, setShortage] = useState(null);
    const [match, setMatch] = useState(null);

    useEffect(() => {
        async function loadData() {
            if (!ndc) return;
            const rx = await getRxCui(ndc);
            setRxCui(rx);
            if (rx) {
                setBrand(await getBrandName(rx));
                setForm(await getFormDescription(rx));
                setDailyMedInfo(await fetchDailyMedInfo(rx));
                setShortage(await getShortageInfo(rx));
                if (compareTo) {
                    const compareRx = await getRxCui(compareTo);
                    setMatch(await isRxCuiMatch(rx, compareRx));
                }
            }
        }
        loadData();
    }, [ndc, compareTo]);

    return (
        <div className="drug-card">
            {match !== null && (
                <div className="match-status">
                    {match ? '✔️ RX Match by RxCUI' : '⚠️ Potential mismatch by RxCUI'}
                </div>
            )}
            <p><strong>NDC:</strong> {ndc}</p>
            <p><strong>RxCUI:</strong> {rxCui || 'Not found'}</p>
            <p><strong>Brand:</strong> {brand}</p>
            <p><strong>Form:</strong> {form}</p>
            {shortage && <p className="shortage-warning">🚨 FDA Drug Shortage: {shortage}</p>}
            <ImageGallery ndc={ndc} rxCui={rxCui} />
            {Object.entries(dailyMedInfo).map(([section, content]) => (
                <details key={section}>
                    <summary>{section}</summary>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </details>
            ))}
        </div>
    );
}

export default DrugInfo;
