import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SeriesPoint } from '@/types';
import { bucketLabel } from '@/shared/utils/format';

// Chart colours match the CSS variables --owl-cyan / --owl-danger / --owl-line.
const COLORS = { requests: '#5ce1e6', attacks: '#ff7b6b', grid: '#1c2533', axis: '#8492a6' };

interface TrafficChartProps {
  series: SeriesPoint[];
  bucketSeconds: number;
  /** Range start/end (ISO): empty buckets in between are drawn as zero. */
  from: string;
  to: string;
}

/**
 * The API only returns buckets that had traffic. Fill the gaps with zeros so
 * the line drops to 0 when nothing happened, instead of joining far points.
 * Buckets are aligned like the API's date_bin (multiples of the bucket size, UTC).
 */
function fillGaps(series: SeriesPoint[], bucketSeconds: number, from: string, to: string): SeriesPoint[] {
  const step = bucketSeconds * 1000;
  const byTime = new Map(series.map((point) => [new Date(point.bucket).getTime(), point]));
  const points: SeriesPoint[] = [];
  for (let t = Math.floor(new Date(from).getTime() / step) * step; t <= new Date(to).getTime(); t += step) {
    points.push(byTime.get(t) ?? { bucket: new Date(t).toISOString(), humans: 0, bots: 0, attacks: 0, errors_5xx: 0 });
  }
  return points;
}

/** Requests and attacks per time bucket. */
export default function TrafficChart({ series, bucketSeconds, from, to }: TrafficChartProps) {
  const data = fillGaps(series, bucketSeconds, from, to).map((point) => ({
    time: bucketLabel(point.bucket, bucketSeconds),
    requests: point.humans + point.bots + point.attacks,
    attacks: point.attacks,
  }));

  return (
    <div className="traffic-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="requestFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.requests} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.requests} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: COLORS.axis, fontSize: 11 }} dy={10} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: COLORS.axis, fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#101720', border: '1px solid #263446', borderRadius: 12, color: '#f3f7fa' }} />
          <Area type="monotone" dataKey="requests" name="Requests" stroke={COLORS.requests} strokeWidth={2.5} fill="url(#requestFill)" activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="attacks" name="Attacks" stroke={COLORS.attacks} strokeWidth={1.5} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
