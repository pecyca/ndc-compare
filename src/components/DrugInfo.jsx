// src/components/DrugInfo.jsx
import React, { useEffect, useState } from 'react';
import { getRxCui, getBrandName, getForm } from '../utils/rxnorm';
import { getDailyMedDetails } from '../utils/dailymed';
import { getShortageInfo } from '../utils/shortages';
import ImageGallery from './ImageGallery';

const DrugInfo = ({ ndc, label }) => {
    const [info, setInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const rxCui = await getRxCui(ndc);
                if (!rxCui) throw new Error('No RxCUI found for this NDC.');

                const [brand, form, dailyMed, shortage] = await Promise.all([
                    getBrandName(rxCui),
                    getForm(rxCui),
                    getDailyMedDetails(rxCui),
                    getShortageInfo(rxCui),
                ]);

                setInfo({
                    ndc,
                    rxCui,
                    brand: brand || 'Unknown',
                    form: form || 'Unknown',
                    dailyMed: dailyMed || {},
                    shortage: shortage || null,
                });
            } catch (err) {
                console.error('DrugInfo fetch error:', err);
                setError(`Error during lookup: ${err.message}`);
                setInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ndc]);

    if (loading) return <p>Loading {label}...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (!info) return <p>No information found for {ndc}</p>;

    const { rxCui, brand, form, dailyMed, shortage } = info;
    const sections = dailyMed?.sections || {};

    return (
        <div className="p-4 border rounded-xl shadow mb-4 bg-white dark:bg-gray-900 dark:text-white">
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <p><strong>NDC:</strong> {ndc}</p>
            <p><strong>RxCUI:</strong> {rxCui}</p>
            <p><strong>Brand:</strong> {brand}</p>
            <p><strong>Form:</strong> {form}</p>

            {dailyMed?.setid && (
                <p><strong>DailyMed Set ID:</strong> {dailyMed.setid}</p>
            )}

            {shortage && (
                <p className="text-yellow-600 font-medium">⚠️ Shortage: {shortage}</p>
            )}

            <ImageGallery ndc={ndc} rxCui={rxCui} />

            {Object.keys(sections).length > 0 ? (
                <div className="mt-4">
                    <h4 className="font-semibold mb-1">DailyMed Sections</h4>
                    {Object.entries(sections).map(([title, content]) => (
                        <details key={title} className="mb-2 border rounded">
                            <summary className="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700">{title}</summary>
                            <div className="p-2 text-sm whitespace-pre-line">{content}</div>
                        </details>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-600 mt-4">No DailyMed section details available.</p>
            )}
        </div>
    );
};

export default DrugInfo;
