import IncrementDecrement from './IncrementDecrement3.js';
import symbols from '../../src/symbols.js';


export default class CustomIncrementDecrement extends IncrementDecrement {

  get updates() {
    return Object.assign({}, super.updates, {
      spanProperties: {
        style: {
          color: this.state.value < 0 ? 'green' : 'blue',
          fontFamily: 'Helvetica',
          fontWeight: 'bold'
        }
      }
    });
  }

}

customElements.define('custom-increment-decrement', CustomIncrementDecrement);