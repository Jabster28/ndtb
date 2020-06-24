/* eslint-disable no-undef */
const help = require('../build/src/helpers.js');
const assert = require('assert');
const originalLogFunction = console.log;
let output;
beforeEach(() => {
  output = '';
  console.log = msg => {
    output += msg + '\n';
  };
});
afterEach(function () {
  console.log = originalLogFunction; // undo dummy log function
  if (this.currentTest.state === 'failed') {
    console.log(output);
  }
});
describe('Testing helper functions', () => {
  it('returns canDo by default', () => {
    assert.equal(help.canDo(), true);
  });
  it('returns canHold by default', () => {
    assert.equal(help.canDo(), true);
  });
  it('sets last used piece to current piece', async () => {
    help.startTesting();
    help.setLastPiece('l');
    help.setCurrent('');
    await help.calcStuff();
    help.stopTesting();
    assert.equal(help.getCurrent(), 'l');
  });
  it('sets current piece to last used', async () => {
    help.startTesting();
    help.setLastPiece('');
    help.setCurrent('l');
    await help.calcStuff();
    help.stopTesting();
    assert.equal(help.lastPiece, 'l');
  });
  it('onhd runs function', done => {
    help.onHD(() => {
      done();
    });
    help.hd();
  });
});
