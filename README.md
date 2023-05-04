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
make -j 8

//产物默认位于 /draco/build_dir/draco_transcoder-1.5.2
//将构建产物移动到 ./server/tools
```

- 安装 caesiumclt

```bash
//需要rust环境
 export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
 export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
 sudo curl https://sh.rustup.rs -sSf | sh

git clone https://github.com/Lymphatus/caesium-clt.git --depth 1

vim ~/.cargo/config
# 添加以下内容

--- start ---
[source.crates-io]
replace-with = 'tuna'

[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
--- end ---

source "$HOME/.cargo/env"

cargo build --release

//产物默认位置在 /caesium-clt/target/release/caesiumclt
//将构建产物移动到 ./server/tools
```

- 安装 gltfpack

```bash
git clone https://github.com/zeux/meshoptimizer.git --depth 1

cd  meshoptimizer

git clone -b gltfpack https://github.com/zeux/basis_universal

cmake . -DMESHOPT_BUILD_GLTFPACK=ON -DMESHOPT_BASISU_PATH=basis_universal -DCMAKE_BUILD_TYPE=Release

cmake --build . --target gltfpack --config Release
//构建产物默认位置在 /meshoptimizer/gltfpack
//将构建产物移动到 ./server/tools
```

## 启动

//需要node环境

corepack enable pnpm

```bash
安装依赖
pnpm i

构建前端
pnpm run build

运行
pnpm run server
```
