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

const brc = require('browser-refresh-client')
if (!brc.isBrowserRefreshEnabled()) {
  console.error('browser-refresh mode not found! Please use `browser-refresh` or `npm run watch`')
  process.exit(1)
}

let port = 3000
if (process.argv.length > 2) {
  let idx = 2
  if (process.argv[idx] === '--') {
    idx++
  }
  port = +process.argv[idx]
}
const url = `http://localhost:${port}`

console.log('Setting up browser-refresh callbacks')
require('lasso/browser-refresh').enable()

console.log('Setting up lasso')
const settings = Object.assign(require('../lasso.config.json'), {
  fingerprintsEnabled: false,
  includeSlotNames: true
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
const mime = require('mime')
require('../src/index.marko')
  .render({ debug: true })
  .then(async res => {
    const outfile = path.join(outputDir, 'index.html')
    return await fs.writeFile(outfile, res.toString(), { encoding: 'utf8' })
  })
  .then(() => {
    console.log('Creating http server on port', port)
    const http = require('http')
    return new Promise(rs => {
      const server = http.createServer(async (req, res) => {
        console.log('> GET', req.url)
        let file = path.join(__dirname, '..', 'dist', req.url)
        let stat = null

        try {
          stat = await fs.stat(file)

          if (stat.isDirectory()) {
            file = path.join(file, 'index.html')
            stat = await fs.stat(file)
          }
        } catch (err) {
          console.log('<', 500, err.message)
          res.writeHead(500, { 'Access-Control-Allow-Origin': '*' })
          res.write(JSON.stringify(err))
          return res.end()
        }

        if (!stat.isFile()) {
          console.log('<', 404, file)
          res.writeHead(404, { 'Access-Control-Allow-Origin': '*' })
        } else {
          console.log('<', 200, file)
          res.writeHead(200, {
            'Content-Type': mime.getType(file) || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
          })
          const content = await fs.readFile(file)
          res.write(content)
        }

        res.end()
      })

      server.listen(port, 'localhost', () => {
        console.log('Started server on', url)
        rs()
      })
    })
  })
  .then(() => {
    console.log('Telling browser-refresh we are ready')
    process.send({ event: 'online', url })
  })
  .catch(err => {
    console.error(err)
  })
