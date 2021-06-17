const fetch = require("node-fetch");
const moment = require("moment");

async function fetchRuns() {
  const url = "https://gamesdonequick.com/tracker/api/v1/search/?type=run&event=35";
  const response = await fetch(url);
  return await response.json();
}

async function* getSchedule(minDate = moment(), maxDate = moment().add(24, "hours")) {
  for (const run of await fetchRuns()) {
    const { starttime, display_name: title, deprecated_runners: runners, endtime, run_time: estimate } = run.fields;

    const ends = moment(endtime);
    const done = minDate.isAfter(ends);
    if (!done) {
      const start = moment(starttime);
      const isToday = maxDate.isAfter(start);

      if (isToday) {
        yield { start, title, runners, estimate, ends, done };
      }
    }
  }
}

module.exports = getSchedule;

(async function () {
  for await (const rec of getSchedule(moment(), moment("2021-07-05"))) {
    console.log({ rec });
  }
})();
