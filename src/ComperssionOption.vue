<template>
  <div
    class="min-w-sm card card-compact max-h-screen w-2/5 bg-base-200 px-10 py-5 transition duration-500 hover:shadow-xl hover:duration-200"
  >
    <div class="flex justify-between">
      <div class="dropdown-bottom dropdown">
        <label tabindex="0" class="btn btn-sm">{{ optionConfig.activeOption }}</label>
        <ul
          tabindex="0"
          class="dropdown-content rounded-btn flex max-h-40 flex-col flex-nowrap overflow-y-auto bg-base-100 py-1 px-2 shadow"
        >
          <li
            v-for="item in optionConfig.optionListKey"
            :key="item"
            class="flex cursor-pointer flex-row justify-between gap-1 py-2 px-2 hover:bg-base-200 hover:rounded-btn"
            ><a @click.capture="optionConfig.activeOption = item">{{ item }}</a
            ><span class="rounded px-2 hover:bg-base-300" @click.stop="delOption(item)">x</span></li
          >
        </ul>
      </div>
      <div class="form-control">
        <div class="input-group">
          <input
            type="text"
            class="input input-sm"
            placeholder="输入名称，保存为新配置"
            v-model="optionConfig.savingOptionName"
          />
          <button class="btn btn-sm" @click="saveOption">
            {{ optionConfig.savingOptionName ? '保存配置' : '更新配置' }}</button
          >
        </div>
      </div>
    </div>
    <div class="divider"></div>

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
              :checked="modeloptionType == 'draco'"
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
              :checked="modeloptionType == 'gltfpack'"
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
          <span class="label-text italic">{{
            showRawDec ? list.description : list.translateDes
          }}</span>
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
              <span class="label-text">{{
                showRawDec ? item.description : item.translateDes
              }}</span>
              <span class="label-text-alt font-bold"> {{ item.default }}</span>
            </label>
            <input
              type="range"
              :min="item.min ?? 1"
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
              <span class="label-text"
                >{{ showRawDec ? item.description : item.translateDes }}
              </span>
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
              <span class="label-text">{{
                showRawDec ? riadio.label : riadio.translateLabel
              }}</span>
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
              {{ showRawDec ? item.description : item.translateDes }}
              <input class="input-bordered input input-sm" type="number" v-model="item.default" />
            </label>
          </section>
        </div>
      </section>
    </section>
  </div>
</template>
<script lang="ts" setup>
  import {
    modeloptionType,
    pictureOption,
    showRawDec,
    modelOption,
    optionConfig,
    saveOption,
    delOption,
  } from './CompressionOption';
</script>
