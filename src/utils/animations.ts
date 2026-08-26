import type {
  CarouselItemAnimation,
  CarouselLayout,
  CarouselProps,
} from "react-native-reanimated-carousel";

export type AnimationPreset =
  | "parallax"
  | "zoom"
  | "cube"
  | "flip"
  | "stack"
  | "normal";

type LayoutConfig = NonNullable<CarouselProps<unknown>["layout"]>;

// تم تعديل الـ type ليقبل كائن فارغ للوضع الطبيعي
type PresetConfig =
  | { layout: LayoutConfig; itemAnimation?: never }
  | { layout?: never; itemAnimation: CarouselItemAnimation }
  | { layout?: never; itemAnimation?: never }; // ← إضافة السماحية هنا

const parallax: PresetConfig = {
  layout: { type: "parallax", offset: 16, scale: 0.99 },
};

const zoom: PresetConfig = {
  itemAnimation: (relativeProgress) => {
    "worklet";
    const abs = Math.abs(relativeProgress);
    return {
      transform: [{ scale: 1 - abs * 0.05 }], 
      opacity: 1 - abs * 0.2, 
    };
  },
};

const cube: PresetConfig = {
  itemAnimation: (relativeProgress) => {
    "worklet";
    const abs = Math.abs(relativeProgress);
    return {
      transform: [
        { translateX: relativeProgress * 10 },
        { scale: 1 - abs * 0.03 },
      ],
      opacity: 1 - abs * 0.3,
      zIndex: relativeProgress === 0 ? 1 : 0, 
    };
  },
};

const flip: PresetConfig = {
  itemAnimation: (relativeProgress) => {
    "worklet";
    return {
      transform: [{ scale: 1 }],
      opacity: 1 - Math.abs(relativeProgress), 
    };
  },
};

const stack: PresetConfig = {
  layout: {
    type: "horizontal-stack",
    visibleCount: 3,
    spacing: 8,
    scaleStep: 0.04, 
    opacityStep: 0.15,
  },
};

// الوضع الطبيعي 100%، كائن فارغ بدون أي إضافات
const normal: PresetConfig = {};

export const animations: Record<AnimationPreset, PresetConfig> = {
  parallax,
  zoom,
  cube,
  flip,
  stack,
  normal,
};