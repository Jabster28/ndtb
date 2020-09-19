import * as robot from 'robotjs';
import {sleep} from './helpers';
const e = robot.getMousePos();
console.log(e);
(async () => {
  for (let i = 0; i < 8; i++) {
    console.log(robot.getPixelColor(e.x, e.y));
    robot.keyTap(' ');
    await sleep(500);
  }
})();
