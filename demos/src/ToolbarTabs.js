import * as internal from "../../src/base/internal.js";
import html from "../../src/core/html.js";
import SlidingPages from "../../src/base/SlidingPages.js";
import Tabs from "../../src/base/Tabs.js";

class ToolbarTabs extends Tabs {
  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      proxyListPosition: "bottom",
      stagePartType: SlidingPages,
      tabAlign: "stretch",
    });
  }

  get [internal.template]() {
    const result = super[internal.template];
    result.content.append(html`
      <style>
        :host {
          background: #eee;
          color: gray;
          display: flex;
          flex: 1;
        }

        slot:not([name])::slotted(*) {
          align-items: center;
          background: white;
          border: 1px solid rgb(204, 204, 204);
          box-sizing: border-box;
          color: initial;
          display: flex;
          justify-content: center;
        }
      </style>
    `);
    return result;
  }
}

export default ToolbarTabs;
customElements.define("toolbar-tabs", ToolbarTabs);
