const gdq = require('@dillonchr/gdq');
const moment = require('moment');
const {exec} = require('child_process');
const maxWidth = 32;

const receiptFormatter = text => {
    const result = text
        .split('\n')
        .map(line => {
            if (line.length > maxWidth) {
                return line.split(' ').reduce((whole, word, i) => {
                    if (!i) {
                        return word;
                    }
                    const lastNewLine = whole.lastIndexOf('\n') !== -1 ? whole.lastIndexOf('\n') : 0;
                    const lengthSoFar = whole.substr(lastNewLine + 1).length;
                    const wouldBeNextLineLength = lengthSoFar + word.length + 1;
                    if (wouldBeNextLineLength > maxWidth) {
                        return `${whole}\n    ${word}`;
                    }
                    return `${whole} ${word}`;
                });
            }

            return line;
        })
        .join('\n');
    return result;
};

module.exports = () => {
    gdq((err, runs) => {
        if (err) {
            console.error(err);
        } else {
            if (!runs.length || !runs.filter(g => !g.done).length) {
                process.exit(0);
            }

            const now = new Date().getTime();
            const tomorrow = new Date(now + (1000 * 60 * 60 * 24));
            const AorS = tomorrow.getMonth() ? 'S' : 'A';
            const year = tomorrow.getFullYear();
            const runsToday = receiptFormatter(runs
                .filter(r => {
                    const ends = new Date(r.ends);
                    const starts = new Date(r.start);
                    return !r.done && ends > now && starts < tomorrow;
                })
                .reduce((list, run) => {
                    return `${list}\n( ) ${run.title}\n    ${moment(run.start).format('h:mm A')} - ${moment(run.ends).format('h:mm A')}\n\n--------------------------------`;
                }, `${AorS}GDQ ${year} - ${moment().format('MMM D')}`));

            console.log(runsToday);

            exec(`echo "${runsToday}\n\n" > /dev/usb/lp0`, (err, stdout, stderr) => {
                if (err) console.log(500, 'print error ' + err);
                if (stderr) console.log(500, 'print error std ' + stderr);
                if (!stderr && !err) console.log(200, 'think we printed');
            });
        }
    });
};

module.exports();
