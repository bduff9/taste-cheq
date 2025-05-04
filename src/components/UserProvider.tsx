"use client";
import type { User } from "@/lib/db-types";
import { type ReactNode, createContext, useContext } from "react";

export const UserContext = createContext<{ user: User | null }>({ user: null });

export const UserProvider = ({
	user,
	children,
}: { user: User | null; children: ReactNode }) => (
	<UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
);

export const useUser = () => useContext(UserContext);
