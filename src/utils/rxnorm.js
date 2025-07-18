// src/utils/rxnorm.js

function encodeUrl(url) {
    return encodeURIComponent(url);
}

async function safeFetchJson(proxyUrl) {
    const res = await fetch(proxyUrl);
    const text = await res.text();
    if (!res.ok || !text.trim().startsWith("{")) {
        throw new Error(`Invalid JSON from proxy: ${text.slice(0, 100)}`);
    }
    return JSON.parse(text);
}

export async function getRxCui(ndc) {
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?id=${ndc}&idtype=NDC`;
    const proxy = `/netlify/functions/proxy?url=${encodeUrl(url)}`;
    const data = await safeFetchJson(proxy);
    return data.idGroup?.rxnormId?.[0] || null;
}

export async function getBrandName(rxCui) {
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/related.json?tty=BN`;
    const proxy = `/netlify/functions/proxy?url=${encodeUrl(url)}`;
    const data = await safeFetchJson(proxy);
    return data?.relatedGroup?.conceptGroup?.[0]?.conceptProperties?.[0]?.name || "Unknown";
}

export async function getForm(rxCui) {
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/properties.json`;
    const proxy = `/netlify/functions/proxy?url=${encodeUrl(url)}`;
    const data = await safeFetchJson(proxy);
    return data?.properties?.name || "Unknown";
}

export function getRxNormMatchStatus(rxCui1, rxCui2) {
    if (!rxCui1 || !rxCui2) return "❓ Unknown RxCUI";
    return rxCui1 === rxCui2
        ? "✅ RX Match by RxCUI"
        : "⚠️ Different RxCUIs (potentially not equivalent)";
}

export function isRxCuiMatch(rxCui1, rxCui2) {
    return !!(rxCui1 && rxCui2 && rxCui1 === rxCui2);
}
