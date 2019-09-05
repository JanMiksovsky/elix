import * as symbols from '../../src/symbols.js';
import * as template from '../../src/template.js';
import ReactiveElement from '../../src/ReactiveElement.js';
import TouchSwipeMixin from '../../src/TouchSwipeMixin.js';
import TrackpadSwipeMixin from '../../src/TrackpadSwipeMixin.js';


const Base =
  TouchSwipeMixin(
  TrackpadSwipeMixin(
    ReactiveElement
  ));


class SwipeDemo extends Base {

  get [symbols.defaultState]() {
    return Object.assign(super[symbols.defaultState], {
      swipeAxis: 'horizontal'
    });
  }

  [symbols.render](/** @type {PlainObject} */ changed) {
    super[symbols.render](changed);
    const { swipeAxis, swipeFraction } = this[symbols.state];
    const vertical = swipeAxis === 'vertical';
    if (changed.swipeAxis) {
      this.style.flexDirection = vertical ? 'row' : 'column';
      Object.assign(this[symbols.$].block.style, {
        height: vertical ? '100%' : '1em',
        width: vertical ? '1em' : '100%'
      });
      Object.assign(this[symbols.$].container.style, {
        'flex-direction': vertical ? 'row-reverse' : 'column',
        'justify-content': vertical ? 'flex-end' : 'center'
      });
      this[symbols.$].empty.style.display = vertical ? 'none' : 'block';
      this[symbols.$].space.style.display = vertical ? 'none' : 'block';
    }
    if (changed.swipeFraction) {
      const axis = vertical ? 'Y' : 'X';
      this[symbols.$].block.style.transform = swipeFraction !== null ?
        `translate${axis}(${swipeFraction * 100}%)` :
        '';
      this[symbols.$].swipeFraction.textContent = swipeFraction !== null ?
        swipeFraction.toFixed(3) :
        '—';
    }
  }

  get swipeAxis() {
    return this[symbols.state].swipeAxis;
  }
  set swipeAxis(swipeAxis) {
    this[symbols.setState]({ swipeAxis });
  }

  get [symbols.template]() {
    return template.html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .section {
          flex: 1;
        }

        #message {
          font-size: smaller;
          padding: 1em;
        }

        #container {
          align-items: center;
          display: flex;
          flex-direction: column;
          font-size: 48px;
          justify-content: center;
          text-align: center;
        }

        #block {
          background: linear-gradient(to right, lightgray, gray);
          height: 1em;
          width: 100%;
          will-change: transform;
        }
      </style>
      <div class="section">
        <div id="message">
          <slot></slot>
        </div>
      </div>
      <div id="container" class="section">
        <div id="swipeFraction"></div>
        <div id="block"></div>
        <div id="space">&nbsp;</div>
      </div>
      <div id="empty" class="section"></div>
    `;
  }

}


customElements.define('swipe-demo', SwipeDemo);
export default SwipeDemo;
