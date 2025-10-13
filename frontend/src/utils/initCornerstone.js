import { init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { init as cornerstoneToolsInit } from '@cornerstonejs/tools';

/**
 * Инициализация Cornerstone3D Core, DICOM Image Loader и Tools
 * Согласно документации:
 * - https://www.cornerstonejs.org/docs/tutorials/basic-stack
 * - https://www.cornerstonejs.org/docs/tutorials/basic-manipulation-tool
 */
export async function initCornerstone() {
  // Инициализация Cornerstone Core
  await coreInit();

  // Инициализация DICOM Image Loader
  await dicomImageLoaderInit();

  // Инициализация Cornerstone Tools
  await cornerstoneToolsInit();

  console.log('Cornerstone3D and Tools initialized successfully');
}
