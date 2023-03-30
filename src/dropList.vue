<template>
  <div class="dropdown-bottom dropdown">
    <label tabindex="0" class="btn-sm btn">{{ activeValue || '暂无数据' }}</label>
    <ul
      tabindex="0"
      class="dropdown-content rounded-btn flex max-h-40 flex-col flex-nowrap overflow-y-auto bg-base-100 py-1 px-2 shadow"
    >
      <li
        v-for="(item, index) in data"
        :key="index"
        class="flex cursor-pointer flex-row justify-between gap-1 py-2 px-2 text-lg font-medium hover:bg-base-200 hover:rounded-btn"
        ><a @click.capture="$emit('onClick', index)">{{ item }}</a
        ><span class="rounded px-2 hover:bg-base-300" @click.stop="$emit('onDelete')">x</span></li
      >
    </ul>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    data: Array<string>;
    activeValue: string;
  }>();
  defineEmits<{
    (event: 'onClick', id: number): void;
    (event: 'onDelete'): void;
  }>();
</script>
