const BRAND_BASE = "./assets/brand";

/**
 * @param {{ size?: 'sm' | 'md' | 'lg', wordmark?: boolean, className?: string }} [opts]
 */
export function hairqooBrandMarkup({ size = "sm", wordmark = true, className = "" } = {}) {
  const extra = [
    `hairqoo-brand--${size}`,
    wordmark ? "" : "hairqoo-brand--monogram-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return `<span class="hairqoo-brand ${extra}" role="img" aria-label="Hairqoo">
    <span class="hairqoo-brand__monogram" aria-hidden="true">
      <span class="hairqoo-brand__shape"></span>
      <img class="hairqoo-brand__mint" src="${BRAND_BASE}/hairqoo_monogram_mint.svg" alt="" />
    </span>
    <span class="hairqoo-brand__wordmark" aria-hidden="true"></span>
  </span>`;
}
