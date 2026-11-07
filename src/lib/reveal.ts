// When a tall box is swapped for a shorter one (the estimate form for the
// inspection times, the times for "booked"), the page keeps its scroll spot and
// the new content ends up above the screen. Bring the box's top back into view,
// just below the fixed header (the box's scroll-mt class sets that gap).
const HEADER_PX = 80;

export function revealTop(box: HTMLElement | null) {
  if (!box) return;
  const top = box.getBoundingClientRect().top;
  if (top < HEADER_PX || top > window.innerHeight) {
    box.scrollIntoView({ block: "start" });
  }
}
