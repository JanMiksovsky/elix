import { fragmentFrom } from "../core/htmlLiterals.js";
import ReactiveElement from "../core/ReactiveElement.js";
import { transmute } from "../core/template.js";
import DisabledMixin from "./DisabledMixin.js";
import FocusVisibleMixin from "./FocusVisibleMixin.js";
import {
  defaultState,
  firstRender,
  ids,
  inputDelegate,
  raiseChangeEvents,
  render,
  rendered,
  setState,
  shadowRoot,
  state,
  stateEffects,
  template,
} from "./internal.js";
import LanguageDirectionMixin from "./LanguageDirectionMixin.js";
import OpenCloseMixin from "./OpenCloseMixin.js";
import Popup from "./Popup.js";

const resizeListenerKey = Symbol("resizeListener");

const Base = DisabledMixin(
  FocusVisibleMixin(LanguageDirectionMixin(OpenCloseMixin(ReactiveElement)))
);

/**
 * Positions a popup with respect to a source element
 *
 * @inherits ReactiveElement
 * @mixes DisabledMixin
 * @mixes FocusVisibleMixin
 * @mixes OpenCloseMixin
 * @part {Popup} popup - the popup element
 * @part {button} source - the element used as the reference point for positioning the popup, generally the element that invokes the popup
 */
