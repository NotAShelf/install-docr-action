import { writeFile } from 'fs/promises'
import { createGunzip } from 'zlib'

import { createReadStream, createWriteStream } from 'fs'

const fs = require('fs')
const core = require('@actions/core')
const https = require('https')
const { exec } = require('child_process')
const emitter = require('events').EventEmitter

// Increase the maximum event listeners for the EventEmitter
emitter.setMaxListeners(50)

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
    const request = https.get(url, { followRedirect: true }, response => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
        })
      } else {
        reject(
          new Error(`HTTP request failed with status ${response.statusCode}`)
        )
      }
    })

    request.on('error', err => {
      fs.unlink(dest, () => {
        reject(err)
      })
    })

    // Log the actual URL from which the download is attempted
    core.info(`Downloading from URL: ${request.path}`)
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

    // Request the latest release from the GitHub API with a custom User-Agent header
    // https://docs.github.com/en/rest/reference/repos#get-the-latest-release
    const apiUrl = `https://api.github.com/repos/${githubRepo}/releases/latest`
    const requestOptions = {
      headers: {
        'User-Agent': 'Custom-Installer-Action'
      },
      followRedirect: true // Enable following redirects
    }

    // API request using 'https' module
    // catch the status code if the request fails
    const apiResponse = await new Promise((resolve, reject) => {
      https
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

    // Construct the download URL using the tag and repo URL (i.e NotAShelf/Docr)
    const url = `https://github.com/${githubRepo}/releases/download/${tag}`
    core.info(`Constructed download URL: ${url}`)

    core.info(
      `Two files will be downloaded: docr_${cleanTag}_linux_amd64.tar.gz and templates.tar.gz`
    )

    // Download and extract docr.tar.gz with retries
    await downloadFileWithRetry(
      `${url}/docr_${cleanTag}_linux_amd64.tar.gz`,
      'docr.tar.gz'
    )

    // Download and extract templates.tar.gz with retries
    await downloadFileWithRetry(`${url}/templates.tar.gz`, 'templates.tar.gz')

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

async function downloadFileWithRetry(
  url,
  dest,
  maxRetries = 3,
  retryDelay = 1000
) {
  let retries = 0
  while (retries < maxRetries) {
    try {
      await downloadFile(url, dest)
      return // Successfully downloaded
    } catch (error) {
      core.warning(
        `Error downloading file from ${url} (retry ${
          retries + 1
        }/${maxRetries}): ${error.message}`
      )
      retries++
      if (retries < maxRetries) {
        core.info(`Retrying in ${retryDelay / 1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  throw new Error(`Failed to download file after ${maxRetries} retries.`)
}

// Run the main function
run()
