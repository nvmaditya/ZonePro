# YouTube API Integration & Fixes

## Issues Fixed

### 1. Window is not defined Error

**Problem**: The application was trying to access `window` object during server-side rendering, causing the error:

```
ReferenceError: window is not defined at MusicPlayer
```

**Solution**: Added proper client-side checks throughout the codebase:

-   Added `typeof window !== 'undefined'` checks before accessing `window`
-   Updated all YouTube API interactions to handle SSR properly
-   Fixed both `music-player.tsx` and `page.tsx`

### 2. YouTube V3 API Integration

**Added**: New `YouTubePlaylist` component with full YouTube Data API v3 integration

**Features**:

-   Load YouTube playlists by URL
-   Search YouTube videos
-   Display video thumbnails and metadata
-   Responsive design matching the existing UI
-   Proper error handling and loading states
-   API key configuration through environment variables

## New Component: YouTube Playlist

Located in `components/youtube-playlist.tsx`, this component provides:

1. **Playlist Loading**: Paste a YouTube playlist URL to load all videos
2. **Video Search**: Search YouTube for specific videos
3. **Video Selection**: Click videos to open them or integrate with other components
4. **Responsive UI**: Works on both desktop and mobile
5. **Error Handling**: Proper error messages for API issues

## Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment

1. Copy `.env.local.example` to `.env.local`
2. Add your YouTube API key:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_actual_api_key_here
```

### 3. Component Usage

The YouTube playlist component is now integrated in the sidebar above the Pomodoro timer. You can:

-   Load playlists by pasting YouTube playlist URLs
-   Search for videos using keywords
-   Click videos to open them in new tabs
-   Integrate with the music player (future enhancement)

## Future Enhancements

1. **Music Player Integration**: Connect YouTube videos with the existing music player
2. **Course Integration**: Use YouTube videos as course content
3. **Offline Support**: Cache video metadata for offline viewing
4. **Playlist Management**: Save and manage custom playlists
5. **Video Notes**: Add notes and timestamps to videos

## UI Improvements

The component matches the existing design system:

-   Same card styling as other components
-   Responsive badges showing video count
-   Proper loading states and error messages
-   Consistent spacing and typography
-   Mobile-friendly layout

## Files Modified

1. `app/page.tsx` - Fixed window usage, added YouTube component
2. `components/music-player.tsx` - Fixed SSR window issues
3. `components/youtube-playlist.tsx` - New component (created)
4. `.env.local.example` - Environment variable template (created)

The application should now run without the "window is not defined" error and include the YouTube API integration in the sidebar.
