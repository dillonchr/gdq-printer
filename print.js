const DEFAULT_MAX_WIDTH = 32;

function printReceiptLine(line, maxWidth = DEFAULT_MAX_WIDTH) {
  for (const receiptLine of printLine(line, maxWidth)) {
    console.log(receiptLine);
  }
}

function* printLine(line, maxWidth = DEFAULT_MAX_WIDTH) {
  if (line.length <= maxWidth) {
    return line;
  }

  const words = line.split(" ");
  let newLine = "";

  for (const word of words) {
    if (!newLine) {
      newLine = word;
    } else {
      const wouldBeNextLineLength = newLine.length + 1 + word.length;
      if (wouldBeNextLineLength < maxWidth) {
        newLine = [newLine, word].join(" ");
      } else {
        yield newLine;
        newLine = "    " + word;
      }
    }
  }
  yield newLine;
}

const spaceBetween = (w1, w2, maxWidth) => {
  maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
  return w1 + spaces(maxWidth - (w1.length + w2.length)) + w2;
};

const spaces = n => Array(Math.max(n, 0)).fill(" ").join("");

module.exports = { printReceiptLine, spaces, spaceBetween };
