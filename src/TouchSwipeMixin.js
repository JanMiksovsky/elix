import { merge } from './updates.js';
import * as symbols from './symbols.js';


/** @type {any} */
const multiTouchKey = Symbol('multiTouch');
const previousTimeKey = Symbol('previousTime');
const previousVelocityKey = Symbol('previousVelocity');
const previousXKey = Symbol('previousX');
const previousYKey = Symbol('previousY');
const startXKey = Symbol('startX');
const startYKey = Symbol('startY');


/**
 * Mixin which maps touch events to swipe gestures.
 * 
 * @module TouchSwipeMixin
 */
export default function TouchSwipeMixin(Base) {

  // The class prototype added by the mixin.
  return class TouchSwipe extends Base {

    constructor() {
      // @ts-ignore
      super();

      // In all touch events, only handle single touches. We don't want to
      // inadvertently do work when the user's trying to pinch-zoom for example.
      // TODO: Even better approach than below would be to ignore touches after
      // the first if the user has already begun a swipe.
      // TODO: Touch events should probably be factored out into its own mixin.
      if ('PointerEvent' in window) {
        // Prefer listening to standard pointer events.
        this.addEventListener('pointerdown', async (event) => {
          this[symbols.raiseChangeEvents] = true;
          if (isEventForPenOrPrimaryTouch(event)) {
            gestureStart(this, event.clientX, event.clientY);
          }
          await Promise.resolve();
          this[symbols.raiseChangeEvents] = false;
        });
        this.addEventListener('pointermove', async (event) => {
          this[symbols.raiseChangeEvents] = true;
          if (isEventForPenOrPrimaryTouch(event)) {
            const handled = gestureContinue(this, event.clientX, event.clientY);
            if (handled) {
              event.preventDefault();
            }
          }
          await Promise.resolve();
          this[symbols.raiseChangeEvents] = false;
        });
        this.addEventListener('pointerup', async (event) => {
          this[symbols.raiseChangeEvents] = true;
          if (isEventForPenOrPrimaryTouch(event)) {
            gestureEnd(this, event.clientX, event.clientY);
          }
          await Promise.resolve();
          this[symbols.raiseChangeEvents] = false;
        });
      } else {
        // Pointer events not supported -- listen to older touch events.
        this.addEventListener('touchstart', async (event) => {
          this[symbols.raiseChangeEvents] = true;
          if (this[multiTouchKey]) {
            return;
          } else if (event.touches.length === 1) {
            const clientX = event.changedTouches[0].clientX;
            const clientY = event.changedTouches[0].clientY;
            gestureStart(this, clientX, clientY);
          } else {
            this[multiTouchKey] = true;
          }
          await Promise.resolve();
          this[symbols.raiseChangeEvents] = false;
        });
        this.addEventListener('touchmove', async (event) => {
          this[symbols.raiseChangeEvents] = true;
          if (!this[multiTouchKey] && event.touches.length === 1) {
            const clientX = event.changedTouches[0].clientX;
            const clientY = event.changedTouches[0].clientY;
            const handled = gestureContinue(this, clientX, clientY);
            if (handled) {
              event.preventDefault();
            }
          }
          await Promise.resolve();
          this[symbols.raiseChangeEvents] = false;
        });
        this.addEventListener('touchend', async (event) => {
          this[symbols.raiseChangeEvents] = true;
          if (event.touches.length === 0) {
            // All touches removed; gesture is complete.
            if (!this[multiTouchKey]) {
              // Single-touch swipe has finished.
              const clientX = event.changedTouches[0].clientX;
              const clientY = event.changedTouches[0].clientY;
              gestureEnd(this, clientX, clientY);
            }
            this[multiTouchKey] = false;
          }
          await Promise.resolve();
          this[symbols.raiseChangeEvents] = false;
        });
      }
    }

    get defaultState() {
      return Object.assign({}, super.defaultState, {
        swipeAxis: 'horizontal',
        swipeFraction: null
      });
    }
    
    /**
     * See [symbols.swipeTarget](symbols#swipeTarget).
     * 
     * @property symbols.swipeTarget
     * @memberof TouchSwipeMixin
     * @type {HTMLElement}
     */
    get [symbols.swipeTarget]() {
      return super[symbols.swipeTarget] || this;
    }

    get updates() {
      const touchAction = this.state.swipeAxis === 'vertical' ?
        'pan-x' : // Let browser handle horizontal panning
        'pan-y';  // Let browser handle vertical panning
      return merge(super.updates, {
        style: {
          'touch-action': `${touchAction} pinch-zoom`
        }
      });
    }
  }
}


