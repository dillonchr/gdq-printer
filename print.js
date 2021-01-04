const DEFAULT_MAX_WIDTH = 32;

const receiptFormatter = (text, maxWidth = DEFAULT_MAX_WIDTH) => {
  const result = text
    .split("\n")
    .map(line => printLine(line, maxWidth))
    .join("\n");
  return result;
};

function printLine(line, maxWidth = DEFAULT_MAX_WIDTH) {
  if (line.length <= maxWidth) {
    return line;
  }

  const words = line.split(" ");
  let newLine = "";

  for (const word of words) {
    if (!newLine) {
      newLine = word;
    } else {
      const lastNewLine = newLine.lastIndexOf("\n");
      const lengthSoFar = newLine.substr(lastNewLine + 1).length;
      const wouldBeNextLineLength = lengthSoFar + 1 + word.length;
      if (wouldBeNextLineLength < maxWidth) {
        newLine = [newLine, word].join(" ");
      } else {
        newLine = newLine + "\n    " + word;
      }
    }
  }
  return newLine;
}

const spaceBetween = (w1, w2, maxWidth) => {
  maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
  return w1 + spaces(maxWidth - (w1.length + w2.length)) + w2;
};

const spaces = n => Array(Math.max(n, 0)).fill(" ").join("");

module.exports = { receiptFormatter, spaces, spaceBetween };
