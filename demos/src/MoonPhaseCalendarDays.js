import * as internal from "../../src/base/internal.js";
import CalendarDays from "../../src/plain/PlainCalendarDays.js";
import MoonPhaseCalendarDay from "./MoonPhaseCalendarDay.js";

class MoonPhaseCalendarDays extends CalendarDays {
  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      dayPartType: MoonPhaseCalendarDay,
    });
  }
}

export default MoonPhaseCalendarDays;
customElements.define("moon-phase-calendar-days", MoonPhaseCalendarDays);
