export class YouTubePlaylistExtractor {
    constructor(private apiKey: string) {}

    extractPlaylistId(url: string): string | null {
        const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }

    async getPlaylistData(playlistUrl: string) {
        const playlistId = this.extractPlaylistId(playlistUrl);
        if (!playlistId) {
            throw new Error("Invalid playlist URL");
        }

        const videos: any[] = [];
        let totalItems = 0;
        let playlistTitle = "";
        let playlistDescription = "";
        let nextPageToken = "";
        let isFirstCall = true;

        do {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${
                this.apiKey
            }${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `API Error: ${response.status} - ${response.statusText}`
                );
            }

            const data = await response.json();

            if (isFirstCall) {
                totalItems = data.pageInfo?.totalResults || 0;
                if (data.items && data.items.length > 0) {
                    playlistTitle = `Playlist (${totalItems} videos)`;
                    playlistDescription = `YouTube playlist with ${totalItems} videos`;
                }
                isFirstCall = false;
            }

            data.items.forEach((item: any) => {
                const snippet = item.snippet;
                videos.push({
                    id: snippet.resourceId.videoId,
                    title: snippet.title,
                    description: snippet.description || "",
                    thumbnail:
                        snippet.thumbnails.medium?.url ||
                        snippet.thumbnails.default?.url ||
                        "/placeholder.jpg",
                    duration: "Unknown",
                    publishedAt: snippet.publishedAt,
                    channelTitle: snippet.channelTitle,
                    url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
                });
            });

            nextPageToken = data.nextPageToken || "";
        } while (nextPageToken);

        return {
            videos,
            metadata: {
                totalVideos: totalItems,
                title: playlistTitle,
                description: playlistDescription,
            },
        };
    }
}
