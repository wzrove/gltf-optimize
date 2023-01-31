<template>
  <section
    class="flex h-screen w-screen justify-around gap-x-5 overflow-hidden bg-slate-50 px-10 py-5 dark:bg-black"
  >
    <div
      class="card card-compact max-h-screen w-3/5 bg-base-100 px-10 py-5 transition duration-500 hover:shadow-xl hover:duration-200"
    >
      <div class="flex items-center justify-between">
        <p class="text-xl font-extrabold">贴图压缩</p>
        <div class="form-control">
          <label class="label cursor-pointer gap-1">
            <span class="label-text">开启</span>
            <input type="checkbox" v-model="pictureOption.isOpen" class="toggle" />
          </label>
        </div>
      </div>

      <section class="my-5" v-disabled="pictureOption.isOpen">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">无损压缩</span>
            <input type="checkbox" class="toggle" v-model="pictureOption.lossless" />
          </label>
        </div>
        <div class="form-control">
          <label class="label py-0">
            <span class="label-text">图片质量</span>
            <span class="label-text-alt font-bold"> {{ pictureOption.quality }}</span>
          </label>
          <input
            type="range"
            min="1"
            :step="1"
            :max="100"
            v-model="pictureOption.quality"
            class="range"
            :disabled="pictureOption.lossless"
          />
        </div>
      </section>
      <div class="divider"></div>
      <!-- 模型 -->
      <div class="flex items-center justify-between">
        <p class="text-xl font-extrabold">模型压缩</p>
        <div class="flex items-center justify-between">
          <div class="form-control">
            <label class="label cursor-pointer gap-1">
              <span class="label-text">draco</span>
              <input
                type="radio"
                name="radio-10"
                @change="modeloptionType = 'draco'"
                class="radio"
                checked
              />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer gap-1">
              <span class="label-text">gltfpack</span>
              <input
                type="radio"
                name="radio-10"
                @change="modeloptionType = 'gltfpack'"
                class="radio"
              />
            </label>
          </div>
        </div>
      </div>
      <section v-if="modeloptionType == 'draco'">
        <div
          class="form-control my-2 w-full"
          v-for="list in modelOption.dracoOption"
          :key="list.type"
        >
          <label class="y-0 label">
            <span class="label-text italic">{{ list.description }}</span>
            <span class="label-text-alt font-bold"> {{ list.default }}</span>
          </label>
          <input
            type="range"
            min="0"
            step="1"
            :max="list.max"
            v-model="list.default"
            :class="list.type"
          />
        </div>
      </section>
      <section v-else class="overflow-auto pr-2">
        <section v-for="(value, name) in modelOption.gltfpackOption" :key="name" class="gap-y-1">
          <p class="font-bold">{{ name }}</p>
          <div v-for="item in value" :key="item.target">
            <section class="form-control" v-if="item.type == 'range'">
              <label class="label">
                <span class="label-text">{{ item.description }}</span>
                <span class="label-text-alt font-bold"> {{ item.default }}</span>
              </label>
              <input
                type="range"
                min="0"
                :step="item.setp || 1"
                :max="item?.max"
                v-model="item.default"
                class="range"
              />
            </section>
            <section
              class="form-control"
              v-else-if="item.type == 'switch' && typeof item.default == 'boolean'"
            >
              <label class="label cursor-pointer">
                <span class="label-text">{{ item.description }} {{ item.type }}</span>
                <input type="checkbox" class="toggle" v-model="item.default" />
              </label>
            </section>
            <section
              class="form-control"
              v-else-if="item.type == 'radio' && Array.isArray(item.description)"
            >
              <label
                class="label cursor-pointer"
                v-for="riadio in item.description"
                :key="riadio.value"
              >
                <span class="label-text">{{ riadio.label }}</span>
                <input
                  :name="riadio.value"
                  type="radio"
                  class="radio"
                  @change="item.default = riadio.value"
                  :checked="item.default === riadio.value"
                />
              </label>
            </section>
            <section class="form-control" v-else-if="item.type == 'number'">
              <label class="label cursor-pointer">
                {{ item.description }}
                <input class="input-bordered input input-sm" type="number" v-model="item.default" />
              </label>
            </section>
          </div>
        </section>
      </section>
    </div>

    <div class="container card flex-col gap-y-5">
      <section class="card flex items-center justify-center bg-base-100 p-2">
        <div class="form-control">
          <label class="label"> 选择上传的文件（glb,gltf） </label>
          <input
            type="file"
            accept=".glb,.gltf,.mp4"
            multiple
            :files="filesRef"
            ref="fileRef"
            @change="fileChange"
            class="file-input-bordered file-input w-full max-w-xs"
          />
        </div>
        <div class="stats" v-show="diffFileInfo.isShow">
          <div class="stat">
            <div class="stat-title">Raw Size</div>
            <div class="stat-value">{{ getfilesize(filesRef?.size) || 0 }}</div>
            <div class="stat-actions">
              <button
                class="btn-ghost btn"
                :class="{ loading: buttonState.isLoading }"
                @click="uploadFile"
                >{{ buttonState.text }}</button
              >
            </div>
          </div>

          <div class="stat">
            <div class="stat-title">Current Size</div>
            <div class="stat-value">{{ getfilesize(diffFileInfo?.CurSize) || 0 }}</div>
            <div class="stat-actions">
              <input
                type="text"
                placeholder="文件名显示在这儿，可修改"
                class="input-bordered input input-xs text-black"
                v-model="diffFileInfo.fileName"
              />
              <button
                class="btn-sm btn"
                @click="fileDownload"
                :disabled="diffFileInfo.filePath ? false : true"
              >
                下载</button
              >
            </div>
          </div>
        </div>
      </section>
      <!-- <div class="mockup-window h-full w-full border bg-base-200">
        <div class="flex h-full justify-center bg-base-100 px-4 py-16">show gltf!</div>
      </div> -->
    </div>
  </section>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import Message from 'vue-m-message';

  interface gltfpackOption {
    target: string;
    description:
      | string
      | Array<{
          label: string;
          value: string;
        }>;
    type: 'radio' | 'range' | 'switch' | 'number';
    default: number | string | boolean;
    setp?: number;
    max?: number;
  }
  const pictureOption = reactive({
    isOpen: true,
    quality: 80,
    lossless: false,
  });
  const filesRef = ref<File>();
  const fileChange = (e: Event) => {
    const curEvent = e.currentTarget as HTMLInputElement;
    if (curEvent.files) filesRef.value = curEvent.files[0];
    diffFileInfo.CurSize = 0;
    diffFileInfo.fileName = '';
    diffFileInfo.filePath = '';
  };
  const modeloptionType = ref<'draco' | 'gltfpack'>('draco');
  const modelOption = reactive<{
    dracoOption: Array<gltfpackOption>;
    gltfpackOption: {
      [key: string]: Array<gltfpackOption>;
    };
  }>({
    // "gltfpack"
    dracoOption: [
      {
        target: 'qp',
        default: 11,
        description: 'quantization bits for the position attribute, default=11.',
        max: 30,
        type: 'range',
      },
      {
        target: 'qt',
        default: 10,
        description: ' quantization bits for the texture coordinate attribute, default=10.',
        max: 30,
        type: 'range',
      },
      {
        target: 'qn',
        default: 8,
        description: 'quantization bits for the color attribute, default=8.',
        max: 30,
        type: 'range',
      },
      {
        target: 'qtg',
        default: 8,
        description: ' quantization bits for the tangent attribute, default=8.',
        max: 30,
        type: 'range',
      },
      {
        target: 'qw',
        default: 8,
        description: 'quantization bits for the weight attribute, default=8.',
        max: 30,
        type: 'range',
      },
      {
        target: 'qg',
        default: 8,
        description: 'quantization bits for any generic attribute, default=8.',
        max: 30,
        type: 'range',
      },
    ],
    gltfpackOption: {
      Basic: [
        {
          target: '',
          default: 'cc',
          description: [
            {
              label: ' produce compressed gltf/glb files',
              value: 'c',
            },
            {
              label: 'higher compression ratio',
              value: 'cc',
            },
          ],
          type: 'radio',
        },
      ],
      Textures: [
        {
          target: '',
          default: 'tc',
          description: [
            {
              label: 'convert all textures to KTX2 with BasisU supercompression',
              value: 'tc',
            },
            {
              label: 'use UASTC when encoding textures (much higher quality and much larger size)',
              value: 'tu',
            },
            {
              label: '不使用ktx2 or UASTC 编码纹理',
              value: '',
            },
          ],
          type: 'radio',
        },
        {
          target: 'tq',
          default: 8,
          description: ' set texture encoding quality (default: 8; N should be between 1 and 10',
          type: 'range',
          max: 10,
        },
        {
          target: 'ts',
          default: 1,
          description:
            'scale texture dimensions by the ratio R (default: 1; R should be between 0 and 1)',
          type: 'range',
          setp: 0.1,
          max: 1,
        },
      ],
      Simplification: [
        {
          target: 'si',
          default: 1,
          description:
            'simplify meshes targeting triangle count ratio R (default: 1; R should be between 0 and 1)',
          type: 'range',
          setp: 0.1,
          max: 1,
        },
        {
          target: 'sa',
          default: false,
          description: 'aggressively simplify to the target ratio disregarding quality',
          type: 'switch',
        },
      ],
      Vertices: [
        {
          target: 'vp',
          default: 14,
          description:
            ' use N-bit quantization for positions (default: 14; N should be between 1 and 16)',
          type: 'range',
          max: 16,
        },
        {
          target: 'vt',
          default: 12,
          description:
            'use N-bit quantization for texture coordinates (default: 12; N should be between 1 and 16)',
          type: 'range',
          max: 16,
        },
        {
          target: 'vn',
          default: 8,
          description:
            'use N-bit quantization for normals and tangents (default: 8; N should be between 1 and 16)',
          type: 'range',
          max: 16,
        },
        {
          target: 'vc',
          default: 8,
          description:
            'use N-bit quantization for colors (default: 8; N should be between 1 and 16)',
          type: 'range',
          max: 16,
        },
        {
          target: 'vpn',
          default: false,
          description: 'use normalized attributes for positions instead of using integers',
          type: 'switch',
        },
      ],
      Animations: [
        {
          target: 'at',
          default: 16,
          description:
            'use N-bit quantization for translations (default: 16; N should be between 1 and 24)',
          type: 'range',
          max: 24,
        },
        {
          target: 'at',
          default: 12,
          description:
            ' use N-bit quantization for rotations (default: 12; N should be between 4 and 16)',
          type: 'range',
          max: 16,
        },
        {
          target: 'af',
          default: 30,
          description: 'resample animations at N Hz (default: 30)',
          type: 'number',
          max: Infinity,
        },
        {
          target: 'ac',
          default: false,
          description:
            'keep constant animation tracks even if they don`t modify the node transform',
          type: 'switch',
        },
      ],
      Scene: [
        {
          target: 'kn',
          default: false,
          description:
            'keep named nodes and meshes attached to named nodes so that named nodes can be transformed externally',
          type: 'switch',
        },
        {
          target: 'km',
          default: false,
          description: ' keep named materials and disable named material merging',
          type: 'switch',
        },
        {
          target: 'ke',
          default: false,
          description: 'keep extras data',
          type: 'switch',
        },
        {
          target: 'mm',
          default: false,
          description: ' merge instances of the same mesh together when possible',
          type: 'switch',
        },
        {
          target: 'mi',
          default: false,
          description: ' use EXT_mesh_gpu_instancing when serializing multiple mesh instances',
          type: 'switch',
        },
      ],
    },
  });

  const getCliOPtion = (option: Array<gltfpackOption>, type: 'draco' | 'gltfpack') =>
    option
      .map((val) => {
        if (val.type == 'range' || val.type == 'number') {
          return `-${val.target}${type == 'draco' ? '=' : ' '}${val.default}`;
        } else if (val.type == 'radio') {
          return val.default ? `-${val.default}` : '';
        } else if (val.type == 'switch' && val.default) {
          return `-${val.target}`;
        }
      })
      .filter((val) => val);

  const uploadFile = async () => {
    try {
      buttonState.isLoading = true;
      const formData = new FormData();
      if (Array.isArray(filesRef.value)) {
        console.log('暂不支持多文件');
      } else if (filesRef.value) {
        formData.append('gltf', filesRef.value);
      }
      let cliOptions;
      if (modeloptionType.value == 'draco') {
        cliOptions = getCliOPtion(modelOption.dracoOption, 'draco');
      } else {
        let options: Array<gltfpackOption> = [];
        for (const key in modelOption.gltfpackOption) {
          const curOption = toRaw(modelOption.gltfpackOption[key]);
          console.log(curOption);
          options.push(...curOption);
        }
        cliOptions = getCliOPtion(options, 'gltfpack');
      }
      formData.append('cliOptions', JSON.stringify(cliOptions));
      formData.append('modeloptionType', JSON.stringify(modeloptionType.value));
      formData.append('pictureOption', JSON.stringify(pictureOption));

      const res = await fetch('/uploadFile', {
        method: 'post',
        body: formData,
      });
      const { code, msg, data } = await res.json();
      if (code != 200) {
        throw new Error(msg);
      } else {
        buttonState.text = '再次压缩文件';
        Message.success(msg);
        diffFileInfo.CurSize = data[0].size;
        diffFileInfo.filePath = data[0].filePath + '.glb';
        diffFileInfo.fileName = data[0].fileName;
      }
      buttonState.isLoading = false;
    } catch (error) {
      Message.error(error as string);
      buttonState.isLoading = false;
    }
  };

  const buttonState = reactive({
    isLoading: false,
    text: '压缩文件',
  });
  const diffFileInfo = reactive({
    isShow: true,
    RawSize: 0,
    CurSize: 0,
    fileName: '',
    filePath: '',
  });
  // let ws: WebSocket;

  // const wsServer = () => {
  //   if (ws?.readyState == 1) {
  //     return ws;
  //   } else
  //     return new Promise((res: (value: WebSocket) => void, rej) => {
  //       ws = new WebSocket('ws://localhost:3000/scoket');
  //       ws.onopen = () => {
  //         res(ws);
  //       };
  //       ws.onclose = () => {
  //         rej('连接关闭');
  //       };
  //       ws.onerror = () => {
  //         rej('连接失败');
  //       };
  //       ws.onmessage = ({ data }) => {
  //         const { type, msg, data: _data } = JSON.parse(data);
  //         console.log(_data);
  //         if (type == 'compression') {
  //           buttonState.isLoading = false;
  //           diffFileInfo.filePath = _data.fileName + '.glb';
  //           diffFileInfo.fileName = _data.fileName;
  //           diffFileInfo.CurSize = _data.size;
  //           buttonState.text = '压缩完成';
  //           Message.success(msg);
  //         }
  //       };
  //     });
  // };
  function getfilesize(size: number | undefined) {
    if (!size) return '';
    var num = 1024.0; //byte
    if (size < num) return size + 'B';
    if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + 'KB'; //kb
    if (size < Math.pow(num, 3)) return (size / Math.pow(num, 2)).toFixed(2) + 'MB'; //M
    if (size < Math.pow(num, 4)) return (size / Math.pow(num, 3)).toFixed(2) + 'G'; //G
    return (size / Math.pow(num, 4)).toFixed(2) + 'T'; //T
  }
  const fileDownload = () => {
    const url = `${import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin}${
      diffFileInfo.filePath
    }`;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', diffFileInfo.fileName + '.glb');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
</script>
