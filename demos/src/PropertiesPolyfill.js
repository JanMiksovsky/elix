import * as updates from '../../src/updates.js';


export function getProperties() {

  const props = {};

  const { attributes, classes, style } = updates.current(this);
  if (Object.keys(attributes).length > 0) {
    props.attributes = attributes;
  }
  if (Object.keys(classes).length > 0) {
    props.classList = classes;
  }
  if (Object.keys(style).length > 0) {
    props.style = style;
  }

  const childNodes = this.childNodes;
  if (childNodes.length > 0) {
    props.childNodes = childNodes;
  }

  const observedAttributes = this.constructor.observedAttributes || [];
  observedAttributes.forEach(attribute => {
    props[attribute] = this[attribute]
  });
  
  return props;
}

export function setProperties(props) {
  updates.apply(this, props);
}


HTMLElement.prototype.getProperties = getProperties;
HTMLElement.prototype.setProperties = setProperties;
