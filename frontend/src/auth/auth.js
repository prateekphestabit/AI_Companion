export async function checkAuth() {
    try {
        const res = await fetch(import.meta.env.VITE_AUTH_API_URL, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        }).catch(error => {
            console.error("Network error during auth check:", error);
            return false;
        });
        
        const data = await res.json();
        return data.success;
    } catch (error) {
        console.error("Auth check failed:", error);
        return false;
    }
}