import { useMemo } from 'react';

interface PlaceholderChartProps {
  promptText: string;
}

function detectChartType(text: string): 'line' | 'table' | 'process' | null {
  const lower = text.toLowerCase();
  if (lower.includes('line graph') || lower.includes('internet usage')) return 'line';
  if (lower.includes('table') || lower.includes('temperatures')) return 'table';
  if (lower.includes('diagram') || lower.includes('process')) return 'process';
  return null;
}

function LineChart() {
  const countries = ['USA', 'UK', 'Japan', 'Brazil', 'Nigeria'];
  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
  const paths = [
    'M40,180 L120,140 L200,90 L280,50 L360,30',
    'M40,190 L120,160 L200,110 L280,70 L360,45',
    'M40,185 L120,150 L200,100 L280,65 L360,40',
    'M40,200 L120,190 L200,160 L280,120 L360,80',
    'M40,210 L120,205 L200,195 L280,170 L360,140',
  ];
  const years = ['2000', '2005', '2010', '2015', '2020'];

  return (
    <svg viewBox="0 0 420 260" className="w-full max-w-lg">
      {/* Grid */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1="40" y1={30 + i * 45} x2="360" y2={30 + i * 45} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
      {/* Y axis labels */}
      {['100%', '75%', '50%', '25%', '0%'].map((label, i) => (
        <text key={i} x="35" y={34 + i * 45} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">{label}</text>
      ))}
      {/* X axis labels */}
      {years.map((y, i) => (
        <text key={y} x={40 + i * 80} y={230} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">{y}</text>
      ))}
      {/* Lines */}
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={colors[i]} strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {/* Legend */}
      {countries.map((c, i) => (
        <g key={c} transform={`translate(${50 + i * 72}, 250)`}>
          <rect width="10" height="10" rx="2" fill={colors[i]} />
          <text x="14" y="9" fontSize="9" fill="hsl(var(--muted-foreground))">{c}</text>
        </g>
      ))}
    </svg>
  );
}

function TableChart() {
  const cities = ['London', 'Tokyo', 'Sydney', 'Cairo'];
  const months = ['Jan', 'Apr', 'Jul', 'Oct'];
  const data = [
    [5, 11, 18, 12],
    [6, 15, 27, 19],
    [23, 19, 13, 18],
    [14, 22, 29, 24],
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-md text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-border bg-muted/50 px-3 py-2 text-left text-muted-foreground">City</th>
            {months.map(m => (
              <th key={m} className="border border-border bg-muted/50 px-3 py-2 text-center text-muted-foreground">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cities.map((city, i) => (
            <tr key={city}>
              <td className="border border-border px-3 py-2 font-medium text-foreground">{city}</td>
              {data[i].map((temp, j) => (
                <td key={j} className="border border-border px-3 py-2 text-center text-foreground">{temp}°C</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProcessDiagram() {
  const steps = ['Collection', 'Sorting', 'Shredding', 'Washing', 'Melting', 'Pelletizing', 'New Products'];

  return (
    <svg viewBox="0 0 500 100" className="w-full max-w-xl">
      {steps.map((step, i) => {
        const x = 10 + i * 70;
        return (
          <g key={step}>
            <rect x={x} y="20" width="58" height="40" rx="8" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x={x + 29} y="44" textAnchor="middle" fontSize="7.5" fill="hsl(var(--foreground))" fontWeight="500">{step}</text>
            {i < steps.length - 1 && (
              <polygon points={`${x + 62},40 ${x + 68},36 ${x + 68},44`} fill="hsl(var(--primary))" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function PlaceholderChart({ promptText }: PlaceholderChartProps) {
  const chartType = useMemo(() => detectChartType(promptText), [promptText]);

  if (!chartType) return null;

  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-5">
      <div className="flex justify-center">
        {chartType === 'line' && <LineChart />}
        {chartType === 'table' && <TableChart />}
        {chartType === 'process' && <ProcessDiagram />}
      </div>
      <p className="mt-3 text-center text-xs italic text-muted-foreground">
        Note: In production this would be a real chart image.
      </p>
    </div>
  );
}
