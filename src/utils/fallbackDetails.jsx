export async function getFallbackDetails(rxCui, brandName) {
    try {
        const url = `https://api.fda.gov/drug/label.json?search=openfda.rxcui:${rxCui}`;
        const response = await fetch(url);

        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
            throw new Error(`FDA response not OK or not JSON: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results?.[0] || {};

        function cleanAndFormat(text) {
            if (!text) return '';
            return text
                .replace(/\r?\n|\r/g, ' ')
                .replace(/\(\s*\d+\s*\)/g, '•')
                .replace(/\(\s*\d+\.\d+\s*\)/g, '•')
                .replace(/(?<!\d)(\d+\.\d+)(?!\d)/g, '•')
                .replace(/•+/g, '•')
                .replace(/(?:^|\s)•/g, '\n•')
                .replace(/ +/g, ' ')
                .replace(/\n{2,}/g, '\n')
                .trim();
        }

        function uniqueConcat(a = '', b = '') {
            return a.includes(b) ? a : a + '\n' + b;
        }

        const indications = cleanAndFormat(results.indications_and_usage?.[0]);
        const dosage = cleanAndFormat(results.dosage_and_administration?.[0]);
        const warnings = cleanAndFormat(results.warnings_and_cautions?.[0] || results.warnings?.[0]);
        const admin = cleanAndFormat(results.how_to_use?.[0] || '');
        const storage = cleanAndFormat(results.storage_and_handling?.[0] || results.how_supplied?.[0]);
        const description = cleanAndFormat(results.description?.[0] || '');
        const drugClass = cleanAndFormat((results.openfda?.pharm_class_epc || []).join('\n'));

        return {
            indications,
            dosageAndAdministration: dosage + (admin ? '\n' + admin : ''),
            warnings,
            storage: uniqueConcat(storage, description),
            preparations: '',
            drugClass,
        };

    } catch (err) {
        console.error('Fallback details fetch error:', err.message);
        return {
            indications: '',
            dosageAndAdministration: '',
            warnings: '',
            storage: '',
            preparations: '',
            drugClass: '',
        };
    }
}
