import {
  createWorkletRuntime,
  makeShareableCloneRecursive,
  type WorkletRuntime,
} from 'react-native-reanimated';
import type { SkCanvas } from '@shopify/react-native-skia';
import type {
  ExportOptions,
  FrameDrawer,
  VideoComposition,
  VideoFrame,
} from './types';
import RNSkiaVideoModule from './RNSkiaVideoModule';

let exportRuntime: WorkletRuntime;
const getExportRuntime = () => {
  if (!exportRuntime) {
    exportRuntime = createWorkletRuntime('RNSkiaVideoExportRuntime');
  }
  return exportRuntime;
};

/**
 * Exports a video composition to a video file.
 * @param videoComposition The video composition to export.
 * @param options The export options.
 * @param drawFrame The function used to draw the video frames.
 * @returns A promise that resolves when the export is complete.
 */
export const exportVideoComposition = async (
  videoComposition: VideoComposition,
  options: ExportOptions,
  drawFrame: FrameDrawer
): Promise<void> => {
  const drawFrameInner = (
    canvas: SkCanvas,
    time: number,
    frames: Record<string, VideoFrame>
  ) => {
    'worklet';
    drawFrame({
      canvas,
      videoComposition,
      currentTime: time,
      frames,
      width: options.width,
      height: options.height,
    });
  };

  return new Promise((resolve, reject) =>
    RNSkiaVideoModule.exportVideoComposition(
      videoComposition,
      options,
      getExportRuntime(),
      makeShareableCloneRecursive(drawFrameInner),
      () => resolve(),
      (e: any) => reject(e ?? new Error('Failed to export video'))
    )
  );
};
