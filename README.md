# gltf-optimize

使用 `caesiumclt` 压缩文件，`gltfpack` or `gltf-pipline` 来压缩模型

## install gltfpack

 ```shell
  git clone git@github.com:zeux/meshoptimizer.git --depth 1
  cd meshoptimizer
  git clone -b gltfpack https://github.com/zeux/basis_universal --depth 1
  cmake . -DMESHOPT_BUILD_GLTFPACK=ON -DMESHOPT_BASISU_PATH=basis_universal -DCMAKE_BUILD_TYPE=Release
  cmake --build . --target gltfpack --config Release
  cd ..
 ```

## install caesiumclt

```shell
  git clone git@github.com:Lymphatus/caesium-clt.git --depth 1
  cd caesium-clt
  cargo build --release
  cd ..
  npm link
```

## usage

```shell
  // -d  use draco
  gltf-optimize -i ./assets/a.gltf -d
```
