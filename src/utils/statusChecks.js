// utils/statusChecks.js

export async function checkDiscontinuedStatus(ndc) {
    try {
        const response = await fetch(`/api/discontinued-status?ndc=${ndc}`);
        const data = await response.json();
        return data.discontinued || false;
    } catch (error) {
        console.error("Discontinued status check failed:", error);
        return false;
    }
}

export async function checkShortageStatus(ndc) {
    try {
        const response = await fetch(`/api/shortage-status?ndc=${ndc}`);
        const data = await response.json();
        return data.inShortage || false; // 🛠️ fixed field name here
    } catch (error) {
        console.error("Shortage status check failed:", error);
        return false;
    }
}
