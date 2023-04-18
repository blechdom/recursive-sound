function drawInterface(
  p5c,
  tilingTypes,
  the_type,
  prev_box,
  next_box,
  phys_unit,
  edit_button_box,
  save_button_box,
  navigator_box,
  minX_nav_box,
  minX_prev_box,
  minX_next_box,
  maxX_nav_box,
  maxX_prev_box,
  maxX_next_box,
  minY_nav_box,
  minY_prev_box,
  minY_next_box,
  maxY_nav_box,
  maxY_prev_box,
  maxY_next_box,
  bxMinX,
	bxMaxX,
	bxMinY,
	bxMaxY
) {
  "use strict";
  drawIcon( p5c, drawEditIcon, edit_button_box );
  drawIcon( p5c, drawSaveIcon, save_button_box );
  drawTileTypeInput(p5c, tilingTypes, the_type, prev_box, next_box, phys_unit, navigator_box, "IH", 0.75, 1);
  drawTileTypeInput(p5c, [], bxMinX, minX_prev_box, minX_next_box, phys_unit, minX_nav_box, "x-min", 0.3, 2);
  drawTileTypeInput(p5c, [], bxMaxX, maxX_prev_box, maxX_next_box, phys_unit, maxX_nav_box, "x-max", 0.3, 2);
  drawTileTypeInput(p5c, [], bxMinY, minY_prev_box, minY_next_box, phys_unit, minY_nav_box, "y-min", 0.3, 2);
  drawTileTypeInput(p5c, [], bxMaxY, maxY_prev_box, maxY_next_box, phys_unit, maxY_nav_box, "y-max", 0.3, 2);
}

function drawTileTypeInput(p5c, list, iterator, prev_box, next_box, phys_unit, navigator_box, label, textSize, offset) {
  "use strict";
  p5c.fill( 252, 255, 254, 220 );
  p5c.stroke( 0 );
  p5c.strokeWeight( 2 );
  p5c.rect( navigator_box.x, navigator_box.y,
    navigator_box.w, navigator_box.h, 5 );

  const value = (list.length > 0) ? list[ iterator ] : iterator;
  const name = `${label}: ${value}`;
  p5c.textAlign( p5c.CENTER );
  p5c.textSize( textSize * phys_unit );
  p5c.fill( 0 );
  p5c.noStroke();
  p5c.text( name, navigator_box.x + 0.5*navigator_box.w,
    navigator_box.y + (textSize*navigator_box.h*offset) );

  if (list.length > 0){
    p5c.fill( (iterator > 0) ? 0 : 200 );
    drawIcon( p5c, () => p5c.triangle( 35, 100, 165, 30, 165, 170 ), prev_box );
    p5c.fill( (iterator < 80) ? 0 : 200 );
    drawIcon( p5c, () => p5c.triangle( 165, 100, 35, 30, 35, 170 ), next_box );
  }
  else {
    drawIcon( p5c, () => p5c.triangle( 35, 100, 165, 30, 165, 170 ), prev_box );
    drawIcon( p5c, () => p5c.triangle( 165, 100, 35, 30, 35, 170 ), next_box );
  }
}

function drawIcon( p5c, drf, B )
{
  "use strict";
  p5c.push();
  p5c.translate( B.x, B.y + B.h );
  p5c.scale( B.w / 200.0 );
  p5c.scale( 1.0, -1.0 );
  drf(p5c);
  p5c.pop();
}

function drawSaveIcon(p5c)
{
  "use strict";
  drawIconBackground(p5c);

  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 133.75, 161.5 );
  p5c.vertex( 51.25, 161.5 );
  p5c.bezierVertex( 43.6172, 161.5, 37.5, 155.313, 37.5, 147.75 );
  p5c.vertex( 37.5, 51.5 );
  p5c.bezierVertex( 37.5, 43.9375, 43.6172, 37.75, 51.25, 37.75 );
  p5c.vertex( 147.5, 37.75 );
  p5c.bezierVertex( 155.063, 37.75, 161.25, 43.9375, 161.25, 51.5 );
  p5c.vertex( 161.25, 134.0 );
  p5c.beginContour();
  p5c.vertex( 99.375, 51.5 );
  p5c.bezierVertex( 87.9609, 51.5, 78.75, 60.7109, 78.75, 72.125 );
  p5c.bezierVertex( 78.75, 83.5391, 87.9609, 92.75, 99.375, 92.75 );
  p5c.bezierVertex( 110.789, 92.75, 120.0, 83.5391, 120.0, 72.125 );
  p5c.bezierVertex( 120.0, 60.7109, 110.789, 51.5, 99.375, 51.5 );
  p5c.endContour();
  p5c.beginContour();
  p5c.vertex( 120.0, 120.25 );
  p5c.vertex( 51.25, 120.25 );
  p5c.vertex( 51.25, 147.75 );
  p5c.vertex( 120.0, 147.75 );
  p5c.endContour();
  p5c.endShape( p5c.CLOSE );

  drawIconOutline(p5c);
}

