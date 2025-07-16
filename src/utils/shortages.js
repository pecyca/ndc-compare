// src/utils/shortages.js
export async function getShortageInfo(rxcui) {
    try {
        const response = await fetch(`https://api.fda.gov/drug/shortages.json?search=rxCui:${rxcui}`);
        const data = await response.json();
        return !!(data?.results?.length);
    } catch (e) {
        return false; // assume no shortage if API fails
    }
}
