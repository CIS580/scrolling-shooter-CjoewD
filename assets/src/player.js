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