interface MetricCardProps {
    readonly label: string;
    readonly value: string;
    readonly helper?: string;
}

export function MetricCard({
    label,
    value,
    helper,
}: MetricCardProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                {value}
            </p>

            {helper ? (
                <p className="mt-1 text-xs text-zinc-500">
                    {helper}
                </p>
            ) : null}
        </div>
    );
}