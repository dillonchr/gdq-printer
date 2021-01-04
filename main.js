const { exec } = require("child_process");

const gdq = require("@dillonchr/gdq");
const moment = require("moment");

const { receiptFormatter, spaces, spaceBetween } = require("./print.js");

const RUN_FORMAT = "H:mm";
const BONUS_GAME = /Bonus Game \d/;

const DATE_COMPARE_FORMAT = "l";

module.exports = () => {
  gdq((err, runs) => {
    if (!err) {
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
      const seed =
        spaceBetween(
          `${AorS}GDQ ${moment().format("Y")}`,
          moment(now + 1000 * 60 * 120).format("ddd MMM D")
        ) + "\n";
      const runsToday = receiptFormatter(
        runs
          .filter(r => {
            const ends = new Date(r.ends);
            const starts = moment(r.start).format(DATE_COMPARE_FORMAT);
            return !r.done && ends > now && relevantDates.includes(starts);
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
            const runTitle = BONUS_GAME.test(run.title)
              ? "??? Bonus\n    ???"
              : run.title;
            return `${list}\n( ) ${runTitle}\n${spaceBetween(
              runTimes,
              estimate
            )}\n\n--------------------------------`;
          }, seed)
      );

      console.log(runsToday);

      return exec(
        `echo "${runsToday}\n\n" > /dev/usb/lp0`,
        (err, stdout, stderr) => {
          if (err) console.log(500, "print error " + err);
          if (stderr) console.log(500, "print error std " + stderr);
          if (!stderr && !err) console.log(200, "think we printed");
        }
      );
    }
    console.error(err);
  });
};

module.exports();
