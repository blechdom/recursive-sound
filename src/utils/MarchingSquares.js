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

          if (!nextPoint || (nextPoint.y > this.inputValues.length || nextPoint.x > this.inputValues[0].length || nextPoint.x < 0 || nextPoint.y < 0)) whileFlag = true;
          if (JSON.stringify(pointToWrite) === JSON.stringify(this.contour[0])) whileFlag = true;
          if (pointToWrite !== null) {
            this.contour.push(pointToWrite);
            let newX = (pointToWrite.x / (this.inputValues[0].length / 2)) - 1.0;
            this.contourX.push(newX);
            let newY = (pointToWrite.y / (this.inputValues.length / 2)) - 1.0;
            this.contourY.push(newY);
          }
          tracePoint = nextPoint;
        }

      } catch (err) {
        console.log('error: ', err);
        console.log("current contour: ", this.contour);
        console.log("current contour length: ", this.contour.length);
      }

      let audioContext = new AudioContext();
      let audioBuffer = audioContext.createBuffer(2, this.contourX.length, 44100);
      let xArray = audioBuffer.getChannelData(0);
      let yArray = audioBuffer.getChannelData(1);
      for (let i = 0; i < this.contourX.length; i++) {
        xArray[i] = this.contourX[i];
        yArray[i] = this.contourY[i];
      }

      let src = audioContext.createBufferSource();
      src.buffer = audioBuffer;

      //console.log('contour: ', JSON.stringify(this.contour.length));
      // this.drawContour(this.contour, "red");
      const simplified = simplify(this.contour, this.tolerance, true);
      const directionList = this.calculateDirectionList(simplified);
      console.log("directionList ", directionList);
      console.log('redrawing with tolerance', this.tolerance);
      //this.ctx?.clearRect(0, 0, this.inputValues.length, this.inputValues.length);
      if (this.ctx) this.drawContour(this.ctx, simplified, "blue");


      console.log('simplified contour length: ', simplified.length);
      console.log('stereo data audio buffer: ', src.buffer);

      make_download(src.buffer, 44100 * audioBuffer.duration, this.cx, this.cy, this.inputValues.length);

    });

    console.log(
      "initialized MarchingSquares class for",
      args
    );
    this.ctx?.clearRect(0, 0, this.inputValues.length, this.inputValues.length);
    this.generateContour();
  }

  line(ctx, from, to) {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    // const vert = to.x - from.x;
    // const slope = vert !== 0 ? (to.y - from.y) / vert : undefined;
    // console.log('slope: ', slope);
    //  if (this.ctx) this.ctx.strokeStyle = "blue";
  }

  calculateDirectionList(coords) {
    let directions = [];
    coords.forEach((coord, index) => {
      if (index < coords.length - 2) {
        directions.push(this.calcDir(coord, coords[index + 1], coords[index + 2]));
      } else if (index === coords.length - 2) {
        directions.push(this.calcDir(coord, coords[index + 1], coords[0]));
      } else if (index === coords.length - 1) {
        directions.push(this.calcDir(coord, coords[0], coords[1]));
      }
    });
    return directions;
  }

  calcDir(p0, p1, p2) {
    return (Math.atan2(p2.y - p0.y, p2.x - p0.x) - Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
  }

  drawContour(ctx, pointList, color) {
    //this.ctx?.clearRect(0, 0, this.inputValues.length, this.inputValues.length);
    ctx.beginPath();
    ctx.lineWidth = 1;
    //ctx.strokeStyle = color;
    console.log('pointList: ', pointList.length);
    pointList.forEach((point, index) => {
      if (index < pointList.length - 2) {
        let shade = 0;
        const rawShade = this.calcDir(point, pointList[index + 1], pointList[index + 2]);
        console.log('shade: ', rawShade);
        if (rawShade < 0) {
          shade = rawShade / 2 + 180;
        } else {
          shade = rawShade / 2;
        }
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsl(${shade}, 100%, 50%)`;
        this.line(ctx, point, pointList[index + 1]);
      } else if (index === pointList.length - 1) this.line(ctx, point, pointList[0]);
      ctx.stroke();
    });

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

function make_download(abuffer, total_samples, cx, cy, size) {
  let new_file = URL.createObjectURL(bufferToWave(abuffer, total_samples));
  let download_link = document.getElementById("download_link");
  download_link.href = new_file;
  download_link.download = 'julia-contour-cx_' + cx + '_cy_' + cy + '_size_' + size + '.wav';
}