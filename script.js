'use strict';

// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
let requestAnimFrame = (function(){
	return window.requestAnimationFrame	   ||
		// window.webkitRequestAnimationFrame ||
		// window.mozRequestAnimationFrame	||
		// window.oRequestAnimationFrame	  ||
		// window.msRequestAnimationFrame	 ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

let cvs = document.getElementById('canvas');
let ctx = cvs.getContext ('2d');

let bg = new Image();
let ship = new Image();
let xPos = 500;
let yPos = 450;
let lazer = new Image ();
let shoot = [];
let meteor = new Image ();
let meteor2 = new Image ();
let fall = [] ,fall2 = [];
let lazer_sound = new Audio('sound/laser-blast_zjrhvyvd.mp3');
let lazer_bingo = new Audio('sound/contra-sfx-29.mp3')
let shootSpeed = 350;
let fallSpeed = 200;
let score = 0;

bg.src = 'img/stars_milky_way.jpg';
ship.src = 'img/spaceShip2.png';
lazer.src = 'img/lazer.png';
meteor.src = 'img/meteor.png';
meteor2.src = 'img/meteor2.png';
document.addEventListener('mousemove',moveImg,false);

function moveImg(e){
	let r = cvs.getBoundingClientRect();
	xPos = e.clientX - r.left - 0.5*ship.width;
	yPos = e.clientY - 0.5*ship.height;
	if (xPos < -(ship.width / 2)) xPos = -(ship.width / 2);
	if (xPos >(cvs.width - (ship.width / 2))) xPos = (cvs.width - (ship.width / 2));
	if (yPos < 0) yPos = 0;
	if (yPos > (cvs.height - ship.height)) yPos = (cvs.height - ship.height); 
}

function newShoot(){
	let bpm = {};
	bpm.x = xPos + 56;
	bpm.y = yPos - 30;
	shoot.push(bpm);
	lazer_sound.play();
}
document.getElementById('play-again').addEventListener('click', function() {
        location.reload();
    });
document.addEventListener('click',newShoot,false);

function draw () {
	ctx.drawImage(bg,0,0);
	for (let i = 0; i < shoot.length ; i++){
		ctx.drawImage(lazer,shoot[i].x ,shoot[i].y);
	}
	for (let z = 0;z < fall.length; z++){
		ctx.drawImage(meteor,fall[z].x,fall[z].y);
	}
	for ( let a = 0; a < fall2.length;a++){
		ctx.drawImage(meteor2,fall2[a].x,fall2[a].y);
	}
	ctx.drawImage(ship,xPos,yPos);
	ctx.fillStyle = '#fff';
	ctx.font = '25px Arial';
	ctx.fillText('Score:'+ score,10,cvs.height-570)
}

bg.onload = draw;
let lastTime = Date.now();
// requestAnimationFrame(main);
requestAnimFrame(main);

function main() {
	let now = Date.now();
	let dt = (now - lastTime) / 1000.0;

	update(dt);
	draw();

	lastTime = now;
    
	// requestAnimationFrame(main);
	requestAnimFrame(main);
};

function update(dt) {
	if(Math.random() < .01) {
		if(Math.random() < 0.5){
			fall.push ({
				x : Math.floor(Math.random()*(cvs.width - meteor.width)),
				y : -meteor.height
			});
		}else{
			fall2.push({
				x : Math.floor(Math.random()*(cvs.width-meteor2.width)),
				y : -meteor2.height
			});
		}
	}
	
	updateEntities(dt);
	checkCollisions();
};

function updateEntities(dt) {

	for (let i = 0; i < shoot.length ; i++){
		shoot[i].y -= shootSpeed * dt;
		if (shoot[i].y < -lazer.height) shoot.shift();
	}
	
	for(let i = 0; i < fall.length; i++) {
		fall[i].y += fallSpeed * dt;
		if (fall[i].y >= cvs.height) {
			fall.shift();
			score --;
		}
	}
	for(let i = 0; i < fall2.length; i++) {
		fall2[i].y += fallSpeed * dt;
		if (fall2[i].y >= cvs.height) {
			fall2.shift();
			score --;
		}
	}
	
}

function checkCollisions() {
	for(let i=0; i<fall.length; i++) {
		for(let j=0; j<shoot.length; j++) {
			if(boxCollides([fall[i].x, fall[i].y],
							[meteor.width, meteor.height],
							[shoot[j].x, shoot[j].y],
							[lazer.width, lazer.height])) {
				fall.splice(i, 1);
				shoot.splice(j, 1);
				i--;
				lazer_bingo.play();
				score++;
				// Add score
				// Add an explosion
				break;
			}
		}
	}
	for(let i=0; i<fall2.length; i++) {
		for(let j=0; j<shoot.length; j++) {
			if(boxCollides([fall2[i].x, fall2[i].y],
							[meteor2.width, meteor2.height],
							[shoot[j].x, shoot[j].y],
							[lazer.width, lazer.height])) {
				fall2.splice(i, 1);
				shoot.splice(j, 1);
				i--;
                lazer_bingo.play();
                score ++;
				// Add score
				// Add an explosion
				break;
			}
		}
	}
	for(let i=0; i<fall.length; i++){
	if (boxCollides([fall[i].x,fall[i].y],
					[meteor.width,meteor.height],
					[xPos,yPos],
					[ship.width,ship.height])) {
		gameOver();
	 }
	}
	for(let i=0; i<fall2.length; i++){
	if (boxCollides([fall2[i].x,fall2[i].y],
					[meteor2.width,meteor2.height],
					[xPos,yPos],
					[ship.width,ship.height])) {
		gameOver();
	 }
	}
	if (score == -5) gameOver();				
}

function boxCollides(pos, size, pos2, size2) {
	return collides(pos[0], pos[1],
					pos[0] + size[0], pos[1] + size[1],
					pos2[0], pos2[1],
					pos2[0] + size2[0], pos2[1] + size2[1]);
}


function collides(x, y, r, b, x2, y2, r2, b2) {
	return !(r <= x2 || x > r2 ||
			b <= y2 || y > b2);
}
function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
   ship=null;
}
