import simplify from "simplify-js";

export class MarchingSquares {
  constructor(context, args = {}) {
    this.ctx = context;
    this.inputValues = args.inputValues;
    this.tolerance = args.tolerance || 0;
    this.cx = args.cx;
    this.cy = args.cy;
    this.contour = [];
    this.contourX = [];
    this.contourY = [];
    this.soundControlList = [];
    this.startingPoint = {
      x: 0,
      y: Math.floor(this.inputValues?.length / 2)
    };

    this.generateContour = (() => {
      try {
        let tracePoint = this.startingPoint;
        let whileFlag = false;

        while (!whileFlag) {

          const {nextPoint, pointToWrite} = this.traceContour(tracePoint.x, tracePoint.y);

          if (!nextPoint || (nextPoint.y > this.inputValues.length - 1 || nextPoint.x > this.inputValues[0].length - 1 || nextPoint.x < 0 || nextPoint.y < 0)) whileFlag = true;
          if (JSON.stringify(pointToWrite) === JSON.stringify(this.contour[0])) whileFlag = true;
          if (!whileFlag) {
            if (pointToWrite !== null) {
              this.contour.push(pointToWrite);
              let newX = (pointToWrite.x / (this.inputValues[0].length / 2)) - 1.0;
              this.contourX.push(newX);
              let newY = (pointToWrite.y / (this.inputValues.length / 2)) - 1.0;
              this.contourY.push(newY);
            }
            tracePoint = nextPoint;
          }
        }
        let simplifiedX = [];
        let simplifiedY = [];
        const simplified = simplify(this.contour, this.tolerance, true);

        simplified.forEach((point, index) => {
          simplifiedX.push((point.x / (this.inputValues[0].length / 2)) - 1.0);
          simplifiedY.push((point.y / (this.inputValues.length / 2)) - 1.0);
        });

        let audioContext = new AudioContext();
        let audioBuffer = audioContext.createBuffer(2, simplified.length, 44100);
        let xArray = audioBuffer.getChannelData(0);
        let yArray = audioBuffer.getChannelData(1);
        for (let i = 0; i < simplifiedX.length; i++) {
          xArray[i] = simplifiedX[i];
          yArray[i] = simplifiedY[i];
        }

        let src = audioContext.createBufferSource();
        src.buffer = audioBuffer;

        if (this.ctx) this.drawContour(this.ctx, simplified);

        //make_download(src.buffer, 44100 * audioBuffer.duration, this.cx, this.cy, this.inputValues.length, this.tolerance);

      } catch (err) {
        console.log('error: ', err);
        console.log("current contour: ", this.contour);
        console.log("current contour length: ", this.contour.length);
      }
    });

    this.ctx?.clearRect(0, 0, this.inputValues.length, this.inputValues.length);
    this.generateContour();
  }

  line(ctx, from, to) {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  }

  calcLength(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  calcDir(a, b, c) {
    return (Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x));
  }

  drawContour(ctx, pointList) {
    let controlList = [];
    ctx.beginPath();
    ctx.lineWidth = 1;
    pointList.forEach((point, index) => {
      let a, c;
      let b = point;
      if (index === 0) {
        a = pointList[pointList.length - 1];
        c = pointList[1];
      } else if (index < pointList.length - 1) {
        a = pointList[index - 1];
        c = pointList[index + 1];
      } else if (index === pointList.length - 1) {
        a = pointList[pointList.length - 2];
        c = pointList[0];
      }
      const radians = this.calcDir(a, b, c);
      const angle = 180 / Math.PI * (radians < 0 ? radians + (2 * Math.PI) : radians);
      controlList.push({angle, duration: this.calcLength(b, c)});
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
      this.line(ctx, b, c);
      ctx.stroke();
    });
    this.soundControlList = controlList;
  }

