import gltfPipeline from 'gltf-pipeline';
import { exec } from 'child_process';
import { promisify } from 'util';
import { basename, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import fse, { remove } from 'fs-extra';
import { hrtime } from 'process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const resultsFiles = resolve(homedir() + '/gltf-optimize-result');

const gltfpackPath = __dirname + '/tools/gltfpack';
const caesiumcltPath = __dirname + '/tools/caesiumclt';
const dracoPath = __dirname + '/tools/draco_transcoder-1.5.5';
const resultsFiles = __dirname + '/dist';

/**
 *
 * @param {{input:string,modeloptionType:'draco'|any,cliOptions:Array<string>,rawFileName:string,ws:import('ws').WebSocket}} param0
 */
export const compression = async ({
  input,
  modeloptionType,
  cliOptions,
  pictureOption,
  rawFileName,
}) => {
  const parse = (data) => (typeof data == 'string' ? JSON.parse(data) : data);
  modeloptionType = modeloptionType;
  cliOptions = parse(cliOptions);
  pictureOption = parse(pictureOption);
  const dataList = [];
  // await fse.mkdirp(resultsFiles);
  await checkFileExtension(input, async ({ extName, baseName, fullPath }) => {
    const startTime = hrtime();
    try {
      let gltfData;
      const options = {
        separate: true,
        resourceDirectory: dirname(fullPath) + '/' + baseName,
      };
      const catchName = `${__dirname}/catch/${baseName}/`;
      const catchFullPath = catchName + '/' + baseName + '.gltf';
      await fse.mkdirp(catchName);
      if (extName == '.gltf') {
        const gltf = await fse.readJSON(fullPath);
        gltfData = await gltfPipeline.processGltf(gltf, options);
      } else {
        const glb = await fse.readFile(fullPath);
        gltfData = await gltfPipeline.glbToGltf(glb, options);
      }
      await fse.writeJSON(catchName + baseName + '.gltf', gltfData.gltf);
      const separateResources = gltfData.separateResources;
      for (const relativePath in separateResources) {
        if (separateResources.hasOwnProperty(relativePath)) {
          const resource = separateResources[relativePath];
          fse.writeFileSync(catchName + relativePath, resource);
        }
      }
      if (pictureOption.isOpen) {
        //q=0 无损压缩
        const imageMsg = await promisify(exec)(
          `${caesiumcltPath} -q=${
            pictureOption.lossless ? 0 : pictureOption.quality
          }  -o=${catchName} ${catchName}`,
        );
        console.log(imageMsg.stdout);
      }
      const targetFilePath = resultsFiles + '/gltf/' + baseName + '.glb';
      let message;
      if (modeloptionType == 'draco') {
        message = await promisify(exec)(
          `${dracoPath} -i ${catchFullPath} -o ${targetFilePath} ${cliOptions.join(' ')} `,
        );
      } else {
        message = await promisify(exec)(
          `${gltfpackPath} -i ${catchFullPath} -o ${targetFilePath} ${cliOptions.join(' ')} -tj 4`,
        );
      }
      console.log(message.stdout);
      const size = await (await fse.stat(targetFilePath)).size;
      const endTime = hrtime(startTime);
      const dataInfo = {
        fileName: baseName,
        filePath: '/gltf/' + baseName,
        rawFileName: rawFileName,
        time: (endTime[0] + endTime[1] / 1000000000).toFixed(2),
        size: size,
      };
      dataList.push(dataInfo);
      await remove(catchName);
      await remove(fullPath);
      return {
        dataInfo,
      };
    } catch (error) {
      if (error?.stdout) {
        const errList = error.stdout.split(`\t`);
        console.log(errList);
        error = errList[2];
      }
      return Promise.reject(error);
    }
  });
  return dataList;
};

/**
 * @param {string} path
 * @param {({extName,baseName,fullName})=> viod} fn
 * @returns
 */
async function checkFileExtension(path, fn) {
  console.log(path);
  try {
    const fsState = await fse.stat(path);
    const fileType = fsState.isFile() ? 'file' : 'directory';
    const curExtname = extname(path);
    const baseName = basename(path, curExtname);
    const fullName = basename(path);

    if (fileType == 'file') {
      if (['.glb', '.gltf'].includes(curExtname)) {
        await fn({
          extName: curExtname,
          baseName: baseName,
          fullName,
          fullPath: path,
        });
      } else return;
    } else {
      const dir = await fse.readdir(path);
      for (const iterator of dir) {
        await checkFileExtension(path + '/' + iterator, fn);
      }
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

//把字节转换成正常文件大小
// function getfilesize(size) {
//   if (!size) return '';
//   var num = 1024.0; //byte
//   if (size < num) return size + 'B';
//   if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + 'KB'; //kb
//   if (size < Math.pow(num, 3)) return (size / Math.pow(num, 2)).toFixed(2) + 'MB'; //M
//   if (size < Math.pow(num, 4)) return (size / Math.pow(num, 3)).toFixed(2) + 'G'; //G
//   return (size / Math.pow(num, 4)).toFixed(2) + 'T'; //T
// }
