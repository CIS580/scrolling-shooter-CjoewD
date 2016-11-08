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