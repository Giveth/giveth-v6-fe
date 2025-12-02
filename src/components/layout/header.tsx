import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Projects", href: "/projects" },
    { label: "QF Rounds", href: "/qf" },
    { label: "Archive", href: "/qf-archive" },
    { label: "Dashboard", href: "/account" },
];

export function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in srgb, var(--color-card) 80%, transparent)] backdrop-blur-lg">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-3 text-lg font-semibold tracking-tight"
                    aria-label="Giveth Quadratic Funding home"
                >
                    <span className="rounded-full bg-[var(--giv-primary-500)] px-3 py-1 text-sm font-bold uppercase text-white">
                        GIVETH
                    </span>
                    <span className="text-sm uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
                        QF
                    </span>
                </Link>

                <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-text-muted)] md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="transition-colors hover:text-[var(--color-text)]"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="primary" size="sm" asChild>
                        <Link href="/donate">Donate</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}

