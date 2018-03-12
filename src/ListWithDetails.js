import './ListBox.js';
import { merge } from './updates.js';
import AriaListMixin from './AriaListMixin.js';
import DirectionSelectionMixin from './DirectionSelectionMixin.js';
import KeyboardDirectionMixin from './KeyboardDirectionMixin.js';
import KeyboardMixin from './KeyboardMixin.js';
import KeyboardPagedSelectionMixin from './KeyboardPagedSelectionMixin.js';
import KeyboardPrefixSelectionMixin from './KeyboardPrefixSelectionMixin.js';
import Spotlight from './Spotlight.js';
import * as symbols from './symbols.js';


const Base =
  AriaListMixin(
  KeyboardPagedSelectionMixin(
  KeyboardPrefixSelectionMixin(
  DirectionSelectionMixin(
  KeyboardDirectionMixin(
  KeyboardMixin(
    Spotlight
  ))))));


class ListWithDetails extends Base {

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      castPosition: 'left',
      orientation: 'vertical'
    });
  }

  get defaults() {
    const base = super.defaults || {};
    return Object.assign({}, base, {
      tags: Object.assign({}, base.tags, {
        cast: 'elix-list-box'
      })
    });
  }

  setAvatarItem(avatar, item) {
    super.setAvatarItem(avatar, item);
    const label = item.getAttribute('aria-label') || item.alt;
    avatar.textContent = label;
  }

  get [symbols.scrollTarget]() {
    // HACK: Shouldn't need to access an element inside another.
    return this.$.cast.$.content;
  }

  get updates() {
    return merge(super.updates, {
      $: {
        cast: {
          attributes: {
            tabindex: ''
          }
        }
      }
    });
  }

}


customElements.define('elix-list-with-details', ListWithDetails);
export default ListWithDetails;