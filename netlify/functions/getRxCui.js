// netlify/functions/getRxCui.js

exports.handler = async function (event) {
    const ndc = event.queryStringParameters?.ndc;

    if (!ndc) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Missing NDC query parameter.' }),
        };
    }

    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?id=${ndc}&idtype=NDC`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed RxNav fetch for ${ndc}: HTTP ${res.status}`);
            return {
                statusCode: res.status,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'RxNav API error', status: res.status }),
            };
        }

        const data = await res.json();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    } catch (err) {
        console.error('Error fetching RxCUI from RxNav:', err);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: 'Failed to fetch RxCUI',
                details: err.message,
            }),
        };
    }
};
