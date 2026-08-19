'use client';

interface PerformanceChartProps {
  score?: number;
  driverName?: string;
}

export function PerformanceChart({
  score = 92,
  driverName = 'السائق',
}: PerformanceChartProps) {
  const months = ['مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'];
  const points: [number, number][] = [
    [25, 125],
    [90, 103],
    [154, 111],
    [218, 73],
    [282, 64],
    [347, 42],
  ];

  return (
    <div className="relative h-[180px] overflow-hidden rounded-xl border border-[var(--zd-line)] bg-[var(--zd-chart-bg)] transition-colors">
      <div
        className="absolute inset-0 opacity-40 dark:opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(134,165,209,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(134,165,209,.08) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      <svg
        viewBox="0 0 380 180"
        className="relative h-full w-full"
        role="img"
        aria-label={`مخطط أداء ${driverName} خلال ستة أشهر`}
      >
        <defs>
          <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--zd-blue)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--zd-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M25 125 L90 103 L154 111 L218 73 L282 64 L347 42 L347 150 L25 150Z"
          fill="url(#scoreFill)"
        />
        <polyline
          points="25,125 90,103 154,111 218,73 282,64 347,42"
          fill="none"
          stroke="var(--zd-blue)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(([x, y]) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="4"
            fill="var(--zd-surface)"
            stroke="var(--zd-blue)"
            strokeWidth="2"
          />
        ))}
        {months.map((month, index) => (
          <text
            key={month}
            x={index * 64 + 10}
            y="169"
            fill="var(--zd-muted)"
            fontSize="9"
            className="select-none font-medium"
          >
            {month}
          </text>
        ))}
      </svg>
      <span className="absolute left-3 top-3 rounded-md bg-[var(--zd-surface-2)] border border-[var(--zd-line)] px-2 py-1 font-manrope text-[10px] font-bold text-[var(--zd-blue)]">
        {score} / ١٠٠
      </span>
    </div>
  );
}
