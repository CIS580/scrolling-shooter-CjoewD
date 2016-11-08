(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const BulletPool = require('./bullet_pool');
const FoeOne = require('./foeOne');
const FoeTwo = require('./foeTwo');
const FoeThree = require('./foeThree');
const FoeFour = require('./foeFour');
const FoeFive = require('./foeFive');
const Part = require('./part');

const BULLET_SPEED = 15;


/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var input = {
  up: false,
  down: false,
  left: false,
  right: false
}
var camera = new Camera(canvas);
//var bullets = new BulletPool(10);
var bullets = [];
var missiles = [];
var foe = new FoeOne(camera.y);
var foes = [];
var upgrades = [];
var part = [];
var player = new Player(bullets, missiles);
var backgrounds = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image()
];
var loc = [
  -214,
  -1214,
  -214,
  -1214,
  -214,
  -1214
];
backgrounds[0].src = 'assets/closeStarsSmall.png';
backgrounds[1].src = 'assets/closeStarsSmall.png';
backgrounds[2].src = 'assets/cloudLayerSmall.png';
backgrounds[3].src = 'assets/cloudLayerSmall.png';
backgrounds[4].src = 'assets/backgroundSmall.png';
backgrounds[5].src = 'assets/backgroundSmall.png';
var lives = 3;
var score = 0;
var level = 1;
var killable = 100;
var state = "start";
var kills = 0;
var shoot = false;
var canShoot = true;
var gunState = "norm";
var amount = 0;
var smoke = 0;



