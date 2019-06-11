import * as symbols from '../../src/symbols.js';
import * as template from '../../src/template.js';
import StyleSheetsMixin from '../../src/StyleSheetsMixin.js';
import ReactiveElement from '../../src/ReactiveElement.js';


class StyleSheetsTest extends StyleSheetsMixin(ReactiveElement) {

  get [symbols.styleSheets]() {
    return [`
      :host {
        color: red;
      }
    `];
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