// Return true if the pointer event is for the pen, or the primary touch point.
function isEventForPenOrPrimaryTouch(event) {
  return event.pointerType === 'pen' ||
    (event.pointerType === 'touch' && event.isPrimary);
}

/*
 * Invoked when the user has moved during a touch operation.
 */
function gestureContinue(element, clientX, clientY) {

  // Calculate and save the velocity since the last event. If this is the last
  // movement of the gesture, this velocity will be used to determine whether
  // the user is trying to flick.
  const deltaX = clientX - element[previousXKey];
  const deltaY = clientY - element[previousYKey];
  const now = Date.now();
  const deltaTime = now - element[previousTimeKey];
  const velocity = deltaX / deltaTime * 1000;

  element[previousXKey] = clientX;
  element[previousYKey] = clientY;
  element[previousTimeKey] = now;
  element[previousVelocityKey] = velocity;

  const verticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);
  const vertical = element.state.swipeAxis === 'vertical';
  const swipeAlongAxis = vertical === verticalSwipe;

  if (swipeAlongAxis) {
    if (element[symbols.swipeTarget].scrollTop > 0) {
      // Don't interfere with scrolling.
      return false;
    }
    // Move was mostly along desired axis.
    const swipeFraction = getSwipeFraction(element, clientX, clientY);
    element.setState({ swipeFraction });
    // Indicate that the event was handled. It'd be nicer if we didn't have
    // to do this so that, e.g., a user could be swiping left and right
    // while simultaneously scrolling up and down. (Native touch apps can do
    // that.) However, Mobile Safari wants to handle swipe events near the
    // page and interpret them as navigations. To avoid having a horiziontal
    // swipe misintepreted as a navigation, we indicate that we've handled
    // the event, and prevent default behavior.
    return true;
  } else {
    // Move was mostly along the other axis.
    return false;
  }
}

/*
 * Invoked when the user has finished a touch operation.
 */
/* eslint-disable no-unused-vars */
function gestureEnd(element, clientX, clientY) {

  // Examine velocity of last movement to see if user is flicking.
  const velocity = element[previousVelocityKey];
  const flickThresholdVelocity = 800; // speed in pixels/second

  let flickPositive;
  if (velocity >= flickThresholdVelocity) {
    // Flicked right/down at high speed.
    flickPositive = true;
  } else if (velocity <= -flickThresholdVelocity) {
    // Flicked left/up at high speed.
    flickPositive = false;
  } else {
    // Finished at low speed.
    const swipeFraction = getSwipeFraction(element, clientX, clientY);
    if (swipeFraction <= -0.5) {
      flickPositive = false;
    } else if (swipeFraction >= 0.5) {
      flickPositive = true;
    }
  }

  if (typeof flickPositive !== 'undefined') {
    const vertical = element.state.swipeAxis === 'vertical';
    const gesture = vertical ?
      (flickPositive ? symbols.swipeDown : symbols.swipeUp) :
      (flickPositive ? symbols.swipeRight : symbols.swipeLeft);
    // If component has method for indicated gesture, invoke it.
    if (gesture && element[gesture]) {
      element[gesture]();
    }
  }

  element.setState({ swipeFraction: null });
}

/*
 * Invoked when the user has begun a touch operation.
 */
function gestureStart(element, clientX, clientY) {
  element[startXKey] = clientX;
  element[startYKey] = clientY;
  element[previousXKey] = clientX;
  element[previousYKey] = clientY;
  element[previousTimeKey] = Date.now();
  element[previousVelocityKey] = 0;
  element.setState({ swipeFraction: 0 });
}

function getSwipeFraction(element, x, y) {
  const vertical = element.state.swipeAxis === 'vertical';
  const dragDistance = vertical ?
    y - element[startYKey] :
    x - element[startXKey];
  const swipeTarget = element[symbols.swipeTarget];
  const swipeTargetSize = vertical ?
    swipeTarget.offsetHeight :
    swipeTarget.offsetWidth;
  const fraction = swipeTargetSize > 0 ?
    dragDistance / swipeTargetSize :
    0;
  return fraction;
}
