import Link from "next/link";

const footerLinks = [
    { label: "Docs", href: "https://docs.giveth.io" },
    { label: "Discord", href: "https://discord.gg/giveth" },
    { label: "GitHub", href: "https://github.com/Giveth" },
];

export function Footer() {
    return (
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between md:px-6">
                <p>
                    © {new Date().getFullYear()} Giveth. Quadratic Funding for community
                    owned impact.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-[var(--color-text)]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

