// No import needed — use global fetch

export async function handler(event) {
    const url = event.queryStringParameters?.url;

    if (!url) {
        return {
            statusCode: 400,
            body: 'Missing URL parameter',
        };
    }

    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type') || 'text/plain';
        const body = await response.text();

        return {
            statusCode: response.status,
            headers: { 'Content-Type': contentType },
            body,
        };
    } catch (err) {
        console.error('Proxy fetch failed:', err);
        return {
            statusCode: 500,
            body: 'Proxy fetch failed: ' + err.message,
        };
    }
}
