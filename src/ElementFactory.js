// Experimental extensions to HTML template instantiation


import { AttributeValueUpdater, UpdaterDescriptor } from '../node_modules/template-instantiation/src/updaters';
import { PropertiesUpdater } from './updaters.js';
import ElementFactoryBase from '../node_modules/template-instantiation/src/ElementFactory.js';


export default class ElementFactory extends ElementFactoryBase {
  constructor(template) {
    super(template);
    patchUpdaters(this);    
  }
}


// HACK: Upgrade updaters for any attribute called "properties".
function patchUpdaters(factory) {
  const patched = factory.updaterDescriptors.map(updaterDescriptor => {
    if (updaterDescriptor.updaterClass.constructor === AttributeValueUpdater.constructor) {
      const updaterArgs = updaterDescriptor.updaterArgs;
      const attributeName = updaterArgs[0];
      if (attributeName === 'properties') {
        const tokens = updaterDescriptor.updaterArgs[1];
        const expression = tokens[0] && tokens[0].expression;
        if (expression) {
          // Patch
          return new UpdaterDescriptor(
            updaterDescriptor.address,
            PropertiesUpdater,
            expression
          );
        }
      }
    }
    // Leave as is
    return updaterDescriptor;
  });
  factory.updaterDescriptors = patched;  
}
