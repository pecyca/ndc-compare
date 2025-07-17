// src/utils/dailymed.js

function encodeUrl(url) {
    return encodeURIComponent(url);
}

export async function getDailyMedDetails(rxCui) {
    try {
        const baseTarget = encodeUrl(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`);
        const baseUrl = `/.netlify/functions/proxy?url=${baseTarget}`;
        const splListResponse = await fetch(baseUrl);
        const splList = await splListResponse.json();

        if (!splList?.data?.spls?.length) return {};

        const setId = splList.data.spls[0].setid;
        const structuredTarget = encodeUrl(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/structured-label`);
        const structuredUrl = `/.netlify/functions/proxy?url=${structuredTarget}`;
        const structuredResponse = await fetch(structuredUrl);
        const structuredData = await structuredResponse.json();

        const sections = {};
        for (const section of structuredData.data?.structuredProductLabel?.component || []) {
            const title = section.title?.toUpperCase();
            const html = section.text;
            if (title && html) {
                sections[title] = html;
            }
        }

        return sections;
    } catch (error) {
        console.error("DailyMed API error:", error);
        return {};
    }
}
