## 构建安装说明

- 下载源码

  ```bash

  http://git.url.geosv.com/wz/gltf-optimize

  cd gltf-optimize

  ```

- 安装 draco

  ```bash
  // 下载项目
  git clone https://github.com/google/draco.git --depth 1

  cd  draco


  //创建目录
  mkdir build_dir && cd build_dir

  //下载相关依赖
  git submodule update --init

  //构建
  cmake ../ -DDRACO_TRANSCODER_SUPPORTED=ON

  //将构建产物移动到 ./server/tools

  ```

- 安装 caesiumclt

```bash

git clone https://github.com/Lymphatus/caesium-clt.git --depth 1

source "$HOME/.cargo/env"

cargo run build

//将构建产物移动到 ./server/tools
```

- 安装 gltfpack

```bash
git clone https://github.com/zeux/meshoptimizer.git --depth 1

cd  meshoptimizer

git clone -b gltfpack https://github.com/zeux/basis_universal

cmake . -DMESHOPT_BUILD_GLTFPACK=ON -DMESHOPT_BASISU_PATH=basis_universal -DCMAKE_BUILD_TYPE=Release

cmake --build . --target gltfpack --config Release

//将构建产物移动到 ./server/tools
```

## 启动

```bash
安装依赖
pnpm i

构建前端
pnpm run build

运行
pnpm run server
```
