import * as httpServer from 'http';
import * as socket from 'socket.io';
import * as express from 'express';
import * as path from 'path';
import 'colors';
import * as robot from 'robotjs';
var app = express();
let http = httpServer.createServer(app);
let io = socket(http);

// some vars
let run = true;
let canDo = true;
let current = '';
let heldPiece = '';
let lastPiece = '';
let bag: string[] = [];
let lastBag: string[] = [];
const colours = [
  'a9fd5e',
  'eb47ce',
  '00fcb9',
  'ffd455',
  '6649dd',
  'ff7f43',
  'ff3244',
  '010101', // test
  // old old
  '00f9bc',
  'fe854a',
  'ff394a',
  '6c51de',
  'fbd95b',
  'ec4fd0',
  // not so old
  'ff844a',
  'ff3a4c',
  'ed4fd1',
  '00fcbd',
  '6e51df',
  'fed95b',
  '2c2b3c',
];
const pieceMap = {
  current: {
    a9fd5e: 's',
    eb47ce: 't',
    '00fcb9': 'i',
    ffd455: 'o',
    '6649dd': 'j',
    ff7f43: 'l',
    ff3244: 'z',
  },
  next: [
    {
      ae469a: 't',
      bc6941: 'l',
      '84b84e': 's',
      be3943: 'z',
      '4fe6b8': 'i',
      '5947a4': 'j',
      e6c970: 'o',
    },
  ],
};

// functions

// quick promise-based sleep solution
const sleep = (ms: number) => {
  return new Promise(res => {
    return setTimeout(res, ms);
  });
};

// calculates the order of pieces
const calcStuff = async function () {
  return new Promise(async res => {
    // console.log('start');
    // console.log(`current piece ${current}`);
    // console.log(`current bag ${bag}`);
    // console.log(`last piece ${lastPiece}`);
    // console.log(`last bag ${lastBag}`);

    bag = [];
    // current piece
    var x = 630;
    var y = 135;
    await sleep(10);

    var hex = robot.getPixelColor(x, y);
    // @ts-ignore
    current = pieceMap.current[hex];
    // console.log(current);
    // console.log(hex);
    // if (current == undefined) {
    //   var hex = robot.getPixelColor(x, y + 22);
    //   // @ts-ignore
    //   current = pieceMap.current[hex];
    //   console.log(current);
    //   console.log(hex);
    //   s;
    // }
    if (current != undefined) {
      lastPiece = current;
    }
    // console.log(`hex current ${hex}`);
    // next piece
    var x = 826;
    var y = 230;
    var hex = robot.getPixelColor(x, y);

    // @ts-ignore
    bag.push(pieceMap.next[0][hex]);
    // console.log(`hex next ${hex}`);

    // console.log(`current is ${current}`);
    // console.log(`next is ${bag[0]}`);
    if (current == undefined) {
      current = lastPiece;
    }

    // console.log('end');
    // console.log(`current piece ${current}`);
    // console.log(`last piece ${lastPiece}`);
    res();
  });
};

// moves

const das = (right: boolean = true) => {
  return new Promise(async res => {
    if (right) {
      robot.keyToggle('right', 'down');
      await sleep(20);
      robot.keyToggle('right', 'up');
      await sleep(5);
      res();
    } else {
      robot.keyToggle('left', 'down');
      await sleep(20);
      robot.keyToggle('left', 'up');
      await sleep(5);
      res();
    }
  });
};
const sd = () => {
  return new Promise(async res => {
    robot.keyToggle('down', 'down');
    await sleep(10);
    robot.keyToggle('down', 'up');
    res();
  });
};
const hd = () => {
  return new Promise(async res => {
    io.emit('hd');
    robot.keyTap('space');
    canHold = true;
    await calcStuff();
    console.log(
      `is ${is} ts ${ts} ls ${ls} js ${js} zs ${zs} ss ${ss} os ${os}`
    );
    res();
  });
};
const hold = (piece: string) => {
  if (piece == undefined) return;
  return new Promise(async res => {
    if (!canHold) {
      console.log(
        `${'failed'.red} tried to force hold ${current.green}, but ${
          heldPiece.red
        } is already held`
      );
      canDo = false;
    }
    robot.keyTap('c');
    heldPiece = piece;
    lastPiece = '';
    current = '';
    canHold = false;
    await calcStuff();
    res();
    await sleep(10);
  });
};
const cw = () => {
  return new Promise(async res => {
    robot.keyTap('up');
    res();
  });
};
const ccw = () => {
  return new Promise(async res => {
    robot.keyTap('z');
    res();
  });
};
const one80 = () => {
  return new Promise(async res => {
    robot.keyTap('a');
    res();
  });
};
const right = () => {
  return new Promise(async res => {
    robot.keyTap('right');
    res();
  });
};
const left = () => {
  return new Promise(async res => {
    robot.keyTap('left');
    res();
  });
};

