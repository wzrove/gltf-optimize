import { ref, toRaw, reactive, watch } from 'vue';
import message from 'vue-m-message';
export const modeloptionType = ref<'draco' | 'gltfpack'>('draco');

export const pictureOption = ref({
  isOpen: true,
  quality: 80,
  lossless: false,
});
export const showRawDec = ref(false);
export const modelOption = reactive<{
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
      translateDes: '顶点属性的量化位数，默认=11。',
      max: 30,
      type: 'range',
    },
    {
      target: 'qt',
      default: 10,
      description: 'quantization bits for the texture coordinate attribute, default=10.',
      translateDes: '纹理坐标属性的量化位数，默认=10。',
      max: 30,
      type: 'range',
    },
    {
      target: 'qn',
      default: 8,
      description: 'quantization bits for the color attribute, default=8.',
      translateDes: '颜色属性的量化位数，默认=8。',
      max: 30,
      type: 'range',
    },
    {
      target: 'qtg',
      default: 8,
      description: 'quantization bits for the tangent attribute, default=8.',
      translateDes: '切线属性的量化位数，默认=8。',
      max: 30,
      type: 'range',
    },
    {
      target: 'qw',
      default: 8,
      description: 'quantization bits for the weight attribute, default=8.',
      translateDes: '权重属性的量化位数，默认=8。',
      max: 30,
      type: 'range',
    },
    {
      target: 'qg',
      default: 8,
      description: 'quantization bits for any generic attribute, default=8.',
      translateDes: '其他通用属性的量化位数，默认=8。',
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
            label: 'produce compressed gltf/glb files(requires KHR_mesh_quantization)',
            translateLabel: '基础压缩，需要支持KHR_mesh_quantization',
            value: 'c',
          },
          {
            label: 'higher compression ratio (requires EXT_meshopt_compression)',
            translateLabel: '更高的压缩比例，需要支持EXT_meshopt_compression',
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
            translateLabel: '用BasisU压缩将所有纹理转换为KTX2格式',
            value: 'tc',
          },
          {
            label: 'use UASTC when encoding textures (much higher quality and much larger size)',
            translateLabel: '编码纹理时使用UASTC（质量高，尺寸大，耗时久）。',
            value: 'tu',
          },
          {
            label: '不使用以上两种方式压缩编码纹理',
            translateLabel: '不使用以上两种方式压缩编码纹理',
            value: '',
          },
        ],
        type: 'radio',
      },
      {
        target: 'tq',
        default: 8,
        description: 'set texture encoding quality (default: 8; N should be between 1 and 10）',
        translateDes: '设置纹理编码的质量（默认：8；N应该在1到10之间）。',
        type: 'range',
        max: 10,
      },
      {
        target: 'ts',
        default: 1,
        description:
          'scale texture dimensions by the ratio R (default: 1; R should be between 0 and 1)',
        translateDes: '按比例R缩放纹理尺寸（默认：1；R应该在0到1之间）。',
        type: 'range',
        setp: 0.1,
        max: 1,
        min: 0,
      },
    ],
    Simplification: [
      {
        target: 'si',
        default: 1,
        description:
          'simplify meshes targeting triangle count ratio R (default: 1; R should be between 0 and 1)',
        translateDes: '简化网格的目标是三角形计数比率R（默认：1；R应该在0到1之间）。',
        type: 'range',
        setp: 0.1,
        min: 0,
        max: 1,
      },
      {
        target: 'sa',
        default: false,
        description: 'aggressively simplify to the target ratio disregarding quality',
        translateDes: '无视质量，积极简化',
        type: 'switch',
      },
    ],
    Vertices: [
      {
        target: 'vp',
        default: 14,
        description:
          'use N-bit quantization for positions (default: 14; N should be between 1 and 16)',
        translateDes: '顶点属性的量化位数，默认=14',
        type: 'range',
        max: 16,
      },
      {
        target: 'vt',
        default: 12,
        description:
          'use N-bit quantization for texture coordinates (default: 12; N should be between 1 and 16)',
        translateDes: '纹理坐标的量化位数，默认=12',
        type: 'range',
        max: 16,
      },
      {
        target: 'vn',
        default: 8,
        description:
          'use N-bit quantization for normals and tangents (default: 8; N should be between 1 and 16)',
        translateDes: '法线及切线的量化位数，默认=8',
        type: 'range',
        max: 16,
      },
      {
        target: 'vc',
        default: 8,
        description: 'use N-bit quantization for colors (default: 8; N should be between 1 and 16)',
        translateDes: '颜色属性的量化位数，默认=8',
        type: 'range',
        max: 16,
      },
      {
        target: 'vpn',
        default: false,
        description: 'use normalized attributes for positions instead of using integers',
        translateDes: '使用规范化的属性来表示位置，而不是使用整数',
        type: 'switch',
      },
    ],
    Animations: [
      {
        target: 'at',
        default: 16,
        description:
          'use N-bit quantization for translations (default: 16; N should be between 1 and 24)',
        translateDes: 'translations的量化位数，默认=16',
        type: 'range',
        min: 1,
        max: 24,
      },
      {
        target: 'at',
        default: 12,
        description:
          ' use N-bit quantization for rotations (default: 12; N should be between 4 and 16)',
        translateDes: '选装属性的量化位数，默认=12',
        type: 'range',
        min: 4,
        max: 16,
      },
      {
        target: 'af',
        default: 30,
        description: 'resample animations at N Hz (default: 30)',
        translateDes: '重采样动画',
        type: 'number',
        max: Infinity,
      },
      {
        target: 'ac',
        default: false,
        description: 'keep constant animation tracks even if they don`t modify the node transform',
        translateDes: '保持恒定的动画轨迹，即使没有修改节点',
        type: 'switch',
      },
    ],
    Scene: [
      {
        target: 'kn',
        default: false,
        description:
          'keep named nodes and meshes attached to named nodes so that named nodes can be transformed externally',
        translateDes: '保持命名的节点和连接到命名节点的网格，以便命名的节点可以在外部进行转换',
        type: 'switch',
      },
      {
        target: 'km',
        default: false,
        description: ' keep named materials and disable named material merging',
        translateDes: '保留已命名的材质并禁其合并',
        type: 'switch',
      },
      {
        target: 'ke',
        default: false,
        description: 'keep extras data',
        translateDes: '保留额外数据',
        type: 'switch',
      },
      {
        target: 'mm',
        default: false,
        description: 'merge instances of the same mesh together when possible',
        translateDes: '尽可能的将同一网格的实例合并在一起',
        type: 'switch',
      },
      {
        target: 'mi',
        default: false,
        description: 'use EXT_mesh_gpu_instancing when serializing multiple mesh instances',
        translateDes: '在序列化多个网格实例时使用EXT_mesh_gpu_instancing',
        type: 'switch',
      },
    ],
  },
});

