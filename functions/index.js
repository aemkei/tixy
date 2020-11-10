const functions = require('firebase-functions');
const PImage = require('pureimage');

const scale = 2
const count = 16;
const size = 16 * scale;
const spacing = 1 * scale;
const padding = size * 4;

const width = count * (size + spacing) + 2 * padding;
const time = 2.5;

function render(code) {

  if (!code){
    code = "sin(i ** 2)";
  }

  console.log(code);

  const callback = eval(`
    (function f(t,i,x,y) {
      try {
        with (Math) {
          return ${code.replace(/\\/g, ';')};
        }
      } catch (error) {
        return error;
      }
    })
  `);

  const image = PImage.make(width, width);
  const context = image.getContext('2d');

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, width);


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

  return image;
}

// Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original
exports.image = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.

  res.setHeader('Content-Type', 'image/png');

  const code = req.query.code;

  const image = render(code);

  PImage.encodePNGToStream(image, res).then(() => {
    res.status(200).end();
  }).catch((e) => {
    res.status(500).send({ error: 'Unable to render code.' })
  });

});