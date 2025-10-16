import { Enums } from '@cornerstonejs/core';

let alertCallback = null;
let lastAlertTime = 0;
const ALERT_DEBOUNCE_MS = 8000; // Не показывать повторное уведомление чаще, чем раз в 8 секунд

// Установка callback для показа alert
export const setAlertCallback = (callback) => {
  alertCallback = callback;
};

// Показать warning если пользователь меняет WW/WL в режиме Sigmoid
export const warnIfSigmoid = (viewport) => {
  if (!viewport) return false;

  try {
    const properties = viewport.getProperties();

    // Проверяем, активен ли SIGMOID
    if (properties.VOILUTFunction === Enums.VOILUTFunctionType.SAMPLED_SIGMOID) {
      // Показываем предупреждение (с debounce)
      const now = Date.now();
      if (alertCallback && (now - lastAlertTime) > ALERT_DEBOUNCE_MS) {
        alertCallback({
          variant: 'warning',
          title: 'Sigmoid VOI Active',
          message: 'Interactive window/level adjustment works best with Linear VOI. Switch to Linear in Window Presets for optimal results.',
          autoClose: true,
          autoCloseDuration: 6000
        });
        lastAlertTime = now;
      }

      return true; // Sigmoid активен
    }
  } catch (error) {
    console.error('Error in warnIfSigmoid:', error);
  }

  return false; // Sigmoid не активен
};
