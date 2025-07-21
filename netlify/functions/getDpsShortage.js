import fetch from "node-fetch";

export async function handler(event) {
    const name = event.queryStringParameters?.name;

    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({ status: "error", message: "Missing 'name' query parameter" })
        };
    }

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const url = `https://dps.fda.gov/drugshortages/activeingredient/${slug}`;
    console.log(`Fetching shortage info for: ${name} → slug: ${slug}`);

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "ndc-compare-app (Netlify Function)",
                "Accept": "text/html"
            }
        });

        const html = await response.text();

        const noMatch = html.toLowerCase().includes("no matches found");

        if (response.status === 404 || noMatch) {
            return {
                statusCode: 200,
                body: JSON.stringify({ status: "not_found" })
            };
        }

        const isActive =
            html.includes("Estimated Resupply Date") ||
            html.includes("Reason for Shortage") ||
            html.includes("Product Strength");

        return {
            statusCode: 200,
            body: JSON.stringify({ status: isActive ? "active" : "inactive" })
        };
    } catch (err) {
        console.error("Error fetching DPS shortage:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ status: "error", message: err.message })
        };
    }
}
