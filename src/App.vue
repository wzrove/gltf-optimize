<template>
  <section class="flex h-screen w-screen gap-x-5 overflow-hidden bg-base-100 px-10 py-5">
    <ComperssionOption />
    <div class="container card flex-col gap-y-5 overflow-hidden">
      <section
        class="flex flex-row items-center justify-around gap-y-2 bg-base-200 p-2 transition duration-500 hover:shadow-xl hover:duration-200"
      >
        <div>
          <div class="form-control w-full max-w-xs">
            <label class="label-text label">
              <span class="label-text">请上传mp4文件进行切片</span>
              <dropList
                class="label-text-alt"
                :data="videoList.data"
                :active-value="curActiveName"
                @on-click="(e) => (videoList.activeIndex = e)"
                @on-delete="deleteVideoOption"
              />
            </label>
            <input
              type="file"
              :file="videoFile"
              accept=".mp4"
              @change="videoFileChange"
              class="file-input-bordered file-input w-full max-w-xs"
              :multiple="false"
            />
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">对该视频的描述</span>
            </label>

            <textarea
              class="textarea-bordered textarea h-14"
              v-model="videoFroms.videoDec"
              placeholder="简短的描述该视频"
            ></textarea>
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">视频名称</span>
            </label>
            <div class="input-group">
              <input
                type="text"
                placeholder="请输入视频名称"
                max="10"
                class="input-bordered input text-black"
                v-model="videoFroms.videoName"
              />
              <button
                class="btn"
                @click="uploadVideo"
                :disabled="
                  uploadLoadding || (videoFroms.videoName && videoFroms.videoDec) ? false : true
                "
                :class="{ loading: uploadLoadding }"
              >
                上传</button
              >
              <button
                class="btn"
                @click="getExportData"
                :disabled="downloadLoadding"
                :class="{ loading: downloadLoadding }"
              >
                导出</button
              >
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center gap-y-2">
          <div class="form-control">
            <label class="label"> 选择上传的文件（glb,gltf） </label>
            <input
              type="file"
              accept=".glb,.gltf"
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
                <button
                  class="btn"
                  :class="{ loading: buttonState.isLoading }"
                  @click="uploadFile"
                  >{{ buttonState.text }}</button
                >
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
  import { fetchOption, getCompressionOption } from './CompressionOption';
  import dropList from './dropList.vue';

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

  const videoList = reactive({
    activeIndex: 0,
    data: [],
    originData: [],
  });

  const curActiveName = computed(() => videoList.data[videoList.activeIndex]);
  const deleteVideoOption = async () => {
    try {
      const res = await fetchOption(
        { mode: 'delete', optionIndex: videoList.activeIndex },
        '/handVideoOption',
      );
      const data = await res.json();
      Message.success(data.msg);
      await getVideoList();
    } catch (error) {
      Message.error(error || JSON.parse(String(error)));
    }
  };
  const getVideoList = async () => {
    const res = await fetchOption({ mode: 'get' }, '/handVideoOption');
    const { data } = await res.json();
    videoList.originData = data;
    videoList.data = data.map((val: any) => {
      return val.videoName;
    });
    videoList.activeIndex = 0;
  };
  getVideoList();

  const videoFroms = reactive({
    videoName: '',
    videoDec: '',
  });
  const videoFile = ref<File>();

  const uploadLoadding = ref(false);
  const uploadVideo = async () => {
    uploadLoadding.value = true;
    try {
      const formData = new FormData();
      formData.append('videoName', videoFroms.videoName);
      formData.append('videoDec', videoFroms.videoDec);
      if (videoFile.value) formData.append('videoFile', videoFile.value);
      else Message.error('请选择mp4文件');
      const res = await fetch('/uploadVideo', {
        method: 'post',
        body: formData,
      });
      const data = await res.json();
      Message.success(data.msg);
      await getVideoList();
    } catch (error) {
      Message.error(error || JSON.parse(String(error)));
    }
    uploadLoadding.value = false;
  };
  const videoFileChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    if (target.files) {
      videoFile.value = target.files[0];
      videoFroms.videoDec = '';
      videoFroms.videoName = '';
    }
  };

  const downloadLoadding = ref(false);
  const getExportData = async () => {
    downloadLoadding.value = true;
    try {
      const res = await fetch('/exportData');
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.blob();
      console.log(res, data, '-----');
      let downloadElement = document.createElement('a');
      let href = window.URL.createObjectURL(data);
      downloadElement.href = href;
      downloadElement.download = 'dist.tar.gz';
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);
      Message.success('下载成功');
    } catch (error) {
      console.log(error);
      Message.error(error || JSON.parse(String(error)));
    }
    downloadLoadding.value = false;
  };
</script>
