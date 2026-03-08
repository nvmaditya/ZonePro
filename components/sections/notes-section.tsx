"use client";

import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileText } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { NoteList } from "@/components/notes/note-list";
import { NoteEditor } from "@/components/notes/note-editor";
import type { Note } from "@/types";

export function NotesSection() {
    const {
        filteredNotes, searchQuery, setSearchQuery, showArchived, setShowArchived,
        addNote, updateNote, deleteNote, togglePinned, toggleArchived,
    } = useNotes();

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedNote = filteredNotes.find(n => n.id === selectedId) || null;

    const handleAdd = () => {
        const note = addNote();
        setSelectedId(note.id);
    };

    const handleSelect = (note: Note) => {
        setSelectedId(note.id);
    };

    const handleDelete = (id: string) => {
        deleteNote(id);
        if (selectedId === id) setSelectedId(null);
    };

    return (
        <div className="h-full">
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={35} minSize={25}>
                    <NoteList
                        notes={filteredNotes}
                        selectedId={selectedId}
                        searchQuery={searchQuery}
                        showArchived={showArchived}
                        onSearch={setSearchQuery}
                        onSelect={handleSelect}
                        onAdd={handleAdd}
                        onToggleArchived={() => setShowArchived(!showArchived)}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={65}>
                    {selectedNote ? (
                        <NoteEditor
                            note={selectedNote}
                            onUpdate={updateNote}
                            onDelete={handleDelete}
                            onTogglePinned={togglePinned}
                            onToggleArchived={toggleArchived}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Select a note or create a new one</p>
                            </div>
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
