const gdq = require('@dillonchr/gdq');
const moment = require('moment');
const {exec} = require('child_process');

module.exports = () => {
    gdq((err, runs) => {
        if (err) {
            console.error(err);
        } else {
            if (!runs.length || runs.filter(g => !g.done).length) {
                process.exit(0);
	    }

            const today = new Date().getDate();
            const runsToday = [`SGDQ 2018 - ${moment().format('MMM D')}`];
            const len = runs.length;
            let i = 0;

            while (i < len) {
                const run = runs[i];
                const d = new Date(run.start);
                if (d.getDate() > today) {
                    break;
                } else if (!run.done) {
                    runsToday.push(`( ) ${run.title}\n--------------------------------\n${moment(run.start).format('h:mm A')} - ${moment(run.ends).format('h:mm A')}`);
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
