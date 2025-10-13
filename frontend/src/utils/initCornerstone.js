import { init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';

/**
 * Инициализация Cornerstone3D Core и DICOM Image Loader
 * Согласно документации: https://www.cornerstonejs.org/docs/tutorials/basic-stack
 */
export async function initCornerstone() {
  // Инициализация Cornerstone Core
  await coreInit();

  // Инициализация DICOM Image Loader
  await dicomImageLoaderInit();

  console.log('Cornerstone3D initialized successfully');
}
