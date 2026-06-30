/** Frosted strip for the mobile browser URL bar area (above the site header). */
export function MobileTopBlur() {
  return (
    <div
      aria-hidden="true"
      className="mobile-edge-blur-top pointer-events-none fixed inset-x-0 top-0 z-[49] md:hidden"
    />
  );
}
