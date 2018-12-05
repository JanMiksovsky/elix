import { html } from '../../src/template.js';
import { merge } from '../../src/updates.js';
import * as symbols from '../../src/symbols.js';
import ArrowDirectionMixin from '../../src/ArrowDirectionMixin.js';
import DirectionSelectionMixin from '../../src/DirectionSelectionMixin.js';
import KeyboardDirectionMixin from '../../src/KeyboardDirectionMixin.js';
import KeyboardMixin from '../../src/KeyboardMixin.js';
import ReactiveElement from '../../src/ReactiveElement.js';
import SelectedIndexMixin from '../../src/SelectedIndexMixin.js';


const Base = 
  ArrowDirectionMixin(
  DirectionSelectionMixin(
  KeyboardMixin(
  KeyboardDirectionMixin(
  SelectedIndexMixin(
    ReactiveElement
  )))));


class SelectionCounter extends Base {

  constructor() {
    super();
    this[symbols.renderedRoles] = {};
  }

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      orientation: 'horizontal',
      overlayArrowButtons: false
    });
  }

  get [symbols.template]() {
    const result = html`
      <style>
        :host {
          background: lightgray;
          display: inline-flex;
        }

        #index {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      </style>
      <div id="index"></div>
    `;
    const index = result.content.querySelector('#index');
    this[ArrowDirectionMixin.wrap](index);
    return result;
  }

  get updates() {
    return merge(super.updates, {
      $: {
        index: {
          textContent: this.state.selectedIndex
        }
      }
    });
  }

}


customElements.define('selection-counter', SelectionCounter);
export default SelectionCounter;
