import { cwd } from 'node:process'
import path from 'path'
import fs from 'fs'
import tinify from 'tinify'
import chokidar from 'chokidar'
import ora from 'ora'
import figlet from 'figlet'
import { fileTypeFromFile } from 'file-type'
import { readPackageJSON } from 'pkg-types'
import imagemin from 'imagemin'
import imageminGifsicle from 'imagemin-gifsicle'

export async function tinifyCompress() {
  const pkg = await readPackageJSON(path.resolve(cwd(), './package.json')) as any
  const buf = Buffer.from('compressed', 'latin1')
  if (!pkg)
    return console.error('package.json not found in current directory')
  const directories: string[] = pkg?.tinifyCompress?.includes
  if (!directories)
    return console.error('please add directories to tinifyCompress.includes in package.json')
  const key = pkg?.tinifyCompress?.key
  if (!key)
    return console.error('Please provide a valid tinify key in package.json tintifyCompress.key')
  tinify.key = key
  figlet('Tinify Compress', (err, data) => {
    if (err)
      return console.log('Something went wrong...')
    console.log(data)
    const types = ['image/webp', 'image/jpeg', 'image/png', 'image/jpg', 'image/jfif']
    directories.forEach((directory) => {
      chokidar.watch(path.resolve(cwd(), directory)).on('all', async (event, pathDir) => {
        if (event === 'add') {
          const data = await fs.readFileSync(pathDir)
          const originalSize = `${(data.length / 1024).toFixed(2)}kb`
          const spinner = ora({ text: `${pathDir}`, color: 'yellow', spinner: 'aesthetic' }).start()
          if (isEqual(data.slice(-10), buf))
            return spinner.succeed(`${pathDir} already compressed 🎉`)
          const { mime = '' } = await fileTypeFromFile(pathDir) || {}
          if (mime === 'image/gif')
            return compressGif(pathDir, spinner, originalSize)
          if (!types.includes(mime))
            return spinner.fail(`mime ${mime} is not supported`)
          compressImage(pathDir, spinner, originalSize)
        }
      })
    })
  })
  function compressImage(pathDir: string, spinner: any, originalSize?: string) {
    const source = tinify.fromFile(pathDir)
    const copyrighted = source.preserve('copyright', 'creation')
    copyrighted.toFile(pathDir, (err) => {
      if (err)
        return spinner.fail(err?.message)
      addFlag(pathDir, spinner, originalSize)
    })
  }
  async function compressGif(pathDir: string, spinner: any, originalSize?: string) {
    const { data } = (await imagemin([pathDir], {
      plugins: [
        imageminGifsicle({
          optimizationLevel: 3,
        }),
      ],
    }))?.[0]

    try {
      addFlag(pathDir, spinner, data, originalSize)
      spinner.succeed(`${pathDir} compressed successfully`)
    }
    catch (error: any) {
      spinner.fail(error)
    }
  }
  function isEqual(arr1: Buffer, arr2: Buffer) {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i])
        return false
    }
    return true
  }
  function addFlag(pathDir: string, spinner: any, source?: Buffer | string, originalSize?: string) {
    if (typeof source === 'string') {
      originalSize = source
      source = undefined
    }
    const data = source ?? fs.readFileSync(pathDir)
    const k = new Uint8Array(data.length + buf.length)
    for (let i = 0; i < data.length; i++)
      k[i] = data[i]

    for (let i = 0; i < buf.length; i++)
      k[data.length + i] = buf[i]
    const newSize = `${(k.length / 1024).toFixed(2)}kb`
    fs.writeFileSync(pathDir, k)
    spinner.succeed(`${pathDir} compressed successfully ${originalSize} => ${newSize}`)
  }
}

tinifyCompress()

