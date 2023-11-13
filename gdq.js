const fetch = require("node-fetch");
const moment = require("moment");

const maxWidth = 32;
const RUN_FORMAT = "H:mm";
const BONUS_GAME = /Bonus Game \d/;

async function fetchRuns() {
  const url =
    "https://gamesdonequick.com/tracker/api/v1/search/?type=run&event=41";
  const response = await fetch(url);
  return await response.json();
}

async function* getSchedule(
  minDate = moment(),
  maxDate = moment().add(24, "hours")
) {
  for (const run of await fetchRuns()) {
    const {
      starttime,
      display_name: title,
      deprecated_runners: runners,
      endtime,
      run_time: estimate
    } = run.fields;

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

const receiptFormatter = text => {
  const result = text
    .split("\n")
    .map(line => {
      if (line.length > maxWidth) {
        return line.split(" ").reduce((whole, word, i) => {
          if (!i) {
            return word;
          }
          const lastNewLine = whole.lastIndexOf("\n");
          const lengthSoFar = whole.substr(lastNewLine + 1).length;
          const wouldBeNextLineLength = lengthSoFar + 1 + word.length;
          if (wouldBeNextLineLength > maxWidth) {
            return `${whole}\n    ${word}`;
          }
          return `${whole} ${word}`;
        });
      }

      return line;
    })
    .join("\n");
  return result;
};

const spaces = n => Array(n).fill(" ").join("");

const spaceBetween = (w1, w2) =>
  w1 + spaces(maxWidth - (w1.length + w2.length)) + w2;

(async function () {
  const runs = [];

  for await (const rec of getSchedule()) {
    runs.push(rec);
  }

  if (!runs.length) {
    process.exit(0);
  }

  const now = new Date().getTime();
  const AorS = moment().format("M") > 1 ? "S" : "A";
  const seed =
    spaceBetween(
      `${AorS}GDQ ${moment().format("Y")}`,
      moment(now + 1000 * 60 * 120).format("ddd MMM D")
    ) + "\n";
  const runsToday = receiptFormatter(
    runs.reduce((list, run) => {
      const estimate = run.estimate.split(":").reduce((str, metric, i) => {
        switch (i) {
          case 0:
            return metric > 0 ? `${metric}h` : str;
          case 1:
            return `${str}${metric}m`;
          default:
            return str;
        }
      }, "");
      const runTimes = `    ${moment(run.start).format(RUN_FORMAT)} - ${moment(
        run.ends
      ).format(RUN_FORMAT)}`;
      const spacePadding = Math.max(
        maxWidth - (estimate.length + runTimes.length),
        0
      );
      const runTitle = BONUS_GAME.test(run.title)
        ? "??? Bonus\n    ???"
        : run.title;
      return `${list}\n( ) ${runTitle}\n${runTimes}${spaces(
        spacePadding
      )}${estimate}\n\n--------------------------------`;
    }, seed)
  );

  console.log(runsToday);
})();

module.exports = getSchedule;
