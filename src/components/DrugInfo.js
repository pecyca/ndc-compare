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

                if (dailyMed.error) {
                    throw new Error(dailyMed.error || 'Failed to retrieve DailyMed data.');
                }

                setInfo({
                    ndc,
                    rxCui,
                    brand,
                    form,
                    dailyMed,
                    shortage,
                });
            } catch (err) {
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

    return (
        <div className="p-4 border rounded-xl shadow mb-4 bg-white dark:bg-gray-900 dark:text-white">
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <p><strong>NDC:</strong> {info.ndc}</p>
            <p><strong>RxCUI:</strong> {info.rxCui}</p>
            <p><strong>Brand:</strong> {info.brand || 'Unknown'}</p>
            <p><strong>Form:</strong> {info.form || 'Unknown'}</p>
            {info.shortage && (
                <p className="text-yellow-600 font-medium">⚠️ Shortage: {info.shortage}</p>
            )}

            <ImageGallery ndc={ndc} rxCui={info.rxCui} />

            <div className="mt-4">
                <h4 className="font-semibold">DailyMed Sections</h4>
                {info.dailyMed.sections && Object.keys(info.dailyMed.sections).length > 0 ? (
                    Object.entries(info.dailyMed.sections).map(([title, content]) => (
                        <details key={title} className="mb-2 border rounded">
                            <summary className="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700">{title}</summary>
                            <div className="p-2 text-sm">{content}</div>
                        </details>
                    ))
                ) : (
                    <p className="text-sm italic">No labeled sections found.</p>
                )}
            </div>
        </div>
    );
};

export default DrugInfo;
