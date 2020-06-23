/* eslint-disable no-undef */
const e = require('../build/src/index.js');
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
  it('holds I at start', async () => {
    return e
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
      });
  });
  // const testCase = configureTestCase('allow-js/with-outDir', {
  //   jestConfig: {testMatch: null, testRegex: '(foo|bar)\\.spec\\.[jt]s$'},
  // });

  // testCase.runWithTemplates(allValidPackageSets, 0, (runTest, {testLabel}) => {
  //   it(testLabel, () => {
  //     const result = runTest();
  //     expect(result.status).toBe(0);
  //     expect(result).toMatchSnapshot();
  //   });
  // });
});
