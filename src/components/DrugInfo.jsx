// components/DrugInfo.jsx
import React, { useEffect, useState } from 'react';
import {
    getRxCui,
    getBrandName,
    getFormFromRxCui,
    compareDrugsEquivalency
} from '../utils/rxnorm';
import { getFallbackDetails } from '../utils/fallbackDetails';
import {
    checkShortageStatus,
    checkDiscontinuedStatus
} from '../utils/statusChecks';
import './DrugInfo.css';

const RENDER_API = 'https://your-render-api.onrender.com'; // Replace with actual backend URL

const DrugInfo = ({ ndc, ndc2, darkMode, searchTerm }) => {
    const [info, setInfo] = useState(null);
    const [info2, setInfo2] = useState(null);
    const [matchMessage, setMatchMessage] = useState(null);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const [orangeBookResult, setOrangeBookResult] = useState(null);

    useEffect(() => {
        async function fetchDrugData(ndcValue, labelSetter) {
            try {
                const rxCui = await getRxCui(ndcValue);
                const brand = rxCui ? await getBrandName(rxCui) : null;
                const form = rxCui ? await getFormFromRxCui(rxCui) : null;
                const fallback = rxCui ? await getFallbackDetails(rxCui, brand) : {};
                const shortage = await checkShortageStatus(ndcValue, RENDER_API);
                const discontinued = await checkDiscontinuedStatus(ndcValue, RENDER_API);


                labelSetter({
                    rxCui: rxCui || 'Not found',
                    brandName: brand || 'Unknown',
                    form: form || 'Unknown',
                    discontinued,
                    shortage,
                    ...fallback
                });

                return rxCui;
            } catch (e) {
                console.error(`❌ Failed fetching data for NDC ${ndcValue}:`, e);
                throw e;
            }
        }

        async function fetchAll() {
            try {
                const rxCui1 = await fetchDrugData(ndc, setInfo);
                let rxCui2 = null;

                if (ndc2) {
                    rxCui2 = await fetchDrugData(ndc2, setInfo2);
                    setMatchMessage(
                        rxCui1 && rxCui2
                            ? rxCui1 === rxCui2
                                ? '✅ RX Match by RxCUI'
                                : '⚠️ Not an exact RxCUI match — compare details closely'
                            : null
                    );
                } else {
                    setInfo2(null);
                    setMatchMessage(null);
                }

                if (ndc && ndc2) {
                    const obResult = await compareDrugsEquivalency(ndc, ndc2);
                    setOrangeBookResult(obResult);
                }
            } catch (err) {
                setError('Error retrieving drug info.');
            }
        }

        if (ndc) {
            setError(null);
            setInfo(null);
            setInfo2(null);
            setMatchMessage(null);
            setWarnings([]);
            setOrangeBookResult(null);
            fetchAll();
        }
    }, [ndc, ndc2]);

    useEffect(() => {
        const allWarnings = [];

        if (info?.shortage || info2?.shortage) {
            allWarnings.push('⚠️ This drug is currently on the FDA shortage list.');
        }

        const storageTexts = [info?.storage, info2?.storage].filter(Boolean);
        if (storageTexts.some(text => text.toLowerCase().includes('original container'))) {
            allWarnings.push('⚠️ Must dispense in original container.');
        }

        setWarnings(allWarnings);
    }, [info, info2]);

    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!info) return <div>Loading...</div>;

    return (
        <div className={`drug-info-container ${darkMode ? 'dark' : ''}`}>
            {matchMessage && (
                <p style={{ fontWeight: 'bold', color: matchMessage.startsWith('✅') ? 'green' : 'orange' }}>
                    {matchMessage}
                </p>
            )}

            {orangeBookResult && (
                <div style={{ marginBottom: '1em', padding: '1em', background: '#e8f0fe', borderRadius: '4px' }}>
                    <strong>🟧 Orange Book Therapeutic Equivalence:</strong>
                    <br />
                    <div>TE Code Match: {orangeBookResult.teMatch ? '✅' : '❌'}</div>
                    <div>Application Number Match: {orangeBookResult.applMatch ? '✅' : '❌'}</div>
                    <div>Strength Match: {orangeBookResult.strengthMatch ? '✅' : '❌'}</div>
                    <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>
                        Overall Match: {orangeBookResult.overallMatch ? '✅ Equivalent' : '❌ Not Equivalent'}
                    </div>
                </div>
            )}

            {warnings.length > 0 && (
                <div style={{
                    background: '#fff3cd',
                    borderLeft: '6px solid #ffa500',
                    padding: '1em',
                    marginBottom: '1em',
                    borderRadius: '4px',
                    color: '#856404'
                }}>
                    {warnings.map((warn, idx) => (
                        <div key={idx}>{warn}</div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                {renderSummary('Drug 1', info, ndc)}
                {info2 && renderSummary('Drug 2', info2, ndc2)}
            </div>

            {renderCollapsible('Indications', info.indications, info2?.indications, searchTerm)}
            {renderCollapsible('Dosage and Administration', info.dosageAndAdministration, info2?.dosageAndAdministration, searchTerm)}
            {renderCollapsible('Warnings', info.warnings, info2?.warnings, searchTerm)}
            {renderCollapsible('Storage/Handling and Preparations', info.storage, info2?.storage, searchTerm)}
            {renderCollapsible('Drug Class', info.drugClass, info2?.drugClass, searchTerm)}
        </div>
    );
};

const renderSummary = (label, data, ndc) => (
    <div>
        <p><strong>{label}{data.discontinued ? ' (Discontinued)' : ''}</strong></p>
        <p><strong>RxCUI:</strong> {data.rxCui}</p>
        <p><strong>Brand Name:</strong> {data.brandName}</p>
        <p><strong>Form:</strong> {data.form}</p>
        <p>
            <a href="https://www.wolterskluwer.com/en/solutions/lexicomp-online" target="_blank" rel="noreferrer">
                Lexicomp (🔗)
            </a>
        </p>
    </div>
);

const renderCollapsible = (title, content1, content2, searchTerm) => {
    if (!content1 && !content2) return null;
    return (
        <Collapsible title={title} content1={content1} content2={content2} searchTerm={searchTerm} />
    );
};

const Collapsible = ({ title, content1, content2, searchTerm }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const haystack = `${content1 || ''} ${content2 || ''}`.toLowerCase();
        if (searchTerm && haystack.includes(searchTerm.toLowerCase())) {
            setOpen(true);
        }
    }, [searchTerm, content1, content2]);

    const highlight = (text) => {
        if (!text || !searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    };

    return (
        <div className="collapsible">
            <button className="toggle-btn" onClick={() => setOpen(!open)}>
                {open ? '▼' : '▶'} {title}
            </button>
            {open && (
                <div className="collapsible-content">
                    {content1 && (
                        <>
                            <strong>Drug 1:</strong>
                            <div>{highlight(content1)}</div>
                        </>
                    )}
                    {content2 && (
                        <>
                            <hr />
                            <strong>Drug 2:</strong>
                            <div>{highlight(content2)}</div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DrugInfo;
