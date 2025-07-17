// netlify/functions/proxy.js

export async function handler(event) {
    const targetUrl = event.queryStringParameters.url;

    if (!targetUrl) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Missing 'url' query parameter" }),
        };
    }

    try {
        const res = await fetch(targetUrl);
        const contentType = res.headers.get("content-type") || "";
        const body = await res.text();

        return {
            statusCode: res.status,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*", // 💥 this enables CORS
            },
            body: body,
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Proxy fetch failed", details: err.message }),
        };
    }
}
