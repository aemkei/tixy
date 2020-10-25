const count = 16;
const size = 16;
const spacing = 1;
const width = count * (size + spacing);

const runner = document.getElementById("code-runner").contentWindow;
const input = document.getElementById("input");
const output = document.getElementById("output");
const context = output.getContext("2d");

output.width = output.height = width;

const cells = [];
let index = 0;

for (let y = 0; y < count; y++) {
  for (let x = 0; x < count; x++) {
    index++;

    cells.push({
      index,
      x,
      y,
    });
  }
}

let callback;
let startTime;
let code;

const url = new URL(document.location);

if (url.searchParams.has("code")) {
  input.value = decodeURIComponent(url.searchParams.get("code"));
}

function updateCallback() {
  code = input.value;
  startTime = new Date();

  try {
    callback = runner.eval(`
      (function f(t,i,x,y) {
        try {
          return ${code.replace(/\\/g, ";")};
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
input.addEventListener("input", updateCallback);

input.addEventListener("keypress", function (event) {
  if ((event.code = "Enter")) {
    history.replaceState(null, code, "?code=" + encodeURIComponent(code));
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
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      index++;

      const value = callback(time, index, x, y);
      const offset = size / 2;
      let color = "#FFF";
      let radius = (value * size) / 2;

      if (radius < 0) {
        radius = -radius;
        color = "#F24";
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
    }
  }

  window.requestAnimationFrame(render);
}

render();
