var canvas = document.queryselector('canvas');

function fullscreen() {
  var el = document.getElementById('canvas');

  if (el.webkitRequestFullScreen) {
    el.webkitRequestFullScreen();
  }
  else {
    el.mozRequestFullScreen();
  }
}

canvas.addEventListener("click", fullscreen)

