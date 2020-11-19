
import examples from '../examples.json';

const output = document.getElementById('output');
const snippets = Object.values(examples);
const comments = Object.keys(examples);

const count = 16;
const size = 8;
const spacing = 1;
const width = count * (size + spacing) - spacing;

function render(callback, time, context){
  let index = 0;

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, width);

  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      const value = Number(callback(time, index, x, y));
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
        x * (size + spacing) + offset,
        y * (size + spacing) + offset,
        radius,
        0,
        2 * Math.PI
      );
      context.fill();
      index++;
    }
  }
}


snippets.forEach(snippet => {

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  output.appendChild(canvas);
  canvas.width = width;
  canvas.height = width;

  const callback  = new Function('t', 'i', 'x', 'y', `
    with (Math) {
      return ${snippet};
    }
  `);

  const defaultTime = 5.2;

  render(callback, defaultTime, context);

  let time;
  let startTime;
  let active = false;

  function loop() {
    setTimeout(loop, 1);

    if (!active) {
      return;
    }

    if (!startTime) {
      startTime = new Date();
      time = 0;
    } else {
      time = (new Date() - startTime) / 1000;
    }

    render(callback, time, context);
  }

  loop();

  canvas.addEventListener('mouseover', function(){
    startTime = null;
    active = true;
  });

  canvas.addEventListener('mouseout', function(){
    active = false;
    startTime = null;
    render(callback, defaultTime, context);
  });

});