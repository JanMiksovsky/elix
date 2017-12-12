import ElementBase from '../../src/ElementBase.js';
import symbols from '../../src/symbols.js';


class IncrementDecrement extends ElementBase {

  componentDidMount() {
    if (super.componentDidMount) { super.componentDidMount(); }
    this.$.decrement.addEventListener('click', () => {
      this.value--;
    });
    this.$.increment.addEventListener('click', () => {
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
        {{value}}
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