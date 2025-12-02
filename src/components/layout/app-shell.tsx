import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

import type { ReactNode } from "react";

type AppShellProps = {
    children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex min-h-screen flex-col bg-[var(--color-surface)] text-[var(--color-text)]">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