const getCliOPtion = (option: Array<gltfpackOption>, type: 'draco' | 'gltfpack') =>
  option
    .map((val) => {
      if (val.type == 'range' || val.type == 'number') {
        return `-${val.target}${type == 'draco' ? ' ' : ' '}${val.default}`;
      } else if (val.type == 'radio') {
        return val.default ? `-${val.default}` : '';
      } else if (val.type == 'switch' && val.default) {
        return `-${val.target}`;
      }
    })
    .filter((val) => val);

export const getCompressionOption = () => {
  let cliOptions;
  if (modeloptionType.value == 'draco') {
    cliOptions = getCliOPtion(modelOption.dracoOption, 'draco');
  } else {
    const options: Array<gltfpackOption> = [];
    for (const key in modelOption.gltfpackOption) {
      const curOption = toRaw(modelOption.gltfpackOption[key]);
      console.log(curOption);
      options.push(...curOption);
    }
    cliOptions = getCliOPtion(options, 'gltfpack');
  }
  return {
    cliOptions,
    modeloptionType: modeloptionType.value,
    pictureOption: toRaw(pictureOption.value),
  };
};

/**
 * 处理远程存储的数据
 * @param optionsKey {string}
 */
const handCompressionOption = async (optionsKey: any) => {
  const { data: remoteOption } = await (await fetchOption({ mode: 'query', optionsKey })).json();
  pictureOption.value = remoteOption.pictureOption;
  modeloptionType.value = remoteOption.modeloptionType;
  remoteOption.cliOptions.forEach((val: string) => {
    const [key, value] = val.split(' ');
    if (modeloptionType.value == 'draco') {
      const curOptionItem = modelOption.dracoOption.find((val) => {
        return '-' + toRaw(val).target == key;
      });
      if (curOptionItem) {
        curOptionItem.default = JSON.parse(value);
      }
    } else {
      for (const optionKey in modelOption.gltfpackOption) {
        modelOption.gltfpackOption[optionKey].forEach((val) => {
          const _val = toRaw(val);
          const _key = key.slice(1);
          if ((_val.type == 'number' || _val.type == 'range') && _val.target == _key) {
            val.default = value;
          } else if (_val.type == 'radio') {
            if (
              Array.isArray(_val.description) &&
              _val.description.some((val) => val.value == _key)
            ) {
              val.default = _key;
            }
          } else if (_val.type == 'switch') {
            val.default = _val.target == _key ? true : false;
          }
        });
      }
    }
  });
};

export const optionConfig = reactive<{
  optionListKey: Array<string>;
  activeOption: string;
  savingOptionName: string;
}>({
  optionListKey: [],
  activeOption: '默认',
  savingOptionName: '',
});

const fetchOption = (data: {
  mode: 'set' | 'get' | 'delete' | 'query';
  optionsKey?: string;
  optionsValue?: any;
}) => {
  return fetch('/handOption', {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

watch(
  () => optionConfig.activeOption,
  (val, oldval) => {
    if (val != oldval) {
      handCompressionOption(optionConfig.activeOption);
      localStorage.setItem('activeOption', optionConfig.activeOption);
    }
  },
);

export const saveOption = async () => {
  if (!optionConfig.savingOptionName) {
    message.error('请输入当前配置的名称');
  } else {
    const { code, msg } = await (
      await fetchOption({
        mode: 'set',
        optionsKey: optionConfig.savingOptionName,
        optionsValue: getCompressionOption(),
      })
    ).json();
    if (code == 200) {
      message.success(msg);
      const res = await fetchOption({ mode: 'get' });
      const { data } = await res.json();
      optionConfig.optionListKey = data.keys;
      optionConfig.activeOption = optionConfig.savingOptionName;
      optionConfig.savingOptionName = '';
    }
  }
};

// export const delOption = async (optionsKey: string) => {
//   const { code, msg } = await fetchOption({ mode: 'delete', optionsKey });
//   if (code == 200) {
//     message.success(msg);
//   }
// };

try {
  const res = await fetchOption({ mode: 'get' });
  const { data } = await res.json();
  optionConfig.optionListKey = data.keys;
  const localActiveOption = localStorage.getItem('activeOption');
  if (localActiveOption) {
    optionConfig.activeOption = localActiveOption;
  } else {
    optionConfig.activeOption = data.keys[0];
  }
} catch (error) {
  console.error(error);
}
