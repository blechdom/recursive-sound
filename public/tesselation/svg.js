import { mul } from "./tactile.js";

function saveSVG(p5c, tile_shape, tiling, tiling_T, COLS, bx)
{
  'use strict';
  const xmlns = "http://www.w3.org/2000/svg";
  const svgElement = getTilingSVG( xmlns, tile_shape, tiling, tiling_T, COLS, bx );
  const s = new XMLSerializer();
  const svgFile = s.serializeToString( svgElement ).split( '\n' );
  p5c.save( svgFile, "tiling", "svg" );
}

function getTilingSVG( namespace, tile_shape, tiling, tiling_T, COLS, bx )
{
  let svgElement = document.createElementNS( namespace,'svg' );
  svgElement.setAttribute( 'xmlns:xlink','http://www.w3.org/1999/xlink' );
  svgElement.setAttribute( 'height', window.innerHeight );
  svgElement.setAttribute( 'width', window.innerWidth );

  let tileSVG = getTileShapeSVG( namespace, tile_shape );
  svgElement.appendChild( tileSVG );

  //const bx = getTilingRect();

  for ( let i of tiling.fillRegionQuad( bx[0], bx[1], bx[2], bx[3] ) ) {
    const T = mul( tiling_T, i.T );
    const svg_T = [ T[0], T[3], T[1], T[4], T[2], T[5] ].map( t => +t.toFixed(3) );

    const col = COLS[ tiling.getColour( i.t1, i.t2, i.aspect ) + 1 ];

    let tile = document.createElementNS( namespace, 'use' );
    tile.setAttribute( 'xlink:href', '#tile-shape' );
    tile.setAttribute( 'fill', `rgb(${col[0]},${col[1]},${col[2]})` );
    tile.setAttribute( 'transform', `matrix(${svg_T})` );
    svgElement.appendChild( tile );
  }

  return svgElement;
}

function getTileShapeSVG( namespace, tile_shape )
	{
    'use strict';
		let defs = document.createElementNS( namespace, 'defs' );
		let symbol = document.createElementNS( namespace, 'symbol' );
		let polygon = document.createElementNS( namespace, 'polygon' );

		let points = tile_shape.map( v => `${+v.x.toFixed(3)},${+v.y.toFixed(3)}` );

		polygon.setAttribute( 'points', points.join(' ') );
		polygon.setAttribute( 'stroke', 'black' );
		polygon.setAttribute( 'vector-effect', 'non-scaling-stroke' );

		symbol.setAttribute( 'id', 'tile-shape' );
		symbol.setAttribute( 'overflow', 'visible' );
		symbol.appendChild( polygon );
		defs.appendChild( symbol );

		return defs;
	}

export {
  saveSVG
};