/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
	case "v":
      if(state == "run" && canShoot) {
		  shoot = true;
		  canShoot = false;
		  }
      event.preventDefault();
      break;
	case "b":
		if(state == "win"){
			lives = 1;
			die();
		}
	  state = "run";
	  event.preventDefault();
	  break;
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
	case "v":
	  canShoot = true;
	  break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  if(state == "run"){
	  // update the player
	  player.update(elapsedTime, input, camera.y);
	  
	  //update the foe
	  foe.update(elapsedTime, input, camera.y, player.getPosition());
	  
	  for(var i = 0; i < foes.length; i++){
		  foes[i].update(elapsedTime, input, camera.y, player.getPosition());
	  } 

	  // update the camera
	  camera.update(player.position, player.getOffset());

	  
	  //makes the bullets if input was made
	  switch(gunState){
		  case "norm":
			if(shoot) {
				bullets.push({x: player.getPosition().x+10,  y: player.getPosition().y});
			}
			shoot = false;
			break;
		  case "fast":
		    if(shoot) {
				bullets.push({x: player.getPosition().x+10,  y: player.getPosition().y-15});
				bullets.push({x: player.getPosition().x+10,  y: player.getPosition().y});
				bullets.push({x: player.getPosition().x+10,  y: player.getPosition().y+15});
			}
			shoot = false;
			break;
		  case "double":
		    if(shoot) {
				bullets.push({x: player.getPosition().x-10,  y: player.getPosition().y});
				bullets.push({x: player.getPosition().x+30,  y: player.getPosition().y});
			}
		    shoot = false;
			break;
		  case "large":
		    if(shoot) {
				bullets.push({x: player.getPosition().x+10,  y: player.getPosition().y});
			}
		    shoot = false;
			break;
	  }
	  
	  
	  //updates the particles
	  if(part.length>0&&part[0].isDead()) part.shift();
	  for(var i = 0; i < part.length; i++){
		  part[i].update(elapsedTime, input);
	  } 
	  
	  
	  
	  /* // Update bullets
	  bullets.update(elapsedTime, function(bullet){
		if(!camera.onScreen(bullet)) return true;
		return false;
	  }); */

	  // Update missiles
	  var markedForRemoval = [];
	  missiles.forEach(function(missile, i){
		missile.update(elapsedTime);
		if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
		  markedForRemoval.unshift(i);
	  });
	  // Remove missiles that have gone off-screen
	  markedForRemoval.forEach(function(index){
		missiles.splice(index, 1);
	  });
	  
	  //updates image location
	  if(loc[0] > camera.y + 786){
		  loc[0] -= 2000;
	  }
	  else if(loc[1] > camera.y + 786){
		  loc[1] -= 2000;
	  }
	  if(loc[2] > camera.y*.6 + 786){
		  loc[2] -= 2000;
	  }
	  else if(loc[3] > camera.y*.6 + 786){
		  loc[3] -= 2000;
	  }
	  if(loc[4] > camera.y*.2 + 786){
		  loc[4] -= 2000;
	  }
	  else if(loc[5] > camera.y*.2 + 786){
		  loc[5] -= 2000;
	  }
	  
	  //brief not killable (working?)
	  if(killable < 100) killable++;
	  
	  //updates the bullets and makes the particle affects
	  var temp = 0;
	  for(var i = 0; i < bullets.length; i++){
		  bullets[i].y -= BULLET_SPEED;
		  switch(gunState){
			  case "fast":
			    temp++
				if(temp == 3){
					part.push(new Part({x: bullets[i].x,  y: bullets[i].y} ,1,0));
					temp = 0;
				}
				break;
			  case "double":
			    smoke++;
				if(smoke == 3){
					part.push(new Part({x: bullets[i].x,  y: bullets[i].y} ,2,-1));
					part.push(new Part({x: bullets[i].x,  y: bullets[i].y} ,2,1));
					smoke = 0;
				}
				break;
			  case "large":
			    part.push(new Part({x: bullets[i].x,  y: bullets[i].y} ,3,0));
				break;
		  }
	  }
	  
	  //removes offscreen bullets
	  if(bullets.length > 0 && bullets[0].y < camera.y ) {
		  bullets.shift();
	  }
	  
	  //removes offscreen foes
      var foePos;
	  if(foes.length > 0) foePos = foes[0].getPosition();
	  if(foes.length > 0 && foePos.y > camera.y+800 ) {
		  foes.shift();
	  }
	  
	  //removes off screen upgrades
	  if(upgrades.length > 0 && upgrades[0].y > camera.y+800 ) {
		  upgrades.shift();
	  }

	  
	  //checks collisions
	  playerBulletCollisions();
	  foeCollisions();
	  foeBulletCollisions();
	  playerUpgradeCollisions();
	  
	  
	  /* if(getRandomNumber(0,50) <= 2){
		  if(getRandomNumber(0,200) <= 10) foes.push(new FoeFive(camera.y));
		  else foes.push(new FoeFour(camera.y));
	  } */
	  
	  //generates the upgrades
	  if(upgrades.length == 0){
		  var temp = Math.floor(getRandomNumber(0,200));
		  switch(temp){
			  case 0:
				//upgrades.push({x: getRandomNumber(10, 1030), y: camera.y-40, upgrade: 0});
				break;
			  case 1:
				upgrades.push({x: getRandomNumber(10, 1030), y: camera.y-40, upgrade: 1});
				break;
			  case 2:
				upgrades.push({x: getRandomNumber(10, 1030), y: camera.y-40, upgrade: 2});
				break;
			  case 3:
				upgrades.push({x: getRandomNumber(10, 1030), y: camera.y-40, upgrade: 3});
				break;
		  }
	  }
	  
	  //generate new generic foes
	  if(getRandomNumber(0,50) <= 3){
		  if(getRandomNumber(0,200) <= 10) foes.push(new FoeFive(camera.y));
		  else foes.push(new FoeFour(camera.y));
	  }
	  
  }
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 786);

  // TODO: Render background
  renderBackgrounds(elapsedTime, ctx);
  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

