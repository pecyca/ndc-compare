// src/utils/rxnorm.js
export async function getRxcuiFromNdc(ndc) {
	const formatted = ndc.replace(/\D/g, "").padStart(11, "0");
	const dashed = `${formatted.slice(0, 5)}-${formatted.slice(5, 9)}-${formatted.slice(9)}`;
	const res = await fetch(`https://rxnav.nlm.nih.gov/REST/ndcproperties.json?id=${dashed}&idtype=NDC`);
	const json = await res.json();
	return json?.ndcPropertyList?.ndcProperty?.[0]?.rxcui || null;
}

export async function getBrandName(rxcui) {
	const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=BN`);
	const json = await res.json();
	const props = json?.relatedGroup?.conceptGroup?.[0]?.conceptProperties;
	return props?.[0]?.name || "Unknown";
}

export async function getFormDescription(rxcui) {
	const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
	const json = await res.json();
	return json?.properties?.name || "Unknown";
}
