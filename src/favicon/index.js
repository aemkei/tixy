const favicon = document.getElementById('favicon');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

let callback = function () { };
let startTime = null;
let code = '';

if (document.location.hash <= 1) {
  document.location.hash = 'Math.sin(y/8+t)';
}

function updateCallback() {
  const url = new URL(document.location);
  code = decodeURIComponent(url.hash.substr(1));

  document.title = `(t,i,x,y) => ${code}`;
  startTime = null;

  try {
    callback = new Function('t', 'i', 'x', 'y', `
      try {
        with (Math) {
          return ${code};
        }
      } catch (error) {
        return error;
      }
    `);
  } catch (error) {
    callback = null;
  }
}

window.addEventListener('hashchange', updateCallback, false);
updateCallback();

function render() {
  let time = 0;

  if (startTime) {
    time = (new Date() - startTime) / 1000;
  } else {
    startTime = new Date();
  }

  if (!callback) {
    window.requestAnimationFrame(render);
    return;
  }

  canvas.width = 16;
  canvas.height = 16;
  context.fillStyle = '#000000';
  context.fillRect(0, 0, 16, 16);

  let index = 0;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let value = Number(callback(time, index, x, y));
      let color = value > 0 ? '#FFF' : '#F24';
      value = Math.abs(-value);
      value = Math.min(1, value);
      value = Math.max(0, value);
      context.fillStyle = color;
      context.fillRect(x, y, value, value);

      index++;
    }
  }

  favicon.setAttribute('href', canvas.toDataURL());
  window.requestAnimationFrame(render);
}

render();
