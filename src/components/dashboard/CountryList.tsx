import type { CountryCount } from '@/types';
import { countryName, formatNumber } from '@/shared/utils/format';

/** Top countries with their share of all requests in the range. */
export default function CountryList({ countries, total }: { countries: CountryCount[]; total: number }) {
  if (countries.length === 0) {
    return <div className="table-empty">No visits in this time range yet.</div>;
  }
  return (
    <div className="country-list">
      {countries.slice(0, 8).map((country) => {
        const share = total > 0 ? Math.round((country.requests / total) * 100) : 0;
        return (
          <div className="country-row" key={country.country || 'unknown'}>
            <span className="country-code">{country.country || '??'}</span>
            <span className="country-name">
              {countryName(country.country)}
              <small>{formatNumber(country.requests)} visits</small>
            </span>
            <span className="country-share">
              <span>{share}%</span>
              <i>
                <b style={{ width: `${share}%` }} />
              </i>
            </span>
          </div>
        );
      })}
    </div>
  );
}
