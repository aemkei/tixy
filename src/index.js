const count = 16;
const size = 16;
const spacing = 1;
const width = count * (size + spacing);

import examples from './examples.json';

const runner = document.getElementById('code-runner').contentWindow;
const input = document.getElementById('input');
const editor = document.getElementById('editor');
const comment = document.getElementById('comment');
const output = document.getElementById('output');
const context = output.getContext('2d');
const dpr = window.devicePixelRatio || 1;

let callback = function () {};
let startTime = new Date();
let code = '';

output.width = output.height = width * dpr;
context.scale(dpr, dpr);
output.style.width = output.style.height = `${width}px`;

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
      (function f(t,i,x,y,l) {
        try {
          with (Math) {
            return ${code.replace(/\\/g, ';')};
          }
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

input.addEventListener('focus', function () {
  updateComments([
    'hit "enter" to save in URL',
    'or get <a href="https://twitter.com/aemkei/status/1323399877611708416">more info here</a>'
  ]);
});

input.addEventListener('blur', updateCommentsForCode);

editor.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = new URL(document.location);
  url.searchParams.set('code', code);
  history.replaceState(null, code, url);
});

function render(lastValues) {
  const time = (new Date() - startTime) / 1000;

  if (!callback) {
    window.requestAnimationFrame(() => render(lastValues));
    return;
  }

  output.width = output.height = width * dpr;
  context.scale(dpr, dpr);
  let index = 0;

  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      const value = callback(time, index, x, y, lastValues[index]);
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
      lastValues[index] = isNaN(value) ? 0 : value;
      index++;
    }
  }

  window.requestAnimationFrame(() => render(lastValues));
}

let lastValues = new Array(256);

for (let i = 0; i < 256; i++) {
    lastValues[i] = 0;
}

render(lastValues);

function updateComments(comments) {
  const lines = comment.querySelectorAll('label');

  if (comments.length === 1) {
    lines[0].innerHTML = '&nbsp;';
    lines[1].innerHTML = `// ${comments[0]}`;
  } else {
    lines[0].innerHTML = `// ${comments[0]}`;
    lines[1].innerHTML = `// ${comments[1]}`;
  }
}

function updateCommentsForCode() {
  const code = input.value;

  const snippets = Object.values(examples);
  const comments = Object.keys(examples);
  const index = snippets.indexOf(code);
  const newComment = comments[index];

  if (!newComment) {
    return;
  }

  const newComments = newComment.split('\n');

  updateComments(newComments);
}

function nextExample() {
  const snippets = Object.values(examples);

  let index = snippets.indexOf(code);

  if (snippets[index + 1]) {
    index = index + 1;
  } else {
    return;
  }

  const newCode = snippets[index];
  input.value = newCode;

  updateCommentsForCode();

  updateCallback();
}

output.addEventListener('click', nextExample);

window.onpopstate = function (event) {
  readURL();
  updateCallback();
};

updateCommentsForCode();
