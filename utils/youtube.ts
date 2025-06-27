export const getYouTubeVideoId = (url: string) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

export const getPlaylistId = (url: string) => {
    // More robust regex to handle various YouTube playlist URL formats
    // Supports both youtube.com and youtu.be domains
    // Handles additional parameters like &si=, &index=, etc.
    const patterns = [
        /[?&]list=([a-zA-Z0-9_-]+)/, // Standard playlist parameter
        /\/playlist\?.*list=([a-zA-Z0-9_-]+)/, // Direct playlist URL
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
};
