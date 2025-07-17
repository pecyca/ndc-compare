// src/utils/rxnorm.js

function encodeUrl(url) {
    return encodeURIComponent(url);
}

export async function getRxCui(ndc) {
    const targetUrl = encodeUrl(`https://rxnav.nlm.nih.gov/REST/rxcui.json?id=${ndc}&idtype=NDC`);
    const url = `/.netlify/functions/proxy?url=${targetUrl}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.idGroup?.rxnormId?.[0] || null;
}

export async function getBrandName(rxCui) {
    const targetUrl = encodeUrl(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/related.json?tty=BN`);
    const url = `/.netlify/functions/proxy?url=${targetUrl}`;
    const response = await fetch(url);
    const data = await response.json();
    return data?.relatedGroup?.conceptGroup?.[0]?.conceptProperties?.[0]?.name || "Unknown";
}

export async function getForm(rxCui) {
    const targetUrl = encodeUrl(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/properties.json`);
    const url = `/.netlify/functions/proxy?url=${targetUrl}`;
    const response = await fetch(url);
    const data = await response.json();

    // This gets the full descriptive name like "Potassium Chloride 20 MEQ Extended Release Tablet"
    return data?.properties?.name || "Unknown";
}

export function getRxNormMatchStatus(rxCui1, rxCui2) {
    if (!rxCui1 || !rxCui2) return "Unknown";
    return rxCui1 === rxCui2 ? "RX Match by RxCUI" : "Different RxCUIs (potentially non-equivalent)";
}

export function isRxCuiMatch(rxCui1, rxCui2) {
    return rxCui1 && rxCui2 && rxCui1 === rxCui2;
}
