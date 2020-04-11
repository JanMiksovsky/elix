import * as internal from "../base/internal.js";
import CalendarMonth from "../base/CalendarMonth.js";
import PlainCalendarDays from "./PlainCalendarDays.js";
import PlainCalendarDayNamesHeader from "./PlainCalendarDayNamesHeader.js";
import PlainCalendarMonthYearHeader from "./PlainCalendarMonthYearHeader.js";

/**
 * CalendarMonth component in the Plain reference design system
 *
 * @inherits CalendarMonth
 * @part {PlainCalendarDayNamesHeader} day-names-header
 * @part {PlainCalendarDays} month-days
 * @part {PlainCalendarMonthYearHeader} month-year-header
 */
class PlainCalendarMonth extends CalendarMonth {
  get [internal.defaultState]() {
    return Object.assign(super[internal.defaultState], {
      dayNamesHeaderPartType: PlainCalendarDayNamesHeader,
      monthDaysPartType: PlainCalendarDays,
      monthYearHeaderPartType: PlainCalendarMonthYearHeader,
    });
  }
}

export default PlainCalendarMonth;
