const gdq = require('@dillonchr/gdq');
const moment = require('moment');

module.exports = () => {
    gdq((err, runs) => {
        if (err) {
            console.error(err);
        } else {
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
                    runsToday.push(`( ) ${run.title}\n-------------------------\n${moment(run.start).format('h:mm A')} - ${moment(run.ends).format('h:mm A')}`);
                }
                i++;
            }

            console.log(runsToday.join('\n\n'));
        }
    });  
};

module.exports();
