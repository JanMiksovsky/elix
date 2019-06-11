import * as symbols from './symbols.js';
import * as template from './template.js';
import ReactiveElement from './ReactiveElement.js'; // eslint-disable-line no-unused-vars


const nativeAdoptedStyleSheets = 'adoptedStyleSheets' in ShadowRoot.prototype;


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
      if (!nativeAdoptedStyleSheets ||
          !this.shadowRoot ||
          this.shadowRoot.adoptedStyleSheets.length > 0) {
        // No native support, or no shadow root was attached, or we've already
        // adopted the stylesheets.
        return;
      }
      const sheets = this[symbols.styleSheets]
        .filter(sheet => sheet)
        .map(sheet => {
          if (sheet instanceof CSSStyleSheet) {
            return sheet;
          } else if (typeof sheet === 'string') {
            const s = new CSSStyleSheet();
            s.replaceSync(sheet);
            return s;
          }
        });
      this.shadowRoot.adoptedStyleSheets = sheets;
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
