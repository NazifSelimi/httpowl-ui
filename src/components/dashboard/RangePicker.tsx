import { TIME_RANGES } from '@/shared/constants';
import type { TimeRange } from '@/types';

/** The 1h / 24h / 7d / 30d switch. */
export default function RangePicker({ value, onChange }: { value: TimeRange; onChange: (range: TimeRange) => void }) {
  return (
    <div className="range-picker" aria-label="Time range">
      {TIME_RANGES.map((range) => (
        <button key={range} onClick={() => onChange(range)} className={value === range ? 'selected' : ''} aria-pressed={value === range}>
          {range}
        </button>
      ))}
    </div>
  );
}
