const PImage = require('pureimage');
const fs = require('fs');

const count = 16;
const size = 16;
const spacing = 1;
const padding = size * 4;

const width = count * (size + spacing) + 2 * padding;

const code = "sin(t-sqrt((x-7.5)**2+(y-6)**2))";

const callback = new Function('t', 'i', 'x', 'y', `
  with (Math) {
    return ${code.replace(/\\/g, ';')};
  }
`);

const image = PImage.make(width, width);
const context = image.getContext('2d');

context.fillStyle = '#000';
context.fillRect(0, 0, width, width);

const time = 2.1;

let index = 0;
for (let y = 0; y < count; y++) {
  for (let x = 0; x < count; x++) {
    const value = callback(time, index, x, y);
    const offset = size / 2;
    let color = '#FFF';
    let radius = (value * size) / 2;

    if (radius < 0) {
      radius = -radius;
      color = '#F24';
    }

    if (radius > size / 2) {
      radius = size / 2;
    }

    context.beginPath();
    context.fillStyle = color;
    context.arc(
      x * (size + spacing) + offset + padding,
      y * (size + spacing) + offset + padding,
      radius,
      0,
      2 * Math.PI
    );
    context.fill();
    index++;
  }
}

PImage.encodePNGToStream(image, fs.createWriteStream('out.png')).then(() => {
  console.log("wrote out the png file to out.png");
}).catch((e) => {
  console.log("there was an error writing");
});