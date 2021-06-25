const { exec } = require("child_process");

const gdq = require("@dillonchr/gdq");
const moment = require("moment");

const {
  lineRule,
  printReceiptLine,
  spaces,
  spaceBetween
} = require("./print.js");

const RUN_FORMAT = "H:mm";
const BONUS_GAME = /Bonus Game \d/;

const DATE_COMPARE_FORMAT = "l";

module.exports = () => {
  gdq((err, runs) => {
    if (err) {
      console.error("Whoops", err);
      process.exit(0);
    }

    if (!runs.length || !runs.filter(g => !g.done).length) {
      process.exit(0);
    }

    const now = Date.now();
    const AorS = moment().format("M") > 1 ? "S" : "A";

    // Beginning Printout
    printReceiptLine(
      spaceBetween(
        `${AorS}GDQ ${moment().format("Y")}`,
        moment(now + 1000 * 60 * 120).format("ddd MMM D")
      )
    );
    console.log("");

    const runsToday = runs.filter(r => {
      return (
        0 < r.ends.diff(moment(), "minutes") &&
        r.ends.diff(moment(), "hours") <= 24
      );
    });

    for (const run of runsToday) {
      const runTitle = BONUS_GAME.test(run.title)
        ? "??? Bonus\n    ???"
        : run.title;
      printReceiptLine(`( ) ${runTitle}`);

      const runTimes = `    ${moment(run.start).format(RUN_FORMAT)} - ${moment(
        run.ends
      ).format(RUN_FORMAT)}`;
      printReceiptLine(spaceBetween(runTimes, getEstimate(run)));
      console.log("");
      printReceiptLine(lineRule());
    }
  });
};

function getEstimate({ estimate }) {
  return estimate.split(":").reduce((str, metric, i) => {
    switch (i) {
      case 0:
        return metric > 0 ? `${metric}h` : str;
      case 1:
        return `${str}${metric}m`;
      default:
        return str;
    }
  }, "");
}

module.exports();
