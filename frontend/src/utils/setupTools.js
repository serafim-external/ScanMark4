import {
  ToolGroupManager,
  addTool,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
} from '@cornerstonejs/tools';

/**
 * Регистрация инструментов в Cornerstone Tools
 * Согласно документации: https://www.cornerstonejs.org/docs/tutorials/basic-manipulation-tool
 */
export function registerTools() {
  // Регистрируем инструменты в глобальном состоянии
  addTool(WindowLevelTool);
  addTool(ZoomTool);
  addTool(PanTool);
  addTool(StackScrollTool);

  console.log('Tools registered successfully');
}

/**
 * Создание ToolGroup и привязка к viewport
 */
export function createToolGroup(viewportId, renderingEngineId) {
  const toolGroupId = 'default-tool-group';

  // Проверяем, не создана ли уже группа
  let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

  if (!toolGroup) {
    // Создаем новую группу инструментов
    toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

    // Добавляем инструменты в группу
    toolGroup.addTool(WindowLevelTool.toolName);
    toolGroup.addTool(ZoomTool.toolName);
    toolGroup.addTool(PanTool.toolName);
    toolGroup.addTool(StackScrollTool.toolName);

    // Активируем инструменты по умолчанию
    // Window/Level - левая кнопка мыши (Primary)
    toolGroup.setToolActive(WindowLevelTool.toolName, {
      bindings: [{ mouseButton: 1 }], // 1 = левая кнопка
    });

    // Zoom - правая кнопка мыши (Secondary)
    toolGroup.setToolActive(ZoomTool.toolName, {
      bindings: [{ mouseButton: 2 }], // 2 = правая кнопка
    });

    // Pan - средняя кнопка мыши (Auxiliary)
    toolGroup.setToolActive(PanTool.toolName, {
      bindings: [{ mouseButton: 4 }], // 4 = средняя кнопка
    });

    // Stack Scroll - колесико мыши
    toolGroup.setToolActive(StackScrollTool.toolName);

    console.log('ToolGroup created and tools activated:', toolGroupId);
  }

  // Привязываем viewport к группе инструментов
  toolGroup.addViewport(viewportId, renderingEngineId);

  return toolGroup;
}
