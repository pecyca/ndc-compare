// src/utils/dailymed.js

export async function getDailyMedDetails(rxCui) {
    try {
        const listUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;
        const listProxy = `/netlify/functions/proxy?url=${encodeURIComponent(listUrl)}`;
        const listResp = await fetch(listProxy);
        const listText = await listResp.text();

        if (!listResp.ok || !listText.trim().startsWith("{")) {
            throw new Error(`SPL list fetch failed: ${listText.slice(0, 100)}`);
        }

        const listData = JSON.parse(listText);
        const setId = listData?.data?.[0]?.setid;
        if (!setId) throw new Error("No SPL Set ID found");

        const structuredUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/structured.json`;
        const structuredProxy = `/netlify/functions/proxy?url=${encodeURIComponent(structuredUrl)}`;
        const structuredResp = await fetch(structuredProxy);
        const structuredText = await structuredResp.text();

        if (!structuredResp.ok || !structuredText.trim().startsWith("{")) {
            throw new Error(`Structured SPL fetch failed: ${structuredText.slice(0, 100)}`);
        }

        const structuredData = JSON.parse(structuredText);

        return {
            setid: setId,
            sections: {
                Indications: structuredData?.indications_and_usage || "Not available",
                Dosage: structuredData?.dosage_and_administration || "Not available",
                Warnings: structuredData?.warnings_and_cautions || "Not available",
                Storage: structuredData?.how_supplied || "Not available",
                Preparations: structuredData?.dosage_forms_and_strengths || "Not available",
            },
        };
    } catch (err) {
        console.error(`Failed to fetch DailyMed details for RxCUI ${rxCui}:`, err);
        return {
            setid: null,
            sections: {
                Indications: "Error loading",
                Dosage: "Error loading",
                Warnings: "Error loading",
                Storage: "Error loading",
                Preparations: "Error loading",
            },
        };
    }
}
