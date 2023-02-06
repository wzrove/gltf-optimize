import Koa from 'koa';
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import staticServe from 'koa-static';
import cors from 'koa2-cors';
import fse from 'fs-extra';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { compression } from './index.mjs';
const app = new Koa();
const router = new Router();
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const catchPath = __dirname + '/catch';
const assetsPath = __dirname + '/dist';
const optionPath = __dirname + '/options.json';
try {
  await fse.mkdir(catchPath);
  await fse.mkdir(assetsPath + '/gltf');
} catch (error) {
  console.error(error);
}

export const optionJSON = await fse.readJSON(optionPath);

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
        ctx.body = { msg: error.message };
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        msg: '请上传gltf,glb文件',
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
