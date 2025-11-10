import Phaser from 'phaser';

const PLAYER_SPEED = 300;
const INITIAL_OBSTACLE_DELAY = 1200;
const MIN_OBSTACLE_DELAY = 450;
const OBSTACLE_SPEED = 260;
const SCORE_INTERVAL = 250;

// Global reference to the scene instance
let globalSceneInstance = null;

class EndlessRunnerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndlessRunnerScene' });
  }

  init() {
    this.gameActive = false;
    this.score = 0;
    this.bestScore = 0;
    this.obstacleDelay = INITIAL_OBSTACLE_DELAY;
  }

  create() {
    // Store global reference to this scene instance
    globalSceneInstance = this;
    
    this.cursors = this.input.keyboard.createCursorKeys();

    // Pre-create obstacle texture
    this.createObstacleTexture();

    this.createBackground();
    this.createPlayer();
    this.createUI();
    this.createGroups();
    this.createTimers();

    // Collision detection will be handled in update() method

    // Make sure player is visible and on correct depth
    if (this.player) {
      this.player.setDepth(2);
      this.player.setVisible(true);
    }

    this.events.emit("score-change", this.score);
    console.log("Scene created, player at:", this.player?.x, this.player?.y);
  }

  createObstacleTexture() {
    // Create a standard obstacle texture (we'll scale it as needed)
    const graphics = this.make.graphics({ add: false });
    graphics.fillStyle(0xff6bcb, 1);
    graphics.fillRoundedRect(0, 0, 60, 32, 6);
    graphics.generateTexture("obstacle-base", 60, 32);
    graphics.destroy();
  }

  createBackground() {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x050b21);
    bg.setDepth(-2);

    // Decorative stripes
    this.add.rectangle(width / 4, height / 2, 4, height, 0x102043).setDepth(-1).setAlpha(0.3);
    this.add.rectangle((width / 4) * 3, height / 2, 4, height, 0x102043).setDepth(-1).setAlpha(0.3);
  }

  createPlayer() {
    const { width, height } = this.scale;

    const graphics = this.make.graphics({ add: false });
    graphics.fillStyle(0x35f0ff, 1);
    graphics.fillRoundedRect(0, 0, 48, 48, 8);
    graphics.generateTexture("runner-player", 48, 48);

    this.player = this.physics.add.sprite(width / 2, height - 80, "runner-player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);
    this.playerSpeedMultiplier = 1;
  }

  createUI() {
    const { width } = this.scale;
    this.scoreText = this.add
      .text(width / 2, 40, "READY", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#35f0ff",
      })
      .setOrigin(0.5);
  }

  createGroups() {
    // Use a regular array to track obstacles instead of a group
    // This prevents display list issues
    this.obstacles = [];
  }

  createTimers() {
    this.obstacleTimer = this.time.addEvent({
      delay: this.obstacleDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
      paused: true,
    });
    console.log("Obstacle timer created:", this.obstacleTimer);
    // Removed scoreTimer - score only increases when obstacles are dodged
  }

  spawnObstacle() {
    if (!this.gameActive) return;
    
    const { width } = this.scale;
    const lanePadding = 60;
    const obstacleWidth = Phaser.Math.Between(40, 80);
    const x = Phaser.Math.Between(lanePadding, width - lanePadding);
    const y = -40;

    // Create rectangle directly - this adds it to the scene's display list
    const obstacle = this.add.rectangle(x, y, obstacleWidth, 32, 0xff6bcb);
    obstacle.setDepth(1);
    obstacle.setVisible(true);
    obstacle.setActive(true);
    
    // Enable physics on the rectangle
    this.physics.add.existing(obstacle);
    obstacle.body.allowGravity = false;
    obstacle.body.setVelocityY(OBSTACLE_SPEED + this.score * 0.8);
    obstacle.body.setImmovable(true);
    obstacle.setData("isObstacle", true);
    obstacle.setData("scored", false); // Track if this obstacle has been scored

    // Add to obstacles array for collision detection
    this.obstacles.push(obstacle);
    
    console.log("Obstacle spawned at", x, y, "Width:", obstacleWidth, "Visible:", obstacle.visible, "Total obstacles:", this.obstacles.length);

    if (this.obstacleTimer && this.obstacleTimer.delay > MIN_OBSTACLE_DELAY) {
      this.obstacleTimer.delay = Math.max(
        MIN_OBSTACLE_DELAY,
        this.obstacleTimer.delay - 10,
      );
    }
  }

  incrementScore(amount) {
    if (!this.gameActive) return;
    this.score += amount;
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.events.emit("score-change", this.score);
  }

  handlePlayerHit = (_player, obstacle) => {
    if (!this.gameActive) return;
    this.gameActive = false;
    this.stopTimers();

    // Camera shake effect on collision
    this.cameras.main.shake(200, 0.01);
    
    // Sound effect removed - no audio file loaded

    this.scoreText.setText(`GAME OVER\nSCORE: ${this.score}`);
    this.events.emit("game-over", this.score);
  };

  update(time, delta) {
    if (!this.gameActive) return;
    this.handlePlayerMovement(delta);
    this.checkCollisions();
    this.cleanupObstacles();
  }

  checkCollisions() {
    if (!this.player || !this.obstacles || !Array.isArray(this.obstacles)) return;
    
    this.obstacles.forEach((obstacle) => {
      if (!obstacle || !obstacle.active || !obstacle.body) return;
      if (this.physics.world.overlap(this.player, obstacle)) {
        this.handlePlayerHit(this.player, obstacle);
      }
    });
  }

  handlePlayerMovement(delta) {
    if (!this.cursors || !this.player) return;
    const moveAmount = PLAYER_SPEED * this.playerSpeedMultiplier;

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-moveAmount);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(moveAmount);
    } else {
      this.player.setVelocityX(0);
    }
  }

  cleanupObstacles() {
    const { height } = this.scale;
    // Check all obstacles in the array
    if (this.obstacles && Array.isArray(this.obstacles)) {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obstacle = this.obstacles[i];
        if (!obstacle || !obstacle.active) {
          this.obstacles.splice(i, 1);
          continue;
        }
        
        // If obstacle passed the bottom of screen and hasn't been scored yet
        if (obstacle.y > height + 40) {
          const alreadyScored = obstacle.getData("scored");
          if (!alreadyScored) {
            // Award 1 point for dodging this obstacle
            this.incrementScore(1);
            obstacle.setData("scored", true);
          }
          obstacle.destroy();
          this.obstacles.splice(i, 1);
        }
      }
    }
  }

  startGame() {
    if (this.gameActive) return;
    console.log("Scene startGame() called");
    this.resetGameObjects();
    this.score = 0;
    this.gameActive = true;
    this.scoreText.setText("SCORE: 0");

    if (this.obstacleTimer) {
      this.obstacleTimer.paused = false;
      this.obstacleTimer.delay = INITIAL_OBSTACLE_DELAY;
      console.log("Obstacle timer unpaused, delay:", this.obstacleTimer.delay);
    } else {
      console.error("Obstacle timer not found!");
    }

    // Score timer removed - score only increases when obstacles are dodged

    this.events.emit("score-change", this.score);
    console.log("Game started, gameActive:", this.gameActive);
  }

  stopTimers() {
    if (this.obstacleTimer) {
      this.obstacleTimer.paused = true;
    }
    // Score timer removed
  }

  resetGameObjects() {
    this.gameActive = false;
    this.stopTimers();
    // Destroy all obstacles and clear array
    if (this.obstacles && Array.isArray(this.obstacles)) {
      this.obstacles.forEach(obstacle => {
        if (obstacle && obstacle.destroy) {
          obstacle.destroy();
        }
      });
      this.obstacles.length = 0;
    }
    this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
    this.player.setVelocity(0, 0);
    this.score = 0;
    this.events.emit("score-change", this.score);
  }

  resetGame() {
    this.resetGameObjects();
    this.scoreText.setText("READY");
  }
}

// Phaser 3 game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  parent: 'phaser-game-container',
  backgroundColor: "#050b21",
  scene: EndlessRunnerScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export default config;

// Export function to get the scene instance
export function getSceneInstance() {
  return globalSceneInstance;
}

