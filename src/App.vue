<template>
  <section class="flex h-screen w-screen gap-x-5 overflow-hidden bg-base-100 px-10 py-5">
    <ComperssionOption />
    <div class="container card flex-col gap-y-5 overflow-hidden">
      <section
        class="card flex items-center justify-center gap-y-2 bg-base-200 p-2 transition duration-500 hover:shadow-xl hover:duration-200"
      >
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
            <div class="stat-title">原始大小</div>
            <div class="stat-value">{{ getfilesize(filesRef?.size) || 0 }}</div>
            <div class="stat-actions">
              <button class="btn" :class="{ loading: buttonState.isLoading }" @click="uploadFile">{{
                buttonState.text
              }}</button>
            </div>
          </div>

          <div class="stat">
            <div class="stat-title">压缩后大小</div>
            <div class="stat-value">{{ getfilesize(diffFileInfo?.CurSize) || 0 }}</div>
            <div class="stat-actionsg flex items-center justify-around gap-x-2">
              <div class="input-group">
                <input
                  type="text"
                  placeholder="文件名，可修改"
                  class="input-bordered input text-black"
                  v-model="diffFileInfo.fileName"
                />
                <button
                  class="btn"
                  @click="fileDownload"
                  :disabled="diffFileInfo.filePath ? false : true"
                >
                  下载</button
                >
              </div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-title">压缩用时</div>
            <div class="stat-value">{{ diffFileInfo.time }}S</div>
          </div>
        </div>
      </section>
      <DiffCompressedGltf
        :left-file="filesRef"
        :right-file="diffFileInfo.fileName ? curFilePath : ''"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import Message from 'vue-m-message';
  import DiffCompressedGltf from './DiffCompressedGltf.vue';
  import ComperssionOption from './ComperssionOption.vue';
  import { getCompressionOption } from './CompressionOption';

  const filesRef = ref<File>();

  const curFilePath = computed(
    () =>
      `${import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin}${
        diffFileInfo.filePath
      }`,
  );

  const fileChange = (e: Event) => {
    const curEvent = e.currentTarget as HTMLInputElement;
    if (curEvent.files) filesRef.value = curEvent.files[0];
    diffFileInfo.CurSize = 0;
    diffFileInfo.fileName = '';
    diffFileInfo.filePath = '';
    diffFileInfo.time = 0;
  };

  const uploadFile = async () => {
    try {
      buttonState.isLoading = true;
      const formData = new FormData();
      if (Array.isArray(filesRef.value)) {
        console.log('暂不支持多文件');
      } else if (filesRef.value) {
        formData.append('gltf', filesRef.value);
      }
      const { cliOptions, modeloptionType, pictureOption } = getCompressionOption();
      formData.append(
        'option',
        JSON.stringify({
          cliOptions,
          modeloptionType,
          pictureOption,
        }),
      );

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
        diffFileInfo.time = Number(data[0].time);
      }
      buttonState.isLoading = false;
    } catch (error) {
      Message.error(error as string, {
        closable: true,
      });
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
    time: 0,
  });
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
    const url = curFilePath.value;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', diffFileInfo.fileName + '.glb');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
</script>
./CompressionOption
