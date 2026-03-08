"use client";

import { useState, useEffect } from "react";

export function useYouTubeAPI(enabled = true) {
    const [isYTReady, setIsYTReady] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        if (typeof window !== "undefined" && !window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setIsYTReady(true);
            };
        } else if (typeof window !== "undefined") {
            setIsYTReady(true);
        }
    }, [enabled]);

    return { isYTReady };
}
