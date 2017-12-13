import symbols from './symbols.js';
import ElementFactory from '../node_modules/template-instantiation/src/ElementFactory.js';
import { NodeUpdater, AttributeValueUpdater, UpdaterDescriptor } from '../node_modules/template-instantiation/src/updaters';
import { apply } from './updates.js';


// A cache of processed templates.
//
// We maintain this as a map keyed by element tag (localName). We could store
// an element's processed template on its element prototype. One scenario that
// wouldn't support would be registration of the same constructor under multiple
// tag names, which was a (perhaps theoretical) use case for Custom Elements.
//
const mapTagToFactory = {};


class PropertiesUpdater extends NodeUpdater {
  constructor(node, expression) {
    super(node);
    this.expression = expression;
  }
  update(data) {
    const value = this.evaluate(this.expression, data);
    apply(this.node, value);
  }
}


class HostUpdater extends PropertiesUpdater {
  update(data) {
    const { attributes, classes, style } = data;
    const stripped = { attributes, classes, style };
    super.update(stripped);
  }
}


/**
 * Mixin which adds stamping a template into a Shadow DOM subtree upon component
 * instantiation.
 *
 * To use this mixin, define a `template` method that returns a string or HTML
 * `<template>` element:
 *
 *     class MyElement extends ElementFactoryMixin(HTMLElement) {
 *       [symbols.template]() {
 *         return `Hello, <em>world</em>.`;
 *       }
 *     }
 *
 * When your component class is instantiated, a shadow root will be created on
 * the instance, and the contents of the template will be cloned into the
 * shadow root. If your component does not define a `template` method, this
 * mixin has no effect.
 * 
 * This adds a member on the component called `this.$` that can be used to
 * reference shadow elements with IDs. E.g., if component's shadow contains an
 * element `<button id="foo">`, then this mixin will create a member
 * `this.$.foo` that points to that button.
 *
 * @module ElementFactoryMixin
 */
export default function ElementFactoryMixin(Base) {

  // The class prototype added by the mixin.
  class ElementWithFactory extends Base {

    /*
     * If the component defines a template, a shadow root will be created on the
     * component instance, and the template stamped into it.
     */
    [symbols.render]() {
      if (super[symbols.render]) { super[symbols.render](); }
      if (!this.shadowRoot) {
        // Stamp the template into a new shadow root.
        const root = this.attachShadow({ mode: 'open' });
        const factory = getFactory(this);
        const { instance, updater } = factory.instantiate();
        root.appendChild(instance);
        const hostUpdater = new HostUpdater(this);
        updater.updaters.push(hostUpdater);
        this.updater = updater;
        this.$ = shadowElementReferences(this);
      }
      const updates = this.updates;
      this.updater.update(updates);
    }
  
    /**
     * The attributes and properies that should be applied to the component on
     * render. By default, this is an empty plain object. Your mixin or
     * component can extend this to identify the properties to set on the host
     * element or elements in the shadow subtree.
     * 
     * @type {object}
     */
    get updates() {
      return super.updates || {};
    }

    /**
     * The collection of references to the elements with IDs in a component's
     * Shadow DOM subtree.
     *
     * @type {object}
     * @member $
     */
  }

  return ElementWithFactory;
}


function getFactory(component) {

  const tag = component.localName;
  let factory = tag && mapTagToFactory[tag];

  // See if we've already processed a factory for this tag.
  if (!factory) {
    // This is the first time we've created an instance of this tag.

    // Get the template and perform initial processing.
    let template = component[symbols.template];
    if (!template) {
      /* eslint-disable no-console */
      console.warn(`ElementFactoryMixin expects ${component.constructor.name} to define a property called [symbols.template].\nSee https://elix.org/documentation/ElementFactoryMixin.`);
      return;
    }

    if (typeof template === 'string') {
      // Upgrade plain string to real template.
      const templateText = template;
      template = document.createElement('template');
      template.innerHTML = templateText;
    }

    // Component template only needs to be parsed once.
    factory = new ElementFactory(template);
    patchUpdaters(factory);

    if (tag) {
      // Store this for the next time we create the same type of element.
      mapTagToFactory[tag] = factory;
    }
  }

  return factory;
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


// Look for elements in the shadow subtree that have id attributes.
function shadowElementReferences(component) {
  const result = {};
  const nodesWithIds = component.shadowRoot.querySelectorAll('[id]');
  Array.prototype.forEach.call(nodesWithIds, node => {
    const id = node.getAttribute('id');
    result[id] = node;
  });
  return result;
}