/**
  * @function renderBackgrounds
  * Renders the parallax scrolling backgrounds.
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderBackgrounds(elapsedTime, ctx) {
  // The background scrolls at 2% of the foreground speed
  ctx.save();
  ctx.translate(0, -camera.y * 0.2);
  ctx.drawImage(backgrounds[5], 0, loc[5]);
  ctx.restore();

  ctx.save();
  ctx.translate(0, -camera.y * 0.2);
  ctx.drawImage(backgrounds[4], 0, loc[4]);
  ctx.restore();

  // The midground scrolls at 60% of the foreground speed
  ctx.save();
  ctx.translate(0, -camera.y * 0.6);
  ctx.drawImage(backgrounds[3], 0, loc[3]);
  ctx.restore();
  
  ctx.save();
  ctx.translate(0, -camera.y * 0.6);
  ctx.drawImage(backgrounds[2], 0, loc[2]);
  ctx.restore();

  // The foreground scrolls in sync with the camera
  ctx.save();
  ctx.translate(0, -camera.y);
  ctx.drawImage(backgrounds[1], 0, loc[1]);
  ctx.restore();

  ctx.save();
  ctx.translate(0, -camera.y);
  ctx.drawImage(backgrounds[0], 0, loc[0]);
  ctx.restore();
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    /* // Render the bullets
    bullets.render(elapsedTime, ctx); */

    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });
	
	//render particles
	for(var i = 0; i < part.length; i++){
		  part[i].render(elapsedTime, ctx);
	} 

    // Render the player
    player.render(elapsedTime, ctx);
	var pos = player.getPosition();
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'white';
	switch(gunState){
		case "fast":
		  ctx.fillStyle = 'red';
		  break;
		case "double":
		  ctx.fillStyle = 'blue';
		  break;
		case "large":
		  ctx.fillStyle = 'green';
		  break;
	}
	ctx.arc(pos.x+10, pos.y+20, 10, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
	ctx.stroke();
    ctx.fill();
	
	//render the foe
	foe.render(elapsedTime, ctx);
	
	
	//render the bullets
	ctx.beginPath();
	  for (var i = 0; i < bullets.length; i++) {
		  ctx.beginPath();
		  switch(gunState){
			  case "norm":
				ctx.fillStyle = 'green';
				ctx.arc(bullets[i].x, bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
				break;
			  case "fast":
				ctx.fillStyle = 'orange';
				ctx.arc(bullets[i].x, bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
				break;
			  case "double":
				ctx.fillStyle = 'yellow';
				ctx.arc(bullets[i].x, bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
				break;
			  case "large":
				ctx.fillStyle = 'white';
				ctx.arc(bullets[i].x, bullets[i].y, 12, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
				break;
		  }
		  ctx.fill();
	  }
	  
	  for (var i = 0; i < upgrades.length; i++) {
		  ctx.beginPath();
		  ctx.lineWidth = 10;
		  ctx.strokeStyle = 'white';
		  switch(upgrades[0].upgrade){
			  case 1:
			    ctx.fillStyle = 'red';
				break;
			  case 2:
			    ctx.fillStyle = 'blue';
				break;
			  case 3:
			    ctx.fillStyle = 'green';
				break;
		  }
		  ctx.arc(upgrades[0].x, upgrades[0].y, 20, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
		  ctx.stroke();
          ctx.fill();
	  }
	  
	  
	  /* for (var i = 0; i < bullets.length; i++) {
		  ctx.beginPath();
		  ctx.arc(bullets[i].x, bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
		  ctx.fill();
	  } */
	  
	  for (var i = 0; i < foes.length; i++) {
		  foes[i].render(elapsedTime,ctx);
	  }
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
  //draw ui text
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  if(level < 4) ctx.fillText("Level: " + level, 915, 775);
  else ctx.fillText("Level: won!", 915, 775);
  ctx.fillText("Score: " + score, 460, 775)
  ctx.fillText("Lives: ", 15, 775);
  //draw lives
  ctx.strokeStyle = 'white';
  for(var i = 0; i< lives;i++){
	  ctx.beginPath();
	  ctx.moveTo(85+(i*25), 755);
	  ctx.lineTo(75+(i*25), 775);
	  ctx.lineTo(85+(i*25), 765);
	  ctx.lineTo(95+(i*25), 775);
	  ctx.closePath();
	  ctx.stroke();
  }  
  
  switch(state){
	  case "start":
	  case "mid":
			ctx.fillStyle = "white";
			ctx.font = "bold 100px Arial";
			ctx.fillText("LEVEL " + level, 300, 200);
			ctx.font = "bold 50px Arial";
			if(kills > 0) ctx.fillText("Kills: " + kills, 400, 300);
		break;
	  case "win":
			ctx.fillStyle = "white";
			ctx.font = "bold 100px Arial";
			ctx.fillText("YOU WON!!!", 200, 200);
			ctx.font = "bold 50px Arial";
			if(kills > 0) ctx.fillText("Kills: " + kills, 400, 300);
		break;
  }
  
 
}

//checks if player hits foe
function foeCollisions(){
	var playerPos = player.getPosition();
	for(var i = 0; i < foes.length; i++){
		var foePos = foes[i].getPosition();
		if(!foes[i].getKill() && foePos.x > playerPos.x-40 && foePos.x < playerPos.x+30){
			if(foePos.y > playerPos.y -40 && foePos.y < playerPos.y+46){
				foes[i].kill();
				part.push(new Part({x: foePos.x+15,  y: foePos.y} ,4,0));
				die();
				part.push(new Part({x: playerPos.x+10,  y: playerPos.y} ,5,0));
			}
		}
	}
}

//checks if player gets powerup
function playerUpgradeCollisions(){
	var playerPos = player.getPosition();
	for(var i = 0; i < upgrades.length; i++){
		var upX = upgrades[i].x;
		var upY = upgrades[i].y;
		if(upX > playerPos.x-40 && upX < playerPos.x+60){
			if(upY > playerPos.y -40 && upY < playerPos.y+46){
				switch(upgrades[i].upgrade){
					case 0:
					case 1:
						gunState = "fast";
						break;
					case 2:
						gunState = "double";
						break;
					case 3:
						gunState = "large";
						break;
				}
				upgrades.shift();
				bullets = [];
			}
		}
	}
}

//checks if foe bullets hit the player
function foeBulletCollisions(){
	var bullets = foe.getBullets();
	var playerPos = player.getPosition();
	for(var i = 0; i<bullets.length;i++){
		if(bullets[i].x > playerPos.x-3 && bullets[i].x < playerPos.x+54){
			if(bullets[i].y > playerPos.y -3 && bullets[i].y < playerPos.y+46){
				foe.killBullet(i);
				part.push(new Part({x: playerPos.x+10,  y: playerPos.y} ,5,0));
				die();
				break;
			}
		}
	}
}

//checks if player bullets foes
function playerBulletCollisions(){
	var playerPos = foe.getPosition();
	for(var i = 0; i<bullets.length;i++){
		if(!foe.getKill() && bullets[i].x > playerPos.x-3 && bullets[i].x < playerPos.x+40){
			if(bullets[i].y > playerPos.y -3 && bullets[i].y < playerPos.y+40){
				foe.kill();
				part.push(new Part({x: playerPos.x+15,  y: playerPos.y} ,4,0));
				kills++;
				score += 1000;
				nextLevel();
				break;
			}
		}
	}
	for(var i = 0; i<foes.length;i++){
		var playerPos = foes[i].getPosition();
		for(var j = 0; j<bullets.length;j++){
			if(!foes[i].getKill() && bullets[j].x > playerPos.x-3 && bullets[j].x < playerPos.x+40){
				if(bullets[j].y > playerPos.y -3 && bullets[j].y < playerPos.y+40){
					foes[i].kill();
					part.push(new Part({x: playerPos.x+15,  y: playerPos.y} ,4,0));
					kills++;
					score += 100;
				}
			}
		}
	}
}

//player has died
function die(){
	lives--;
	gunState = "norm"
	if(lives < 1){
		lives = 3;
		score = 0;
		level = 1;
		loc = [
		  -214,
		  -1214,
		  -214,
		  -1214,
		  -214,
		  -1214
		];
		game = new Game(canvas, update, render);
		input = {
		  up: false,
		  down: false,
		  left: false,
		  right: false
		}
		camera = new Camera(canvas);
		bullets = new BulletPool(10);
		missiles = [];
		foe = new FoeOne(camera.y);
		foes = [];
		player = new Player(bullets, missiles);
		bullets = [];
		kills = 0;
		state = "start"
		upgrades = [];
		part = [];
	}
	else{
		killable = 0;
		
	}
}

//resets map for next level
function nextLevel(){
	level++;
	state = "mid";
	bullets = [];
	foes = [];
	part = [];
	upgrades = [];
	if(level == 2) foe = new FoeTwo(camera.y);
	if(level == 3) foe = new FoeThree(camera.y);
	if(level == 4) state = "win";
}


},{"./bullet_pool":2,"./camera":3,"./foeFive":4,"./foeFour":5,"./foeOne":6,"./foeThree":7,"./foeTwo":8,"./game":9,"./part":11,"./player":12,"./vector":13}],2:[function(require,module,exports){
"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x;
    this.pool[4*this.end+1] = position.y;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of bullets by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "black";
  for(var i = 0; i < this.end; i++) {
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.arc(this.pool[4*i], this.pool[4*i+1], 2, 0, 2*Math.PI);
  }
  ctx.fill();
  ctx.restore();
}

},{}],3:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');

/**
 * @module Camera
 * A class representing a simple camera
 */
module.exports = exports = Camera;

/**
 * @constructor Camera
 * Creates a camera
 * @param {Rect} screen the bounds of the screen
 */
function Camera(screen) {
  this.x = 0;
  this.y = 0;
  this.width = screen.width;
  this.height = screen.height;
}

/**
 * @function update
 * Updates the camera based on the supplied target
 * @param {Vector} target what the camera is looking at
 */
Camera.prototype.update = function(target, offset) {
  // TODO: Align camera with player
  this.y = target.y - offset;
}

/**
 * @function onscreen
 * Determines if an object is within the camera's gaze
 * @param {Vector} target a point in the world
 * @return true if target is on-screen, false if not
 */
Camera.prototype.onScreen = function(target) {
  return (
     target.x > this.x &&
     target.x < this.x + this.width &&
     target.y > this.y &&
     target.y < this.y + this.height
   );
}

/**
 * @function toScreenCoordinates
 * Translates world coordinates into screen coordinates
 * @param {Vector} worldCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toScreenCoordinates = function(worldCoordinates) {
  return Vector.subtract(worldCoordinates, this);
}

/**
 * @function toWorldCoordinates
 * Translates screen coordinates into world coordinates
 * @param {Vector} screenCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toWorldCoordinates = function(screenCoordinates) {
  return Vector.add(screenCoordinates, this);
}

},{"./vector":13}],4:[function(require,module,exports){
"use strict";

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = FoeFive;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function FoeFive(loc) {
  this.bullets = [];
  this.position = {x: 500, y: loc-40};
  this.velocity = {x: 0, y: 0};
  this.offset = 500;
  this.img = new Image()
  this.img.src = 'assets/foe5.png';
  this.gone = false;
  this.yVal =0;
  this.click = 0;
  this.dead = false;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
FoeFive.prototype.update = function(elapsedTime, input, camera, player) {

	this.position.x = player.x-9;

}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
FoeFive.prototype.render = function(elapasedTime, ctx) {
  if(!this.dead){
	  ctx.save();
	  ctx.translate(this.position.x, this.position.y);
	  ctx.drawImage(this.img, 0, 0, 40, 40);  
	  ctx.restore();

  }
}

FoeFive.prototype.getBullets = function() {
  return this.bullets;
}

FoeFive.prototype.getPosition = function(){
	return this.position;
}

FoeFive.prototype.killBullet = function(value){
	switch(value){
		case 0:
			this.bullets.shift();
			break;
		case 1:
			var temp = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp);
			break;
		case 2:
			var temp = this.bullets.shift();
			var temp1 = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp1);
			this.bullets.unshift(temp);		
			break;
	}
}

FoeFive.prototype.kill = function(){
	this.dead = true;
}

FoeFive.prototype.getKill = function(){
	return this.dead;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
},{}],5:[function(require,module,exports){
"use strict";

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = FoeFour;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function FoeFour(loc) {
  this.bullets = [];
  this.position = {x: getRandomNumber(10, 1030), y: loc-40};
  this.velocity = {x: 0, y: 0};
  this.offset = 500;
  this.img = new Image()
  this.img.src = 'assets/foe3.png';
  this.gone = false;
  this.yVal =0;
  this.click = 0;
  this.dead = false;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
FoeFour.prototype.update = function(elapsedTime, input, camera, player) {

 
  

}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
FoeFour.prototype.render = function(elapasedTime, ctx) {
  if(!this.dead){
	  ctx.save();
	  ctx.translate(this.position.x, this.position.y);
	  ctx.drawImage(this.img, 0, 0, 40, 40);  
	  ctx.restore();

  }
}

FoeFour.prototype.getBullets = function() {
  return this.bullets;
}

FoeFour.prototype.getPosition = function(){
	return this.position;
}

FoeFour.prototype.killBullet = function(value){
	switch(value){
		case 0:
			this.bullets.shift();
			break;
		case 1:
			var temp = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp);
			break;
		case 2:
			var temp = this.bullets.shift();
			var temp1 = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp1);
			this.bullets.unshift(temp);		
			break;
	}
}

FoeFour.prototype.kill = function(){
	this.dead = true;
}

FoeFour.prototype.getKill = function(){
	return this.dead;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
},{}],6:[function(require,module,exports){
"use strict";

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = FoeOne;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function FoeOne(loc) {
  this.bullets = [];
  this.position = {x: getRandomNumber(200, 880), y: loc-40};
  this.velocity = {x: 0, y: 0};
  this.offset = 500;
  this.img = new Image()
  this.img.src = 'assets/foe1.png';
  this.gone = false;
  this.yVal =0;
  this.click = 0;
  this.dead = false;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
FoeOne.prototype.update = function(elapsedTime, input, camera) {

  // set the offset
  if(input.up && camera < this.position.y - 200) {
	  this.offset -= PLAYER_SPEED / 2;
  }
  if(input.down && camera > this.position.y - 700) {
	  this.offset += PLAYER_SPEED / 2;
  }

  // move the player
  if (this.yVal < 80) {
	  this.position.y += PLAYER_SPEED /2;
	  this.yVal += PLAYER_SPEED /2;
  }

  // don't let the player move off-screen
  if(this.position.x < 10) this.position.x = 10;
  if(this.position.x > 994) this.position.x = 994;
  if(this.position.y > 786) this.gone = true;
  
  //forces a constant move forward
  this.position.y -= 5;
  
  //make bullets
  this.click++;
  if (this.click == 50) {
        this.click = 1;
        
        //Spawns Apple
        this.bullets.push({x: this.position.x +20 , y: this.position.y+20 });
  }
  for(var i = 0; i < this.bullets.length; i++){
	  this.bullets[i].y+= BULLET_SPEED;
  }
  if(this.bullets.length > 0 && this.bullets[0].y > camera + 790) this.bullets.shift();
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
FoeOne.prototype.render = function(elapasedTime, ctx) {
  if(!this.dead){
	  ctx.save();
	  ctx.translate(this.position.x, this.position.y);
	  ctx.drawImage(this.img, 0, 0, 40, 40);  
	  ctx.restore();
	  
	  
	  ctx.beginPath();
	  ctx.fillStyle = 'red';
	  for (var i = 0; i < this.bullets.length; i++) {
		  ctx.beginPath();
		  ctx.arc(this.bullets[i].x, this.bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
		  ctx.fill();
	  }
  }
}

FoeOne.prototype.getBullets = function() {
  return this.bullets;
}

FoeOne.prototype.getPosition = function(){
	return this.position;
}

FoeOne.prototype.killBullet = function(value){
	switch(value){
		case 0:
			this.bullets.shift();
			break;
		case 1:
			var temp = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp);
			break;
		case 2:
			var temp = this.bullets.shift();
			var temp1 = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp1);
			this.bullets.unshift(temp);		
			break;
	}
}

FoeOne.prototype.kill = function(){
	this.dead = true;
}

FoeOne.prototype.getKill = function(){
	return this.dead;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
},{}],7:[function(require,module,exports){
"use strict";

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = FoeThree;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function FoeThree(loc) {
  this.bullets = [];
  this.position = {x: 494, y: loc-40};
  this.velocity = {x: 0, y: 0};
  this.offset = 500;
  this.img = new Image()
  this.img.src = 'assets/foe4.png';
  this.gone = false;
  this.yVal =0;
  this.click = 0;
  this.dead = false;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
FoeThree.prototype.update = function(elapsedTime, input, camera, player) {

  // set the offset
  if(input.up && camera < this.position.y - 200) {
	  this.offset -= PLAYER_SPEED / 2;
  }
  if(input.down && camera > this.position.y - 700) {
	  this.offset += PLAYER_SPEED / 2;
  }

  // move the player
  if (this.yVal < 80) {
	  this.position.y += PLAYER_SPEED /2;
	  this.yVal += PLAYER_SPEED /2;
  }

  console.log(player.x);
  this.position.x = player.x;
  
  // don't let the player move off-screen
  if(this.position.x < 10) this.position.x = 10;
  if(this.position.x > 994) this.position.x = 994;
  if(this.position.y > 786) this.gone = true;
  
  //forces a constant move forward
  this.position.y -= 5;
  
  
  //make bullets
  this.click++;
  if (this.click == 30) {
        this.click = 1;
        
        //Spawns Apple
        this.bullets.push({x: this.position.x +20 , y: this.position.y+20 });
  }
  for(var i = 0; i < this.bullets.length; i++){
	  this.bullets[i].y+= BULLET_SPEED;
  }
  if(this.bullets.length > 0 && this.bullets[0].y > camera + 790) this.bullets.shift();
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
FoeThree.prototype.render = function(elapasedTime, ctx) {
  if(!this.dead){
	  ctx.save();
	  ctx.translate(this.position.x, this.position.y);
	  ctx.drawImage(this.img, 0, 0, 40, 40);  
	  ctx.restore();
	  
	  
	  ctx.beginPath();
	  ctx.fillStyle = 'red';
	  for (var i = 0; i < this.bullets.length; i++) {
		  ctx.beginPath();
		  ctx.arc(this.bullets[i].x, this.bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
		  ctx.fill();
	  }
  }
}

FoeThree.prototype.getBullets = function() {
  return this.bullets;
}

FoeThree.prototype.getPosition = function(){
	return this.position;
}

FoeThree.prototype.killBullet = function(value){
	switch(value){
		case 0:
			this.bullets.shift();
			break;
		case 1:
			var temp = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp);
			break;
		case 2:
			var temp = this.bullets.shift();
			var temp1 = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp1);
			this.bullets.unshift(temp);		
			break;
	}
}

FoeThree.prototype.kill = function(){
	this.dead = true;
}

FoeThree.prototype.getKill = function(){
	return this.dead;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
},{}],8:[function(require,module,exports){
"use strict";

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = FoeTwo;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function FoeTwo(loc) {
  this.bullets = [];
  this.position = {x: 494, y: loc-40};
  this.velocity = {x: 0, y: 0};
  this.offset = 500;
  this.img = new Image()
  this.img.src = 'assets/foe2.png';
  this.gone = false;
  this.yVal =0;
  this.click = 0;
  this.dead = false;
  this.xDir = 0;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
FoeTwo.prototype.update = function(elapsedTime, input, camera) {

  // set the offset
  if(input.up && camera < this.position.y - 200) {
	  this.offset -= PLAYER_SPEED / 2;
  }
  if(input.down && camera > this.position.y - 700) {
	  this.offset += PLAYER_SPEED / 2;
  }

  // move the player
  if (this.yVal < 80) {
	  this.position.y += PLAYER_SPEED /2;
	  this.yVal += PLAYER_SPEED /2;
  }

  if(this.xDir == 0){
	  this.position.x -= PLAYER_SPEED;
	  if(getRandomNumber(0, 10) <= 1) this.xDir = 1;
  }
  else{
	  this.position.x += PLAYER_SPEED;
	  if(getRandomNumber(0, 10) <= 1) this.xDir = 0;
  }
  
  // don't let the player move off-screen
  if(this.position.x < 10) this.position.x = 10;
  if(this.position.x > 994) this.position.x = 994;
  if(this.position.y > 786) this.gone = true;
  
  //forces a constant move forward
  this.position.y -= 5;
  
  
  //make bullets
  this.click++;
  if (this.click == 70) {
        this.click = 1;
        
        //Spawns Apple
        this.bullets.push({x: this.position.x +20 , y: this.position.y+20 });
  }
  for(var i = 0; i < this.bullets.length; i++){
	  this.bullets[i].y+= BULLET_SPEED;
  }
  if(this.bullets.length > 0 && this.bullets[0].y > camera + 790) this.bullets.shift();
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
FoeTwo.prototype.render = function(elapasedTime, ctx) {
  if(!this.dead){
	  ctx.save();
	  ctx.translate(this.position.x, this.position.y);
	  ctx.drawImage(this.img, 0, 0, 40, 40);  
	  ctx.restore();
	  
	  
	  ctx.beginPath();
	  ctx.fillStyle = 'red';
	  for (var i = 0; i < this.bullets.length; i++) {
		  ctx.beginPath();
		  ctx.arc(this.bullets[i].x, this.bullets[i].y, 4, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
		  ctx.fill();
	  }
  }
}

FoeTwo.prototype.getBullets = function() {
  return this.bullets;
}

FoeTwo.prototype.getPosition = function(){
	return this.position;
}

FoeTwo.prototype.killBullet = function(value){
	switch(value){
		case 0:
			this.bullets.shift();
			break;
		case 1:
			var temp = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp);
			break;
		case 2:
			var temp = this.bullets.shift();
			var temp1 = this.bullets.shift();
			this.bullets.shift();
			this.bullets.unshift(temp1);
			this.bullets.unshift(temp);		
			break;
	}
}

FoeTwo.prototype.kill = function(){
	this.dead = true;
}

FoeTwo.prototype.getKill = function(){
	return this.dead;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
},{}],9:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],10:[function(require,module,exports){

},{}],11:[function(require,module,exports){
"use strict";

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Part;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Part(loc, part, vel) {
  this.position = {x: loc.x, y: loc.y};
  this.color = "#470000"
  this.size = 2;
  this.xVel = vel;
  this.die = 0;
  this.dead = false;
  this.increase = 0;
  this.span = 200;
  switch(part){
	  case 1:
	    
		break;
	  case 2:
	    this.color = "#001347";
		this.increase = .2;
		break;
	  case 3:
	    this.color = "#473800";
	    this.size = 5
		this.increase = .3;
		break;
	  case 4:
		this.color = "#7F0000";
		this.size = 20;
		this.increase = .8;
		this.span = 50
		break;
	  case 5:
		this.color = "grey";
		this.size = 20;
		this.increase = .8;
		this.span = 50
		break;
  }
  
  
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Part.prototype.update = function(elapsedTime, input) {
	this.position.x += this.xVel;
	this.size += this.increase;
	this.die++;
	if(this.die > this.span) this.dead = true;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Part.prototype.render = function(elapasedTime, ctx) {
  if(!this.dead){
	  ctx.beginPath();
	  ctx.fillStyle = this.color;
	  ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
	  ctx.fill();
  }
}

Part.prototype.isDead = function() {
  return this.dead;
}
},{}],12:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles) {
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 514, y: 500};
  this.velocity = {x: 0, y: 0};
  this.offset = 500;
  this.img = new Image()
  this.img.src = 'assets/tyrian.shp.007D3C.png';
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input, camera) {

  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = 0;
  if(input.up && camera < this.position.y - 200) {
      this.velocity.y -= PLAYER_SPEED / 2;
	  this.offset -= PLAYER_SPEED / 2;
  }
  if(input.down && camera > this.position.y - 700) {
	  this.velocity.y += PLAYER_SPEED / 2;
	  this.offset += PLAYER_SPEED / 2;
  }

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // don't let the player move off-screen
  if(this.position.x < 10) this.position.x = 10;
  if(this.position.x > 994) this.position.x = 994;
  if(this.position.y > 786) this.position.y = 786;
  
  //forces a constant move forward
  this.position.y -= 5;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  var offset = this.angle * 23;
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, 48+offset, 57, 23, 27, -12.5, -12, 46, 54);
  ctx.restore();
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:30, y:30});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}

Player.prototype.getOffset = function(){
	return this.offset;
}

Player.prototype.getPosition = function(){
	return this.position;
}
},{"./missile":10,"./vector":13}],13:[function(require,module,exports){
"use strict";

/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  add: add,
  subtract: subtract,
  scale: scale,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}


/**
 * @function rotate
 * Scales a vector
 * @param {Vector} a - the vector to scale
 * @param {float} scale - the scalar to multiply the vector by
 * @returns a new vector representing the scaled original
 */
function scale(a, scale) {
 return {x: a.x * scale, y: a.y * scale};
}

/**
 * @function add
 * Computes the sum of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed sum
*/
function add(a, b) {
 return {x: a.x + b.x, y: a.y + b.y};
}

/**
 * @function subtract
 * Computes the difference of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed difference
 */
function subtract(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

},{}]},{},[1]);
