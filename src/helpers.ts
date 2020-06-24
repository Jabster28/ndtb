import 'colors';
import * as robot from 'robotjs';
let canhold = false;
let cando = false;
let testing = false;
let onhd: () => void;
let moves: string[] = [];
export const startTesting = () => {
  moves = [];
  testing = true;
};
export const onHD = (e: () => Promise<void>) => {
  onhd = e;
};
export const setBag = (e: Piece[]) => {
  bag = e;
};
export const setCurrent = (e: Piece) => {
  current = e;
};
export const setLastPiece = (e: Piece) => {
  lastPiece = e;
};
export const stopTesting = () => {
  // console.log('Tests are over already? Well it was fun while it lasted :D');
  testing = false;
  return moves;
};
/**
 * Whether the current state of the board can be used to complete a New DT Cannon. If this is false, the bot essentially gives up.
 * @type {boolean}
 */
export const canDo = function (val?: boolean): boolean | void {
  if (val === undefined) {
    return cando;
  } else {
    cando = val;
  }
};
/**
 * Whether the current piece can be swapped for "hold"
 * @type {boolean}
 */
export const canHold = function (val?: boolean): boolean | void {
  if (val === undefined) {
    return canhold;
  } else {
    canhold = val;
  }
};
/**
 * Object with X and Y of where to check for the current piece. Every piece should overlap this pixel.
 * @type {Object<string,number>}
 */
export const currentPos: {[dim: string]: number} = {
  x: 630,
  y: 135,
};
/**
 * Array of objects with X and Y of where to check for the next pieces. Every piece should overlap the pixels.
 * @type {Array<Object<string,number>>}
 */
export const nextPos: {[dim: string]: number}[] = [
  {
    x: 826,
    y: 230,
  },
];
export let hex = '';

/** @type {Piece} */
export let current: Piece = '';
/**
 * The currently held piece. Undefined if nothing is held
 * @type {Piece}
 */
export let heldPiece: Piece = '';
/**
 * The last known piece in the matrix. Used for if gravity is enabled and the piece has moved from the recognition position
 * @type {Piece}
 */
export let lastPiece: Piece = '';
/**
 * List of pieces in the "Next" section
 * @type {Piece[]}
 */
export let bag: Piece[] = [];

/**
 * @typedef {(string|undefined)} Piece - A string that represents a Tetris mino, can be undefined or empty
 */
export type Piece = 't' | 'i' | 'o' | 's' | 'z' | 'l' | 'j' | '';
/**
 * Object mapping the hex colors of pieces in the matrix to their piece name
 * @type {Object<string,Piece>}
 */
export const currentPieceMap: {[hexColor: string]: Piece} = {
  a9fd5e: 's',
  eb47ce: 't',
  '00fcb9': 'i',
  ffd455: 'o',
  '6649dd': 'j',
  ff7f43: 'l',
  ff3244: 'z',
};
/**
 * Array of objects mapping the hex colors of pieces in the next box to their piece name
 * @type {Array<Object<string,Piece>>}
 */
export const nextPieceMap: {[hexColor: string]: Piece}[] = [
  {
    ae469a: 't',
    bc6941: 'l',
    '84b84e': 's',
    be3943: 'z',
    '4fe6b8': 'i',
    '5947a4': 'j',
    e6c970: 'o',
  },
];

/**
 * Sleep function
 * @param {number} ms Time to sleep in milliseconds
 */
export const sleep = (ms: number) => {
  return new Promise(res => {
    return setTimeout(res, ms);
  });
};

/**
 * Calculates which piece is in play and the current bag
 */
