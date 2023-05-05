# 安装必要的相关工具用于多阶段构建共用该阶段。
FROM ubuntu:22.04 AS base
ADD ./sources.list /etc/apt/sources.list
RUN apt-get update && \
  DEBIAN_FRONTEND="noninteractive" \
  apt-get install -y --no-install-recommends  \
  git  wget \
  ca-certificates \
  g++  \
  gcc  \
  cmake  make \
  gdb && \
  apt-get autoremove -y && \
  apt-get clean -y &&\
  rm -rf /var/lib/apt/lists/* &&\
  wget --no-check-certificate https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v18.9.1/node-v18.9.1-linux-x64.tar.gz  && tar -xzvf  node-v18.9.1-linux-x64.tar.gz

#构建相关工具，首先拉代码，然后编译 构建draco
FROM base AS dracoBuilder
RUN git clone -b 1.5.6 --depth 1 https://github.com/google/draco.git
RUN cd draco &&  mkdir build_dir && cd build_dir && \
  git submodule update --init &&\
  cmake ../ -DDRACO_TRANSCODER_SUPPORTED=ON && make -j $(nproc)


FROM base AS caesiumcltCode
RUN git clone https://github.com/Lymphatus/caesium-clt.git --depth 1

#构建caesium-clt
FROM rust AS caesiumcltBuilder
ADD ./config /usr/local/cargo/config.toml
COPY --from=caesiumcltCode /caesium-clt   /caesium-clt/
RUN cd  /caesium-clt  && cargo build --release

#构建gltf-pack
FROM base AS gltfpack
RUN   git clone --depth 1 https://github.com/zeux/meshoptimizer.git  && \
  cd meshoptimizer && git clone -b gltfpack --depth 1 https://github.com/zeux/basis_universal
RUN cd /meshoptimizer &&  cmake . -DMESHOPT_BUILD_GLTFPACK=ON -DMESHOPT_BASISU_PATH=basis_universal -DCMAKE_BUILD_TYPE=Release && \
  cmake --build . --target gltfpack --config Release -j $(nproc)

FROM ubuntu:22.04 AS runtime
COPY .  /gltf-optimize/
# 移动构建产
COPY --from=dracoBuilder /draco/build_dir/draco_transcoder-1.5.6  /gltf-optimize/server/tools/draco_transcoder
COPY --from=caesiumcltBuilder /caesium-clt/target/release/caesiumclt  /gltf-optimize/server/tools/caesiumclt
COPY --from=gltfpack /meshoptimizer/gltfpack  /gltf-optimize/server/tools/gltfpack
COPY --from=base /node-v18.9.1-linux-x64  /node-v18.9.1-linux-x64

ENV PATH="/node-v18.9.1-linux-x64/bin:${PATH}"

# 构建源码
RUN cd /gltf-optimize && \
  corepack enable pnpm && \
  pnpm --registry https://registry.npmmirror.com install && pnpm run build
# 暴露端口
EXPOSE 3000/tcp
CMD [ "node", "/gltf-optimize/server/server.mjs"]
