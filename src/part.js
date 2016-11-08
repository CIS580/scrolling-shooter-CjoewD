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