class PopupSource extends Base {
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      ariaHasPopup: "true",
      horizontalAlign: "start",
      popupHeight: null,
      popupMeasured: false,
      popupPosition: "below",
      popupPartType: Popup,
      popupWidth: null,
      roomAbove: null,
      roomBelow: null,
      roomLeft: null,
      roomRight: null,
      sourcePartType: "div",
    });
  }

  // By default, assume that the source part is an input-like element that will
  // get the foucs.
  get [inputDelegate]() {
    return this[ids].source;
  }

  get frame() {
    return /** @type {any} */ (this[ids].popup).frame;
  }

  /**
   * The alignment of the popup with respect to the source button.
   *
   * * `start`: popup and source are aligned on the leading edge according to
   *   the text direction
   * * `end`: popup and source are aligned on the trailing edge according to the
   *   text direction
   * * `left`: popup and source are left-aligned
   * * `right`: popup and source are right-aligned
   * * `stretch: both left and right edges are aligned
   *
   * @type {('start'|'end'|'left'|'right'|'stretch')}
   * @default 'start'
   */
  get horizontalAlign() {
    return this[state].horizontalAlign;
  }
  set horizontalAlign(horizontalAlign) {
    this[setState]({ horizontalAlign });
  }

  /**
   * The preferred direction for the popup.
   *
   * * `above`: popup should appear above the source
   * * `below`: popup should appear below the source
   *
   * @type {('above'|'below')}
   * @default 'below'
   */
  get popupPosition() {
    return this[state].popupPosition;
  }
  set popupPosition(popupPosition) {
    this[setState]({ popupPosition });
  }

  /**
   * The class or tag used to create the `popup` part – the element
   * responsible for displaying the popup and handling overlay behavior.
   *
   * @type {PartDescriptor}
   * @default Popup
   */
  get popupPartType() {
    return this[state].popupPartType;
  }
  set popupPartType(popupPartType) {
    this[setState]({ popupPartType });
  }

  [render](/** @type {ChangedFlags} */ changed) {
    super[render](changed);

    renderParts(this[shadowRoot], this[state], changed);

    if (this[firstRender] || changed.ariaHasPopup) {
      const { ariaHasPopup } = this[state];
      if (ariaHasPopup === null) {
        this[inputDelegate].removeAttribute("aria-haspopup");
      } else {
        this[inputDelegate].setAttribute(
          "aria-haspopup",
          this[state].ariaHasPopup
        );
      }
    }

    if (changed.popupPartType) {
      // Popup's opened state becomes our own opened state.
      this[ids].popup.addEventListener("open", () => {
        if (!this.opened) {
          this[raiseChangeEvents] = true;
          this.open();
          this[raiseChangeEvents] = false;
        }
      });

      // Popup's closed state becomes our own closed state.
      this[ids].popup.addEventListener("close", (event) => {
        if (!this.closed) {
          this[raiseChangeEvents] = true;
          /** @type {any} */

          const cast = event;
          const closeResult = cast.detail.closeResult;
          this.close(closeResult);
          this[raiseChangeEvents] = false;
        }
      });
    }

    if (changed.opened || changed.popupMeasured) {
      const {
        calculatedFrameMaxHeight,
        calculatedFrameMaxWidth,
        calculatedPopupLeft,
        calculatedPopupPosition,
        calculatedPopupRight,
        opened,
        popupMeasured,
      } = this[state];

      if (!opened) {
        // If the popup's closed, we reset the styles used to position it.
        if (!opened) {
          Object.assign(this[ids].popupContainer.style, {
            overflow: "",
          });
          Object.assign(this[ids].popup.style, {
            bottom: "",
            left: "",
            opacity: "",
            position: "",
            right: "",
          });
          const frame = /** @type {any} */ (this[ids].popup).frame;
          Object.assign(frame.style, {
            maxHeight: "",
            maxWidth: "",
          });
        }
      } else if (!popupMeasured) {
        // If the popup is opened but has not yet been measured, we want to
        // render the component invisibly so we can measure it before showing
        // it. We hide it by giving it zero opacity. If we use `visibility:
        // hidden` for this purpose, the popup won't be able to receive the
        // focus, which would complicate our overlay focus handling.
        //
        // We also need to avoid affecting page layout or triggering page
        // scrolling in this phase. One way we can do that is to hide the
        // overflow on the zero-height popupContainer element, clipping the
        // popup and preventing it from affecting layout. (Another method would
        // be applying `position: fixed` to the popup in this phase, but as of
        // September 2020, a Chrome bug prevents that from working inside a
        // scrollable page region with a transform.)
        Object.assign(this[ids].popupContainer.style, {
          overflow: "hidden",
        });
        Object.assign(this[ids].popup.style, {
          opacity: 0,
        });
      } else {
        // We can now show the open and measured popup in position.
        const positionBelow = calculatedPopupPosition === "below";

        const popup = this[ids].popup;
        Object.assign(popup.style, {
          bottom: positionBelow ? "" : 0,
          left: calculatedPopupLeft,
          opacity: "",
          right: calculatedPopupRight,
        });

        const frame = /** @type {any} */ (popup).frame;
        Object.assign(frame.style, {
          maxHeight: calculatedFrameMaxHeight
            ? `${calculatedFrameMaxHeight}px`
            : "",
          maxWidth: calculatedFrameMaxWidth
            ? `${calculatedFrameMaxWidth}px`
            : "",
        });

        Object.assign(this[ids].popupContainer.style, {
          overflow: "",
          top: positionBelow ? "" : "0",
        });
      }
    }

    if (changed.opened) {
      const { opened } = this[state];
      /** @type {any} */ (this[ids].popup).opened = opened;
    }

    if (changed.disabled) {
      if ("disabled" in this[ids].source) {
        const { disabled } = this[state];
        /** @type {any} */ (this[ids].source).disabled = disabled;
      }
    }

    // Let the popup know it's position relative to the popup.
    if (changed.calculatedPopupPosition) {
      const { calculatedPopupPosition } = this[state];
      /** @type {any} */ const popup = this[ids].popup;
      if ("position" in popup) {
        popup.position = calculatedPopupPosition;
      }
    }
  }

  [rendered](/** @type {ChangedFlags} */ changed) {
    super[rendered](changed);
    const { opened } = this[state];
    if (changed.opened) {
      if (opened) {
        // Worth noting that's possible (but unusual) for a popup to render opened
        // on first render.
        waitThenRenderOpened(this);
      } else {
        removeEventListeners(this);
      }
    } else if (opened && !this[state].popupMeasured) {
      // Need to recalculate popup measurements.
      measurePopup(this);
    }
  }

  /**
   * The class or tag used to create the `source` part - the button
   * (or other element) the user can tap/click to invoke the popup.
   *
   * @type {PartDescriptor}
   * @default 'button'
   */
  get sourcePartType() {
    return this[state].sourcePartType;
  }
  set sourcePartType(sourcePartType) {
    this[setState]({ sourcePartType });
  }

  [stateEffects](state, changed) {
    const effects = super[stateEffects](state, changed);

    // We reset our popup calculations when the popup closes, or if it's open
    // and state that affects positioning has changed.
    if (
      (changed.opened && !state.opened) ||
      (state.opened && (changed.horizontalAlign || changed.rightToLeft))
    ) {
      Object.assign(effects, {
        calculatedFrameMaxHeight: null,
        calculatedFrameMaxWidth: null,
        calculatedPopupLeft: null,
        calculatedPopupPosition: null,
        calculatedPopupRight: null,
        popupMeasured: false,
      });
    }

    return effects;
  }

  get [template]() {
    const result = super[template];
    result.content.append(fragmentFrom.html`
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        [part~="source"] {
          height: 100%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          width: 100%;
        }

        #popupContainer {
          height: 0;
          outline: none;
          position: absolute;
          width: 100%;
        }

        [part~="popup"] {
          align-items: initial;
          height: initial;
          justify-content: initial;
          left: initial;
          outline: none;
          position: absolute;
          top: initial;
          width: initial;
        }
      </style>
      <div id="source" part="source">
        <slot name="source"></slot>
      </div>
      <div id="popupContainer" role="none">
        <div id="popup" part="popup" exportparts="backdrop, frame" role="none">
          <slot></slot>
        </div>
      </div>
    `);

    renderParts(result.content, this[state]);

    return result;
  }
}

function addEventListeners(/** @type {PopupSource} */ element) {
  /** @type {any} */ const cast = element;
  cast[resizeListenerKey] = () => {
    // measurePopup(element);
    element[setState]({ popupMeasured: false });
  };
  window.visualViewport.addEventListener("resize", cast[resizeListenerKey]);
}

/**
 * If we haven't already measured the popup since it was opened, measure its
 * dimensions and the relevant distances in which the popup might be opened.
 *
 * @private
 * @param {PopupSource} element
 */
