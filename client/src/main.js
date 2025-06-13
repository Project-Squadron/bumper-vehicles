import './index.css';
import p5 from 'p5';
import socket from './networking/socket.js';
import keyManager from './EventObjects/KeyManager.js';
import mouse from './EventObjects/MouseManager.js';
import timeManager from './EventObjects/TimeManager.js';
import sceneManager from './EventObjects/SceneManager.js';
import Button from './EventObjects/Button.js';
import { rectToRect, rectToCircle } from './utils/collisions.js';

import privateProfileScene from './Scenes/privateProfileScene.js';
import mapScene from './Scenes/mapScene.js';
import gameScene from './Scenes/gameScene.js';

/////////////////////////////////////////////////////
// Register action labels for key codes
/////////////////////////////////////////////////////
keyManager.register("W", "KeyW");
keyManager.register("A", "KeyA");
keyManager.register("S", "KeyS");
keyManager.register("D", "KeyD");
keyManager.register("Space", "Space");
keyManager.register("Shift", "ShiftLeft");
// keyManager.register("Ctrl", "ControlLeft");
// keyManager.register("Ctrl", "ControlRight");
keyManager.register("up", "ArrowUp");
keyManager.register("down", "ArrowDown");
keyManager.register("left", "ArrowLeft");
keyManager.register("right", "ArrowRight");

// register powerup keys 1-5
keyManager.register("one", "1");
keyManager.register("two", "2");
keyManager.register("three", "3");
keyManager.register("four", "4");
keyManager.register("five", "5");
keyManager.register('z', 'z');

/////////////////////////////////////////////////////
// Register Button Shape Types
/////////////////////////////////////////////////////
Button.registerType('rect', rectToRect);
Button.registerType('circle', rectToCircle);

/////////////////////////////////////////////////////
// Register Scenes
/////////////////////////////////////////////////////
sceneManager.addScene("profile", privateProfileScene);
sceneManager.addScene("map", mapScene);
sceneManager.addScene("game", gameScene);
sceneManager.setScene("map");

// Create a new sketch
const sketch = (p) => {
  p.setup = async () => {
    // Create canvas that fills the window
    p.createCanvas(window.innerWidth, window.innerHeight);

    // Attach canvas to scene manager
    sceneManager.attachCanvas(p);

    // Initialize mouse event listeners
    mouse.handleEvents();

    // Set up key event handlers
    p.keyPressed = (event) => {
      keyManager.keyPressed(event.key);
    };

    p.keyReleased = (event) => {
      keyManager.keyReleased(event.key);
    };
  };

  // Handle window resize
  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    // window.location.reload();
  };

  p.draw = () => {
    p.background(51);

    // Reset mouse cursor to default
    mouse.setCursor('default');

    // Update mouse position relative to canvas
    const canvasRect = p.canvas.getBoundingClientRect();
    mouse.move(p.mouseX + canvasRect.left, p.mouseY + canvasRect.top);

    sceneManager.displayScene();

    // Run time intervals
    timeManager.runIntervals();
  };
};

// Create new p5 instance with our sketch
new p5(sketch);