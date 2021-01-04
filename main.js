const { exec } = require("child_process");

const gdq = require("@dillonchr/gdq");
const moment = require("moment");

const { printReceiptLine, spaces, spaceBetween } = require("./print.js");

const RUN_FORMAT = "H:mm";
const BONUS_GAME = /Bonus Game \d/;

const DATE_COMPARE_FORMAT = "l";

module.exports = () => {
  gdq((err, runs) => {
    if (err) {
      console.error("Whoops", err);
      return;
    }

    if (!runs.length || !runs.filter(g => !g.done).length) {
      process.exit(0);
    }

    const nowDate = new Date();
    const now = nowDate.getTime();
    const relevantDates = [moment().format(DATE_COMPARE_FORMAT)];
    if (nowDate.getHours() > 5) {
      relevantDates.push(
        moment(now + 1000 * 60 * 60 * 24).format(DATE_COMPARE_FORMAT)
      );
    }
    const AorS = moment().format("M") > 1 ? "S" : "A";

    // Beginning Printout
    console.log(
      spaceBetween(
        `${AorS}GDQ ${moment().format("Y")}`,
        moment(now + 1000 * 60 * 120).format("ddd MMM D")
      )
    );

    const runsToday = runs.filter(r => {
      const ends = new Date(r.ends);
      const starts = moment(r.start).format(DATE_COMPARE_FORMAT);
      return !r.done && ends > now && relevantDates.includes(starts);
    });

    for (const run of runsToday) {
      const runTitle = BONUS_GAME.test(run.title)
        ? "??? Bonus\n    ???"
        : run.title;
      printReceiptLine(`( ) ${runTitle}`);

      const runTimes = `    ${moment(run.start).format(RUN_FORMAT)} - ${moment(
        run.ends
      ).format(RUN_FORMAT)}`;
      console.log(runTimes);
      console.log("--- what?");

      printReceiptLine(spaceBetween(runTimes, getEstimate(run)));

      printReceiptLine("--------------------------------");
    }
  });
};

function getEstimate(run) {
  return run.estimate.split(":").reduce((str, metric, i) => {
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
