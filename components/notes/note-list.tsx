"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pin, Search, Archive, Plus } from "lucide-react";
import type { Note } from "@/types";
import { formatShortDate } from "@/lib/date-utils";

interface NoteListProps {
    notes: Note[];
    selectedId: string | null;
    searchQuery: string;
    showArchived: boolean;
    onSearch: (query: string) => void;
    onSelect: (note: Note) => void;
    onAdd: () => void;
    onToggleArchived: () => void;
}

export function NoteList({
    notes,
    selectedId,
    searchQuery,
    showArchived,
    onSearch,
    onSelect,
    onAdd,
    onToggleArchived,
}: NoteListProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-3 space-y-2 border-b">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Search notes..."
                            className="pl-8 h-8"
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onToggleArchived}
                        className={showArchived ? "bg-muted" : ""}
                    >
                        <Archive className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-3 text-center">
                            {searchQuery
                                ? "No matching notes"
                                : "No notes yet. Create one!"}
                        </p>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => onSelect(note)}
                                className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                                    selectedId === note.id
                                        ? "bg-muted"
                                        : "hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    {note.isPinned && (
                                        <Pin className="w-3 h-3 text-primary" />
                                    )}
                                    <span className="text-sm font-medium truncate">
                                        {note.title || "Untitled"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {note.content.substring(0, 80) ||
                                        "Empty note"}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {formatShortDate(note.updatedAt)}
                                    </span>
                                    {note.tags.slice(0, 2).map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-xs px-1 py-0 h-4"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
