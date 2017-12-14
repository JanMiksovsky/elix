import ElementBase from '../../src/ElementBase.js';
import symbols from '../../src/symbols.js';


export default class IncrementDecrement extends ElementBase {

  connectedCallback() {
    if (super.connectedCallback) { super.connectedCallback(); }
    this.shadowRoot.querySelector('#decrement').addEventListener('click', () => {
      this.value--;
    });
    this.shadowRoot.querySelector('#increment').addEventListener('click', () => {
      this.value++;
    });
  }

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      value: 0
    });
  }

  get [symbols.template]() {
    return `
      <button id="decrement">-</button>
        {{state.value}}
      <button id="increment">+</button>
    `;
  }

  get value() {
    return this.state.value;
  }
  set value(value) {
    this.setState({ value });
  }

}

customElements.define('increment-decrement', IncrementDecrement);