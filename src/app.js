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

