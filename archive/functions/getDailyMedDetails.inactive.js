import { XMLParser } from "fast-xml-parser";

export async function getDailyMedDetails(rxCui) {
    try {
        const listUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;
        const listProxy = `/netlify/functions/proxy?url=${encodeURIComponent(listUrl)}`;
        const listResp = await fetch(listProxy);
        const listText = await listResp.text();

        if (!listResp.ok || !listText.trim().startsWith("{")) {
            throw new Error(`SPL list fetch failed: ${listText.slice(0, 100)}`);
        }

        const listData = JSON.parse(listText);
        const spl = listData?.data?.[0];
        if (!spl?.setid) throw new Error("No SPL Set ID found");

        const xmlUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${spl.setid}/display.xml`;
        const xmlProxy = `/netlify/functions/proxy?url=${encodeURIComponent(xmlUrl)}`;
        const xmlResp = await fetch(xmlProxy);
        const xmlText = await xmlResp.text();

        if (!xmlResp.ok || !xmlText.includes("<document>")) {
            throw new Error("Failed to retrieve DailyMed XML");
        }

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
        });

        const parsed = parser.parse(xmlText);
        const sections = parsed?.document?.body?.section || [];

        const extract = (keyword) => {
            const section = sections.find(sec =>
                typeof sec?.title === "string" &&
                sec.title.toLowerCase().includes(keyword.toLowerCase())
            );
            return section?.para || "Not available";
        };

        return {
            setid: spl.setid,
            title: spl.title || '',
            sections: {
                Indications: extract("indications"),
                Dosage: extract("dosage"),
                Warnings: extract("warning"),
                Storage: extract("storage"),
                Preparations: extract("strength"),
            }
        };
    } catch (err) {
        console.error(`Failed to fetch DailyMed details for RxCUI ${rxCui}:`, err.message);
        return {
            setid: null,
            title: '',
            sections: {}
        };
    }
}
