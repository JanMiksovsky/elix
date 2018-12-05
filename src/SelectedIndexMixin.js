import { stateChanged } from './utilities.js';
import * as symbols from './symbols.js';


const previousStateKey = Symbol('previousState');


/**
 * Adds single-selection semantics to a list-like element.
 *
 * This mixin expects a component to provide an `items` Array or NodeList of
 * all elements in the list.
 *
 * This mixin tracks a single selected item in the list, and provides means to
 * get and set that state by item position (`selectedIndex`) or item identity
 * (`selectedItem`). The selection can be moved in the list via the methods
 * `selectFirst`, `selectLast`, `selectNext`, and `selectPrevious`.
 *
 * This mixin does not produce any user-visible effects to represent
 * selection.
 *
 * @module SingleSelectionMixin
 */
export default function SingleSelectionMixin(Base) {

  // The class prototype added by the mixin.
  class SingleSelection extends Base {

    /**
     * True if the selection can be moved to the next item, false if not (the
     * selected item is the last item in the list).
     *
     * @type {boolean}
     */
    get canSelectNext() {
      return this.state.maxIndex === null ?
        true :
        this.state.selectedIndex < this.state.maxIndex;
    }

    /**
     * True if the selection can be moved to the previous item, false if not
     * (the selected item is the first one in the list).
     *
     * @type {boolean}
     */
    get canSelectPrevious() {
      return this.state.minIndex === null ?
        true :
        this.state.selectedIndex > this.state.minIndex;
    }

    componentDidUpdate(previousState) {
      if (super.componentDidUpdate) { super.componentDidUpdate(previousState); }

      const selectedIndex = this.state.selectedIndex;
      if (selectedIndex !== previousState.selectedIndex && this[symbols.raiseChangeEvents]) {
        /**
         * Raised when the `selectedIndex` property changes.
         * 
         * @event SingleSelectionMixin#selected-index-changed
         */
        const event = new CustomEvent('selected-index-changed', {
          detail: { selectedIndex }
        });
        this.dispatchEvent(event);
      }
    }

    get defaultState() {
      return Object.assign({}, super.defaultState, {
        maxIndex: null,
        minIndex: null,
        selectedIndex: 0
      });
    }

    // When new state is being applied, ensure selectedIndex is valid.
    refineState(state) {
      let result = super.refineState ? super.refineState(state) : true;

      state[previousStateKey] = state[previousStateKey] || {
        maxIndex: undefined,
        minIndex: undefined,
        selectedIndex: undefined
      };
      const changed = stateChanged(state, state[previousStateKey]);

      if (changed.maxIndex || changed.minIndex || changed.selectedIndex) {
        const { selectedIndex } = state;
        const validatedIndex = validateIndex(selectedIndex, state);
        if (validatedIndex !== selectedIndex) {
          state.selectedIndex = validatedIndex;
          result = false;
        }
      }

      return result;
    }

    /**
     * The index of the currently-selected item.
     * 
     * @type {number}
     */
    get selectedIndex() {
      return this.state.selectedIndex;
    }
    set selectedIndex(selectedIndex) {
      const parsedIndex = typeof selectedIndex === 'string' ?
        parseInt(selectedIndex) :
        selectedIndex;
      this.setState({
        selectedIndex: parsedIndex
      });
    }

    /**
     * Select the next item in the list.
     *
     * If the list has no selection, the first item will be selected.
     *
     * @returns {Boolean} True if the selection changed, false if not.
     */
    selectNext() {
      if (super.selectNext) { super.selectNext(); }
      return updateSelectedIndex(this, this.state.selectedIndex + 1);
    }

    /**
     * Select the previous item in the list.
     *
     * If the list has no selection, the last item will be selected.
     *
     * @returns {Boolean} True if the selection changed, false if not.
     */
    selectPrevious() {
      if (super.selectPrevious) { super.selectPrevious(); }
      return updateSelectedIndex(this, this.state.selectedIndex - 1);
    }

  }

  return SingleSelection;
}


function validateIndex(index, state) {
  const { minIndex, maxIndex } = state;
  if (minIndex !== null && maxIndex !== null) {
    return Math.max(Math.min(index, maxIndex), minIndex);
  } else if (minIndex !== null) {
    return Math.max(index, minIndex);
  } else if (maxIndex !== null) {
    return Math.min(index, maxIndex);
  }
  return index;
}


function updateSelectedIndex(element, selectedIndex) {
  const validatedIndex = validateIndex(
    selectedIndex,
    element.state
  );
  const changed = element.state.selectedIndex !== validatedIndex;
  if (changed) {
    element.setState({
      selectedIndex: validatedIndex
    });
  }
  return changed;
}
