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

    try {
        // Step 1: Get SPL Set ID
        const splUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;
        const splRes = await fetch(splUrl);
        const splText = await splRes.text();
        if (!splRes.ok) throw new Error(`SPL fetch failed: ${splText}`);

        const splData = JSON.parse(splText);
        const firstSPL = splData.data?.[0];
        if (!firstSPL?.setid) throw new Error("No SPL found for RxCUI");

        const setid = firstSPL.setid;
        const title = firstSPL.title || "";

        // Step 2: Get sections
        const sectionsUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setid}/sections.json`;
        const secRes = await fetch(sectionsUrl);
        const secText = await secRes.text();

        if (!secRes.ok || !secRes.headers.get("content-type")?.includes("application/json")) {
            console.warn("DailyMed sections response is not JSON, falling back.");
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ setid, title, sections: {} })
            };
        }

        const secData = JSON.parse(secText);
        const sectionMap = {};
        for (const sec of secData.data || []) {
            const name = sec.title?.trim() || sec.section || "Unknown Section";
            const text = sec.text?.trim();
            if (name && text) sectionMap[name] = text;
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ setid, title, sections: sectionMap })
        };

    } catch (err) {
        console.error("DailyMed fetch error:", err.message);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: `Error: ${err.message}`
        };
    }
}
