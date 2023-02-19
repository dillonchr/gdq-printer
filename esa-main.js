const esa = require("./esa.js");
const moment = require("moment");
const maxWidth = 32;
const RUN_FORMAT = "H:mm";
const BONUS_GAME = /Bonus Game \d/;

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

function eventName(acronym) {
  if ("esa" === acronym) {
    const season = moment().format("M") < 6 ? "WINTER" : "SUMMER";
    return (
      spaceBetween(
        `ESA ${season} ${moment().format("Y")}`,
        moment().format("ddd MMM D")
      ) + "\n"
    );
  }
  const AorS = moment().format("M") > 1 ? "S" : "A";
  return (
    spaceBetween(
      `${AorS}GDQ ${moment().format("Y")}`,
      moment().format("ddd MMM D")
    ) + "\n"
  );
}

module.exports = () => {
  esa((err, runs) => {
    if (err) {
      console.error(err);
    } else {
      if (!runs.length || !runs.filter(g => !g.done).length) {
        process.exit(0);
      }

      const now = moment();
      const endOfSchedule = moment().add(24, "hours");
      const includedInToday = starts => endOfSchedule.isAfter(starts);
      const runsToday = receiptFormatter(
        runs
          .filter(r => {
            const ends = new Date(r.ends);
            return !r.done && includedInToday(r.start);
          })
          .reduce((list, run) => {
            const estimate = run.estimate
              .split(":")
              .reduce((str, metric, i) => {
                switch (i) {
                  case 0:
                    return metric > 0 ? `${metric}h` : str;
                  case 1:
                    return `${str}${metric}m`;
                  default:
                    return str;
                }
              }, "");
            const runTimes = `    ${moment(run.start).format(
              RUN_FORMAT
            )} - ${moment(run.ends).format(RUN_FORMAT)}`;
            const spacePadding = Math.max(
              maxWidth - (estimate.length + runTimes.length),
              0
            );
            const runTitle = BONUS_GAME.test(run.title)
              ? "??? Bonus\n    ???"
              : run.title;
            return `${list}\n(${
              "2023-winter1" === run.stream ? 1 : 2
            }) ${runTitle}\n${runTimes}${spaces(
              spacePadding
            )}${estimate}\n\n--------------------------------`;
          }, eventName("esa"))
      );

      console.log(runsToday);
    }
  });
};

module.exports();
