// js/cups/manifest.js
import { makeImageCup } from './image.js';

// 統一控制資產版本（改這行就能全站刷新圖片快取）
const ASSET_VERSION = '?v=20251007a';

const base = 'assets/images/cups/';
const V = ASSET_VERSION;

export const IMAGE_CUPS = [
  makeImageCup({
    id: 'classic',
    name: { zh: '傳統杯', tl: '傳統桮（thoân-thóng poe）', en: 'Classic Poe' },
    yang: base + 'traditional_yang.webp' + V,
    yin:  base + 'traditional_yin.webp'  + V
  }),
  makeImageCup({
    id: 'banana',
    name: { zh: '香蕉杯', tl: '金蕉桮（kim-chio poe）', en: 'Banana Poe' },
    yang: base + 'banana_yang.webp' + V,
    yin:  base + 'banana_yin.webp'  + V
  }),
  makeImageCup({
    id: 'mushroom',
    name: { zh: '香菇杯', tl: '香菇桮（hiuⁿ-ko͘ poe）', en: 'Shiitake Poe' },
    yang: base + 'mushroom_yang.webp' + V,
    yin:  base + 'mushroom_yin.webp'  + V
  }),
  makeImageCup({
    id: 'guava',
    name: { zh: '芭樂杯', tl: '菝仔桮（pa̍t-á poe）', en: 'Guava Poe' },
    yang: base + 'guava_yang.webp' + V,
    yin:  base + 'guava_yin.webp'  + V
  }),
  makeImageCup({
    id: 'strawberry',
    name: { zh: '草莓杯', tl: '草莓桮（chháu-m̂ poe）', en: 'Strawberry Poe' },
    yang: base + 'strawberry_yang.webp' + V,
    yin:  base + 'strawberry_yin.webp'  + V
  }),
  makeImageCup({
    id: 'blue-slipper',
    name: { zh: '藍白拖杯', tl: '藍白淺拖仔桮（nâ-pe̍h chhián-thoa-á poe）', en: 'Blue Slipper Poe' },
    yang: base + 'blue_slipper_yang.webp' + V,
    yin:  base + 'blue_slipper_yin.webp'  + V
  }),
  makeImageCup({
    id: 'red-slipper',
    name: { zh: '紅白拖杯', tl: '紅白淺拖仔桮（âng-pe̍h chhián-thoa-á poe）', en: 'Red Slipper Poe' },
    yang: base + 'red_slipper_yang.webp' + V,
    yin:  base + 'red_slipper_yin.webp'  + V
  }),
  makeImageCup({
    id: 'papaya',
    name: { zh: '木瓜杯', tl: '木瓜桮（bo̍k-koe poe）', en: 'Papaya Poe' },
    yang: base + 'papaya_yang.webp' + V,
    yin:  base + 'papaya_yin.webp'  + V
  }),
  makeImageCup({
    id: 'avocado',
    name: { zh: '酪梨杯', tl: '阿母跤躼桮（a-bú-kha-lò poe）', en: 'Avocado Poe' },
    yang: base + 'avocado_yang.webp' + V,
    yin:  base + 'avocado_yin.webp'  + V
  }),
  makeImageCup({
    id: 'pineapple',
    name: { zh: '鳳梨杯', tl: '王梨桮（ông-lâi poe）', en: 'Pineapple Poe' },
    yang: base + 'pineapple_yang.webp' + V,
    yin:  base + 'pineapple_yin.webp'  + V
  }),
  makeImageCup({
    id: 'apple',
    name: { zh: '蘋果杯', tl: '瓜果桮（koa-kó poe）', en: 'Apple Poe' },
    yang: base + 'apple_yang.webp' + V,
    yin:  base + 'apple_yin.webp'  + V
  }),
  makeImageCup({
    id: 'mackerel',
    name: { zh: '烤鯖魚杯', tl: '烘花飛桮（hang hoe-hui poe）', en: 'Baked Mackerel Poe' },
    yang: base + 'mackerel_yang.webp' + V,
    yin:  base + 'mackerel_yin.webp'  + V
  }),
];
