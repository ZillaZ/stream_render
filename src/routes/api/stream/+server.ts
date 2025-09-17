import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, fetch }) => {
    const videoUrl = url.searchParams.get("video");
    if (!videoUrl) {
        return new Response("Missing 'video' parameter", { status: 400 });
    }

    try {
        const response = await fetch(videoUrl, {
            headers: { "Referer": videoUrl }
        });

        if (!response.ok) {
            return new Response(`Failed to fetch: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get("Content-Type") || "";

        const resHeaders = new Headers(response.headers);
        resHeaders.set("Access-Control-Allow-Origin", "*");
        resHeaders.set("Cache-Control", "no-store");

        if (contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("application/x-mpegURL")) {
            const playlistText = await response.text();
            const baseUrl = response.url; // Use the final response URL as the base

            const rewrittenLines = playlistText.split("\n").map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine === "" || trimmedLine.startsWith("#")) {
                    return line;
                }
                const absoluteUrl = new URL(trimmedLine, baseUrl).href;
                return `http://localhost:5173/api/stream?video=${encodeURIComponent(absoluteUrl)}`;
            });

            const rewrittenPlaylist = rewrittenLines.join("\n");

            return new Response(rewrittenPlaylist, {
                status: 200,
                headers: resHeaders
            });
        } else {
            return new Response(response.body, {
                status: response.status,
                headers: resHeaders
            });
        }

    } catch (error) {
        console.error("Proxy Error:", error);
        return new Response("Failed to process video URL", { status: 500 });
    }
};