function measurePopup(element) {
  // const windowHeight = window.innerHeight;
  // const windowWidth = window.innerWidth;
  const windowHeight = window.visualViewport.height;
  const windowWidth = window.visualViewport.width;
  const popupRect = element[ids].popup.getBoundingClientRect();
  const sourceRect = element.getBoundingClientRect();

  const popupHeight = popupRect.height;
  const popupWidth = popupRect.width;

  const { horizontalAlign, popupPosition, rightToLeft } = element[state];

  // Calculate the best vertical popup position relative to the source.
  const roomAbove = sourceRect.top;
  const roomBelow = Math.ceil(windowHeight - sourceRect.bottom);
  const roomLeft = sourceRect.right;
  const roomRight = Math.ceil(windowWidth - sourceRect.left);

  const fitsAbove = popupHeight <= roomAbove;
  const fitsBelow = popupHeight <= roomBelow;

  const preferPositionBelow = popupPosition === "below";

  // We respect each position popup preference (above/below/right/right) if
  // there's room in that direction. Otherwise, we use the horizontal/vertical
  // position that maximizes the popup width/height.
  const positionBelow =
    (preferPositionBelow && (fitsBelow || roomBelow >= roomAbove)) ||
    (!preferPositionBelow && !fitsAbove && roomBelow >= roomAbove);
  const fitsVertically =
    (positionBelow && fitsBelow) || (!positionBelow && fitsAbove);
  const calculatedFrameMaxHeight = fitsVertically
    ? null
    : positionBelow
    ? roomBelow
    : roomAbove;

  // The popup should be positioned below the source.
  const calculatedPopupPosition = positionBelow ? "below" : "above";

  // Calculate the best horizontal popup alignment relative to the source.
  const canLeftAlign = popupWidth <= roomRight;
  const canRightAlign = popupWidth <= roomLeft;

  let calculatedPopupLeft;
  let calculatedPopupRight;
  let calculatedFrameMaxWidth;
  if (horizontalAlign === "stretch") {
    calculatedPopupLeft = 0;
    calculatedPopupRight = 0;
    calculatedFrameMaxWidth = null;
  } else {
    const preferLeftAlign =
      horizontalAlign === "left" ||
      (rightToLeft ? horizontalAlign === "end" : horizontalAlign === "start");
    // The above/below preference rules also apply to left/right alignment.
    const alignLeft =
      (preferLeftAlign && (canLeftAlign || roomRight >= roomLeft)) ||
      (!preferLeftAlign && !canRightAlign && roomRight >= roomLeft);
    calculatedPopupLeft = alignLeft ? 0 : null;
    calculatedPopupRight = !alignLeft ? 0 : null;

    const fitsHorizontally =
      (alignLeft && roomRight) || (!alignLeft && roomLeft);
    calculatedFrameMaxWidth = fitsHorizontally
      ? null
      : alignLeft
      ? roomRight
      : roomLeft;
  }

  element[setState]({
    calculatedFrameMaxHeight,
    calculatedFrameMaxWidth,
    calculatedPopupLeft,
    calculatedPopupPosition,
    calculatedPopupRight,
    popupMeasured: true,
  });
}

function removeEventListeners(/** @type {PopupSource} */ element) {
  /** @type {any} */ const cast = element;
  if (cast[resizeListenerKey]) {
    window.visualViewport.removeEventListener(
      "resize",
      cast[resizeListenerKey]
    );
    cast[resizeListenerKey] = null;
  }
}

/**
 * Render parts for the template or an instance.
 *
 * @private
 * @param {DocumentFragment} root
 * @param {PlainObject} state
 * @param {ChangedFlags} [changed]
 */
function renderParts(root, state, changed) {
  if (!changed || changed.popupPartType) {
    const { popupPartType } = state;
    const popup = root.getElementById("popup");
    if (popup) {
      transmute(popup, popupPartType);
    }
  }
  if (!changed || changed.sourcePartType) {
    const { sourcePartType } = state;
    const source = root.getElementById("source");
    if (source) {
      transmute(source, sourcePartType);
    }
  }
}

/**
 *
 * When a popup is first rendered, we let it render invisibly so that it doesn't
 * affect the page layout.
 *
 * We then wait, for two reasons:
 *
 * 1) We need to give the popup time to render invisibly. That lets us get the
 *    true size of the popup content.
 *
 * 2) Wire up events that can dismiss the popup. If the popup was opened because
 *    the user clicked something, that opening click event may still be bubbling
 *    up, and we only want to start listening after it's been processed.
 *    Along the same lines, if the popup caused the page to scroll, we don't
 *    want to immediately close because the page scrolled (only if the user
 *    scrolls).
 *
 * After waiting, we can take care of both of the above tasks.
 *
 * @private
 * @param {PopupSource} element
 */
function waitThenRenderOpened(element) {
  // Wait a tick to let the newly-opened component actually render.
  setTimeout(() => {
    // It's conceivable the popup was closed before the timeout completed,
    // so double-check that it's still opened before listening to events.
    if (element[state].opened) {
      measurePopup(element);
      addEventListeners(element);
    }
  });
}

export default PopupSource;
