import brand from "@/constants/brand.json";

export function BrandMark() {
  return (
    <svg
      viewBox="100 105 335 280"
      className="brand-mark"
      fill="none"
      aria-hidden="true"
    >
      <path d={brand.monogram} fill="currentColor" fillRule="evenodd" />
      <path d={brand.asterisk} stroke="currentColor" strokeWidth="12" />
    </svg>
  );
}
