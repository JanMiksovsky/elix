import * as internal from "../../src/base/internal.js";
import CalendarMonth from "../../src/plain/PlainCalendarMonth.js";
import MoonPhaseCalendarDays from "./MoonPhaseCalendarDays.js";

class MoonPhaseCalendarMonth extends CalendarMonth {
  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      monthDaysPartType: MoonPhaseCalendarDays,
    });
  }
}

export default MoonPhaseCalendarMonth;
customElements.define("moon-phase-calendar-month", MoonPhaseCalendarMonth);
