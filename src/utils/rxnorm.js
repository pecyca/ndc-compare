export async function getRxCui(ndc) {
	const response = await fetch(`/.netlify/functions/getRxCui?ndc=${ndc}`);
	const data = await response.json();
	return data.idGroup?.rxnormId?.[0] || null;
}


export async function getBrandName(rxCui) {
	const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/related.json?tty=BN`);
	const data = await response.json();
	const brand = data?.relatedGroup?.conceptGroup?.[0]?.conceptProperties?.[0]?.name;
	return brand || 'Unknown';
}

export async function getFormDescription(rxCui) {
	const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxCui}/properties.json`);
	const data = await response.json();
	return data?.properties?.doseFormName || 'Unknown';
}

export async function isRxCuiMatch(rxCui1, rxCui2) {
	return rxCui1 && rxCui2 && rxCui1 === rxCui2;
}
