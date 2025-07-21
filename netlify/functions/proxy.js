import fetch from "node-fetch";

export async function handler(event, context) {
    const encodedUrl = event.queryStringParameters?.url;

    if (!encodedUrl) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: "Missing 'url' query parameter"
        };
    }

    const targetUrl = decodeURIComponent(encodedUrl);
    console.log("Proxying request to:", targetUrl);

    try {
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*"
            }
        });

        const bodyText = await response.text();
        const contentType = response.headers.get("content-type") || "text/plain";

        if (!response.ok) {
            console.error("Upstream error:", bodyText.slice(0, 300));
            return {
                statusCode: response.status,
                headers: {
                    "Content-Type": contentType,
                    "Access-Control-Allow-Origin": "*"
                },
                body: bodyText
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*"
            },
            body: bodyText
        };
    } catch (error) {
        console.error("Proxy fetch failed:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: `Error proxying to ${targetUrl}: ${error.message}`
        };
    }
}
