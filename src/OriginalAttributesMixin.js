import symbols from './symbols.js';
import * as updates from './updates.js';


export default function OriginalAttributesMixin(Base) {
  return class OriginalAttributes extends Base {

    connectedCallback() {
      // Calculate original props before we call super. If, e.g., ReactiveMixin
      // is applied before this mixin, we want to get the original props before
      // we render.
      this.setState({
        original: updates.current(this)
      });

      if (super.connectedCallback) { super.connectedCallback(); }
    }

    // Override setAttribute so that, if this is called outside of rendering,
    // we can update our notion of the component's original updates.
    setAttribute(name, value) {
      if (!this[symbols.rendering]) {
        updateOriginalProp(this, name, value);
      }
      super.setAttribute(name, value);
    }

    // Override style for same reasons as setAttribute.
    get style() {
      return super.style;
    }
    set style(style) {
      if (!this[symbols.rendering]) {
        updateOriginalProp(this, 'style', style);
      }
      super.style = style;
    }
  }
}


// Given a space-separated string of class names like "foo bar", return a props
// object like { foo: true, bar: true }.
function parseClassProps(text) {
  const result = {};
  const classes = text.split(' ');
  classes.forEach(className => {
    result[className] = true
  });
  return result;
}


// Given a semicolon-separated set of CSS rules like, return a props object.
// Example: when called with "background: black; color: white", this returns
// { background: 'black', color: 'white' }.
function parseStyleProps(text) {
  const result = {};
  const rules = text.split(';');
  rules.forEach(rule => {
    if (rule.length > 0) {
      const parts = rule.split(':');
      const name = parts[0].trim();
      const value = parts[1].trim();
      result[name] = value;
    }
  });
  return result;
}


// If we're changing an attribute outside of rendering, the element is being
// directly modified by its host. Update our notion of the element's "original"
// props, and give the component a chance to re-render based on this new
// information.
//
// This is important when, for example, a mixin or component wants to provide a
// default value for an attribute. Suppose a mixin wants to set a default
// tabindex of zero if no tabindex is provided by the host. If/when the host
// eventually sets a tabindex, the mixin should see the change, and let the
// host's preferred tabindex stick instead of overwriting it with its default
// tabindex of zero.
//
function updateOriginalProp(element, name, value) {
  let changes;
  switch (name) {
    
    case 'class': {
      const classes = parseClassProps(value);
      changes = { classes };
      break;
    }

    case 'style': {
      const style = parseStyleProps(value);
      changes = { style };
      break;
    }
    
    default:
      changes = {
        name: value
      };
      break;
  }
  const original = updates.merge(element.state.original, changes);
  element.setState({ original });
}
