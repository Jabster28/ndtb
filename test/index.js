/* eslint-disable no-undef */
const main = require('../build/src/index.js');
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
describe('Testing basic patterns', () => {
  it('holds I at start', done => {
    console.log('start async');
    main
      .test(['i'], {
        i: 0,
        o: 0,
        s: 0,
        z: 0,
        l: 0,
        j: 0,
        t: 0,
      })
      .then(res => {
        assert.equal(res.toString(), ['hold'].toString());
        done();
      })
      .catch(err => {
        done(err);
      });
  });
  it('does style two', done => {
    console.log('prestart');
    main
      .test(['j', 'l', 's', 'z', 'i', 'o', 't'], {
        i: 0,
        o: 0,
        s: 0,
        z: 0,
        l: 0,
        j: 0,
        t: 0,
      })
      .then(res => {
        assert.equal(
          res.toString(),
          'ccw,r,hd,das,cw,l,hd,cw,das,hd,ccw,hd,cw,r,hd,das,hd,hd'
        );
        done();
      })
      .catch(err => {
        done(err);
      });
  });
  it('does kaidan when early L', done => {
    console.log('prestart');
    main
      .test(['l', 'o', 'z', 'i', 'j', 's', 't'], {
        i: 3,
        o: 3,
        s: 3,
        z: 3,
        l: 3,
        j: 3,
        t: 3,
      })
      .then(res => {
        assert.equal(
          res.toString(),
          'cw,das,sd,r,hd,das,sd,l,hd,hd,cw,das,hd,cw,r,r,hd,cw,das,hd,ccw,das,r,sd,ccw,hd'
        );
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
