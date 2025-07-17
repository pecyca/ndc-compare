import fetch from 'node-fetch';
import xml2js from 'xml2js';

export async function handler(event) {
    try {
        console.log('Raw event:', JSON.stringify(event));

        const rxCui = event.queryStringParameters?.rxCui || event.queryStringParameters?.rxcui;
        if (!rxCui) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing rxCui parameter' }),
            };
        }

        const splsRes = await fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxcui=${rxCui}`);
        const splsJson = await splsRes.json();
        const splList = splsJson.data?.spls || [];

        if (splList.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No SPL documents found for this RxCUI' }),
            };
        }

        const latestSetId = splList[0].setid;
        const xmlRes = await fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${latestSetId}.xml`);
        const xmlText = await xmlRes.text();

        console.log("Raw SPL XML (start):", xmlText.slice(0, 500));

        let xmlJson;
        try {
            const parser = new xml2js.Parser({ explicitArray: false });
            xmlJson = await parser.parseStringPromise(xmlText);
        } catch (parseErr) {
            console.error("XML parsing failed:", parseErr.message);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Failed to parse SPL XML",
                    message: parseErr.message,
                    raw: xmlText.slice(0, 300)
                }),
            };
        }

        const sections = {};
        const document = xmlJson.document || {};
        const structuredBody = document.component?.structuredBody?.component || [];

        const components = Array.isArray(structuredBody) ? structuredBody : [structuredBody];

        components.forEach((comp) => {
            const title = comp.section?.title || 'Untitled';
            const text = comp.section?.text?._ || comp.section?.text || '';
            sections[title] = text;
        });

        const desiredSections = ['Indications & Usage', 'Warnings', 'Dosage and Administration', 'Storage and Handling'];
        const extractedSections = {};
        for (const title of desiredSections) {
            const match = Object.keys(sections).find((t) => t.toLowerCase().includes(title.toLowerCase()));
            if (match) {
                extractedSections[title] = sections[match];
            }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setid: latestSetId, sections: extractedSections }),
        };

    } catch (err) {
        console.error('Error in getDailyMedDetails handler:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to retrieve or parse DailyMed SPL',
                message: err.message,
            }),
        };
    }
}
