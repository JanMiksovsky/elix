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
        <span style="color: {{color}};">{{state.value}}</span>
      <button id="increment">+</button>
    `;
  }

  get updates() {
    return Object.assign({}, super.updates, {
      color: this.state.value < 0 ? 'red' : 'inherit'
    });
  }

  get value() {
    return this.state.value;
  }
  set value(value) {
    this.setState({ value });
  }

}

customElements.define('increment-decrement', IncrementDecrement);