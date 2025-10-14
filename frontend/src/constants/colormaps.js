/**
 * Проверенные colormaps для Cornerstone3D
 * Только те colormap, которые точно работают с vtk.js
 *
 * Reference:
 * - cornerstone3D-github-original/packages/core/examples/stackAPI/index.ts (uses 'hsv')
 * - cornerstone3D-github-original/packages/tools/examples/advancedColorbar/index.ts (uses 'Grayscale', 'Black-Body Radiation')
 *
 * Note: Имена colormap регистрозависимые и должны точно соответствовать vtk.js preset names
 */

export const COMMON_COLORMAPS = [
  // Проверенные - 100% работают
  { name: 'hsv', label: 'HSV' },
  { name: 'erdc_rainbow_bright', label: 'Rainbow Bright' },

  // Grayscale
  { name: 'Grayscale', label: 'Grayscale' },

  // Scientific (из matplotlib, используются с суффиксом)
  { name: 'Viridis (matplotlib)', label: 'Viridis' },
  { name: 'Plasma (matplotlib)', label: 'Plasma' },
  { name: 'Inferno (matplotlib)', label: 'Inferno' },
  { name: 'Magma (matplotlib)', label: 'Magma' },

  // Physical/Medical
  { name: 'Black-Body Radiation', label: 'Black Body' },
  { name: 'X Ray', label: 'X-Ray' },

  // Rainbow/Spectrum
  { name: 'rainbow', label: 'Rainbow' },
  { name: 'erdc_rainbow_dark', label: 'Rainbow Dark' },

  // Diverging
  { name: 'Blue to Red Rainbow', label: 'Blue-Red Rainbow' },
  { name: 'Cool to Warm', label: 'Cool to Warm' },

  // Classic
  { name: 'jet', label: 'Jet' },
];
