/** Strong frosted overlays for mobile browser chrome (URL bar / toolbar areas). */
export function MobileBlurEdges({ hidden = false }: { hidden?: boolean }) {
  if (hidden) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="mobile-edge-blur-top pointer-events-none fixed inset-x-0 top-0 z-[48] md:hidden"
      />
      <div
        aria-hidden="true"
        className="mobile-edge-blur-bottom pointer-events-none fixed inset-x-0 bottom-0 z-[48] md:hidden"
      />
    </>
  );
}
