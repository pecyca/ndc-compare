// src/components/DrugInfo.js
import React, { useEffect, useState } from "react";
import { getRxcuiFromNdc, getBrandName, getFormDescription } from "../utils/rxnorm";
import { getShortageInfo } from "../utils/shortages";
import { getDailyMedInfo } from "../utils/dailymed";
import ImageGallery from "./ImageGallery";

function DrugInfo({ ndc1, ndc2 }) {
    const [drug1, setDrug1] = useState({});
    const [drug2, setDrug2] = useState({});
    const [matchMessage, setMatchMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            const rxcui1 = await getRxcuiFromNdc(ndc1);
            const rxcui2 = ndc2 ? await getRxcuiFromNdc(ndc2) : null;

            const [brand1, form1] = await Promise.all([
                getBrandName(rxcui1),
                getFormDescription(rxcui1)
            ]);

            const [brand2, form2] = rxcui2
                ? await Promise.all([
                    getBrandName(rxcui2),
                    getFormDescription(rxcui2)
                ])
                : [null, null];

            const shortage1 = await getShortageInfo(rxcui1);
            const shortage2 = rxcui2 ? await getShortageInfo(rxcui2) : null;

            setDrug1({ ndc: ndc1, rxcui: rxcui1, brand: brand1, form: form1, shortage: shortage1 });
            setDrug2(ndc2 ? { ndc: ndc2, rxcui: rxcui2, brand: brand2, form: form2, shortage: shortage2 } : {});

            if (rxcui2) {
                setMatchMessage(
                    rxcui1 === rxcui2
                        ? "✅ RX Match by RxCUI"
                        : "⚠️ Different RxCUI — use judgment; they may still be equivalent"
                );
            } else {
                setMatchMessage("");
            }

            setLoading(false);
        };

        loadData();
    }, [ndc1, ndc2]);

    if (loading) return <p>Loading drug information...</p>;

    return (
        <div>
            {matchMessage && (
                <div style={{ background: "#eaf4ff", padding: "10px", borderRadius: "6px", marginBottom: "20px" }}>
                    <strong>{matchMessage}</strong>
                </div>
            )}

            <h2>NDC 1 Details</h2>
            <p><strong>Brand:</strong> {drug1.brand}</p>
            <p><strong>Form Description:</strong> {drug1.form}</p>
            <p><strong>RxCUI:</strong> <a href={`https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${drug1.rxcui}`} target="_blank" rel="noreferrer">{drug1.rxcui}</a></p>
            <p><a href={`https://online.lexi.com/lco/action/search?q=${ndc1}&t=name`} target="_blank" rel="noreferrer">Lexicomp Link</a></p>
            <p style={{ color: drug1.shortage ? "red" : "green" }}>
                {drug1.shortage ? "🚫 Reported FDA shortage" : "✅ No reported FDA shortages"}
            </p>
            <ImageGallery ndc={ndc1} rxcui={drug1.rxcui} />

            {ndc2 && (
                <>
                    <h2>NDC 2 Details</h2>
                    <p><strong>Brand:</strong> {drug2.brand}</p>
                    <p><strong>Form Description:</strong> {drug2.form}</p>
                    <p><strong>RxCUI:</strong> <a href={`https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${drug2.rxcui}`} target="_blank" rel="noreferrer">{drug2.rxcui}</a></p>
                    <p><a href={`https://online.lexi.com/lco/action/search?q=${ndc2}&t=name`} target="_blank" rel="noreferrer">Lexicomp Link</a></p>
                    <p style={{ color: drug2.shortage ? "red" : "green" }}>
                        {drug2.shortage ? "🚫 Reported FDA shortage" : "✅ No reported FDA shortages"}
                    </p>
                    <ImageGallery ndc={ndc2} rxcui={drug2.rxcui} />
                </>
            )}
        </div>
    );
}

export default DrugInfo;
