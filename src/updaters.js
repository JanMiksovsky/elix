// Experimental Updaters -- extensions to template instantiation proposal.


import { apply } from './updates.js';
import { NodeUpdater } from '../node_modules/template-instantiation/src/updaters';


export class PropertiesUpdater extends NodeUpdater {
  constructor(node, expression) {
    super(node);
    this.expression = expression;
  }
  update(data) {
    const value = this.evaluate(this.expression, data);
    apply(this.node, value);
  }
}


export class HostUpdater extends PropertiesUpdater {
  update(data) {
    const { attributes, classes, style } = data;
    const stripped = { attributes, classes, style };
    super.update(stripped);
  }
}
