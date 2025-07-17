export async function getRxImageUrls({ ndc, rxCui }) {
    const urls = [];

    if (ndc) {
        const formattedNdc = ndc.replace(/[^0-9-]/g, "").replace(/-/g, "");
        urls.push(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?resolution=300&idtype=NDC&id=${formattedNdc}`);
    }

    if (rxCui) {
        urls.push(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?resolution=300&idtype=RXCUI&id=${rxCui}`);
    }

    for (const url of urls) {
        try {
            const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            const data = await res.json();
            if (data?.nlmRxImages?.length) {
                return data.nlmRxImages.map((img) => img.imageUrl);
            }
        } catch (err) {
            console.warn("RxImage fetch failed:", err);
        }
    }

    return [];
}
