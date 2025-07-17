// rxnorm.js

export async function getRxCui(ndc) {
	try {
		const response = await fetch(`/.netlify/functions/getRxCui?ndc=${ndc}`);
		if (!response.ok) {
			console.error(`getRxCui failed for NDC ${ndc}: ${response.status}`);
			return null;
		}
		const data = await response.json();
		const rxCui = data?.idGroup?.rxnormId?.[0] || null;
		if (!rxCui) {
			console.warn(`No RxCUI found for NDC ${ndc}`);
		}
		return rxCui;
	} catch (err) {
		console.error(`Error fetching RxCUI for ${ndc}:`, err);
		return null;
	}
}

export async function getBrandName(rxCui) {
	try {
		const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/related.json?tty=BN`);
		if (!response.ok) {
			console.error(`getBrandName failed for RxCUI ${rxCui}: ${response.status}`);
			return 'Unknown';
		}
		const data = await response.json();
		const brand = data?.relatedGroup?.conceptGroup?.[0]?.conceptProperties?.[0]?.name;
		return brand || 'Unknown';
	} catch (err) {
		console.error(`Error fetching brand name for RxCUI ${rxCui}:`, err);
		return 'Unknown';
	}
}

export async function getFormDescription(rxCui) {
	try {
		const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/properties.json`);
		if (!response.ok) {
			console.error(`getFormDescription failed for RxCUI ${rxCui}: ${response.status}`);
			return 'Unknown';
		}
		const data = await response.json();
		return data?.properties?.doseFormName || 'Unknown';
	} catch (err) {
		console.error(`Error fetching form for RxCUI ${rxCui}:`, err);
		return 'Unknown';
	}
}

export function isRxCuiMatch(rxCui1, rxCui2) {
	return rxCui1 && rxCui2 && rxCui1 === rxCui2;
}