  traceContour(x, y) {

    /*
          A
       o --- o
    D  |     |  B
       o --- o
          C
     */

    let nw = this.inputValues[y][x];
    let ne = this.inputValues[y][x + 1];
    let se = this.inputValues[y + 1][x + 1];
    let sw = this.inputValues[y + 1][x];

    let a = {x: x + 0.5, y: y - 1};
    let b = {x: x + 1, y: y - 0.5};
    let c = {x: x + 0.5, y};
    let d = {x, y: y - 0.5};

    let up = {x, y: y - 1};
    let down = {x, y: y + 1};
    let left = {x: x - 1, y};
    let right = {x: x + 1, y};

    let squareType = binaryToType(   // nw, ne, se, sw
      nw === 0,
      ne === 0,
      se === 0,
      sw === 0
    );

    let pointToWrite = null;
    let nextPoint = null;

    switch (squareType) {
      case 0: // right but don't write, looking for a boundary
        nextPoint = right;
        break;
      case 1: // DOWN: 	D -> C
              //this.line(d, c);
        pointToWrite = c;
        nextPoint = down;
        break;
      case 2: // RIGHT: 	C -> B
              //this.line(c, b);
        pointToWrite = b;
        nextPoint = right;
        break;
      case 3: // RIGHT: 	D -> B
              //this.line(d, b);
        pointToWrite = b;
        nextPoint = right;
        break;
      case 4: // UP:			B -> A
              //this.line(b, a);
        pointToWrite = a;
        nextPoint = up;
        break;
      case 5: /* if (lastCoord === thisCoord.D)
											then	UP: 	D -> A
											else 	DOWN: B -> C		(lastCoord === thisCoord.B)
								*/
        //	console.log("CASE 5: previous point: ", this.contour[this.contour.length-1]);
        //	console.log("CASE 5: current d: ", d);
        //	console.log("CASE 5: current b: ", b);
        if (JSON.stringify(this.contour[this.contour.length - 1]) === JSON.stringify(d)) {
          //this.line(d, a);
          pointToWrite = a;
          nextPoint = up;
        } else if (JSON.stringify(this.contour[this.contour.length - 1]) === JSON.stringify(b)) {
          //this.line(b, c);
          pointToWrite = c;
          nextPoint = down;
        }
        break;
      case 6: // UP:			C -> A
              //this.line(c, a);
        pointToWrite = a;
        nextPoint = up;
        break;
      case 7: // UP:			D -> A
              //this.line(d, a);
        pointToWrite = a;
        nextPoint = up;
        break;
      case 8: // LEFT:	  A -> D
              //this.line(a, d);
        pointToWrite = d;
        nextPoint = left;
        break;
      case 9: // DOWN:		A -> C
              //this.line(a, c);
        pointToWrite = c;
        nextPoint = down;
        break;
      case 10: /* if (lastCoord === thisCoord.C)
											then 	LEFT:		C -> D
											else 	RIGHT:	A -> B	  (lastCoord === thisCoord.A)
								*/
        //	console.log("CASE 10: previous point: ", this.contour[this.contour.length-1]);
        //	console.log("CASE 10: current c: ", c);
        //	console.log("CASE 10: current a: ", a);
        if (JSON.stringify(this.contour[this.contour.length - 1]) === JSON.stringify(c)) {
          //this.line(c, d);
          pointToWrite = d;
          nextPoint = left;
        } else if (JSON.stringify(this.contour[this.contour.length - 1]) === JSON.stringify(a)) {
          //this.line(a, b);
          pointToWrite = b;
          nextPoint = right;
        }
        break;
      case 11: // RIGHT:	A -> B
        //this.line(a, b);
        pointToWrite = b;
        nextPoint = right;
        break;
      case 12: // LEFT:	B -> D
        //this.line(b, d);
        pointToWrite = d;
        nextPoint = left;
        break;
      case 13: // DOWN:	B -> C
        // this.line(b, c);
        pointToWrite = c;
        nextPoint = down;
        break;
      case 14: // LEFT:	C -> D
        // this.line(c, d);
        pointToWrite = d;
        nextPoint = left;
        break;
      case 15: // shouldn't happen...
        console.log('error, case 15 happened');
        break;
      default:
        break;
    }
    return {
      nextPoint,
      pointToWrite
    }
  }
}

function binaryToType(nw, ne, se, sw) {
  let a = [nw, ne, se, sw];
  return a.reduce((res, x) => (res << 1) | x);
}

function bufferToWave(abuffer, len) {
  let numOfChan = abuffer.numberOfChannels;
  let length = len * numOfChan * 2 + 44;
  let buffer = new ArrayBuffer(length);
  let view = new DataView(buffer);
  let channels = [], i, sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length && offset < len) {
    for (i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++                                     // next source sample
  }

  // create Blob
  return new Blob([buffer], {type: "audio/wav"});

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

function make_download(abuffer, total_samples, cx, cy, size, tolerance) {
  try {
    let new_file = URL.createObjectURL(bufferToWave(abuffer, total_samples));
    let download_link = document.getElementById("download_link");
    download_link.href = new_file;
    download_link.download = 'julia-contour-cx_' + cx + '_cy_' + cy + '_size_' + size + '_tolerance_' + tolerance + '.wav';
  } catch (err) {
    console.log('error: ', err);
  }
}