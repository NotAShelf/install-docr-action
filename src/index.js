const core = require('@actions/core')
const fs = require('fs').promises
const http = require('https')
const { createGunzip } = require('zlib')

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    http
      .get(url, response => {
        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
        })
      })
      .on('error', err => {
        fs.unlink(dest)
        reject(err)
      })
  })
}

async function untarFile(tarFile, targetDir) {
  return new Promise((resolve, reject) => {
    const tarStream = fs.createReadStream(tarFile).pipe(createGunzip())
    const extract = require('tar').Extract({ path: targetDir })

    tarStream.pipe(extract)

    extract.on('end', () => {
      resolve()
    })

    extract.on('error', err => {
      reject(err)
    })
  })
}

async function run() {
  try {
    const githubRepo = core.getInput('github-repo')
    const installDir = core.getInput('install-dir')
    const githubUsername = core.getInput('github-username')
    const websiteName = core.getInput('website-name')
    const templateDir = core.getInput('template-dir')
    const markdownDir = core.getInput('markdown-dir')
    const outputDir = core.getInput('output-dir')
    const websiteURL = core.getInput('website-url')
    const websiteDescription = core.getInput('website-description')
    const timestampsFromFilename = core.getInput('timestamps-from-filename')

    const apiUrl = `https://api.github.com/repos/${githubRepo}/releases/latest`
    const requestOptions = {
      headers: {
        'User-Agent': 'Custom-Installer-Action'
      }
    }

    // API request using 'https' module
    const response = await new Promise((resolve, reject) => {
      http
        .get(apiUrl, requestOptions, response => {
          let data = ''
          response.on('data', chunk => {
            data += chunk
          })
          response.on('end', () => {
            if (response.statusCode === 200) {
              resolve(JSON.parse(data))
            } else {
              reject(
                new Error(
                  `API request failed with status ${response.statusCode}`
                )
              )
            }
          })
        })
        .on('error', reject)
    })

    const tag = response.tag_name
    const cleanTag = tag.replace('v', '')

    core.setOutput('installed-version', cleanTag)

    const url = `https://github.com/${githubRepo}/releases/download/${tag}`
    core.info(`Constructed download URL: ${url}`)

    core.info(
      `Two files will be downloaded: docr_${cleanTag}_linux_amd64.tar.gz and templates.tar.gz`
    )

    await downloadFile(
      `${url}/docr_${cleanTag}_linux_amd64.tar.gz`,
      'docr.tar.gz'
    )
    await downloadFile(`${url}/templates.tar.gz`, 'templates.tar.gz')
    await untarFile('docr.tar.gz', installDir)
    await untarFile('templates.tar.gz', installDir)

    // installer settings
    const settings = {
      githubUsername,
      websiteName,
      templateDir,
      markdownDir,
      outputDir,
      websiteURL,
      websiteDescription,
      timestampsFromFilename: timestampsFromFilename === 'true'
    }

    await fs.writeFile(
      `${installDir}/settings.json`,
      JSON.stringify(settings, null, 2)
    )
  } catch (error) {
    core.setFailed(error.message)
  }
  run()
}
