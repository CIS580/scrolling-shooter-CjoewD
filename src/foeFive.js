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