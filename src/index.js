const count = 16;
const size = 16;
const spacing = 1;
const width = count * (size + spacing);

import examples from './examples.json';

const runner = document.getElementById('code-runner').contentWindow;
const input = document.getElementById('input');
const comment = document.getElementById('comment');
const output = document.getElementById('output');
const context = output.getContext('2d');

let callback = function() {};
let startTime = new Date();
let code = '';

output.width = output.height = width;

const cells = [];

for (let y = 0, index = 0; y < count; y++) {
  for (let x = 0; x < count; x++) {
    index++;

    cells.push({
      index,
      x,
      y
    });
  }
}

function readURL() {
  const url = new URL(document.location);

  if (url.searchParams.has('code')) {
    input.value = url.searchParams.get('code');
  }
}

readURL();

function updateCallback() {
  code = input.value;
  startTime = new Date();

  try {
    callback = runner.eval(`
      (function f(t,i,x,y) {
        try {
          return ${code.replace(/\\/g, ';')};
        } catch (error) {
          return error;
        }
      })
    `);
  } catch (error) {
    callback = null;
  }
}

updateCallback();
input.addEventListener('input', updateCallback);

input.addEventListener('keypress', (event) => {
  if ((event.code === 'Enter')) {
    history.replaceState(null, code, `?code=${encodeURIComponent(code)}`);
  }
});

function render() {
  const time = (new Date() - startTime) / 1000;

  if (!callback) {
    window.requestAnimationFrame(render);
    return;
  }

  output.width = output.height = width;
  let index = 0;
  for (let y = 1; y <= count; y++) {
    for (let x = 1; x <= count; x++) {
      index++;

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
        x * (size + spacing) - offset,
        y * (size + spacing) - offset,
        radius,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }

  window.requestAnimationFrame(render);
}

render();

function nextExample() {
  const comments = Object.keys(examples);
  const snippets = Object.values(examples);

  let index = snippets.indexOf(code);

  if (snippets[index + 1]) {
    index = index + 1;
  } else {
    return;
  }

  const newCode = snippets[index];
  const newComment = comments[index].split('\n');

  const lines = comment.querySelectorAll('label');

  if (newComment.length === 1) {
    lines[0].innerHTML = '&nbsp;';
    lines[1].innerText = `// ${newComment[0]}`;
  } else {
    lines[0].innerText = `// ${newComment[0]}`;
    lines[1].innerText = `// ${newComment[1]}`;
  }

  input.value = newCode;
  // history.replaceState({
  //   code: newCode,
  //   comment: newComment
  // }, code, `?code=${encodeURIComponent(newCode)}`);

  updateCallback();
}

output.addEventListener('click', nextExample);

window.onpopstate = function(event) {
  readURL();
  updateCallback();
};
