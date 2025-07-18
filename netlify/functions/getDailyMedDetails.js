import fetch from "node-fetch";

export async function handler(event, context) {
    const rxCui = event.queryStringParameters.rxCui || event.queryStringParameters.rxcui;
    if (!rxCui) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: "Missing rxCui"
        };
    }

    const splUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;
    try {
        const splResponse = await fetch(splUrl);
        const splText = await splResponse.text();
        if (!splResponse.ok) throw new Error(`SPL fetch failed: ${splText}`);

        const splData = JSON.parse(splText);
        const firstSPL = splData.data?.[0];
        if (!firstSPL?.setid) {
            throw new Error("No SPL data found for RxCUI");
        }

        const setid = firstSPL.setid;
        const title = firstSPL.title;

        const sectionsUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setid}/sections.json`;
        const sectionsResponse = await fetch(sectionsUrl);
        const sectionsText = await sectionsResponse.text();
        if (!sectionsResponse.ok) throw new Error(`Sections fetch failed: ${sectionsText}`);

        const sectionsData = JSON.parse(sectionsText);
        const sectionMap = {};

        for (const section of sectionsData.data || []) {
            const name = section.title?.trim() || section.section || "Unknown Section";
            const content = section.text?.trim() || "";
            if (name && content) {
                sectionMap[name] = content;
            }
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                setid,
                title,
                sections: sectionMap
            })
        };

    } catch (err) {
        console.error("getDailyMedDetails error:", err.message);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: `Server error: ${err.message}`
        };
    }
}
