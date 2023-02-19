const moment = require("moment");
const fetch = require("@dillonchr/fetch");
const urls = [
  "https://app.esamarathon.dev/horaro-proxy/v2/esa/schedule/2023-winter1",
  "https://app.esamarathon.dev/horaro-proxy/v2/esa/schedule/2023-winter2"
];

/*
 * {
        start: <date>,
        title: <string>,
        runners: <string>,
        estimate: <string>, //  in hh:mm:ss format
        ends: <date>,
        done: <bool>
    }
  */

function deMarkdown(str) {
  return str.replace(/^\[/, "").replace(/\].*$/, "");
}

function prettyLength(length) {
  return [
    String(Math.floor(length / 3600)),
    String((length / 60) % 60),
    String(length % 60).padStart(2, "0")
  ].join(":");
}

function streamToGames(stream) {
  const now = moment();
  const scheduleJson = "string" === typeof stream ? JSON.parse(stream) : stream;
  return scheduleJson.data.map(game => {
    const ends = moment(game.scheduled).add(game.length, "s");
    return {
      stream: scheduleJson.meta.slug,
      start: moment(game.scheduled),
      title: deMarkdown(game.game),
      runners: deMarkdown(game.players[0]),
      estimate: prettyLength(game.length),
      ends,
      done: now.isAfter(ends)
    };
  });
}

function getEsaSchedules(callback) {
  fetch({ url: urls[0] }, (err, stream1) => {
    if (err) {
      callback(err);
    } else {
      fetch({ url: urls[1] }, (err, stream2) => {
        if (err) {
          callback(err);
        } else {
          // we have stream1 and stream2 here
          callback(
            null,
            [stream1, stream2]
              .map(streamToGames)
              .reduce((schedule, stream) => schedule.concat(stream), [])
              .sort((a, b) => a.start - b.start)
          );
        }
      });
    }
  });
}

module.exports = getEsaSchedules;

/* TESTING!
getEsaSchedules((err, schedule) => {
  if (err) {
    console.error(err);
  } else {
    console.log({ schedule });
  }
});
*/
