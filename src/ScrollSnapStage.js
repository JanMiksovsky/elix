import * as internal from './internal.js';
import * as template from './template.js';
import EffectMixin from './EffectMixin.js';
import ReactiveElement from './ReactiveElement.js';
import SingleSelectionMixin from './SingleSelectionMixin.js';
import SlotItemsMixin from './SlotItemsMixin.js';

const Base = EffectMixin(SingleSelectionMixin(SlotItemsMixin(ReactiveElement)));

/**
 * Shows a crossfade effect when transitioning between a single selected item.
 *
 * Like [Modes](Modes), this component shows a single item at a time, but it
 * adds a crossfade effect when transitioning between items.
 *
 * @inherits Modes
 * @mixes EffectMixin
 */
class ScrollSnapStage extends Base {
  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      selectionRequired: true
    });
  }

  [internal.render](/** @type {PlainObject} */ changed) {
    super[internal.render](changed);
    if (changed.items || changed.selectedIndex) {
      // Scroll to get the selected item in view.
      const { items, selectedIndex } = this[internal.state];
      const selectedItem = items ? items[selectedIndex] : null;
      const selectedItemOffsetLeft = selectedItem ? selectedItem.offsetLeft : 0;
      this.scrollLeft = selectedItemOffsetLeft;
      // Apply `selected` style to the selected item only.
      if (items) {
        items.forEach((item, index) => {
          item.toggleAttribute('selected', index === selectedIndex);
        });
      }
    }
  }

  get [internal.template]() {
    return template.html`
      <style>
        :host {
          display: inline-flex;
          overflow-x: scroll;
          position: relative;
          scroll-snap-type: x mandatory;
        }

        ::slotted(*) {
          /* flex: 0 0 100%; */
          flex-basis: 100%;
          flex-grow: 0;
          flex-shrink: 0;
          scroll-snap-align: start;
        }
      </style>
      <slot></slot>
    `;
  }
}

export default ScrollSnapStage;
