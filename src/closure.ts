import fs from 'fs';
import qs from 'querystring';
import axios from 'axios';
axios({
  method: 'POST',
  url: 'https://closure-compiler.appspot.com/compile',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded',
  },
  data: qs.stringify({
    js_code: fs.readFileSync('build/src/index.js').toString(),
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
    output_format: 'text',
    output_info: 'compiled_code',
  }),
})
  .then(e => {
    fs.writeFileSync('build/src/compiledIndex.js', e.data);
  })
  .catch(e => {
    console.log(e);
  });
