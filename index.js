#! /usr/bin/env node

import { Command } from 'commander'
import gltfPipeline from 'gltf-pipeline'
import fse from 'fs-extra'
import { exec } from 'child_process';
import { promisify } from 'util'
import { basename, dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const program = new Command();
const resultsFiles = resolve(homedir() + '/gltf-optimize-result')
console.log(homedir())
program
  .name('gltf-optimizer')
  .description('gltf  optimize with meshoptimizer and caesiumclt')
  .version('0.0.1');


program
  .configureOutput({
    writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
    outputError: (str, write) => write(errorColor(str))
  })
  .requiredOption('-i, --input <char>', 'file path ')
  .option('-d, --draco', 'optimize with draco')
  .action(async ({ input, output, draco }) => {
    await fse.mkdirp(resultsFiles)
    await checkFileExtension(input, async ({ extName, fullName, baseName, fullPath }) => {
      try {
        let gltfData;
        const options = {
          separateTextures: true,
          resourceDirectory: dirname(fullPath)
        };
        if (extName == '.gltf') {
          const gltf = await fse.readJSON(fullPath)
          gltfData = await gltfPipeline.processGltf(gltf, options)
        } else {
          const gltf = await fse.readFile(fullPath)
          gltfData = await gltfPipeline.processGlb(gltf, options)
        }
        const catchName = `${__dirname}/catch/${baseName}/`
        const catchFullPath = catchName + fullName
        await fse.mkdirp(catchName)
        await fse.writeJSON(catchFullPath, gltfData.gltf);
        const separateResources = gltfData.separateResources;
        for (const relativePath in separateResources) {
          if (separateResources.hasOwnProperty(relativePath)) {
            const resource = separateResources[relativePath];
            fse.writeFileSync(catchName + relativePath, resource);
          }
        }
        await promisify(exec)(`${__dirname}/tools/caesiumclt -q=80  -o=${catchName} ${catchName}`)
        const targetFilePath = resultsFiles + '/' + baseName + '.glb';
        if (draco) {
          const files = await fse.readJson(catchFullPath)
          const file = await gltfPipeline.gltfToGlb(files, {
            dracoOptions: {
              compressionLevel: 10,
            },
            resourceDirectory: catchName
          })
          await fse.writeFile(targetFilePath, file.glb);
        } else {
          await promisify(exec)(`${__dirname}/tools/gltfpack -i ${catchFullPath} -o ${targetFilePath} -cc -tu C -tj 4 -vpf `)
        }
        const size = await (await fse.stat(targetFilePath)).size
        return size
      } catch (error) {
        console.error(error)
      }
    })
  });

program.parse();


/**
 * @param {string} path 
 * @param {({extName,baseName,fullName})=> viod} fn 
 * @returns 
 */
async function checkFileExtension(path, fn, isSp) {
  const fsState = await fse.stat(path)
  const fileType = fsState.isFile() ? 'file' : 'directory';
  const curExtname = extname(path)
  const baseName = basename(path, curExtname)
  const rawSize = fsState.size
  const fullName = basename(path)
  if (fileType == 'file') {
    if (['.glb', '.gltf'].includes(curExtname)) {
      console.time(fullName)
      const size = await fn({
        extName: curExtname,
        baseName: baseName,
        fullName,
        fullPath: path
      })
      const loseSize = rawSize - size;
      console.timeEnd(fullName)
      if (loseSize > 0)
        console.log(`${getfilesize(rawSize)} => ${getfilesize(size)}  [-${(loseSize / rawSize).toFixed(2) * 100}% | - ${getfilesize(loseSize)}]`)
      else
        console.log(getfilesize(size))
      console.log(`file save ${resultsFiles + '/' + baseName + '.glb'}
      `)
    }
    else
      return
  } else {
    const dir = await fse.readdir(path)
    for (const iterator of dir) {
      await checkFileExtension(path + '/' + iterator, fn)
    }
  }
}


function errorColor(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  return `\x1b[31m${str}\x1b[0m`;
}

//把字节转换成正常文件大小
function getfilesize(size) {
  if (!size) return "";
  var num = 1024.00; //byte
  if (size < num)
    return size + "B";
  if (size < Math.pow(num, 2))
    return (size / num).toFixed(2) + "KB"; //kb
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + "MB"; //M
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
  return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
}