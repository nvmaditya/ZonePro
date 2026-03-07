"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

export function HabitsSection() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        Habits
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
}
