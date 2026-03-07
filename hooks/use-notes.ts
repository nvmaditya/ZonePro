"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Note } from "@/types";

export function useNotes() {
    const {
        value: notes,
        setValue: setNotes,
        isLoaded,
    } = useLocalStorage<Note[]>("zonepro-notes", []);
    const [searchQuery, setSearchQuery] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    const addNote = useCallback(
        (data?: Partial<Note>) => {
            const now = new Date().toISOString();
            const newNote: Note = {
                id: crypto.randomUUID(),
                title: "Untitled",
                content: "",
                tags: [],
                isPinned: false,
                isArchived: false,
                createdAt: now,
                updatedAt: now,
                ...data,
            };
            setNotes((prev) => [newNote, ...prev]);
            return newNote;
        },
        [setNotes],
    );

    const updateNote = useCallback(
        (id: string, updates: Partial<Note>) => {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              ...updates,
                              updatedAt: new Date().toISOString(),
                          }
                        : n,
                ),
            );
        },
        [setNotes],
    );

    const deleteNote = useCallback(
        (id: string) => {
            setNotes((prev) => prev.filter((n) => n.id !== id));
        },
        [setNotes],
    );

    const togglePinned = useCallback(
        (id: string) => {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              isPinned: !n.isPinned,
                              updatedAt: new Date().toISOString(),
                          }
                        : n,
                ),
            );
        },
        [setNotes],
    );

    const toggleArchived = useCallback(
        (id: string) => {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              isArchived: !n.isArchived,
                              updatedAt: new Date().toISOString(),
                          }
                        : n,
                ),
            );
        },
        [setNotes],
    );

    const filteredNotes = useMemo(() => {
        let result = notes.filter((n) =>
            showArchived ? n.isArchived : !n.isArchived,
        );
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n) =>
                    n.title.toLowerCase().includes(q) ||
                    n.content.toLowerCase().includes(q) ||
                    n.tags.some((t) => t.toLowerCase().includes(q)),
            );
        }
        // Pinned first, then by updatedAt
        return result.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return b.updatedAt.localeCompare(a.updatedAt);
        });
    }, [notes, searchQuery, showArchived]);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [notes]);

    return {
        notes,
        setNotes,
        isLoaded,
        filteredNotes,
        allTags,
        searchQuery,
        setSearchQuery,
        showArchived,
        setShowArchived,
        addNote,
        updateNote,
        deleteNote,
        togglePinned,
        toggleArchived,
    };
}
