// Test script for YouTube URL parsing functionality
// Run this with: node test-youtube-urls.js

const getYouTubeVideoId = (url) => {
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

const getPlaylistId = (url) => {
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

// Test URLs
const testUrls = [
    // Standard playlist URLs
    "https://youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo",
    "https://www.youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo",

    // Playlist URLs with si parameter (the user's format)
    "https://youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo&si=PXIgLQSeBUH25ckv",
    "https://www.youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo&si=PXIgLQSeBUH25ckv",

    // Playlist URLs with other parameters
    "https://youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo&index=1",
    "https://youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo&index=1&si=PXIgLQSeBUH25ckv",

    // Individual video URLs
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&si=PXIgLQSeBUH25ckv",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo&si=PXIgLQSeBUH25ckv",

    // Short URLs
    "https://youtu.be/dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=PXIgLQSeBUH25ckv",
    "https://youtu.be/dQw4w9WgXcQ?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo",
];

console.log("Testing YouTube URL parsing functionality...\n");

testUrls.forEach((url, index) => {
    const videoId = getYouTubeVideoId(url);
    const playlistId = getPlaylistId(url);

    console.log(`Test ${index + 1}:`);
    console.log(`URL: ${url}`);
    console.log(`Video ID: ${videoId || "Not found"}`);
    console.log(`Playlist ID: ${playlistId || "Not found"}`);
    console.log("---");
});

// Specific test for the user's URL format
console.log("\n🎯 SPECIFIC TEST FOR USER PROVIDED URL:");
const userUrl =
    "https://youtube.com/playlist?list=PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo&si=PXIgLQSeBUH25ckv";
const userVideoId = getYouTubeVideoId(userUrl);
const userPlaylistId = getPlaylistId(userUrl);

console.log(`URL: ${userUrl}`);
console.log(`Video ID: ${userVideoId || "Not found"}`);
console.log(`Playlist ID: ${userPlaylistId || "Not found"}`);

if (userPlaylistId === "PLrhWE6dwHUeiSTblHiOe9RyvGBAp8nAeo") {
    console.log("✅ SUCCESS: Playlist ID extracted correctly!");
} else {
    console.log("❌ FAILED: Playlist ID not extracted correctly");
}
