import ElementBase from '../../src/ElementBase.js';
import symbols from '../../src/symbols.js';


export default class GreetElement extends ElementBase {

  get name() {
    return this.state.name;
  }
  set name(name) {
    this.setState({ name });
  }

  get [symbols.template]() {
    return `Hello, <span>{{state.name}}</span>.`;
  }

}


customElements.define('greet-element', GreetElement);
