import Koa from 'koa';
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import staticServe from 'koa-static';
import cors from 'koa2-cors';
import fse from 'fs-extra';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { compression, getNameByPath } from './index.mjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, readFile } from 'fs/promises';
const app = new Koa();
const router = new Router();
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const catchPath = __dirname + '/catch';
const assetsPath = __dirname + '/dist';
const optionPath = __dirname + '/options.json';
const videoPath = __dirname + '/videoList.json';

const m3u8Path = __dirname + '/dist/m3u8';

try {
  await fse.mkdir(assetsPath + '/gltf');
  await fse.mkdir(assetsPath + '/m3u8');
  await fse.mkdir(catchPath);
} catch (error) {
  console.error(error);
}

export const optionJSON = await fse.readJSON(optionPath);
export const videoJSON = await fse.readJSON(videoPath);

// let wsServer;
app.use(staticServe(assetsPath));
app.use(async (ctx, next) => {
  const start = new Date();
  try {
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms ${ctx.ip}`);
  } catch (error) {
    const ms = new Date() - start;
    console.log(`error ${ctx.method} ${ctx.url} - ${ms}ms`);
    ctx.body = {
      code: error.status || 400,
      msg: error.message,
    };
  }
});

router.post(
  '/uploadFile',
  koaBody({
    multipart: true,
    encoding: 'gzip',
    jsonStrict: false,
    formidable: {
      maxFieldsSize: Infinity,
      maxFields: Infinity,
      maxTotalFileSize: Infinity,
      maxFileSize: Infinity,
      uploadDir: catchPath,
      keepExtensions: true,
    },
  }),
  async (ctx) => {
    if (ctx.request.files.gltf) {
      const file = ctx.request.files.gltf;
      try {
        const bodyData = ctx.request.body;
        const paramData = bodyData.optionKey
          ? optionJSON[bodyData.optionKey]
          : JSON.parse(bodyData.option);
        const data = await compression({
          input: catchPath + '/' + file.newFilename,
          ...paramData,
          rawFileName: file.originalFilename,
        });
        ctx.body = {
          code: 200,
          msg: '文件压缩完毕',
          data,
        };
      } catch (error) {
        ctx.status = 400;
        ctx.body = { msg: error?.message || error };
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        msg: '请上传gltf,glb文件',
      };
    }
  },
);

router.post(
  '/uploadVideo',
  koaBody({
    multipart: true,
    encoding: 'gzip',
    jsonStrict: false,
    formidable: {
      maxFieldsSize: Infinity,
      maxFields: Infinity,
      maxTotalFileSize: Infinity,
      maxFileSize: Infinity,
      uploadDir: catchPath,
      keepExtensions: true,
    },
  }),
  async (ctx) => {
    if (ctx.request.files.videoFile) {
      const file = ctx.request.files.videoFile;
      const bodyData = ctx.request.body;
      try {
        const FilePathInfo = getNameByPath(file.newFilename);
        const curPath = m3u8Path + '/' + FilePathInfo.baseName;
        await mkdir(curPath);
        await promisify(exec)(
          `ffmpeg -i ${
            catchPath + '/' + file.newFilename
          } -c:v h264 -flags +cgop -g 30 -hls_time 10 -hls_list_size 0 -hls_segment_filename  ${curPath}/index%3d.ts ${curPath}/index.m3u8`,
        );
        await fse.remove(catchPath + '/' + file.newFilename);
        const data = {
          oriName: file.originalFilename,
          curName: file.newFilename,
          path: `/m3u8/${FilePathInfo.baseName}/index.m3u8`,
          ...bodyData,
        };
        videoJSON.push(data);
        await fse.writeJSON(videoPath, videoJSON);
        ctx.status = 200;
        ctx.body = {
          data,
          msg: '视频切片成功',
        };
        // videoJSON
      } catch (error) {
        ctx.status = 400;
        ctx.body = { msg: error?.message || error };
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        msg: '请上传mp4文件',
      };
    }
  },
);

router.post('/handOption', koaBody(), async (ctx) => {
  try {
    const { optionsKey, optionsValue, mode } = ctx.request.body;
    let data, msg;
    switch (mode) {
      case 'get':
        data = {
          keys: Object.keys(optionJSON),
        };
        msg = '获取成功';
        break;
      case 'set':
        optionJSON[optionsKey] = optionsValue;
        await fse.writeJSON(optionPath, optionJSON);
        msg = '设置成功';
        break;
      case 'delete':
        delete optionJSON[optionsKey];
        await fse.writeJSON(optionPath, optionJSON);
        msg = '删除成功';
        break;
      case 'query':
        data = optionJSON[optionsKey];
        msg = '查询成功';
        break;
      default:
        throw new Error('无法处理此模式');
    }
    ctx.body = {
      code: 200,
      data,
      msg,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { msg: error.message };
  }
});

router.post('/handVideoOption', koaBody(), async (ctx) => {
  try {
    const optionJSON = videoJSON;
    const optionPath = videoPath;
    const { optionsValue, mode, optionIndex } = ctx.request.body;
    let data, msg;
    switch (mode) {
      case 'get':
        data = optionJSON;
        msg = '获取成功';
        break;
      case 'set':
        optionJSON.push(optionsValue);
        await fse.writeJSON(optionPath, optionJSON);
        msg = '设置成功';
        break;
      case 'delete':
        const res = optionJSON.splice(optionIndex, 1);
        await fse.writeJSON(optionPath, optionJSON);
        const list = res[0].path.split('/');
        const len = list.length;
        list.splice(len - 1, 1);
        const path = assetsPath + list.join('/');
        await fse.remove(path);
        msg = '删除成功';
        break;
      default:
        throw new Error('无法处理此模式');
    }
    ctx.body = {
      code: 200,
      data,
      msg,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { msg: error.message };
  }
});

router.get('/exportData', koaBody(), async (ctx) => {
  try {
    await promisify(exec)(`cp ${__dirname}/videoList.json ${assetsPath}/`);
    await promisify(exec)(
      `tar -zcvf ${catchPath}/dist.tar.gz -C${assetsPath}/ videolist.html videoList.json m3u8/ assets/`,
    );
    const fileBuff = await readFile(`${catchPath}/dist.tar.gz`);
    ctx.set('Content-Type', 'application/octet-stream');
    ctx.body = fileBuff;
  } catch (error) {
    console.log(error);
    ctx.status = 400;
    ctx.body = { msg: error.message };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000).on('error', (err) => {
  console.log(err);
});

// wsServer = new WebSocketServer({
//   server: server,
//   path: '/scoket',
// });

// wsServer.addListener;

// wsServer.on('connection', async function connection(ws) {
//   ws.on('error', console.error);
//   ws.on('message', async (data) => {
//     const {
//       type,
//       data: { fileInfo, cliOptions, modeloptionType, pictureOption },
//     } = JSON.parse(data.toString());
//     if (type == 'compression') {
//       await compression({
//         input: catchPath + '/' + fileInfo.fileName,
//         modeloptionType,
//         cliOptions,
//         fileInfo,
//         pictureOption,
//         ws,
//       });
//     }
//   });

//   ws.send('something');
// });
