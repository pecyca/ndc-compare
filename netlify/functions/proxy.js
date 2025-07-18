import fetch from "node-fetch";

export async function handler(event, context) {
    const encodedUrl = event.queryStringParameters.url;

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
        const response = await fetch(targetUrl);
        const bodyText = await response.text();
        const contentType = response.headers.get("content-type") || "text/plain";

        if (!response.ok) {
            console.error("Upstream error:", bodyText);
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
