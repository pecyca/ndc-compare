import fetch from "node-fetch";

export async function handler(event, context) {
    const rxCui = event.queryStringParameters.rxCui;

    if (!rxCui) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: "Missing rxCui parameter",
        };
    }

    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/drug-shortages.json?rxnorm=${rxCui}`;
    console.log("Fetching shortage info from:", url);

    try {
        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "ndc-compare-tool/1.0"
            }
        });

        const contentType = response.headers.get("content-type") || "";
        const bodyText = await response.text();

        if (!response.ok || !contentType.includes("application/json")) {
            console.error("DailyMed shortage response error:", bodyText);
            return {
                statusCode: response.status,
                headers: {
                    "Content-Type": contentType,
                    "Access-Control-Allow-Origin": "*"
                },
                body: `Upstream shortage API error: ${bodyText}`
            };
        }

        const data = JSON.parse(bodyText);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.error("Fetch error in getShortageInfo:", err.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: `Error fetching shortage info: ${err.message}`,
        };
    }
}
