/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface gltfpackOption {
  target: string;
  description:
    | string
    | Array<{
        label: string;
        translateLabel?: string;
        value: string;
      }>;
  translateDes?: string;
  type: 'radio' | 'range' | 'switch' | 'number';
  default: number | string | boolean;
  setp?: number;
  max?: number;
  min?: number;
}
