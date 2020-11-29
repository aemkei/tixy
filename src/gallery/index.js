import s from './snippets.txt';

const output = document.getElementById('output');
const count = 16;
const size = 16;
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

      const defaultTime = 0;

      render(callback, defaultTime, context);

      let time;
      let pausesStart;
      let pausesEnd;
      let pausedDuration = 0;
      let startTime;
      let active = false;

      function loop() {
        setTimeout(loop, 10);

        if (!active) {
          return;
        }

        if (!startTime) {
          startTime = Number(new Date());
          time = 0;
        } else {
          time = (new Date() - startTime - pausedDuration) / 1000;
        }

        render(callback, time, context);
      }

      loop();

      function start(){

        if (active) {
          return;
        }

        if (pausesStart) {
          const duration = new Date() - pausesStart;
          pausedDuration += duration;
        }

        active = true;
        canvas.classList.add('active');
      }

      function stop(){

        if (!active){
          return;
        }

        active = false;
        // startTime = null;
        pausesStart = new Date();
        // render(callback, defaultTime, context);
        canvas.classList.remove('active');
      }


      // canvas.addEventListener('mouseover', start);
      // canvas.addEventListener('mouseout', stop);

      let ticking = false;

      function inView(){
        const rect = link.getBoundingClientRect();
        const height = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top >= 0 && rect.bottom <= height) {
          start();
        } else {
          stop();
        }
      }

      document.addEventListener('scroll', function(e) {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            inView();
            ticking = false;
          });

          ticking = true;
        }
      });

      inView();

    });
  });

