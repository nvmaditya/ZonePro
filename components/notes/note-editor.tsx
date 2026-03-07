"use client";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pin, PinOff, Archive, ArchiveRestore, Trash2, X } from "lucide-react";
import type { Note } from "@/types";

interface NoteEditorProps {
    note: Note;
    onUpdate: (id: string, updates: Partial<Note>) => void;
    onDelete: (id: string) => void;
    onTogglePinned: (id: string) => void;
    onToggleArchived: (id: string) => void;
}

export function NoteEditor({
    note,
    onUpdate,
    onDelete,
    onTogglePinned,
    onToggleArchived,
}: NoteEditorProps) {
    const [newTag, setNewTag] = useState("");
    const debounceRef = useRef<NodeJS.Timeout>();

    const handleContentChange = (content: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onUpdate(note.id, { content });
        }, 500);
    };

    const handleTitleChange = (title: string) => {
        onUpdate(note.id, { title });
    };

    const handleAddTag = () => {
        if (newTag.trim() && !note.tags.includes(newTag.trim())) {
            onUpdate(note.id, { tags: [...note.tags, newTag.trim()] });
            setNewTag("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onTogglePinned(note.id)}
                >
                    {note.isPinned ? (
                        <PinOff className="w-4 h-4" />
                    ) : (
                        <Pin className="w-4 h-4" />
                    )}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleArchived(note.id)}
                >
                    {note.isArchived ? (
                        <ArchiveRestore className="w-4 h-4" />
                    ) : (
                        <Archive className="w-4 h-4" />
                    )}
                </Button>
                <div className="flex-1" />
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => onDelete(note.id)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Title */}
            <div className="px-4 pt-4">
                <Input
                    value={note.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Note title"
                    className="border-0 text-xl font-semibold p-0 h-auto focus-visible:ring-0 shadow-none"
                />
            </div>

            {/* Tags */}
            <div className="px-4 py-2 flex flex-wrap items-center gap-1">
                {note.tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 text-xs"
                    >
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
                <div className="flex items-center gap-1">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        placeholder="Add tag..."
                        className="h-6 w-24 text-xs border-dashed"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-4">
                <Textarea
                    defaultValue={note.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start writing... (Markdown supported)"
                    className="h-full min-h-[300px] resize-none border-0 focus-visible:ring-0 shadow-none font-mono text-sm"
                />
            </div>
        </div>
    );
}