// stuff

let canHold: boolean = true;
let style: number | null = null;
let pcType: string | undefined = undefined;
let pcStep: string | undefined = undefined;
let os: number = 0;
let is: number = 0;
let ss: number = 0;
let zs: number = 0;
let ls: number = 0;
let js: number = 0;
let ts: number = 0;

const o = () => {
  return new Promise(async res => {
    if (os == 0) {
      if (style == 1 || style == 2) {
        console.log(`${current.green} normal drop, because style one or two`);
        await das(false);
        await hd();
        os++;
      } else if (style == null) {
        if (bag[0] == 'j' || bag[0] == 'l') {
          console.log(
            `${current.green} setting style to ${'three'.yellow}, since piece ${
              bag[0].yellow
            } is next`
          );

          style = 3;
        } else {
          style = 2;
          console.log(
            `${current.green} setting style to ${'two'.yellow}, since piece ${
              bag[0].yellow
            } is next`
          );
        }
      } else {
        if (ls) {
          if (ss && ts) {
            console.log(
              `${'failed'.red} style three, but the ${
                'L, S and T'.red
              } pieces have already been dropped`
            );
            canDo = false;
          } else if (!ts) {
            console.log(
              `${current.green} two left drop, because there's an L but no T`
            );

            await left();
            await left();
            await sd();
            await right();
            await hd();
            os++;
          } else {
            console.log(
              `${current.green} das & back, because there's a T but no L`
            );

            await das(false);
            await sd();
            await das();
            await hd();
            os++;
          }
        } else {
          console.log(`${current.green} normal drop, because no L`);

          await left();
          await hd();
          os++;
        }
      }
    } else if (os == 1) {
      if (style == 3) {
        if (js && zs) {
          console.log(`${current.green} J and Z exist, dropping`);
          await das();
          await left();
          await hd();
          os++;
        } else {
          console.log(`${current.yellow} J and Z don't exist, holding`);
          await hold(current);
        }
      } else {
        if (ss && ls) {
          console.log(`${current.green} L and S exist, dropping`);
          await das();
          await left();
          await hd();
          os++;
        } else {
          console.log(`${current.yellow} L and S don't exist, holding`);

          await hold(current);
        }
      }
    } else if (os == 2) {
      if (ls >= 2) {
        console.log(`${current.green} L exists, dropping`);
        await das(false);
        await right();
        await sd();
        await right();
        await hd();
        os++;
      } else {
        console.log(`${current.green} no L, dropping`);
        await left();
        await left();
        await hd();
        os++;
      }
    } else if (os == 3) {
      if (ts >= 3) {
        if (pcType == null) {
          if (bag[0] == 'i' || (js >= 2 && ss >= 2 && zs >= 2)) {
            console.log(`${current.blue} no pcType, i next, setting to kaidan`);
            pcType = 'k';
          } else if (bag[0] == 'i') {
            console.log(`${current.blue} no pcType, setting to anchor`);
            pcType = 'a';
          } else {
            console.log(`${current.yellow} no JSZ, no pc type, holding`);
            await hold(current);
          }
        } else if (pcType == 'k') {
          if (is < 3 && js >= 3 && ss >= 3 && zs >= 3) {
            if (ls >= 4) {
              await sleep(20);
              console.log(`${current.green} kaidan, L exists, dropping`);
              await das();
              await sd();
              await left();
              await hd();
              os++;
            } else {
              console.log(`${current.green} kaidan, no L, dropping`);
              await das();
              await sd();
              await left();
              await hd();
              os++;
            }
          } else {
            if (ss < 3) {
              console.log(`${current.yellow} kaidan, no S, holding`);
              await hold(current);
            }
            if (is >= 4) {
              console.log(`${current.green} kaidan, I exists, dropping`);
              await das();
              await sd();
              await left();
              await left();
              await hd();
              os++;
            } else {
              console.log(`${current.green} kaidan, no I, dropping`);
              await das();
              await left();
              await hd();
            }
          }
        } else {
          console.log(`${current.green} anchor, dropping`);
          await das();
          await left();
          await left();
          await hd();
          os++;
        }
      } else {
        console.log(`${current.yellow} tsd not done yet, holding`);
        await hold(current);
      }
    }
    res();
  });
};
const i = () => {
  return new Promise(async res => {
    if (is == 0) {
      if (style == 1 || style == 3) {
        console.log(`${current.green} normal drop, because style one or three`);

        await cw();
        await right();
        await hd();
        is++;
      } else if (style == null) {
        if (bag[0] == 't') {
          style = 3;
        } else if (canHold) {
          console.log(`${current.yellow} holding, because no style`);
          await hold(current);
        } else {
          console.log(
            `${current.yellow} can't hold and no style yet, so dropping`
          );
          await cw();
          await right();
          await hd();
          is++;
        }
      } else {
        if ((ss && !ls) || (zs && !js)) {
          console.log(
            `${current.yellow} holding, because there's an S or Z piece on the field`
          );
          await hold(current);
        } else {
          console.log(`${current.green} no S or Z, so dropping`);
          await cw();
          await right();

          await hd();
          is++;
        }
      }
    } else if (is == 1) {
      if (style == 1 && zs) {
        console.log(`${current.green} style one, z exists, dropping`);
        await cw();
        await das();
        await hd();
        is++;
      } else if (style == 2 && ss) {
        console.log(`${current.green} style two, s exists, dropping`);
        await cw();
        await das();
        await hd();
        is++;
      } else if (style == 3 && ts >= 2) {
        console.log(`${current.green} style three, TSD done, dropping`);
        await cw();
        await das();
        await hd();
        is++;
      } else {
        console.log(`${current.yellow} it doesn't exist, holding`);
        await hold(current);
      }
    } else if (is == 2) {
      if (ss >= 2) {
        console.log(`${current.green} S exists, dropping`);
        await cw();
        await hd();
        is++;
      } else {
        console.log(`${current.yellow} S doesn't exist, holding`);
        await hold(current);
      }
    } else if (is == 3) {
      if (pcType == null || pcType == 'k') {
        // kaidan method
        if (js >= 3 && zs >= 3 && ss >= 3) {
          if (os >= 4) {
            if (js < 4) {
              console.log(`${current.green} O but no J, dropping`);
              await cw();
              await das();
              await hd();
            } else {
              console.log(`${current.green} J and O, dropping`);
              await cw();
              await das();
              await hd();
              is++;
            }
          } else {
            if (js >= 4) {
              console.log(`${current.green} J, Z and S, kaidan, dropping`);
              pcType = 'k';
              await das();
              await hd();
              is++;
            } else {
              console.log(`${current.yellow} J but no O, holding`);
              await hold(current);
            }
          }
        } else {
          console.log(`${current.yellow} no JSZ, holding`);
          await hold(current);
        }
      }
    }

    res();
  });
};
const s = () => {
  return new Promise(async res => {
    if (ss == 0) {
      if (style == 1) {
        if (ls) {
          console.log(`${current.green} style one, L exists, dropping`);
          await hd();
          ss++;
        } else {
          console.log(`${current.yellow} style one, L doesn't exist, holding`);
          await hold(current);
        }
      } else if (style == 2) {
        if (!ls) {
          if (!is) {
            console.log(`${current.green} style two, no L or I, dropping`);
            await cw();
            await das();
            await hd();
            ss++;
          } else {
            console.log(
              `${current.yellow} style two, L doesn't exist and there's an I, holding`
            );
            await hold(current);
          }
        } else {
          console.log(`${current.green} style two, L exists, dropping`);
          await cw();
          await das();
          await hd();
          ss++;
        }
      } else if (style == 3) {
        if (canHold && !os) {
          console.log(`${current.yellow} no O, holding`);
          await hold(current);
        } else {
          console.log(`${current.green} style three, dropping`);
          await cw();
          await das(false);
          // await sd();
          // await right();
          // await right();
          // await sd();
          // await right();
          await hd();

          ss++;
        }
      } else {
        if (bag[0] == 'i') {
          console.log(
            `${current.blue} no style yet, I is next, setting to three`
          );
          style = 3;
        } else {
          console.log(`${current.blue} no style yet, setting to two`);
          style = 2;
        }
      }
    } else if (ss == 1) {
      if (ts) {
        console.log(`${current.green} T has been placed, dropping`);
        await cw();
        await hd();
        ss++;
      } else {
        console.log(`${current.green} no T, holding`);
        await hold(current);
      }
    } else if (ss == 2) {
      if (zs >= 3) {
        if (js >= 3) {
          console.log(
            `${current.green} Z exists but J is in the way, doing a funky`
          );
          await das();
          await cw();
          await left();
          await sd();
          await cw();
          await hd();
          ss++;
        } else {
          console.log(`${current.green} Z exists, dropping`);
          await das();
          await hd();
          ss++;
        }
      } else {
        console.log(`${current.yellow} Z doesn't exist, holding`);
        await hold(current);
      }
    } else if (ss == 3) {
      if (pcType == null) {
        if (bag[0] == 'l') {
          console.log(`${current.blue} no pcType, L next, kaidan`);
          pcType = 'k';
          console.log(`${current.yellow} kaidan, no L, holding`);
          await hold(current);
        } else if (bag[0] == 'j') {
          console.log(`${current.blue} no pcType, J next, anchor`);
          pcType = 'a';
          console.log(`${current.yellow} anchor, no J, holding`);
          await hold(current);
        }
      } else if (pcType == 'k' && ls >= 4) {
        console.log(`${current.green} kaidan, L exists, dropping`);
        await cw();
        await das(false);
        await hd();
        ss++;
      } else if (pcType == 'a' && js >= 4) {
        console.log(`${current.green} anchor, J exists, dropping`);
        await cw();
        await das(false);
        await hd();
        ss++;
      }
    }

    res();
  });
};
const z = () => {
  return new Promise(async res => {
    if (zs == 0) {
      // await das(false);
      // await hd();
      // zs++;
      if (style == 1) {
        if (js) {
          console.log(`${current.green} style one, J exists, dropping`);
          await das();
          await hd();
          zs++;
        } else {
          console.log(`${current.yellow} style one, no J, holding`);
          await hold(current);
        }
      } else if (style == 2) {
        // cw left down right ccw down right down right ccw
        if (js == 1) {
          if (ts) {
            console.log(
              `${current.green} style two, J and T exist, doing a funky`
            );

            await cw();
            await das(false);
            await sd();
            await right();
            await ccw();
            await sd();
            await right();
            await sd();
            await right();
            await ccw();
            await right();

            await hd();
            zs++;
          } else {
            console.log(`${current.green} style two, J exists, dropping`);
            await ccw();
            await hd();
            zs++;
          }
        } else if (is) {
          console.log(`${current.yellow} style two, no J but I, holding`);

          await hold(current);
        } else {
          console.log(`${current.green} style two, no J, dropping`);
          await ccw();
          // await left();
          await hd();
          zs++;
        }
      } else if (style == 3) {
        console.log(`${current.green} style three, dropping`);
        await cw();
        await das();
        await hd();
        zs++;
      } else {
        if (bag[0] == 'i') {
          console.log(
            `${current.blue} no style yet, I is next, setting to three`
          );
          style = 3;
        } else {
          console.log(`${current.blue} no style yet, setting to two`);
          style = 2;
        }
      }
    } else if (zs == 1) {
      if (is && os >= 2) {
        console.log(`${current.green} first I and second O, dropping`);
        await cw();
        await right();
        await right();
        await hd();
        zs++;
      } else {
        console.log(`${current.green} no IO, holding`);
        await hold(current);
      }
    } else if (zs == 2) {
      if (os >= 2 && is >= 2) {
        console.log(`${current.green} O and I have been placed, dropping`);
        await cw();
        await das();
        await hd();
        zs++;
      } else {
        console.log(`${current.yellow} no OI, holding`);
        await hold(current);
      }
    } else if (zs == 3) {
      if (ls >= 3 && is >= 3) {
        console.log(`${current.green} L and I exist, dropping`);
        await hd();
        zs++;
      }
    }

    res();
  });
};
const j = () => {
  return new Promise(async res => {
    if (js == 0) {
      if (style == 1) {
        console.log(`${current.green} style one, dropping`);
        await das();
        await hd();
        js++;
      } else if (style == 2) {
        // up right right down 180 left
        if (ts || zs) {
          if (is) {
            console.log(
              `${'failed'.red} style two, T and I exist, can't drop J`
            );
            canDo = false;
          } else {
            console.log(`${current.green} style two, T exists, doing a funky`);
            await cw();
            await right();
            await right();
            await sd();
            await one80();
            await sd();
            await left();
            await hd();
            js++;
          }
        } else {
          console.log(`${current.green} style two, no T, dropping`);
          await ccw();
          await right();
          await hd();
          js++;
        }
      } else if (style == 3) {
        if (zs) {
          console.log(`${current.green} style three, Z exists, dropping`);
          await das();
          await cw();
          await left();
          await hd();
          js++;
        } else {
          console.log(`${current.yellow} style three, no Z, holding`);
          await hold(current);
        }
      } else {
        console.log(
          `${current.yellow} no style, ${bag[0].blue} next, switching to two`
        );
        style = 2;
      }
    } else if (js == 1) {
      if (style == 3) {
        if (ts >= 2) {
          console.log(`${current.green} first tsd done, dropping`);
          await cw();
          await das(false);
          await hd();
          js++;
        } else {
          console.log(`${current.yellow} no tsd yet, holding`);
          await hold(current);
        }
      } else {
        console.log(`${current.green} dropping`);
        await cw();
        await das(false);
        await hd();
        js++;
      }
    } else if (js == 2) {
      if (zs >= 2) {
        console.log(`${current.green} Z exists, dropping`);
        await cw();
        await right();
        await right();
        await hd();
        js++;
      } else {
        console.log(`${current.green} no Z piece, holding`);
        await hold(current);
      }
    } else if (js == 3) {
      if (ss >= 3) {
        if (is >= 4) {
          console.log(`${current.green} I exists, dropping`);
          await ccw();
          await das();
          await hd();
          js++;
        } else {
          console.log(`${current.green} no I, dropping`);
          await cw();
          await right();
          await right();
          await hd();
          js++;
        }
      } else {
        console.log(`${current.yellow} no S, holding`);
        await hold(current);
      }
    } else if (js == 4) {
      if (pcType == 'k') {
        if (is >= 4) {
          console.log(`${current.green} dropping`);
          await cw();
          await das();
          await hd();
          js++;
        } else {
          console.log(`${current.yellow} no I, holding`);
          await hold(current);
        }
      }
    }
    res();
  });
};
const l = () => {
  return new Promise(async res => {
    if (ls == 0) {
      if (style == 1) {
        console.log(`${current.green} style one, dropping`);
        await hd();
        ls++;
      } else if (style == 2) {
        if (ss) {
          console.log(`${current.green} style two, S, dropping`);
          await cw();
          await right();
          await right();
          await sd();
          await right();
          await hd();
          ls++;
        } else {
          console.log(`${current.green} style two, I, dropping`);
          await das();
          await cw();
          await left();
          await hd();
          ls++;
        }
      } else if (style == 3) {
        console.log(`${current.green} style three, dropping`);
        await ccw();
        await right();
        await hd();
        ls++;
      } else {
        if (bag[0] == 's' || bag[0] == 'o' || bag[0] == 'i' || bag[0] == 'j') {
          console.log(
            `${current.yellow} no style, ${bag[0].blue} next, switching to two`
          );
          style = 2;
        } else {
          console.log(
            `${current.yellow} no style, ${bag[0].blue} next, switching to three`
          );
          style = 3;
        }
      }
    } else if (ls == 1) {
      if (ts) {
        console.log(`${current.green} T has been placed, dropping`);
        await ccw();
        await left();
        await hd();
        ls++;
      } else {
        console.log(`${current.green} no T, holding`);
        await hold(current);
      }
    } else if (ls == 2) {
      if (ss >= 2) {
        console.log(`${current.green} L exists, dropping`);
        await ccw();
        await hd();
        ls++;
      } else {
        console.log(`${current.green} no L, holding`);
        await hold(current);
      }
    } else if (ls == 3) {
      if (ts < 3) {
        console.log(`${current.yellow} no tss, holding`);
        await hold(current);
      } else if (pcType == null || pcType == 'k') {
        if (pcType == null) {
          console.log(`${current.blue} no pcType, setting to kaidan`);
          pcType = 'k';
        } else {
          console.log(`${current.green} kaidan, dropping`);
          await cw();
          await das(false);
          await sd();
          await right();
          await hd();
          ls++;
        }
      }
    }

    res();
  });
};
const t = () => {
  return new Promise(async res => {
    if (ts == 0) {
      if (style == 1 && ss) {
        console.log(`${current.green} style one, S exists, dropping`);
        await hd();
        ts++;
      } else if (style == 2 && (js || (zs && !ts))) {
        console.log(`${current.green} style two, J exists, dropping`);
        await hd();
        ts++;
      } else if (style == 3 && ls) {
        console.log(`${current.green} style three, L exists, dropping`);
        await hd();
        ts++;
      } else {
        if (bag[0] == 'i') {
          console.log(`${current.blue} style two, because I piece next`);
          style = 2;
        }
        console.log(`${current.yellow} nothing, holding`);
        await hold(current);
      }
    } else if (ts == 1 || ts == 2) {
      if (style != 3) {
        if (ts == 2 && is < 2) {
          console.log(`${current.yellow} no I, holding`);
          await hold(current);
        } else if (ls >= 2 && js >= 2) {
          console.log(`${current.green} J and L exist, doing tsd`);
          await cw();
          await das(false);
          await sd();
          await ccw();
          await ccw();
          await sd();
          await ccw();
          if (ts == 2) {
            await ccw();
          } else {
            await right();
            await sd();
            await right();
          }
          await sd();
          await hd();
          ts++;
        } else if (js >= 2) {
          if (canHold && !(bag[0] == 'z' && is >= 2 && os < 2)) {
            console.log(`${current.yellow} J exists but L doesn't, holding`);
            await hold(current);
          } else {
            console.log(
              `${'failed'.red} T piece, can't hold, and  ${
                'J'.red
              } piece exists without the L`
            );
            canDo = false;
          }
        } else if (ls >= 2) {
          if (canHold && !(bag[0] == 'z' && is >= 2 && os < 2)) {
            console.log(`${current.yellow} Z next, no I, holding`);
            await hold(current);
          } else {
            console.log(`${current.green} T piece, can't hold, doing tsd`);
            await cw();
            await das(false);
            await sd();
            await ccw();
            if (ts == 2) await ccw();
            await sd();
            await right();
            if (ts == 1) await one80();
            await hd();
            ts++;
          }
        } else {
          if (canHold && bag[0] != 'z') {
            console.log(`${current.yellow} holding`);
            await hold(current);
          } else {
            console.log(`${current.green} T piece, can't hold, doing tsd`);
            await ccw();
            await left();
            await left();
            await sd();
            await ccw();
            await hd();
            ts++;
          }
        }
      } else {
        if (ss && os) {
          if (ts == 2 && js < 3) {
            console.log(`${current.yellow} no J, holding`);
            await hold(current);
          } else {
            console.log(`${current.green} doing tsd`);
            await cw();
            await das(false);
            await sd();
            if (ts == 2) {
              await ccw();
              await ccw();
            }
            await ccw();
            await right();
            await sd();
            await ccw();
            if (ts == 1) {
              await right();
              await sd();
              await ccw();
            }
            await hd();
            ts++;
          }
        } else {
          console.log(`${current.yellow} no SO, holding`);
          await hold(current);
        }
      }
    } else if (ts == 3) {
    }

    res();
  });
};
// SEMICOLON
const start = async () => {
  run = true;
  console.log('ready'.bold);
  while (run) {
    if (canDo) {
      await calcStuff();
      // console.log(style);
      // if (!bag[0]) continue;
      // console.log(`${current}(), dropped ${eval(current + 's')} times so far`);
      switch (current) {
        case 't':
          await t();
          break;

        case 'i':
          await i();
          break;

        case 'o':
          await o();
          break;

        case 's':
          await s();
          break;

        case 'j':
          await j();
          break;

        case 'l':
          await l();
          break;

        case 'z':
          await z();
          break;

        default:
      }
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
      canHold = true;
      style = null;
      current = '';
      lastPiece = '';
      pcType = undefined;
      pcStep = undefined;
      bag = [];
      os = 0;
      is = 0;
      ss = 0;
      zs = 0;
      ls = 0;
      js = 0;
      ts = 0;
      canDo = true;
      await sleep(6000);
      console.log('okay, recovered');
    }
  }
  // sd();
};
// 650, 135
// colors = []

// ???, ????, 00f9bc fe854a ff394a 6c51de fbd95b ec4fd0 old

// 650, 135, ff844a ff3a4c ed4fd1 00fcbd 6e51df fed95b 2c2b3c old
// 630, 135, a9fd5e eb47ce 00fcb9 ffd455 6649dd ff7f43 ff3244 current
// 826, 230, ae469a bc6941 84b84e be3943 4fe6b8 5947a4 e6c970 next 1

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

io.on('connection', socket => {
  socket.on('start', () => start());
  socket.on('stop', () => {
    run = false;
    console.log('stopped'.red);
  });
  socket.on('redo', () => {
    canDo = false;
    console.log('commiting sudoku...'.red);
  });
});

http.listen(8080, () => {
  console.info(`${'online'.green} running on port 8080`);
});
start();
