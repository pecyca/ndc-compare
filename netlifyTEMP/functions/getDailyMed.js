export async function handler(event) {
    const rxCui = event.queryStringParameters.rxCui;

    try {
        const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxcui=${rxCui}`;
        const res = await fetch(url);
        const data = await res.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch DailyMed data', details: err.message }),
        };
    }
}
