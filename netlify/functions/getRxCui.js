exports.handler = async function (event) {
    const ndc = event.queryStringParameters.ndc;
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?id=${ndc}&idtype=NDC`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(data),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch RxCUI', details: err.message }),
        };
    }
};
