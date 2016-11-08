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