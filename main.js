const gdq = require('@dillonchr/gdq');
const moment = require('moment');
const {exec} = require('child_process');

module.exports = () => {
    gdq((err, runs) => {
        if (err) {
            console.error(err);
        } else {
            const today = new Date().getDate();
            const runsToday = [`SGDQ 2018 - ${moment().utcOffset('-05:00').format('MMM D')}`];
            const len = runs.length;
            let i = 0;

            while (i < len) {
                const run = runs[i];
                const d = new Date(run.start);
                if (d.getDate() > today) {
                    break;
                } else if (!run.done) {
                    runsToday.push(`( ) ${run.title}\n-------------------------\n${moment(run.start).utcOffset('-05:00').format('h:mm A')} - ${moment(run.ends).utcOffset('-05:00').format('h:mm A')}`);
                }
                i++;
            }

            console.log(runsToday.join('\n\n'));

            exec(`echo "${runsToday.join('\n\n')}\n\n" > /dev/usb/lp0`, (err, stdout, stderr) => {
                if (err) console.log(500, 'print error ' + err);
                if (stderr) console.log(500, 'print error std ' + stderr);
                if (!stderr && !err) console.log(200, 'think we printed');
            });
        }
    });
};

module.exports();
