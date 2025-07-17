export async function getRxImageUrls({ ndc, rxCui }) {
    const urls = [];
    const trySources = [
        { type: "NDC", id: ndc },
        { type: "RXCUI", id: rxCui }
    ];

    for (const { type, id } of trySources) {
        if (!id) continue;

        const apiUrl = `https://rximage.nlm.nih.gov/api/rximage/1/rxnav?resolution=300&idtype=${type}&id=${id}`;
        const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(apiUrl)}`;

        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const images = data?.nlmRxImages || [];

            if (images.length) {
                urls.push(...images.map(img => img.imageUrl));
                break; // stop at first valid result
            }
        } catch (err) {
            console.error(`RxImage lookup failed for ${type}:`, err);
        }
    }

    return urls;
}
