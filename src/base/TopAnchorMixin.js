import * as internal from "./internal.js";

export default function TopAnchorMixin(Base) {
  // The class prototype added by the mixin.
  return class TopAnchor extends Base {
    get [internal.defaultState]() {
      return Object.assign(super[internal.defaultState], {
        topAnchor: null,
      });
    }

    [internal.rendered](changed) {
      super[internal.rendered](changed);

      if (this[internal.firstRender]) {
        this.addEventListener("scroll", () => {
          this[internal.raiseChangeEvents] = true;
          checkTopAnchor(this);
          this[internal.raiseChangeEvents] = false;
        });
        checkTopAnchor(this);
      }

      if (changed.topAnchor && this[internal.raiseChangeEvents]) {
        const topAnchor = this[internal.state].topAnchor;
        const event = new CustomEvent("top-anchor-changed", {
          detail: {
            topAnchor,
          },
        });
        this.dispatchEvent(event);
      }
    }
  };
}

function checkTopAnchor(element) {
  const topAnchor = findTopAnchor(element);
  if (topAnchor != element[internal.state].anchor) {
    console.log(topAnchor.textContent);
  }
  element[internal.setState]({ topAnchor });
}

function findTopAnchor(element) {
  const scrollTop = element.scrollTop;
  const anchors = element.querySelectorAll("a[id]");
  let previous = null;
  // Find the first visible anchor, then back up one and return that.
  for (const anchor of anchors) {
    if (anchor.offsetTop <= scrollTop) {
      previous = anchor;
    } else {
      break;
    }
  }
  return previous;
}
