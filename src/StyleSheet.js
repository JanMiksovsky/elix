// TOOD: Remove?
// This provides a template literal for constructing a CSSStyleSheet,
// but it's probably simpler just to use strings.

let nativeConstructibleStyleSheets;
try {
  new CSSStyleSheet();
  nativeConstructibleStyleSheets = true;
} catch (e) {
  nativeConstructibleStyleSheets = false;
}


export function css(strings, ...substitutions) {
  // Concatenate the strings and substitutions.
  const complete = strings.map((string, index) => {
    const substitution = index < substitutions.length ?
      substitutions[index] :
      '';
    return `${string}${substitution}`;
  }).join('');
  let sheet;
  if (nativeConstructibleStyleSheets) {
    sheet = new CSSStyleSheet();
    /** @type {any} */ (sheet).replaceSync(complete);
  } else {
    const element = document.createElement('style');
    element.textContent = complete;
    document.head.append(element);
    sheet = element.sheet;
    element.remove();
  }
  return sheet;
}
