import { Enums } from '@cornerstonejs/core';

let alertCallback = null;

// Установка callback для показа alert
export const setAlertCallback = (callback) => {
  alertCallback = callback;
};

// Автоматическое переключение с SIGMOID на LINEAR с уведомлением
export const autoSwitchToLinear = (viewport) => {
  if (!viewport) return false;

  try {
    const properties = viewport.getProperties();

    // Проверяем, активен ли SIGMOID
    if (properties.VOILUTFunction === Enums.VOILUTFunctionType.SAMPLED_SIGMOID) {
      // Переключаем на LINEAR
      viewport.setProperties({
        VOILUTFunction: Enums.VOILUTFunctionType.LINEAR
      });

      viewport.render();

      // Показываем уведомление
      if (alertCallback) {
        alertCallback({
          variant: 'danger',
          title: 'VOI Function Auto-Switched',
          message: 'Sigmoid VOI was automatically switched to Linear for interactive window/level adjustment.',
          autoClose: true,
          autoCloseDuration: 5000
        });
      }

      return true; // Переключение произошло
    }
  } catch (error) {
    console.error('Error in autoSwitchToLinear:', error);
  }

  return false; // Переключение не требовалось
};

// Проверка, нужно ли переключить на LINEAR
export const shouldSwitchToLinear = (viewport) => {
  if (!viewport) return false;

  try {
    const properties = viewport.getProperties();
    return properties.VOILUTFunction === Enums.VOILUTFunctionType.SAMPLED_SIGMOID;
  } catch (error) {
    console.error('Error checking VOI function:', error);
    return false;
  }
};
