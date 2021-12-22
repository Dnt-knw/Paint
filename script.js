onload = main;

function main() {
  const canvas = document.getElementById('canvas');
  canvas.style.margin = '5px';
  canvas.width = window.innerWidth - 15;
  canvas.height = window.innerHeight - 120;
  const ctx = canvas.getContext('2d');

  const coords = [];
  const touchCoords = [];
  const replayColors = [];
  const replayWidth = [];

  let paintColor = 'black',
    width = '10';

  const colors = document.querySelectorAll('button');
  const repeatButton = document.querySelector('#repeat');
  const widthChangerInput = document.querySelector('#widthChanger');

  for (const color of colors) {
    color.style.background = color.id;
    color.onclick = () => paintColor = color.id;
  }

  function onInteractionStart(e) {
    const isMobPlatform = e.changedTouches;
    ctx.beginPath();
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = width;
    ctx.linejoin = 'miter';
    ctx.miterLimit = 1;
    ctx.lineCap = 'round';

    replayColors.push(paintColor);
    replayWidth.push(width);

    return isMobPlatform ? touchCoords.push('down', 'down') : coords.push('down', 'down');
  }

  function onMove(e) {
    const isMobPlatform = e.changedTouches;
    const x = isMobPlatform ? e.changedTouches['0'].clientX : e.clientX;
    const y = isMobPlatform ? e.changedTouches['0'].clientY : e.clientY;

    isMobPlatform ? touchCoords.push(x, y) : coords.push(x, y);

    ctx.lineTo(x, y);
    ctx.stroke();

    if (isMobPlatform) {
      canvas.ontouchend = () => {
        canvas.ontouchmove = null;
        ctx.beginPath();
        touchCoords.push('up', 'up');
      }
    } else {
      canvas.onmouseup = canvas.onmouseleave = () => {
        canvas.onmousemove = null;
        ctx.beginPath();
        coords.push('up', 'up')
      }
    }
  }

  //for mobile
  widthChangerInput.ontouchend = () => width = widthChangerInput.value;

  canvas.ontouchstart = e => {
    //only 1 touch...
    if (e.touches.length > 1) {
      canvas.ontouchmove = null;
      return;
    } else {
      onInteractionStart(e);
      canvas.ontouchmove = onMove;
    }
    return false;
  };

  //for PC
  widthChangerInput.onmouseup = () => width = widthChangerInput.value;

  canvas.onmousedown = e => {
    onInteractionStart(e);
    canvas.onmousemove = onMove;
    return false;
  };

  repeatButton.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const timer = setInterval(() => {

      const x = coords.shift() || touchCoords.shift();
      const y = coords.shift() || touchCoords.shift();

      if (x == 'down' || y == 'down') {
        ctx.lineWidth = replayWidth.shift();
        ctx.strokeStyle = replayColors.shift();
      }

      if (x == 'up' || y == 'up') {
        ctx.beginPath();
      }

      //forbid drawing when replaying...
      if (coords.length > 0 || touchCoords.length > 0) {
        canvas.onmousedown = canvas.ontouchstart = canvas.onmousemove = canvas.onmouseup = canvas.onmouseleave = canvas.ontouchend = canvas.ontouchmove = null;
      } else {
        //else allow drawing...
        //for PC
        canvas.onmousedown = e => {
          onInteractionStart(e);
          canvas.onmousemove = onMove;
          return false;
        };

        //for mobile
        canvas.ontouchstart = e => {
          //only 1 touch...
          if (e.touches.length > 1) {
            canvas.ontouchmove = null;
            return;
          } else {
            onInteractionStart(e);
            canvas.ontouchmove = onMove;
          }
          return false;
        };
      }

      if (x == undefined || y == undefined) {
        clearInterval(timer);
        return;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    }, 10);
  };
}