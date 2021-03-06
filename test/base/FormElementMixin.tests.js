import FormElementMixin from "../../src/base/FormElementMixin.js";
import {
  defaultState,
  renderChanges,
  setState,
  state,
  stateEffects,
} from "../../src/base/internal.js";
import ReactiveElement from "../../src/core/ReactiveElement.js";
import { assert } from "../testHelpers.js";

const formElementsSupported = "ElementInternals" in window;

class FormElementTest extends FormElementMixin(ReactiveElement) {
  // @ts-ignore
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      value: null,
    });
  }

  [stateEffects](state, changed) {
    const effects = super[stateEffects](state, changed);

    if (changed.value) {
      const valid = state.value !== null && state.value !== "";
      const validationMessage = valid ? "" : `Can't be empty`;
      Object.assign(effects, {
        valid,
        validationMessage,
      });
    }

    return effects;
  }

  get value() {
    return this[state].value;
  }
  set value(value) {
    this[setState]({ value });
  }
}
customElements.define("form-element-test", FormElementTest);

(formElementsSupported ? describe : describe.skip)("FormElementMixin", () => {
  let container;

  before(() => {
    container = document.getElementById("container");
  });

  afterEach(() => {
    container.innerHTML = "";
  });

  it("associates with a form", () => {
    const fixture = new FormElementTest();
    const form = document.createElement("form");
    form.append(fixture);
    assert.equal(fixture.form, form);
    const elements = form.elements;
    assert.equal(elements.length, 1);
    assert.equal(elements[0], fixture);
  });

  it("includes its value in form submission", (done) => {
    const fixture = new FormElementTest();
    fixture.name = "animal";
    const form = document.createElement("form");
    form.action = "about:blank";
    form.target = "result";
    const resultFrame = document.createElement("iframe");
    resultFrame.name = "result";
    form.append(fixture);
    container.append(form, resultFrame);
    fixture.value = "aardvark";
    fixture[renderChanges]();
    form.addEventListener("formdata", (event) => {
      assert(event["formData"].get("animal"), "aardvark");
      done();
    });
    form.submit();
  });

  it("participates in validation", () => {
    const fixture = new FormElementTest();
    fixture[renderChanges]();
    assert.isFalse(fixture.checkValidity());
    fixture.value = "bandicoot";
    fixture[renderChanges]();
    assert(fixture.checkValidity());
  });
});
