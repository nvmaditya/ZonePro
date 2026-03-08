"use client";

import { createContext, useContext } from "react";

interface UserIdContextValue {
    userId: string | null;
}

const UserIdContext = createContext<UserIdContextValue>({ userId: null });

export function UserIdProvider({
    userId,
    children,
}: {
    userId: string | null;
    children: React.ReactNode;
}) {
    return (
        <UserIdContext.Provider value={{ userId }}>
            {children}
        </UserIdContext.Provider>
    );
}

export function useUserId() {
    return useContext(UserIdContext);
}
