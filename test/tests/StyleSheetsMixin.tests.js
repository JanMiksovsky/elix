import * as symbols from '../../src/symbols.js';
import * as template from '../../src/template.js';
import { css } from '../../src/StyleSheet.js';
import StyleSheetsMixin from '../../src/StyleSheetsMixin.js';
import ReactiveElement from '../../src/ReactiveElement.js';


class StyleSheetsTest extends StyleSheetsMixin(ReactiveElement) {

  get [symbols.styleSheets]() {
    const sheet = css`
      :host {
        color: red;
      }
    `;
    return [sheet];
  }

  get [symbols.template]() {
    const base = super[symbols.template];
    return template.concat(base, template.html`
      <slot></slot>
    `);
  }

}
customElements.define('style-sheets-test', StyleSheetsTest);


describe("StyleSheetsMixin", () => {

  let container;

  before(() => {
    container = document.getElementById('container');
  });

  afterEach(() => {
    container.innerHTML = '';
  });

  it("applies styleSheets", async () => {
    const fixture = new StyleSheetsTest();
    fixture.textContent = 'Hello';
    container.append(fixture);
    await Promise.resolve();
    const style = getComputedStyle(fixture);
    assert.equal(style.color, 'rgb(255, 0, 0)');
  });

});
