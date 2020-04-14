import * as internal from "../../src/base/internal.js";
import * as template from "../../src/core/template.js";
import TopAnchorMixin from "../../src/base/TopAnchorMixin.js";
import ReactiveElement from "../../src/core/ReactiveElement.js";

const Base = TopAnchorMixin(ReactiveElement);

export default class TopAnchorTest extends Base {
  get [internal.template]() {
    const result = template.html`
      <style>
        :host {
          display: block;
          overflow: auto;
          position: relative;
        }
      </style>
      <slot></slot>
    `;
    return result;
  }
}

customElements.define("top-anchor-test", TopAnchorTest);
