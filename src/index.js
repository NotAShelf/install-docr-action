import { writeFile } from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs'
const fs = require('fs')

const core = require('@actions/core')
const http = require('https')
const { createGunzip } = require('zlib')
const { exec } = require('child_process')

process.setMaxListeners(20)

/**
 * Downloads a file from a given URL and saves it to the destination.
 *
 * @param {string} url - The URL of the file to download.
 * @param {string} dest - The destination path to save the downloaded file.
 * @returns {Promise<void>} - A Promise that resolves when the download is complete.
 */
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
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

/**
 * Untars a Gzipped tar file to a specified target directory.
 *
 * @param {string} tarFile - The path to the tar.gz file to untar.
 * @param {string} targetDir - The target directory to extract the contents to.
 * @returns {Promise<void>} - A Promise that resolves when the untar process is complete.
 */
async function untarFile(tarFile, targetDir) {
  return new Promise((resolve, reject) => {
    const tarStream = createReadStream(tarFile).pipe(createGunzip())
    tarStream.on('error', err => {
      reject(err)
    })

    const untarCmd = `tar -xzvf ${tarFile} -C ${targetDir}`
    exec(untarCmd, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Main function to execute the GitHub Action.
 */
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
    const apiResponse = await new Promise((resolve, reject) => {
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

    const tag = apiResponse.tag_name
    const cleanTag = tag.replace('v', '')

    core.setOutput('installed-version', cleanTag)

    const url = `https://github.com/${githubRepo}/releases/download/${tag}`
    core.info(`Constructed download URL: ${url}`)

    core.info(
      `Two files will be downloaded: docr_${cleanTag}_linux_amd64.tar.gz and templates.tar.gz`
    )

    // Download and extract docr.tar.gz
    await downloadFile(
      `${url}/docr_${cleanTag}_linux_amd64.tar.gz`,
      'docr.tar.gz'
    )

    // Download and extract templates.tar.gz
    await downloadFile(`${url}/templates.tar.gz`, 'templates.tar.gz')

    // Use exec to extract the tar.gz file
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

    await writeFile(
      `${installDir}/settings.json`,
      JSON.stringify(settings, null, 2)
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
