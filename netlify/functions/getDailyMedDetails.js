import fetch from "node-fetch";

export async function handler(event, context) {
    const rxCui = event.queryStringParameters.rxCui || event.queryStringParameters.rxcui;

    console.log("Calling getDailyMedDetails with RxCUI:", rxCui);

    if (!rxCui) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: "Missing rxCui"
        };
    }

    const splUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;
    console.log("Fetching from:", splUrl);

    try {
        const response = await fetch(splUrl);
        const bodyText = await response.text();
        const contentType = response.headers.get("content-type") || "text/plain";

        if (!response.ok) {
            console.error("DailyMed error:", bodyText);
            return {
                statusCode: response.status,
                headers: {
                    "Content-Type": contentType,
                    "Access-Control-Allow-Origin": "*"
                },
                body: bodyText
            };
        }

        // Try parsing body as JSON (DailyMed sometimes returns XML/HTML error page)
        let data;
        try {
            data = JSON.parse(bodyText);
        } catch (parseErr) {
            console.error("Invalid JSON from DailyMed:", bodyText);
            return {
                statusCode: 502,
                headers: {
                    "Content-Type": contentType,
                    "Access-Control-Allow-Origin": "*"
                },
                body: "Invalid response from DailyMed"
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Fetch failed:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: `Server error: ${error.message}`
        };
    }
}
