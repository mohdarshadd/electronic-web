let locks = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (locks === 0) {
    const { body } = document;
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  }

  locks += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    }
  };
}
