import fetch from 'node-fetch';

export async function handler(event, context) {
    const { ndc } = event.queryStringParameters;

    if (!ndc) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing NDC parameter' }),
        };
    }

    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?id=${ndc}&idtype=NDC`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const rxCui = data.idGroup?.rxnormId?.[0] || null;

        return {
            statusCode: 200,
            body: JSON.stringify({ rxCui }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
