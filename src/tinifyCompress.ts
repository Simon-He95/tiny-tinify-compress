import { cwd } from 'node:process'
import path from 'path'
import tinify from 'tinify'
import chokidar from 'chokidar'
import ora from 'ora'
import figlet from 'figlet'
import { fileTypeFromFile } from 'file-type'
import { readPackageJSON } from 'pkg-types'
export async function tinifyCompress() {
  const pkg = await readPackageJSON(path.resolve(cwd(), './package.json')) as any
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
          const spinner = ora({ text: `Loading ${pathDir}`, color: 'yellow' }).start()
          const { mime = '' } = await fileTypeFromFile(pathDir) || {}
          if (!types.includes(mime))
            return spinner.fail(`mime ${mime} is not supported`)
          compressImage(pathDir, spinner)
        }
      })
    })
  })
  function compressImage(path: string, spinner: any) {
    const source = tinify.fromFile(path)
    const copyrighted = source.preserve('copyright', 'creation')
    copyrighted.toFile(path, (err) => {
      if (err)
        return spinner.error(err)
      spinner.succeed(`${path} compressed successfully`)
    })
  }
}

tinifyCompress()

