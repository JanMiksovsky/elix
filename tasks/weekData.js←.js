import fetch from "node-fetch";

// The cldr-json week data uses English days of week, but we'd rather have
// a numeric representation.
const daysOfWeek = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const weekDataUrl =
  "https://raw.githubusercontent.com/unicode-cldr/cldr-core/master/supplemental/weekData.json";

// Extract the week data we care about and format it as an ES6 module.
function formatWeekDataAsModule(weekData) {
  const { firstDay, weekendEnd, weekendStart } = weekData;
  const transformed = {
    firstDay: transformWeekDays(firstDay),
    weekendEnd: transformWeekDays(weekendEnd),
    weekendStart: transformWeekDays(weekendStart),
  };
  const formatted = JSON.stringify(transformed, null, 2);
  const js = `// Generated from
// https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/weekData.json
const weekData = ${formatted};
export default weekData;
`;
  return js;
}

function transformWeekDays(data) {
  const transformed = {};
  for (const key in data) {
    transformed[key] = daysOfWeek[data[key]];
  }
  return transformed;
}

// Get data from cldr-json project
// at https://github.com/unicode-cldr/cldr-core.
export default async function weekData() {
  const response = await fetch(weekDataUrl);
  const json = await response.json();
  const data = json.supplemental.weekData;
  return formatWeekDataAsModule(data);
}
