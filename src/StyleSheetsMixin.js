import * as symbols from './symbols.js';
import * as template from './template.js';
import ReactiveElement from './ReactiveElement.js'; // eslint-disable-line no-unused-vars


const nativeAdoptedStyleSheets = 'adoptedStyleSheets' in ShadowRoot.prototype;

// A cache mapping element class to stylesheet arrays.
const classStyleSheetsMap = new Map();


/**
 * Stamps a template into a component's Shadow DOM when instantiated
 *
 * @module StyleSheetsMixin
 * @param {Constructor<ReactiveElement>} Base
 */
export default function StyleSheetsMixin(Base) {

  // The class prototype added by the mixin.
  class StyleSheets extends Base {

    /*
     * If the component defines a template, a shadow root will be created on the
     * component instance, and the template stamped into it.
     */
    [symbols.render](/** @type {PlainObject} */ changed) {
      if (super[symbols.render]) { super[symbols.render](changed); }
      // TODO: warn if no shadow root
      if (!nativeAdoptedStyleSheets || !this.shadowRoot) {
        // No native support, or no shadow root was attached, or we've already
        // adopted the stylesheets.
        return;
      }
      /** @type {any} */
      const cast =  this.shadowRoot;
      if (cast.adoptedStyleSheets.length > 0) {
        // Already adopted
        return;
      }
      const sheets = getStyleSheets(this);
      cast.adoptedStyleSheets = sheets;
    }

    get [symbols.template]() {
      const base = super[symbols.template];
      if (!nativeAdoptedStyleSheets) {
        const sheets = this[symbols.styleSheets];
        const text = sheets.join('\n');
        if (text) {
          return template.concat(base, template.html`
            <style>${text}</style>
          `);
        }
      }
      return base;
    }

  }

  return StyleSheets;
}


/**
 * Return and cache the stylesheet array for the given element's class.
 * 
 * @private
 * @param {HTMLElement} element
 * @returns {CSSStyleSheet[]}
 */
function getStyleSheets(element) {
  let styleSheets = classStyleSheetsMap.get(element.constructor);
  if (!styleSheets) {
    styleSheets = element[symbols.styleSheets]
      .filter(sheet => sheet)
      .map(sheet => {
        if (sheet instanceof CSSStyleSheet) {
          // Return as is.
          return sheet;
        }
        // Convert from string.
        const s = new CSSStyleSheet();
        /** @type {any} */ (s).replaceSync(sheet);
        return s;
      });
    classStyleSheetsMap.set(element.constructor, styleSheets);
  }
  return styleSheets;
}
