//    Copyright 2017 Christopher Kรถnig (Kura)
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

// monkey patch
const _use = require('stylus/lib/renderer').prototype.use
require('stylus/lib/renderer').prototype.use = function (fn) {
  if (typeof fn === 'string') {
    fn = require(fn)
  }
  return _use.call(this, fn)
}

console.log('Setting up lasso')
const settings = Object.assign(require('../lasso.config.json'), {
  fingerprintsEnabled: true,
  includeSlotNames: false
})
require('lasso').configure(settings)

console.log('Creating build dir')
const fs = require('fs-extra')
const path = require('path')
const outputDir = path.resolve(__dirname, '..', settings.outputDir)
if (fs.existsSync(outputDir)) {
  fs.removeSync(outputDir)
}
fs.mkdirpSync(outputDir)

console.log('Creating index.html')
require('marko/node-require').install()
require('../src/index.marko')
  .render({ debug: true })
  .then(async res => {
    const outfile = path.join(outputDir, 'index.html')
    return await fs.writeFile(outfile, res.toString(), { encoding: 'utf8' })
  })
  .then(() => {
    console.log('All done!')
  })
  .catch(err => {
    console.error(err)
  })