export const calcStuff = async function () {
  // console.log('start');
  // console.log(`current piece ${current}`);
  // console.log(`current bag ${bag}`);
  // console.log(`last piece ${lastPiece}`);
  // console.log(`last bag ${lastBag}`);

  bag = [];
  await sleep(3);
  if (!testing) {
    hex = robot.getPixelColor(currentPos.x, currentPos.y);
    current = currentPieceMap[hex];
  }
  // console.log(current);
  // console.log(hex);
  // if (current === undefined) {
  //   var hex = robot.getPixelColor(x, y + 22);
  //   // @ts-ignore
  //   current = pieceMap.current[hex];
  //   console.log(current);
  //   console.log(hex);
  //   s;
  // }
  if (current !== undefined) {
    lastPiece = current;
  }
  // console.log(`hex current ${hex}`);
  // next piece
  if (!testing) {
    hex = robot.getPixelColor(nextPos[0].x, nextPos[0].y);

    bag.push(nextPieceMap[0][hex]);
    // console.log(`hex next ${hex}`);
  }
  // console.log(`current is ${current}`);
  // console.log(`next is ${bag[0]}`);
  if (current === undefined) {
    current = lastPiece;
  }

  // console.log('end');
  // console.log(`current piece ${current}`);
  // console.log(`last piece ${lastPiece}`);
  await sleep(10);
};

/**
 * DAS all the way to the specified direction
 * @param {boolean} [right=true] Whether the piece should go right or not. Defaults to true
 * @category PieceMovement
 */
export const das = async (right = true) => {
  if (right) {
    if (!testing) robot.keyToggle('right', 'down');
    await sleep(30);
    if (!testing) robot.keyToggle('right', 'up');
    await sleep(5);
  } else {
    if (!testing) robot.keyToggle('left', 'down');
    await sleep(30);
    if (!testing) robot.keyToggle('left', 'up');
    await sleep(5);
  }
  if (testing) moves.push('das');
};
/**
 * Soft drops the current piece
 * @category PieceMovement
 */
export const sd = async () => {
  if (!testing) robot.keyToggle('down', 'down');
  await sleep(20);
  if (!testing) robot.keyToggle('down', 'up');
  await sleep(5);
  if (testing) moves.push('sd');
};
/**
 * Hard drops the current piece
 * @category PieceMovement
 */
export const hd = async () => {
  if (!testing) robot.keyTap('space');
  canHold(true);
  if (!testing) await calcStuff();
  // console.log(
  //   `is ${is} ts ${ts} ls ${ls} js ${js} zs ${zs} ss ${ss} os ${os}`
  // );
  await onhd();
  if (testing) moves.push('hd');
};
/**
 * Tries to hold the specified {@link Piece} and sets it to {@link heldPiece}. If it can't, it sets {@link cando} to false
 * @param {Piece} piece - The piece to hold
 * @category PieceMovement
 */
export const hold = async (piece: Piece) => {
  if (piece === undefined) return;
  if (!canHold()) {
    console.log(
      `${'failed'.red} tried to force hold ${current?.green}, but ${
        heldPiece?.red
      } is already held`
    );
    canDo(false);
  }
  if (!testing) robot.keyTap('c');
  heldPiece = piece;
  lastPiece = '';
  current = '';
  canHold(false);
  await sleep(40);
  await onhd();
  if (testing) moves.push('hold');
};
/**
 * Rotates clockwise
 * @category PieceMovement
 */
export const cw = async () => {
  if (!testing) robot.keyTap('up');
  if (testing) moves.push('cw');
};
/**
 * Rotates counter-clockwise
 * @category PieceMovement
 */
export const ccw = async () => {
  if (!testing) robot.keyTap('z');
  if (testing) moves.push('ccw');
};
/**
 * Does a 180 spin
 * @category PieceMovement
 */
export const one80 = async () => {
  if (!testing) robot.keyTap('a');
};
/**
 * Moves one square right
 * @category PieceMovement
 */
export const right = async () => {
  if (!testing) robot.keyTap('right');
  if (testing) moves.push('r');
};
/**
 * Moves one square left
 * @category PieceMovement
 */
export const left = async () => {
  if (!testing) robot.keyTap('left');
  if (testing) moves.push('l');
};
export const fail = async function (spin: boolean) {
  if (spin) {
    await cw();
    await sleep(20);
  } else {
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    await hd();
    canHold(true);
    current = '';
    lastPiece = '';

    bag = [];
    canDo(true);
    await sleep(6000);
    console.log('okay, recovered');
  }
};
