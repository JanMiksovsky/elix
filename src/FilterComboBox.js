import { getTextsFromItems } from './ItemsTextMixin.js';
import { substantiveElements } from './content.js';
import * as symbols from './symbols.js';
import AutoCompleteInput from './AutoCompleteInput.js';
import FilterListBox from './FilterListBox.js';
import ListComboBox from './ListComboBox.js';
import SlotContentMixin from './SlotContentMixin.js';


const Base =
  SlotContentMixin(
    ListComboBox
  );


/**
 * A combo box which applies its text input as a filter on its list items
 * 
 * @inherits ListComboBox
 * @mixes SlotContentMixin
 * @elementrole {AutoCompleteInput} input
 * @elementrole {FilterListBox} list
 */
class FilterComboBox extends Base {
  
  get [symbols.defaultState]() {
    const state = Object.assign(super[symbols.defaultState], {
      filter: '',
      inputRole: AutoCompleteInput,
      listRole: FilterListBox,
      texts: null
    });

    // If content changes, regenerate texts.
    state.onChange('content', state => {
      const { content } = state;
      const items = content ?
        substantiveElements(content) :
        null;
      const texts = items ?
        getTextsFromItems(items) :
        [];
      return {
        texts
      };
    });

    // Closing resets the filter.
    state.onChange('opened', state => {
      if (!state.opened) {
        return {
          filter: ''
        };
      }
      return null;
    });

    return state;
  }

  [symbols.render](/** @type {PlainObject} */ changed) {
    super[symbols.render](changed);
    if (changed.inputRole) {
      this[symbols.$].input.addEventListener('input', event => {
        this[symbols.raiseChangeEvents] = true;
        /** @type {any} */
        const cast = event;
        const filter = cast.detail ?
          cast.detail.originalText :
          this[symbols.state].value;
        this[symbols.setState]({
          filter
        });
        this[symbols.raiseChangeEvents] = false;
      });
    }
    if (changed.filter || changed.selectedIndex) {
      const { filter, selectedIndex } = this[symbols.state];
      if (filter === '' || selectedIndex === -1) {
        const list = /** @type {any} */ (this[symbols.$].list);
        if ('filter' in list) {
          list.filter = filter;
        }
      }
    }
    if (changed.texts) {
      const input = /** @type {any} */ (this[symbols.$].input);
      if ('texts' in input) {
        input.texts = this[symbols.state].texts;
      }
    }
  }

}


export default FilterComboBox;
customElements.define('elix-filter-combo-box', FilterComboBox);
