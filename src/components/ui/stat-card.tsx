type StatCardProps = {
    label: string;
    value: string;
    helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-soft">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                {label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
            {helper && (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{helper}</p>
            )}
        </div>
    );
}

