export async function fetchDailyMedInfo(rxCui) {
    const baseUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;

    const splListResponse = await fetch(baseUrl);
    const splList = await splListResponse.json();

    if (!splList?.data?.spls?.length) return {};

    const setId = splList.data.spls[0].setid;
    const structuredUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/structured-label`;

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
}
