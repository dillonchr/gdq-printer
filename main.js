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

module.exports = () => {
  gdq((err, runs) => {
    if (err) {
      console.error(err)
    } else {
      if (!runs.length || !runs.filter(g => !g.done).length) {
        process.exit(0)
      }

      const now = new Date().getTime()
      const tomorrow = new Date(now + (1000 * 60 * 60 * 24))
      const AorS = tomorrow.getMonth() ? 'S' : 'A'
      const year = tomorrow.getFullYear()
      const runsToday = receiptFormatter(runs
        .filter(r => {
          const ends = new Date(r.ends)
          const starts = new Date(r.start)
          return !r.done && ends > now && starts < tomorrow
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
            '??? Bonus\n    ¿¿¿' :
            run.title
          return `${list}\n( ) ${runTitle}\n${runTimes}${spaces(spacePadding)}${estimate}\n\n--------------------------------`
        }, `${AorS}GDQ ${year} - ${moment().format('MMM D')}`))

      console.log(runsToday)

      exec(`echo "${runsToday}\n\n" > /dev/usb/lp0`, (err, stdout, stderr) => {
        if (err) console.log(500, 'print error ' + err)
        if (stderr) console.log(500, 'print error std ' + stderr)
        if (!stderr && !err) console.log(200, 'think we printed')
      })
    }
  })
}

module.exports()
