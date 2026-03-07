"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import type { FocusSession } from "@/types";
import { formatShortDate } from "@/lib/date-utils";

interface FocusSessionLogProps {
    sessions: FocusSession[];
    taskNames?: Record<string, string>;
}

export function FocusSessionLog({ sessions, taskNames }: FocusSessionLogProps) {
    if (sessions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <History className="w-5 h-5" />
                        Session History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No focus sessions recorded yet. Start a timer to begin
                        tracking!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <History className="w-5 h-5" />
                    Session History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Task</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session) => (
                            <TableRow key={session.id}>
                                <TableCell className="text-sm">
                                    {formatShortDate(session.date)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {session.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {session.actualMinutes} min
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {session.taskId &&
                                    taskNames?.[session.taskId]
                                        ? taskNames[session.taskId]
                                        : "\u2014"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
