FROM ubuntu:22.04 AS base
ADD ./sources.list /etc/apt/sources.list
RUN apt-get update && \
  DEBIAN_FRONTEND="noninteractive" \
  apt-get install -y --no-install-recommends  \
  git \
  ca-certificates \
  g++  \
  gcc  \
  cmake  make \
  gdb && \
  apt-get autoremove -y && \
  apt-get clean -y &&\
  rm -rf /var/lib/apt/lists/*

FROM base AS dracoBuilder
RUN   git clone -b 1.5.6 --depth 1 https://github.com/google/draco.git  && \
  cd draco &&  mkdir build_dir && cd build_dir && \
  git submodule update --init && \
  cmake ../ -DDRACO_TRANSCODER_SUPPORTED=ON && make -j $(nproc)

FROM base AS caesiumcltCode
RUN git clone https://github.com/Lymphatus/caesium-clt.git --depth 1

FROM rust AS caesiumcltBuilder
COPY --from=caesiumcltCode /caesium-clt   /caesium-clt/
RUN  cd  /caesium-clt  && cargo build --release

FROM base AS gltfpack
RUN   git clone --depth 1 https://github.com/zeux/meshoptimizer.git  && \
  cd meshoptimizer && git clone -b gltfpack --depth 1 https://github.com/zeux/basis_universal   && \
  cmake . -DMESHOPT_BUILD_GLTFPACK=ON -DMESHOPT_BASISU_PATH=basis_universal -DCMAKE_BUILD_TYPE=Release && \
  cmake --build . --target gltfpack --config Release -j $(nproc)

FROM ubuntu:22.04 AS runtime
COPY .  /gltf-optimize/
COPY --from=dracoBuilder /draco/build_dir/draco_transcoder-1.5.6  /gltf-optimize/server/tools/draco_transcoder
COPY --from=caesiumcltBuilder /caesium-clt/target/release/caesiumclt  /gltf-optimize/server/tools/caesiumclt
COPY --from=gltfpack /meshoptimizer/gltfpack  /gltf-optimize/server/tools/gltfpack
ADD ./sources.list /etc/apt/sources.list

RUN   apt-get update && \
  DEBIAN_FRONTEND="noninteractive"  && \
  apt-get install -y --no-install-recommends  wget && \
  wget --no-check-certificate https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v18.9.1/node-v18.9.1-linux-x64.tar.gz  && tar -xzvf  node-v18.9.1-linux-x64.tar.gz

ENV PATH="/node-v18.9.1-linux-x64/bin:${PATH}"

RUN cd /gltf-optimize && \
  corepack enable pnpm && \
  pnpm --registry https://registry.npmmirror.com install && pnpm run build && \
  apt-get autoremove -y && \
  apt-get clean -y &&\
  rm -rf /var/lib/apt/lists/*;
EXPOSE 3000/tcp
CMD [ "node", "/gltf-optimize/server/server.mjs"]
