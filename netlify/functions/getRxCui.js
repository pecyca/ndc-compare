const fetch = require('node-fetch');

exports.handler = async function (event) {
    const ndc = event.queryStringParameters.ndc;
    if (!ndc) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing NDC' })
        };
    }

    const formattedNdc = ndc.padStart(11, '0');
    const dashed = formattedNdc.slice(0, 5) + '-' + formattedNdc.slice(5, 9) + '-' + formattedNdc.slice(9, 11);

    try {
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/ndcproperties.json?id=${dashed}&idtype=NDC`);
        const data = await response.json();
        const rxCui = data?.ndcPropertyList?.ndcProperty?.[0]?.rxcui || null;

        return {
            statusCode: 200,
            body: JSON.stringify({ rxCui })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API call failed', details: err.message })
        };
    }
};
