#!/usr/bin/env node

const characters = ' -=oO0@';
const emptyLine = ' '.repeat(16 * 2 + 1);

module.exports = function() {

  code = process.argv[2] || 'sin(t-sqrt((x-7.5)**2+(y-6)**2))';

  console.clear();
  let output = '';
  const callback = new Function('t', 'i', 'x', 'y', `
    with (Math) {
      return ${code.replace(/\\/g, ';')};
    }
  `);

  let startTime;

  function render() {
    output = '\n\x1b[40m  ' + emptyLine;
    output += '\n  ';
    let time = 0;

    if (startTime) {
      time = (new Date() - startTime) / 1000;
    } else {
      startTime = new Date();
    }

    let index = 0;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        let value = Number(callback(time, index, x, y));
        let color = '\x1b[37m';

        if (value < 0) {
          value = -value;
          color = '\x1b[31m';
        }

        if (value > 1) {
          value = 1;
        }


        const character = characters[
          Math.floor(value * characters.length)
        ];

        output += color + character + ' ';
        index++;
      }

      output += ' \n  ';
    }

    output += emptyLine;
    output += '\x1b[0m\n';
    output += '\n  (t,i,x,y)=>';
    output += '\n  ' + code;
    output += '\n';
    output += '\n';
    process.stdout.cursorTo(0, 0);
    process.stdout.write(output);

    setTimeout(render, 1);
  }

  render();
}