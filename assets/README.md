# Shooter
An assignment template for a scrolling shooter, a clone of [Tyrian](https://en.wikipedia.org/wiki/Tyrian_(video_game)) created for the Fall 2016 class of CIS 580 at Kansas State University.

## Requirements

The game is implemented in JavaScript using the HTML5 canvas element and the provided game framework.

1. The player pilots a ship that can maneuver around the screen and fire weapons.  The player has a set amount of life that is reduced by being hit by enemy weapons and enemies.  When the player dies, they explode using a particle system (20 points).

2. The player flies through a parallax scrolling world composed of at least three layers generated using tilemaps (20 points).

3. The player ship can be upgraded with better weapons providing different advantages and visual representations on-screen.  These upgrades are provided via powerups that can be picked up in game.  At least three of these implement particle effects (20 points).

4. At least five unique types of enemies using different attack strategies and behaviors actively oppose the player's progress.  Colliding with an enemy or enemy projectile cause damage to the player.  Destroying an enemy causes an explosion or similar destruction implementing a particle engine (20 points).

5. The player progresses through at least three levels (either by reaching the end of the level or defeating a boss), and between levels a screen summarizing they player's performance is displayed (20 points).

### Extra Credit

1. An additional 20 points is available for especially impressive games.

## Bundling
The source code in the src directory is bundled into a single file using **Browserify**.  The Browserify tools must first be installed on your system:

```$ npm install -g browserify``` (for OSX and linus users, you may need to preface this command with ```sudo```)

Once installed, you can bundle the current source with the command:

```$ browserify src/app.js -o bundle.js```

Remember, the browser must be refreshed to receive the changed javascript file.

## Watching

You may prefer to instead _watch_ the files for changes using **Watchify**.  This works very similarily to Browserify.  It first must be installed:

```$ npm install -g watchify``` (again, ```sudo``` may need to be used on linux and OSX platforms)

Then run the command:

```watchify src/app.js -o bundle.js```

The bundle will automatically be re-created every time you change a source file.  However, you still need to refresh your browser for the changed bundle to take effect.

## Credits
Game framework HTML5/CSS3/Javascript code was written by course instructor Nathan Bean, and released under the [CC-A-SA 3.0 License](https://creativecommons.org/licenses/by-sa/3.0/)

Assets are remastered graphics from the game Tyrian released as public domain on [Lostgarden](http://www.lostgarden.com/2007/04/free-game-graphics-tyrian-ships-and.html)
