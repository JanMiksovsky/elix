import * as symbols from './symbols.js';
import * as template from './template.js';
import ComposedFocusMixin from './ComposedFocusMixin.js';
import DelegateFocusMixin from './DelegateFocusMixin.js';
import DelegateItemsMixin from './DelegateItemsMixin.js';
import DirectionSelectionMixin from './DirectionSelectionMixin.js';
import FilterListBox from './FilterListBox.js';
import KeyboardMixin from './KeyboardMixin.js';
import ReactiveElement from './ReactiveElement.js';
import SelectedItemTextValueMixin from './SelectedItemTextValueMixin.js';
import SingleSelectionMixin from './SingleSelectionMixin.js';


const Base =
  ComposedFocusMixin(
  DelegateFocusMixin(
  DelegateItemsMixin(
  DirectionSelectionMixin(
  KeyboardMixin(
  SelectedItemTextValueMixin(
  SingleSelectionMixin(
    ReactiveElement
  )))))));


/**
 * A list accompanied by a search box
 * 
 * @inherits ReactiveElement
 * @mixes ComposedFocusMixin
 * @mixes DelegateFocusMixin
 * @mixes DelegateItemsMixin
 * @mixes DirectionSelectionMixin
 * @mixes KeyboardMixin
 * @mixes SelectedItemTextValueMixin
 * @mixes SingleSelectionMixin
 * @elementrole {AutoCompleteInput} input
 * @elementRole {FilterListBox} list
 */
class ListWithSearch extends Base {

  // Forward any ARIA label to the input element.
  get ariaLabel() {
    return this[symbols.state].ariaLabel;
  }
  set ariaLabel(ariaLabel) {
    this[symbols.setState]({ ariaLabel });
  }

  get [symbols.defaultState]() {
    return Object.assign(super[symbols.defaultState], {
      ariaLabel: '',
      filter: '',
      inputRole: 'input',
      listRole: FilterListBox,
      placeholder: 'Search'
    });
  }
  
  get filter() {
    return this[symbols.state].filter;
  }
  set filter(filter) {
    this[symbols.setState]({ filter });
  }

  /**
   * The class, tag, or template used to create the input element.
   * 
   * @type {Role}
   * @default 'input'
   */
  get inputRole() {
    return this[symbols.state].inputRole;
  }
  set inputRole(inputRole) {
    this[symbols.setState]({ inputRole });
  }

  get [symbols.itemsDelegate]() {
    return this[symbols.$].list;
  }

    [symbols.keydown](/** @type {KeyboardEvent} */ event) {

    let handled;
    /** @type {any} */
    const list = this[symbols.$].list;

    switch (event.key) {

      // We do our own handling of the Up and Down arrow keys, rather than
      // relying on KeyboardDirectionMixin. The latter supports Home and End,
      // and we don't want to handle those -- we want to let the text input
      // handle them. We also need to forward PageDown/PageUp to the list
      // element.
      case 'ArrowDown':
        handled = event.altKey ? this[symbols.goEnd]() : this[symbols.goDown]();
        break;
      case 'ArrowUp':
        handled = event.altKey ? this[symbols.goStart]() : this[symbols.goUp]();
        break;

      // Forward Page Down/Page Up to the list element.
      //
      // This gets a little more complex than we'd like. The pageUp/pageDown
      // methods may update the list's selectedIndex, which in turn will
      // eventually update the selectedIndex of this component. In the meantime,
      // other keydown processing can set state, which will trigger a render.
      // When this component is asked for updates, it'll return the current
      // (i.e. old) selectedIndex value, and overwrite the list's own, newer
      // selectedIndex. To avoid this, we wait for the component to finish
      // processing the keydown using timeout timing, then invoke
      // pageUp/pageDown.
      //
      // This forces us to speculate about whether pageUp/pageDown will update
      // the selection so that we can synchronously return an indication of
      // whether the key event was handled. 
      case 'PageDown':
        if (list.pageDown) {
          setTimeout(() => list.pageDown());
          const items = this.items;
          if (items) {
            handled = this.selectedIndex < items.length - 1;
          }
        }
        break;
      case 'PageUp':
        if (list.pageUp) {
          setTimeout(() => list.pageUp());
          handled = this.selectedIndex > 0;
        }
        break;
    }

    // Prefer mixin result if it's defined, otherwise use base result.
    return handled || (super[symbols.keydown] && super[symbols.keydown](event));
  }

  /**
   * The class, tag, or template used to create the list element.
   * 
   * @type {Role}
   * @default ListBox
   */
  get listRole() {
    return this[symbols.state].listRole;
  }
  set listRole(listRole) {
    this[symbols.setState]({ listRole });
  }

  get placeholder() {
    return this[symbols.state].placeholder;
  }
  set placeholder(placeholder) {
    this[symbols.setState]({ placeholder });
  }

  [symbols.render](/** @type {PlainObject} */ changed) {
    super[symbols.render](changed);
    if (changed.inputRole) {
      template.transmute(this[symbols.$].input, this[symbols.state].inputRole);
      this[symbols.$].input.addEventListener('input', () => {
        this[symbols.raiseChangeEvents] = true;
        const filter = /** @type {any} */ (this[symbols.$].input).value;
        this[symbols.setState]({
          filter
        });
        this[symbols.raiseChangeEvents] = false;
      });
    }
    if (changed.listRole) {
      template.transmute(this[symbols.$].list, this[symbols.state].listRole);
    }
    if (changed.ariaLabel) {
      const { ariaLabel } = this[symbols.state];
      this[symbols.$].input.setAttribute('aria-label', ariaLabel);
    }
    if (changed.filter) {
      const { filter } = this[symbols.state];
      /** @type {HTMLInputElement} */ (this[symbols.$].input).value = filter;
      /** @type {any} */ (this[symbols.$].list).filter = filter;
    }
    if (changed.placeholder) {
      const { placeholder } = this[symbols.state];
      /** @type {HTMLInputElement} */ (this[symbols.$].input).placeholder = placeholder;
    }
  }

  get [symbols.template]() {
    return template.html`
      <style>
        :host {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
        }

        #input {
          font-family: inherit;
          font-size: inherit;
          font-style: inherit;
          font-weight: inherit;
        }
      </style>
      <input id="input">
      <elix-filter-list-box id="list" tabindex="-1">
        <slot></slot>
      </elix-filter-list-box>
    `;
  }

}


customElements.define('elix-list-with-search', ListWithSearch);
export default ListWithSearch;
