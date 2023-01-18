import Koa from 'koa'
import Router from 'koa-router'
import { koaBody } from 'koa-body'
import serve from 'koa-static'
import { createReadStream } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
const app = new Koa()
const router = new Router()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const catchPath = __dirname + '/catch'
const assetsPath = __dirname + '/assets'

app.use(async (ctx, next) => {
  try {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  } catch (error) {
    if (error.status === 401) {
      ctx.body = {
        code: error.status,
        msg: error.message
      }
    }
  }
})

router.post('/uploadFile', (ctx) => {
  if (ctx.request.files) {
    const file = ctx.request.files
    ctx.body = {
      msg: '文件上传成功',
      url: ctx.request.origin + '/' + file[123].newFilename,
    }
  } else {
    ctx.throw(400, '文件上传失败')
  }
})




app.use(router.routes()).use(router.allowedMethods())

app.use(serve('./assets'))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFieldsSize: Infinity,
    uploadDir: catchPath,
    keepExtensions: true,
  }
}))

app.listen(3000).on('error', (err) => {
  console.log(err)
})
