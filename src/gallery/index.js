import s from './snippets.txt';

const output = document.getElementById('output');
const count = 16;
const size = 8;
const spacing = 1;
const width = count * (size + spacing) - 2 * spacing;

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

fetch(s)
  .then(response => response.text())
  .then(text => {

    const lines = text.split('\n')
      .filter(line => line !== '')
      .filter(line => line.indexOf('//'));

    lines.forEach(code => {
      const link = document.createElement('a');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const url = new URL('/', document.location);
      url.searchParams.set('code', code);

      link.appendChild(canvas);
      link.classList.add('canvas');
      link.setAttribute('href', url);


      output.appendChild(link);
      canvas.width = width;
      canvas.height = width;

      const callback  = new Function('t', 'i', 'x', 'y', `
        with (Math) {
          return ${code};
        }
      `);

      const defaultTime = 6.5;

      render(callback, defaultTime, context);

      let time;
      let startTime;
      let active = false;

      function loop() {
        setTimeout(loop, 10);

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

      function start(){
        startTime = null;
        active = true;
        canvas.classList.add('active');
      }

      function stop(){
        active = false;
        startTime = null;
        render(callback, defaultTime, context);
        canvas.classList.remove('active');
      }

      if ('ontouchstart' in document.documentElement) {
        link.addEventListener('click', (event)=> {
          if (!active) {
            event.stopPropagation();
            event.preventDefault();
            start();
          } else {
            document.location = url;
          }
        })
      } else {
        canvas.addEventListener('mouseover', start);
      }



      canvas.addEventListener('mouseout', stop);

    });
  });

