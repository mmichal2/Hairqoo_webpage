"use client";

import { useFiltersStore } from "@/core/state/filtersStore";
import { useDict } from "@/core/state/i18nStore";
import styles from "./CountryFilter.module.css";

export function CountryFilter({ countries }: { countries: string[] }) {
  const dict = useDict();
  const { country, setCountry } = useFiltersStore();

  return (
    <label className={styles.wrap}>
      <span className="sr-only">{dict.common.country}</span>
      <select
        className={styles.select}
        value={country ?? ""}
        onChange={(e) => setCountry(e.target.value || null)}
      >
        <option value="">{dict.common.allCountries}</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
