// src/utils/dailymed.js
export async function getDailyMedInfo(setId) {
    try {
        const res = await fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/sections.json`);
        const json = await res.json();
        return json?.data || [];
    } catch (e) {
        return [];
    }
}
