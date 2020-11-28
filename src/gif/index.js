const scale = 3;
const count = 16;
const size = 16 * scale;
const spacing = 1 * scale;
const padding = size * 4;
const width = count * (size + spacing) + 2 * padding;

import GIF from "gif.js.optimized";

const workerScript = document.getElementById('worker').src;

const $output = document.getElementById('output');
const $editor = document.getElementById('editor');
const $input = document.getElementById('input');
const $duration = document.getElementById('duration');

const context = $output.getContext('2d');

const url = new URL(document.location);

if (url.searchParams.has('code')) {
  $input.value = url.searchParams.get('code');
}

if (url.searchParams.has('duration')) {
  $duration.value = url.searchParams.get('duration');
}

function run(){

  var gif = new GIF({
    workerScript,
    workers: 4,
    quality: 100,
    background: '#000000',
    width: width,
    height: width
  });

  const code = $input.value;
  const duration = $duration.value;

  url.searchParams.set('code', code);
  url.searchParams.set('duration', duration);
  history.replaceState(null, code, url);

  const callback = new Function('t', 'i', 'x', 'y', `
    try {
      with (Math) {
        return ${code.replace(/\\/g, ';')};
      }
    } catch (error) {
      return error;
    }
  `);

  let time = 0;

  $output.width = $output.height = width;

  function render() {

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
    gif.addFrame(context, {copy: true, delay: 20});
  }

  while (time < duration) {
    time += 1 / 50;
    render();
  }

  const t = new Date();

  gif.on('finished', function(blob) {
    console.log("…");
    console.log(new Date() - t);


    const link = document.createElement("a");
    link.download='tixy.gif';
    link.href=URL.createObjectURL(blob);
    link.click();

    document.location = URL.createObjectURL(blob);
  });

  gif.on('abort', function() {
    console.log('abort', arguments)
  });

  gif.on('progress', function(ratio) {
    $editor.innerText = `exporting ${Math.round(ratio * 100)}%`;
  });

  gif.render();
}

$editor.addEventListener('submit', (event) => {
  event.preventDefault();
  $editor.innerText = 'rendering ...'
  setTimeout(run, 300);
})