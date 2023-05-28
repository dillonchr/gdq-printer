const gdq = require('@dillonchr/gdq')
const moment = require('moment')
const {exec} = require('child_process')
const maxWidth = 32
const RUN_FORMAT = 'H:mm'
const BONUS_GAME = /Bonus Game \d/

const receiptFormatter = text => {
  const result = text
    .split('\n')
    .map(line => {
      if (line.length > maxWidth) {
        return line.split(' ').reduce((whole, word, i) => {
          if (!i) {
            return word
          }
          const lastNewLine = whole.lastIndexOf('\n')
          const lengthSoFar = whole.substr(lastNewLine + 1).length
          const wouldBeNextLineLength = lengthSoFar + 1 + word.length
          if (wouldBeNextLineLength > maxWidth) {
            return `${whole}\n    ${word}`
          }
          return `${whole} ${word}`
        })
      }

      return line
    })
    .join('\n')
  return result
}

const spaces = (n) => Array(n).fill(' ').join('')

const DATE_COMPARE_FORMAT = 'l'

const spaceBetween = (w1, w2) => w1 + spaces(maxWidth - (w1.length + w2.length)) + w2

module.exports = () => {
  gdq((err, runs) => {
    if (err) {
      console.error(err)
    } else {
      if (!runs.length || !runs.filter(g => !g.done).length) {
        process.exit(0)
      }

      const now = moment();
      const endOfSchedule = moment().add(24, "hours");
      const includedInToday = starts => endOfSchedule.isAfter(starts);

      const relevantDates = [moment().format(DATE_COMPARE_FORMAT)]

      const AorS = moment().format('M') > 1 ? 'S' : 'A'
      const seed = spaceBetween(`${AorS}GDQ ${moment().format('Y')}`, moment().format('ddd MMM D')) + '\n'
      const runsToday = receiptFormatter(runs
        .filter(r => {
          return !r.done && includedInToday(r.start);
        })
        .reduce((list, run) => {
          const estimate = run.estimate.split(':')
            .reduce((str, metric, i) => {
              switch(i) {
                case 0:
                  return metric > 0 ? `${metric}h` : str
                case 1:
                  return `${str}${metric}m`
                default:
                  return str
              }
            }, '')
          const runTimes = `    ${moment(run.start).format(RUN_FORMAT)} - ${moment(run.ends).format(RUN_FORMAT)}`
          const spacePadding = Math.max(maxWidth - (estimate.length + runTimes.length), 0)
          const runTitle = BONUS_GAME.test(run.title) ?
            '??? Bonus\n    ???' :
            run.title
          return `${list}\n( ) ${runTitle}\n${runTimes}${spaces(spacePadding)}${estimate}\n\n--------------------------------`
        }, seed))

      console.log(runsToday)
    }
  })
}

module.exports()
