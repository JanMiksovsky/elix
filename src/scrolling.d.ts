// Elix is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

export function canScrollInDirection(
  element: HTMLElement,
  orientation: 'horizontal'|'vertical',
  downOrRight: boolean
): boolean;
export function defaultScrollTarget(element: HTMLElement): HTMLElement;
export function getScrollableElement(element: HTMLElement): HTMLElement|null;
