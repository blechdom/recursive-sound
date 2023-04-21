/*
 * Tactile-JS
 * Copyright 2018 Craig S. Kaplan, csk@uwaterloo.ca
 *
 * Distributed under the terms of the 3-clause BSD license.  See the
 * file "LICENSE" for more information.
 */

import { mul, matchSeg, EdgeShape, numTypes, tilingTypes, IsohedralTiling } from './tactile.js';
import { drawInterface } from "./interface.js";
import { saveSVG } from './svg.js';
import { playAudio, updateAudioVolume, updateAudioPitchRange } from "./audio.js";

let sktch = function( p5c )
{
	let the_type = null;
	let bxMinX = -2;
	let bxMaxX = 3;
	let bxMinY = -2;
	let bxMaxY = 3;
	let params = null;
	let aParams = [0, 0, 0, 0]; // volume [volume] for now
	let tiling = null;
	let edges = null;
	let tile_shape = null;

	let phys_unit = 60; // Ideally, about a centimeter
	let edit_button_box = null;
	let save_button_box = null;
	let prev_box = null;
	let next_box = null;
	let navigator_box = null;
	let minX_nav_box = null;
	let minX_prev_box = null;
	let minX_next_box = null;
	let maxX_nav_box = null;
	let maxX_prev_box = null;
	let maxX_next_box = null;
	let minY_nav_box = null;
	let minY_prev_box = null;
	let minY_next_box = null;
	let maxY_nav_box = null;
	let maxY_prev_box = null;
	let maxY_next_box = null;
	let edit_box = null;
	let slide_w = null;
	let slide_h = null;

	let audioSliderBox1 = null;
	let volume = 0;

	const Mode = {
		NONE : 0,
		MOVE_VERTEX : 1,
		ADJ_TILE : 2,
		ADJ_TV : 3,
		ADJ_TILING : 4,
		AUDIO: 5,
	};

	let tiling_T = null;
	let tiling_iT = null;

	let tiling_T_down = null;

	let mode = Mode.NONE;
	let drag_tv = null;
	let drag_tv_offs = null;

	let drag_audio = null;
	let drag_audio_offs = null;

	let editor_T;
	let editor_T_down;
	let drag_edge_shape = -1;
	let drag_vertex = -1;
	let drag_T = null;
	let u_constrain = false;

	let down_motion = null;
	let delete_timer = null;

	let editor_pane = null;
	let show_controls = false;

	let msgs = [];

	const COLS = [
		[ 25, 52, 65 ],
		[ 62, 96, 111 ],
		[ 145, 170, 157 ],
		[ 209, 219, 189 ],
		[ 252, 255, 245 ],
		[ 219, 188, 209 ] ];

	let bx = [
		{x: bxMinX, y: bxMinY},
		{x: bxMaxX, y: bxMinY},
		{x: bxMaxX, y: bxMaxY},
		{x: bxMinX, y: bxMaxY},
	];

	function sub( V, W ) { return { x: V.x-W.x, y: V.y-W.y }; }
	function dot( V, W ) { return V.x*W.x + V.y*W.y; }
	function len( V ) { return Math.sqrt( dot( V, V ) ); }
	function ptdist( V, W ) { return len( sub( V, W ) ); }
	function inv( T ) {
		const det = T[0]*T[4] - T[1]*T[3];
		return [T[4]/det, -T[1]/det, (T[1]*T[5]-T[2]*T[4])/det,
			-T[3]/det, T[0]/det, (T[2]*T[3]-T[0]*T[5])/det];
	}

	function makeBox( x, y, w, h )
	{
		return { x: x, y: y, w: w, h: h };
	}

	function hitBox( x, y, B )
	{
		return (x >= B.x) && (x <= (B.x+B.w)) && (y >= B.y) && (y <= (B.y+B.h));
	}

	let fake_serial = 123456;
	let all_touch_ids = [];
	let my_touches = {};
	let num_touches = 0;
	let max_touches = 1;

	function addTouch( x, y, id )
	{
		if( num_touches < max_touches ) {
			my_touches[id] = {
				down: { x: x, y: y },
				prev: { x: x, y: y },
				pos: { x: x, y: y },
				id: id,
				t: p5c.millis() };
			++num_touches;
			doTouchStarted( id);
		}
	}

	p5c.touchStarted = function() {
		if( p5c.touches.length === 0 ) {
			addTouch( p5c.mouseX, p5c.mouseY, fake_serial );
			++fake_serial;
		} else {
			all_touch_ids = [];
			for( let tch of p5c.touches ) {
				all_touch_ids.push( tch.id );

				if( !(tch.id in my_touches) ) {
					addTouch( tch.x, tch.y, tch.id );
				}
			}
		}
		return false;
	};

	p5c.touchMoved = function() {
		if( num_touches > 0 ) {
			if( p5c.touches.length === 0 ) {
				for( let k in my_touches ) {
					let tch = my_touches[k];

					tch.prev = tch.pos;
					tch.pos = { x: p5c.mouseX, y: p5c.mouseY };
				}
			} else {
				for( let tch of p5c.touches ) {
					if( tch.id in my_touches ) {
						let atch = my_touches[ tch.id ];
						atch.prev = atch.pos;
						atch.pos = { x: tch.x, y: tch.y };
					}
				}
			}

			doTouchMoved();
		}
		return false;
	};

	p5c.touchEnded = function() {

		let new_ids = [];

		for( let k in my_touches ) {
			my_touches[k].present = false;
		}

		for( let tch of p5c.touches ) {
			const id = tch.id;
			new_ids.push( id );
			if( id in my_touches ) {
				my_touches[id].present = true;
			}
		}

		for( let k in my_touches ) {
			if( !my_touches[k].present ) {
				// This one is going away.
				doTouchEnded( k );
				delete my_touches[ k ];
				--num_touches;
			}
		}

		u_constrain = false;

		return false;
	};

	function drawEditor()
	{
		let pg = editor_pane;
		pg.clear();

		pg.fill( 252, 255, 254, 120 );
		//pg.noStroke();

		pg.strokeWeight( 2.0 );
		pg.fill( COLS[3][1], COLS[3][2], COLS[3][0] );

		pg.beginShape();
		for( let v of tile_shape ) {
			const P = mul( editor_T, v );
			pg.vertex( P.x, P.y );
		}
		pg.endShape( p5c.CLOSE );

		pg.noFill();

		// Draw edges
		for( let i of tiling.parts() ) {
			if( i.shape === EdgeShape.I ) {
				pg.stroke( 158 );
			} else {
				pg.stroke( 0 );
			}

			const M = mul( editor_T, i.T );
			pg.beginShape();
			for( let v of edges[i.id] ) {
				const P = mul( M, v );
				pg.vertex( P.x, P.y );
			}
			pg.endShape();
		}

		// Draw tiling vertices
		pg.noStroke();
		pg.fill( 158 );
		for( let v of tiling.vertices() ) {
			const pt = mul( editor_T, v );
			pg.ellipse( pt.x, pt.y, 10.0, 10.0 );
		}

		// Draw editable vertices
		for( let i of tiling.parts() ) {
			const shp = i.shape;
			const id = i.id;
			const ej = edges[id];
			const T = mul( editor_T, i.T );

			for( let idx = 1; idx < ej.length - 1; ++idx ) {
				pg.fill( 0 );
				const pt = mul( T, ej[idx] );
				pg.ellipse( pt.x, pt.y, 10.0, 10.0 );
			}

			if( shp === EdgeShape.I || shp === EdgeShape.J ) {
				continue;
			}

			// Draw symmetry points for U and S edges.
			if( !i.second ) {
				if( shp === EdgeShape.U ) {
					pg.fill( COLS[2][0], COLS[2][1], COLS[2][2] );
				} else {
					pg.fill( COLS[5][0], COLS[5][1], COLS[5][2] );
				}
				const pt = mul( T, ej[ej.length-1] );
				pg.ellipse( pt.x, pt.y, 10.0, 10.0 );
			}
		}

		// Draw sliders
		const params = tiling.getParameters();
		let yy = 25;
		const xx = edit_box.w - 25 - slide_w;
		pg.textSize( slide_h * 0.75 );

		for( let i = 0; i < params.length; ++i ) {
			pg.fill( 200 );
			pg.stroke( 60 );
			pg.strokeWeight( 0.5 );
			pg.rect( xx, yy, slide_w, slide_h );

			pg.fill( 60 );
			pg.noStroke();
			pg.rect( p5c.map( params[i],
				0, 2, xx, xx+slide_w-slide_h ), yy, slide_h, slide_h );

			pg.text( "v" + i, xx - slide_h, yy + slide_h * 0.75 );

			yy += slide_h + 10;
		}

		for( let i = 0; i < aParams.length; ++i ) {
			pg.fill( 200 );
			pg.stroke( 60 );
			pg.strokeWeight( 0.5 );
			pg.rect( xx, yy, slide_w, slide_h );

			pg.fill( 60 );
			pg.noStroke();
			pg.rect( p5c.map( aParams[i],
				0, 1, xx, xx+slide_w-slide_h ), yy, slide_h, slide_h );

			pg.text( "a" + i, xx - slide_h, yy + slide_h * 0.75 );

			yy += slide_h + 10;
		}

		p5c.image( pg, edit_box.x, edit_box.y );

		p5c.strokeWeight( 2.0 );
		p5c.stroke( 25, 52, 65, 220 );
		p5c.noFill();
		p5c.rect( edit_box.x, edit_box.y, edit_box.w, edit_box.h );
	}

	function cacheTileShape()
	{
		tile_shape = [];

		for( let i of tiling.parts() ) {
			const ej = edges[i.id];
			let cur = i.rev ? (ej.length-2) : 1;
			const inc = i.rev ? -1 : 1;

			for( let idx = 0; idx < ej.length - 1; ++idx ) {
				tile_shape.push( mul( i.T, ej[cur] ) );
				cur += inc;
			}
		}
	}

	function setTilingType()
	{
		const tp = tilingTypes[ the_type ];
		tiling.reset( tp );
		params = tiling.getParameters();

		edges = [];
		for( let idx = 0; idx < tiling.numEdgeShapes(); ++idx ) {
			let ej = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
			edges.push( ej );
		}

		cacheTileShape();
		calcEditorTransform();
	}

	function nextTilingType()
	{
		if( the_type < (numTypes-1) ) {
			the_type++;
			setTilingType();
		}
	}

	function prevTilingType()
	{
		if( the_type > 0 ) {
			the_type--;
			setTilingType();
		}
	}

	function setBx()
	{
		bx = [
			{x: bxMinX, y: bxMinY},
			{x: bxMaxX, y: bxMinY},
			{x: bxMaxX, y: bxMaxY},
			{x: bxMinX, y: bxMaxY},
		];
	}

	function setupInterface()
	{
		let w = window.innerWidth;
		let h = window.innerHeight;

		// Any way to fix this for different devices?
		phys_unit = 60;

		edit_button_box = makeBox(
			0.25 * phys_unit, 0.25 * phys_unit, phys_unit, phys_unit );
		save_button_box = makeBox(
			1.5 * phys_unit, 0.25 * phys_unit, phys_unit, phys_unit );
		navigator_box = makeBox(
			w - 5.25 * phys_unit, 0.25 * phys_unit, 5 * phys_unit, phys_unit );
		prev_box = makeBox(
			navigator_box.x, navigator_box.y, phys_unit, phys_unit );
		next_box = makeBox(
			navigator_box.x + navigator_box.w - phys_unit, navigator_box.y,
			phys_unit, phys_unit );
		minX_nav_box = makeBox(
			w - 5.25 * phys_unit, navigator_box.y + phys_unit, 5 * phys_unit, phys_unit/2 );
		minX_prev_box = makeBox(
			minX_nav_box.x, minX_nav_box.y, phys_unit/2, phys_unit/2 );
		minX_next_box = makeBox(
			minX_nav_box.x + minX_nav_box.w - phys_unit, minX_nav_box.y,
			phys_unit/2, phys_unit/2 );
		maxX_nav_box = makeBox(
			w - 5.25 * phys_unit, minX_nav_box.y + (phys_unit/2), 5 * phys_unit, phys_unit/2 );
		maxX_prev_box = makeBox(
			maxX_nav_box.x, maxX_nav_box.y, phys_unit/2, phys_unit/2 );
		maxX_next_box = makeBox(
			maxX_nav_box.x + maxX_nav_box.w - phys_unit, maxX_nav_box.y,
			phys_unit/2, phys_unit/2 );
		minY_nav_box = makeBox(
			w - 5.25 * phys_unit, maxX_nav_box.y + (phys_unit/2), 5 * phys_unit, phys_unit/2 );
		minY_prev_box = makeBox(
			minY_nav_box.x, minY_nav_box.y, phys_unit/2, phys_unit/2 );
		minY_next_box = makeBox(
			minY_nav_box.x + minY_nav_box.w - phys_unit, minY_nav_box.y,
			phys_unit/2, phys_unit/2 );
		maxY_nav_box = makeBox(
			w - 5.25 * phys_unit, minY_nav_box.y + (phys_unit/2), 5 * phys_unit, phys_unit/2 );
		maxY_prev_box = makeBox(
			maxY_nav_box.x, maxY_nav_box.y, phys_unit/2, phys_unit/2 );
		maxY_next_box = makeBox(
			maxY_nav_box.x + maxY_nav_box.w - phys_unit, maxY_nav_box.y,
			phys_unit/2, phys_unit/2 );

		edit_box = makeBox(
			0.25*phys_unit, 1.5*phys_unit,
			Math.min( 800, 0.8*w ), Math.min( 600, 0.8*h ) );

		audioSliderBox1 = makeBox(
			w - 5.25 * phys_unit, maxY_nav_box.y + phys_unit, 5 * phys_unit, phys_unit/2 );

		slide_w = 5 * phys_unit;
		slide_h = 0.7 * phys_unit;

		editor_pane = p5c.createGraphics( edit_box.w, edit_box.h );
	}

	function strip(number) {
		return (parseFloat(number).toPrecision(12));
	}

	function drawTiling() {
		console.log("drawTiling");
		p5c.stroke(COLS[0][0], COLS[0][1], COLS[0][2]);
		p5c.strokeWeight(1.0);

		let audioLines = [];
		let audioPYMin = 10000;
		let audioPYMax = 0;

		for (let i of tiling.fillRegionQuad(bx[0], bx[1], bx[2], bx[3])) {
			const TT = i.T;
			const T = mul(tiling_T, TT);

			const col = COLS[tiling.getColour(i.t1, i.t2, i.aspect) + 1];
			p5c.fill(col[0], col[1], col[2]);
			let shape = [];
			p5c.beginShape();
			for (let v of tile_shape) {
				const P = mul(T, v);
				const stripX = strip(P.x);
				const stripY = strip(P.y);
				if(parseFloat(stripY) < parseFloat(audioPYMin)) audioPYMin = parseFloat(stripY);
				if(parseFloat(stripY) > parseFloat(audioPYMax)) audioPYMax = parseFloat(stripY);
				shape.push({x: stripX, y: stripY});
				p5c.vertex(P.x, P.y);
			}

			shape.forEach((line, index) => {
				let start = line;
				let end = index < shape.length - 1 ? shape[index + 1] : shape[0];
				parseFloat(start.x) <= parseFloat(end.x) ? audioLines.push([start, end]) : audioLines.push([end, start]);
			});
			p5c.endShape(p5c.CLOSE);
		}
		// remove duplicates
		const uniqueAudioLines = audioLines.filter((value, index, self) =>
			index === self.findIndex((t) => (
				t[0].x === value[0].x && t[0].y === value[0].y && t[1].x === value[1].x && t[1].y === value[1].y
			))
		)
		//sort audioShapes according to first x value
		uniqueAudioLines.sort((a, b) => a[0].x - b[0].x);

		const xOffset = uniqueAudioLines[0][0].x;
		const scaledAudioLines = uniqueAudioLines.map(line => {

				return [{
					x: line[0].x - xOffset,
					y: (line[0].y - audioPYMin) / (audioPYMax - audioPYMin)
				},
				{
					x: line[1].x - xOffset,
					y: (line[1].y - audioPYMin) / (audioPYMax - audioPYMin)
				}];

		});
		playAudio(scaledAudioLines);
	}

	function calcEditorTransform()
	{
		let xmin = 1e7;
		let xmax = -1e7;
		let ymin = 1e7;
		let ymax = -1e7;

		for( let v of tile_shape ) {
			xmin = Math.min( xmin, v.x );
			xmax = Math.max( xmax, v.x );
			ymin = Math.min( ymin, v.y );
			ymax = Math.max( ymax, v.y );
		}

		const ww = edit_box.w - 5 * phys_unit;

		const sc = Math.min( (ww-50) / (xmax-xmin), (edit_box.h-50) / (ymax-ymin) );

		editor_T = mul(
			[sc, 0, 0.5*ww+25, 0, -sc, 0.5*edit_box.h],
			[1, 0, -0.5*(xmin+xmax), 0, 1, -0.5*(ymin+ymax)] );
	}

	function distToSeg( P, A, B )
	{
		const qmp = sub( B, A );
		const t = dot( sub( P, A ), qmp ) / dot( qmp, qmp );
		if( (t >= 0.0) && (t <= 1.0) ) {
			return len( sub( P, { x: A.x + t*qmp.x, y : A.y + t*qmp.y } ) );
		} else if( t < 0.0 ) {
			return len( sub( P, A ) );
		} else {
			return len( sub( P, B ) );
		}
	}

	function deleteVertex()
	{
		edges[drag_edge_shape].splice( drag_vertex, 1 );
		mode = Mode.NONE;
		cacheTileShape();
		p5c.loop();
	}

	function doTouchStarted( id )
	{
		// First, check if this touch is intended to initiate an
		// instantaneous action.

		if( mode == Mode.NONE ) {
			if( hitBox( p5c.mouseX, p5c.mouseY, edit_button_box ) ) {
				show_controls = !show_controls;
				p5c.loop();
				return false;
			}

			if( hitBox( p5c.mouseX, p5c.mouseY, save_button_box ) ) {
				saveSVG(p5c, tile_shape, tiling, tiling_T, COLS, bx);
				p5c.loop();
				return false;
			}

			if( hitBox( p5c.mouseX, p5c.mouseY, prev_box ) ) {
				prevTilingType();
				p5c.loop();
				return false;
			}

			if( hitBox( p5c.mouseX, p5c.mouseY, next_box ) ) {
				nextTilingType();
				p5c.loop();
				return false;
			}
			if( hitBox( p5c.mouseX, p5c.mouseY, minX_prev_box ) ) {
				bxMinX--;
				setBx();
				p5c.loop();
				return false;
			}
			if( hitBox( p5c.mouseX, p5c.mouseY, minX_next_box ) ) {
				bxMinX++;
				setBx();
				p5c.loop();
				return false;
			}
			if( hitBox( p5c.mouseX, p5c.mouseY, maxX_prev_box ) ) {
				bxMaxX--;
				setBx();
				p5c.loop();
				return false;
			}

			if( hitBox( p5c.mouseX, p5c.mouseY, maxX_next_box ) ) {
				bxMaxX++;
				setBx();
				p5c.loop();
				return false;
			}
			if( hitBox( p5c.mouseX, p5c.mouseY, minY_prev_box ) ) {
				bxMinY--;
				setBx();
				p5c.loop();
				return false;
			}
			if( hitBox( p5c.mouseX, p5c.mouseY, minY_next_box ) ) {
				bxMinY++;
				setBx();
				p5c.loop();
				return false;
			}
			if( hitBox( p5c.mouseX, p5c.mouseY, maxY_prev_box ) ) {
				bxMaxY--;
				setBx();
				p5c.loop();
				return false;
			}

			if( hitBox( p5c.mouseX, p5c.mouseY, maxY_next_box ) ) {
				bxMaxY++;
				setBx();
				p5c.loop();
				return false;
			}
		}

		// If not, we assume that it might be the start of a new gesture.

		if( show_controls ) {
			const pt =
				{ x: p5c.mouseX - edit_box.x, y: p5c.mouseY - edit_box.y };

			if( (pt.x < 0) || (pt.x > edit_box.w) ) {
				return false;
			}
			if( (pt.y < 0) || (pt.y > edit_box.h) ) {
				return false;
			}

			// Check for a sliding gesture on one of the tiling vertex parameter sliders.
			const params = tiling.getParameters();

			let yy = 25;
			const xx = edit_box.w - 25 - slide_w;

			for( let i = 0; i < params.length; ++i ) {
				const x = p5c.map( params[i], 0, 2, xx, xx+slide_w-slide_h );
				if( hitBox( pt.x, pt.y, makeBox( x, yy, slide_h, slide_h ) ) ) {
					mode = Mode.ADJ_TV;
					max_touches = 1;
					drag_tv = i;
					drag_tv_offs = pt.x - x;
					return false;
				}
				yy += slide_h + 10;
			}
			for (let i = 0; i < aParams.length; i++) {
				const x = p5c.map( aParams[i], 0, 1, xx, xx + slide_w - slide_h);
				if (hitBox(pt.x, pt.y, makeBox(x, yy, slide_h, slide_h))) {
					mode = Mode.AUDIO;
					max_touches = 1;
					drag_audio = i;
					drag_audio_offs = pt.x - x;
					return false;
				}
				yy += slide_h + 10;
			}

			// Nothing yet.  OK, try the geometric features of the tiling.
			for( let i of tiling.parts() ) {
				const shp = i.shape;

				// No interaction possible with an I edge.
				if( shp == EdgeShape.I ) {
					continue;
				}

				const id = i.id;
				let ej = edges[id];
				const T = mul( editor_T, i.T );
				let P = mul( T, ej[0] );

				for( let idx = 1; idx < ej.length; ++idx ) {
					let Q = mul( T, ej[idx] );
					if( ptdist( Q, pt ) < 0.5 * phys_unit ) {
						u_constrain = false;
						if( idx == (ej.length-1) ) {
							if( shp == EdgeShape.U && !i.second ) {
								u_constrain = true;
							} else {
								break;
							}
						}

						mode = Mode.MOVE_VERTEX;
						max_touches = 1;
						drag_edge_shape = id;
						drag_vertex = idx;
						drag_T = inv( T );
						down_motion = pt;

						// Set timer for deletion.  But not on a U vertex.
						if( !u_constrain ) {
							delete_timer = setTimeout( deleteVertex, 1000 );
						}

						p5c.loop();
						return false;
					}

					// Check segment
					if( distToSeg( pt, P, Q ) < 20 ) {
						mode = Mode.MOVE_VERTEX;
						max_touches = 1;
						drag_edge_shape = id;
						drag_vertex = idx;
						drag_T = inv( T );
						down_motion = pt;
						// Don't set timer -- can't delete new vertex.

						ej.splice( idx, 0, mul( drag_T, pt ) );
						cacheTileShape();
						p5c.loop();
						return false;
					}

					P = Q;
				}
			}

			mode = Mode.ADJ_TILE;
			editor_T_down = editor_T;
			max_touches = 2;
		 } else {
			mode = Mode.ADJ_TILING;
			tiling_T_down = tiling_T;
			max_touches = 2;
		}

		return false;
	}

	function getTouchRigid()
	{
		const ks = Object.keys( my_touches );

		if( num_touches == 1 ) {
			// Just translation.
			const tch = my_touches[ks[0]];
			const dx = tch.pos.x - tch.down.x;
			const dy = tch.pos.y - tch.down.y;

			return [ 1.0, 0.0, dx, 0.0, 1.0, dy ];
		} else {
			// Full rigid.
			const tch1 = my_touches[ks[0]];
			const tch2 = my_touches[ks[1]];

			const P1 = tch1.down;
			const P2 = tch1.pos;
			const Q1 = tch2.down;
			const Q2 = tch2.pos;

			const M1 = matchSeg( P1, Q1 );
			const M2 = matchSeg( P2, Q2 );
			const M = mul( M2, inv( M1 ) );

			return M;
		}
	}

	function doTouchMoved()
	{
		if( mode == Mode.ADJ_TILING ) {
			const M = getTouchRigid();
			tiling_T = mul( M, tiling_T_down );
			tiling_iT = inv( tiling_T );
			p5c.loop();
			return false;
		} else if( mode == Mode.ADJ_TILE ) {
			const M = getTouchRigid();
			editor_T = mul( M, editor_T_down );
			p5c.loop();
			return false;
		} else if( mode == Mode.ADJ_TV ) {
			const params = tiling.getParameters();
			const xx = edit_box.w - 25 - 5*phys_unit;
			let t = p5c.map(
				p5c.mouseX-edit_box.x-drag_tv_offs, xx,
				xx+5*phys_unit-20, 0, 2 );
			if(t < 0) { t = 0;}
			if (t > 2) { t = 2;}
			params[drag_tv] = t;
			tiling.setParameters(params);
			cacheTileShape();
			p5c.loop();
		} else if( mode == Mode.AUDIO ) {
			const xx = edit_box.w - 25 - 5*phys_unit;
			let t = p5c.map(
				p5c.mouseX-edit_box.x-drag_audio_offs, xx,
				xx+5*phys_unit-20, 0, 1 );
			if(t < 0) { t = 0;}
			if (t > 1) { t = 1;}
			aParams[drag_audio] = t;
			sendAudioParams(aParams, drag_audio);
			if( show_controls ) {
				drawEditor();
				p5c.noLoop();
			}
		} else if( mode == Mode.MOVE_VERTEX ) {
			const pt =
				{ x: p5c.mouseX - edit_box.x, y: p5c.mouseY - edit_box.y };
			const npt = mul( drag_T, pt );

			if( u_constrain ) {
				npt.x = 1.0;
			}
			const d = p5c.dist( pt.x, pt.y, down_motion.x, down_motion.y );
			if( d > 10 ) {
				// You've moved far enough, so don't delete.
				if( delete_timer ) {
					clearTimeout( delete_timer );
					delete_timer = null;
				}
			}

			edges[drag_edge_shape][drag_vertex] = npt;
			cacheTileShape();
			p5c.loop();
		}

		return false;
	}

	function sendAudioParams(params, idx) {
		if(idx === 0) { // volume
			updateAudioVolume(params[0]);
		}
		else if(idx === 1) { // pitch range
			updateAudioPitchRange(params[1]);
		}
	}

	function doTouchEnded( id )
	{
		if( delete_timer ) {
			clearTimeout( delete_timer );
			delete_timer = null;
		}
		mode = Mode.NONE;
	}

	p5c.setup = function()
	{
		let w = window.innerWidth;
		let h = window.innerHeight;

		let canvas = p5c.createCanvas( w, h );
		canvas.parent( "sktch" );

		const asp = w / h;
		const hh = 6.0;
		const ww = asp * hh;
		const sc = h / (2*hh);

		tiling_T = mul(
			[1, 0, p5c.width/2.0, 0, 1, p5c.height/2.0],
			[sc, 0, 0, 0, -sc, 0] );
		tiling_iT = inv( tiling_T );

		setupInterface();

		the_type = 0;

		let parms = p5c.getURLParams();
		if( 't' in parms ) {
			let tt = p5c.int( parms.t );
			for( let i = 0; i < tilingTypes.length; ++i ) {
				if( tilingTypes[i] == tt ) {
					the_type = i;
					break;
				}
			}
		}

		const tp = tilingTypes[ the_type ];
		tiling = new IsohedralTiling( tp );

		setTilingType();
	}

	p5c.windowResized = function()
	{
		p5c.resizeCanvas( window.innerWidth, window.innerHeight );
		setupInterface();
		p5c.loop();
	}

	p5c.draw = function()
	{
		p5c.background( 255 );

		drawTiling();
		drawInterface(
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
			bxMaxY,
			audioSliderBox1,
			volume,
		);
		if( show_controls ) {
    	drawEditor();
  	}
		p5c.noLoop();
	}
};

let myp5 = new p5( sktch, 'sketch0' );