function drawEditIcon(p5c)
{
  "use strict";
  drawIconBackground(p5c);

  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 119.539, 148.27 );
  p5c.vertex( 82.0313, 109.57 );
  p5c.bezierVertex( 87.8008, 103.59, 93.8594, 97.9297, 99.0508, 91.5508 );
  p5c.vertex( 132.051, 125.602 );
  p5c.bezierVertex( 132.93, 126.512, 134.648, 126.281, 135.898, 125.09 );
  p5c.vertex( 136.301, 124.711 );
  p5c.bezierVertex( 137.551, 123.52, 137.852, 121.82, 136.969, 120.91 );
  p5c.vertex( 103.16, 86.0313 );
  p5c.bezierVertex( 104.309, 84.3086, 105.391, 82.5195, 106.371, 80.6484 );
  p5c.vertex( 146.738, 122.301 );
  p5c.vertex( 119.539, 148.27 );
  p5c.endShape( p5c.CLOSE );
  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 79.6211, 61.7383 );
  p5c.bezierVertex( 78.7383, 60.8281, 77.0117, 61.0586, 75.7695, 62.25 );
  p5c.vertex( 75.3711, 62.6289 );
  p5c.bezierVertex( 74.1211, 63.8203, 73.8203, 65.5195, 74.6992, 66.4297 );
  p5c.vertex( 112.578, 105.512 );
  p5c.bezierVertex( 107.738, 112.25, 102.48, 118.711, 95.75, 123.73 );
  p5c.vertex( 51.0586, 77.6289 );
  p5c.vertex( 78.2617, 51.6484 );
  p5c.vertex( 120.059, 94.7813 );
  p5c.bezierVertex( 118.891, 96.4609, 117.719, 98.1484, 116.539, 99.8516 );
  p5c.vertex( 79.6211, 61.7383 );
  p5c.endShape( p5c.CLOSE );
  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 151.391, 127.102 );
  p5c.vertex( 124.191, 153.078 );
  p5c.vertex( 131.961, 161.102 );
  p5c.bezierVertex( 136.391, 165.672, 145.07, 164.512, 151.359, 158.512 );
  p5c.vertex( 155.801, 154.27 );
  p5c.bezierVertex( 162.078, 148.27, 163.59, 139.699, 159.16, 135.129 );
  p5c.vertex( 151.391, 127.102 );
  p5c.endShape( p5c.CLOSE );
  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 37.6016, 41.3789 );
  p5c.vertex( 46.4102, 72.8203 );
  p5c.vertex( 60.0117, 59.8281 );
  p5c.vertex( 73.6094, 46.8398 );
  p5c.vertex( 42.3008, 36.8906 );
  p5c.bezierVertex( 39.9609, 36.1484, 36.9414, 39.0313, 37.6016, 41.3789 );
  p5c.endShape( p5c.CLOSE );

  drawIconOutline(p5c);
}

function drawIconBackground(p5c)
{
  "use strict";
  p5c.fill( 252, 255, 254, 220 );
  p5c.beginShape();
  p5c.vertex( 180.0, 7.94141 );
  p5c.vertex( 19.2188, 7.94141 );
  p5c.bezierVertex( 12.6211, 7.94141, 7.21875, 13.3398, 7.21875, 19.9414 );
  p5c.vertex( 7.21875, 180.73 );
  p5c.bezierVertex( 7.21875, 187.328, 12.6211, 192.73, 19.2188, 192.73 );
  p5c.vertex( 180.0, 192.73 );
  p5c.bezierVertex( 186.602, 192.73, 192.0, 187.328, 192.0, 180.73 );
  p5c.vertex( 192.0, 19.9414 );
  p5c.bezierVertex( 192.0, 13.3398, 186.602, 7.94141, 180.0, 7.94141 );
  p5c.endShape( p5c.CLOSE );
}

function drawIconOutline(p5c)
{
  "use strict";
  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 85.75, 15.2109 );
  p5c.vertex( 177.18, 15.2109 );
  p5c.bezierVertex( 181.371, 15.2109, 184.789, 18.6211, 184.789, 22.8203 );
  p5c.vertex( 184.789, 177.18 );
  p5c.bezierVertex( 184.789, 181.371, 181.379, 184.789, 177.18, 184.789 );
  p5c.vertex( 84.4453, 184.789 );
  p5c.vertex( 84.4453, 200.0 );
  p5c.vertex( 177.18, 200.0 );
  p5c.bezierVertex( 189.762, 200.0, 200.0, 189.762, 200.0, 177.18 );
  p5c.vertex( 200.0, 22.8203 );
  p5c.bezierVertex( 200.0, 10.2383, 189.762, 0.0, 177.18, 0.0 );
  p5c.vertex( 84.0117, 0.0 );
  p5c.vertex( 85.75, 15.2109 );
  p5c.endShape( p5c.CLOSE );
  p5c.fill( 0, 0, 0 );
  p5c.beginShape();
  p5c.vertex( 114.25, 184.789 );
  p5c.vertex( 22.8203, 184.789 );
  p5c.bezierVertex( 18.6289, 184.789, 15.2109, 181.379, 15.2109, 177.18 );
  p5c.vertex( 15.2109, 22.8203 );
  p5c.bezierVertex( 15.2109, 18.6289, 18.6211, 15.2109, 22.8203, 15.2109 );
  p5c.vertex( 115.555, 15.2109 );
  p5c.vertex( 115.555, 0.0 );
  p5c.vertex( 22.8203, 0.0 );
  p5c.bezierVertex( 10.2383, 0.0, 0.0, 10.2383, 0.0, 22.8203 );
  p5c.vertex( 0.0, 177.18 );
  p5c.bezierVertex( 0.0, 189.762, 10.2383, 200.0, 22.8203, 200.0 );
  p5c.vertex( 115.988, 200.0 );
  p5c.vertex( 114.25, 184.789 );
  p5c.endShape( p5c.CLOSE );
}

export {
  drawInterface,
};