function stripPackageCode(ndc) {
    return ndc?.split('-').slice(0, 2).join('-');
}

function generateNDCVariants(ndc) {
    const base = stripPackageCode(ndc);
    if (!base) return [];

    const [labeler, product] = base.split('-');
    const variants = new Set();

    // Original (stripped package)
    variants.add(`${labeler}-${product}`);

    // Pad labeler and/or product
    variants.add(`${labeler.padStart(5, '0')}-${product}`);
    variants.add(`${labeler}-${product.padStart(4, '0')}`);
    variants.add(`${labeler.padStart(5, '0')}-${product.padStart(4, '0')}`);

    // Strip leading zeroes from labeler/product
    variants.add(`${parseInt(labeler, 10)}-${product}`);
    variants.add(`${labeler}-${parseInt(product, 10)}`);
    variants.add(`${parseInt(labeler, 10)}-${parseInt(product, 10)}`);

    // Reverse padded strips
    variants.add(`${parseInt(labeler.padStart(5, '0'), 10)}-${product}`);
    variants.add(`${labeler}-${parseInt(product.padStart(4, '0'), 10)}`);
    variants.add(`${parseInt(labeler.padStart(5, '0'), 10)}-${parseInt(product.padStart(4, '0'), 10)}`);

    // Product only: leading zero strip
    if (product.startsWith('0')) {
        const stripped = product.replace(/^0+/, '');
        variants.add(`${labeler}-${stripped}`);
        variants.add(`${parseInt(labeler, 10)}-${stripped}`);
    }

    return Array.from(variants);
}

async function fetchFirstMatchingEntry(ndc) {
    const variants = generateNDCVariants(ndc);
    for (const variant of variants) {
        try {
            const res = await fetch(`/api/queryDB?ndc=${encodeURIComponent(variant)}`);

            const contentType = res.headers.get("content-type") || '';
            const isJson = contentType.includes("application/json");

            if (!res.ok || !isJson) {
                console.warn(`🟡 Skipping variant ${variant} – Response status: ${res.status}, Content-Type: ${contentType}`);
                continue;
            }

            const json = await res.json();
            if (json?.results?.length) {
                return json.results[0];
            }
        } catch (e) {
            console.warn(`🔴 Failed to fetch variant ${variant}:`, e.message);
        }
    }
    return null;
}

export async function compareOrangeBookTE(ndc1, ndc2) {
    const entry1 = await fetchFirstMatchingEntry(ndc1);
    const entry2 = await fetchFirstMatchingEntry(ndc2);

    if (!entry1 || !entry2) {
        return {
            match: false,
            reason: 'One or both entries are missing',
            entry1,
            entry2
        };
    }

    const te1 = entry1.TE_Code || '';
    const te2 = entry2.TE_Code || '';

    const match = te1 && te2 && te1 === te2 && te1.startsWith('A');

    return {
        match,
        reason: match ? 'TE_Code matches and starts with A' : 'TE_Code mismatch or not "A" rated',
        entry1: {
            te_code: te1,
            ingredient: entry1.NONPROPRIETARYNAME,
            RLD: entry1.RLD || 'No',
            RS: entry1.RS || 'No'
        },
        entry2: {
            te_code: te2,
            ingredient: entry2.NONPROPRIETARYNAME,
            RLD: entry2.RLD || 'No',
            RS: entry2.RS || 'No'
        }
    };
}
