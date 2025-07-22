import React, { useEffect, useRef, useState } from 'react';

import {
  RenderingEngine,
  Enums as csEnums,
  init as cornerstoneCoreInit,
} from '@cornerstonejs/core';

import {
  ToolGroupManager,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  Enums as csToolsEnums,
  addTool,
  init as cornerstoneToolsInit,
} from '@cornerstonejs/tools';

import {
  init as dicomImageLoaderInit,
} from '@cornerstonejs/dicom-image-loader';

import {
  utilities,
  metaData,
  imageLoader,
} from '@cornerstonejs/core';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState('Готов к загрузке');
  const [patients, setPatients] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [currentSliceIndex, setCurrentSliceIndex] = useState({ axial: 0, coronal: 0, sagittal: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('1x1'); // '1x1', '1x2', '2x2'
  const [showInstructions, setShowInstructions] = useState(false);
  const [viewportSeries, setViewportSeries] = useState({
    viewport1: null,
    viewport2: null, 
    viewport3: null,
    viewport4: null
  });
  
  const viewport1Ref = useRef(null);
  const viewport2Ref = useRef(null);
  const viewport3Ref = useRef(null);
  const viewport4Ref = useRef(null);
  const [viewports, setViewports] = useState({
    viewport1: { viewport: null, renderingEngine: null },
    viewport2: { viewport: null, renderingEngine: null },
    viewport3: { viewport: null, renderingEngine: null },
    viewport4: { viewport: null, renderingEngine: null }
  });

  useEffect(() => {
    if (isInitialized) return;

    const initCornerstone = async () => {
      try {
        await cornerstoneCoreInit();
        dicomImageLoaderInit({ useWebWorkers: false });
        await cornerstoneToolsInit();

        addTool(WindowLevelTool);
        addTool(PanTool);
        addTool(ZoomTool);
        addTool(StackScrollTool);

        // Инициализация каждого viewport
        const newViewports = { ...viewports };
        const refs = { 
          viewport1: viewport1Ref, 
          viewport2: viewport2Ref, 
          viewport3: viewport3Ref, 
          viewport4: viewport4Ref 
        };
        const viewportIds = ['viewport1', 'viewport2', 'viewport3', 'viewport4'];

        for (const viewportId of viewportIds) {
          const renderingEngine = new RenderingEngine(`${viewportId}RenderingEngine`);
          const stackId = `${viewportId}_STACK`;
          
          if (refs[viewportId].current) {
            const viewportInput = {
              viewportId: stackId,
              element: refs[viewportId].current,
              type: csEnums.ViewportType.STACK,
            };

            renderingEngine.enableElement(viewportInput);
            
            let toolGroup;
            try {
              toolGroup = ToolGroupManager.getToolGroup(`${viewportId}ToolGroup`);
              if (!toolGroup) {
                toolGroup = ToolGroupManager.createToolGroup(`${viewportId}ToolGroup`);
              }
            } catch (error) {
              toolGroup = ToolGroupManager.createToolGroup(`${viewportId}ToolGroup`);
            }
            
            if (toolGroup) {
              toolGroup.addTool(WindowLevelTool.toolName);
              toolGroup.addTool(PanTool.toolName);
              toolGroup.addTool(ZoomTool.toolName);
              toolGroup.addTool(StackScrollTool.toolName);

              toolGroup.setToolActive(WindowLevelTool.toolName, {
                bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
              });
              toolGroup.setToolActive(PanTool.toolName, {
                bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
              });
              toolGroup.setToolActive(ZoomTool.toolName, {
                bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
              });
              toolGroup.setToolActive(StackScrollTool.toolName, {
                bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
              });

              toolGroup.addViewport(stackId, `${viewportId}RenderingEngine`);
            }

            const stackViewport = renderingEngine.getViewport(stackId);
            newViewports[viewportId].viewport = stackViewport;
            newViewports[viewportId].renderingEngine = renderingEngine;
          }
        }

        setViewports(newViewports);
        setIsInitialized(true);
        setStatus('Готов к загрузке. Перетащите DICOM файлы или папки в область просмотра.');

      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setStatus('Ошибка инициализации');
      }
    };

    initCornerstone();
  }, [isInitialized]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      Object.values(viewports).forEach(vp => {
        if (vp.renderingEngine) {
          try {
            vp.renderingEngine.destroy();
          } catch (error) {
            // Engine уже уничтожен
          }
        }
      });
    };
  }, []);

  // Структура данных для организации DICOM файлов
  const organizeDicomFiles = (files, existingPatients = []) => {
    // Начинаем с существующих пациентов
    const patients = new Map();
    let duplicatesCount = 0;
    let addedCount = 0;
    
    // Преобразуем существующих пациентов обратно в Map для удобства работы
    existingPatients.forEach(patient => {
      const studiesMap = new Map();
      patient.studies.forEach(study => {
        const seriesMap = new Map();
        study.series.forEach(series => {
          seriesMap.set(series.id, series);
        });
        studiesMap.set(study.id, {
          ...study,
          series: seriesMap
        });
      });
      patients.set(patient.id, {
        ...patient,
        studies: studiesMap
      });
    });
    
    files.forEach(file => {
      const patientId = file.metadata?.patientId || 'Unknown Patient';
      const studyInstanceUID = file.metadata?.studyInstanceUID || 'Unknown Study';
      let seriesInstanceUID = file.metadata?.seriesInstanceUID || 'Unknown Series';
      const patientName = file.metadata?.patientName || 'Unknown Name';
      const studyDescription = file.metadata?.studyDescription || 'Unknown Study';
      let seriesDescription = file.metadata?.seriesDescription || 'Unknown Series';
      const seriesNumber = file.metadata?.seriesNumber || 0;
      
      console.log(`Обрабатываем файл: ${file.fileName}, folderName: ${file.folderName}, исходный seriesInstanceUID: ${seriesInstanceUID}`);
      
      // НЕ модифицируем seriesInstanceUID - пусть DICOM метаданные сами определяют серии
      console.log(`  Используем оригинальный seriesInstanceUID: ${seriesInstanceUID}, описание: ${seriesDescription}`);
      
      if (!patients.has(patientId)) {
        patients.set(patientId, {
          id: patientId,
          name: patientName,
          studies: new Map()
        });
      }
      
      const patient = patients.get(patientId);
      
      if (!patient.studies.has(studyInstanceUID)) {
        patient.studies.set(studyInstanceUID, {
          id: studyInstanceUID,
          description: studyDescription,
          series: new Map()
        });
      }
      
      const study = patient.studies.get(studyInstanceUID);
      
      if (!study.series.has(seriesInstanceUID)) {
        study.series.set(seriesInstanceUID, {
          id: seriesInstanceUID,
          description: seriesDescription,
          number: seriesNumber,
          images: [],
          orientation: null
        });
      }
      
      const series = study.series.get(seriesInstanceUID);
      
      // Проверяем, не существует ли уже файл с таким же imageId или именем
      const isDuplicate = series.images.some(existingImage => 
        existingImage.imageId === file.imageId || 
        (existingImage.fileName === file.fileName && existingImage.file?.size === file.file?.size)
      );
      
      if (!isDuplicate) {
        series.images.push(file);
        addedCount++;
        console.log(`  Добавлен файл: ${file.fileName} в серию ${seriesDescription}`);
      } else {
        duplicatesCount++;
        console.log(`  Пропущен дубликат: ${file.fileName} в серии ${seriesDescription}`);
      }
    });
    
    const result = Array.from(patients.values()).map(patient => ({
      ...patient,
      studies: Array.from(patient.studies.values()).map(study => ({
        ...study,
        series: Array.from(study.series.values()).sort((a, b) => a.number - b.number)
      }))
    }));
    
    return {
      patients: result,
      stats: {
        addedCount,
        duplicatesCount,
        totalFiles: files.length
      }
    };
  };

  // Обработка клавиатурных команд
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (viewportSeries.viewport1 && viewportSeries.viewport1.images.length > 1) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            navigateSlice('next', 'viewport1');
            break;
          case 'ArrowDown':
            event.preventDefault();
            navigateSlice('prev', 'viewport1');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewportSeries]);

  // Функция сортировки по Instance Number
  const sortByInstanceNumber = async (imageIds) => {
    const imageWithMetadata = [];
    
    for (const imageId of imageIds) {
      try {
        const generalImageModule = metaData.get('generalImageModule', imageId);
        const instanceNumber = generalImageModule?.instanceNumber || 0;
        imageWithMetadata.push({ imageId, instanceNumber });
        console.log(`Image: ${imageId}, Instance Number: ${instanceNumber}`);
      } catch (error) {
        console.warn(`Не удалось получить метаданные для ${imageId}:`, error);
        imageWithMetadata.push({ imageId, instanceNumber: 0 });
      }
    }
    
    imageWithMetadata.sort((a, b) => a.instanceNumber - b.instanceNumber);
    return imageWithMetadata.map(item => item.imageId);
  };

  // Функция сортировки по Slice Location
  const sortBySliceLocation = async (imageIds) => {
    const imageWithMetadata = [];
    
    for (const imageId of imageIds) {
      try {
        const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
        const sliceLocation = imagePlaneModule?.sliceLocation || 0;
        imageWithMetadata.push({ imageId, sliceLocation });
        console.log(`Image: ${imageId}, Slice Location: ${sliceLocation}`);
      } catch (error) {
        console.warn(`Не удалось получить метаданные для ${imageId}:`, error);
        imageWithMetadata.push({ imageId, sliceLocation: 0 });
      }
    }
    
    imageWithMetadata.sort((a, b) => a.sliceLocation - b.sliceLocation);
    return imageWithMetadata.map(item => item.imageId);
  };

  // Функция сортировки по Image Position Patient
  const sortByImagePositionPatient = async (imageIds) => {
    const imageWithMetadata = [];
    
    for (const imageId of imageIds) {
      try {
        const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
        const imagePositionPatient = imagePlaneModule?.imagePositionPatient;
        const imageOrientationPatient = imagePlaneModule?.imageOrientationPatient;
        
        if (imagePositionPatient && imagePositionPatient.length >= 3) {
          imageWithMetadata.push({ 
            imageId, 
            position: imagePositionPatient,
            orientation: imageOrientationPatient,
            x: imagePositionPatient[0],
            y: imagePositionPatient[1], 
            z: imagePositionPatient[2]
          });
          console.log(`Image: ${imageId}, Position: [${imagePositionPatient.join(', ')}]`);
        } else {
          imageWithMetadata.push({ imageId, position: [0, 0, 0], orientation: null, x: 0, y: 0, z: 0 });
        }
      } catch (error) {
        console.warn(`Не удалось получить метаданные для ${imageId}:`, error);
        imageWithMetadata.push({ imageId, position: [0, 0, 0], orientation: null, x: 0, y: 0, z: 0 });
      }
    }
    
    if (imageWithMetadata.length >= 2) {
      // Определяем основное направление изменения координат
      const positions = imageWithMetadata.map(item => item.position);
      const xRange = Math.max(...positions.map(p => p[0])) - Math.min(...positions.map(p => p[0]));
      const yRange = Math.max(...positions.map(p => p[1])) - Math.min(...positions.map(p => p[1]));
      const zRange = Math.max(...positions.map(p => p[2])) - Math.min(...positions.map(p => p[2]));
      
      console.log(`Диапазоны координат - X: ${xRange.toFixed(2)}, Y: ${yRange.toFixed(2)}, Z: ${zRange.toFixed(2)}`);
      
      // Сортируем по оси с наибольшим изменением
      if (zRange >= xRange && zRange >= yRange) {
        console.log('Сортировка по Z-координате (аксиальные срезы)');
        imageWithMetadata.sort((a, b) => a.z - b.z);
      } else if (yRange >= xRange) {
        console.log('Сортировка по Y-координате (коронарные срезы)');
        imageWithMetadata.sort((a, b) => a.y - b.y);
      } else {
        console.log('Сортировка по X-координате (сагиттальные срезы)');
        imageWithMetadata.sort((a, b) => a.x - b.x);
      }
    }
    
    return imageWithMetadata.map(item => item.imageId);
  };

  // Drag and Drop обработчики
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Обработчик выбора папки через input
  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log(`Выбрана папка с ${files.length} файл(ов)`);
    
    // Фильтруем только DICOM файлы, исключаем системные файлы
    const dicomFiles = files.filter(file => {
      // Пропускаем системные файлы
      if (file.name.startsWith('.DS_Store') || 
          file.name.startsWith('Thumbs.db') ||
          file.name.startsWith('.') ||
          file.name.toLowerCase().includes('desktop.ini')) {
        return false;
      }
      
      return file.name.toLowerCase().endsWith('.dcm') || 
             file.name.toLowerCase().endsWith('.dicom') ||
             file.name.toLowerCase().endsWith('.ima') ||
             file.type === 'application/dicom' ||
             file.type === '' ||
             !file.name.includes('.');
    });

    console.log(`Найдено DICOM файлов: ${dicomFiles.length}`);
    
    if (dicomFiles.length > 0) {
      await processFiles(dicomFiles);
    } else {
      setStatus('В выбранной папке не найдено DICOM файлов');
    }
    
    // Очищаем input для возможности повторного выбора той же папки
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const items = Array.from(e.dataTransfer.items);
      const files = Array.from(e.dataTransfer.files);
      
      console.log(`Перетащено ${items.length} элемент(ов), ${files.length} файл(ов)`);
      
      // Обрабатываем первый элемент (одну папку или файл)
      if (items.length > 0) {
        const item = items[0];
        console.log(`Обрабатываем элемент: kind="${item.kind}", type="${item.type}"`);
        
        const entry = item.webkitGetAsEntry();
        if (entry) {
          console.log(`Обрабатываем: ${entry.name} (${entry.isDirectory ? 'папка' : 'файл'})`);
          
          if (entry.isDirectory) {
            // Обрабатываем папку
            const allFiles = [];
            await traverseFileTree(entry, allFiles);
            console.log(`Найдено файлов в папке: ${allFiles.length}`);
            
            if (allFiles.length > 0) {
              await processFiles(allFiles);
            } else {
              setStatus('В папке не найдено DICOM файлов');
            }
          } else {
            // Обрабатываем отдельный файл
            const file = item.getAsFile();
            if (file) {
              console.log(`Обрабатываем файл: ${file.name}`);
              await processFiles([file]);
            }
          }
        } else {
          // Резервный механизм через e.dataTransfer.files
          console.log('Используем резервный механизм через e.dataTransfer.files');
          const dicomFiles = files.filter(file => {
            // Пропускаем системные файлы
            if (file.name.startsWith('.DS_Store') || 
                file.name.startsWith('Thumbs.db') ||
                file.name.startsWith('.') ||
                file.name.toLowerCase().includes('desktop.ini')) {
              return false;
            }
            
            return file.size > 0 && (
              file.name.toLowerCase().endsWith('.dcm') || 
              file.name.toLowerCase().endsWith('.dicom') ||
              file.name.toLowerCase().endsWith('.ima') ||
              file.type === 'application/dicom' ||
              file.type === '' ||
              !file.name.includes('.')
            );
          });
          
          if (dicomFiles.length > 0) {
            await processFiles(dicomFiles);
          } else {
            setStatus('Не найдено DICOM файлов');
          }
        }
      }
      
      // Если перетащено несколько элементов, предупреждаем
      if (items.length > 1) {
        setStatus(`Обработан только первый элемент из ${items.length}. Для загрузки нескольких папок используйте кнопку "Open DICOM folder" или перетаскивайте по одной.`);
      }
      
    } catch (error) {
      console.error(`Ошибка в handleDrop:`, error);
      setStatus(`Ошибка при обработке: ${error.message}`);
    }
  };

  const traverseFileTree = async (item, files) => {
    return new Promise((resolve, reject) => {
      console.log(`    Обрабатываем: ${item.name} (${item.isFile ? 'файл' : item.isDirectory ? 'папка' : 'неизвестно'})`);
      
      if (item.isFile) {
        item.file((file) => {
          // Пропускаем системные файлы
          if (file.name.startsWith('.DS_Store') || 
              file.name.startsWith('Thumbs.db') ||
              file.name.startsWith('.') ||
              file.name.toLowerCase().includes('desktop.ini')) {
            console.log(`      Пропускаем системный файл: ${file.name}`);
            resolve();
            return;
          }
          
          // Проверяем различные форматы DICOM файлов
          if (file.name.toLowerCase().endsWith('.dcm') || 
              file.name.toLowerCase().endsWith('.dicom') ||
              file.name.toLowerCase().endsWith('.ima') ||
              file.type === 'application/dicom' ||
              file.type === '' ||
              !file.name.includes('.')) { // Многие DICOM файлы не имеют расширения
            console.log(`      Добавляем DICOM файл: ${file.name}`);
            files.push(file);
          } else {
            console.log(`      Пропускаем файл: ${file.name} (не DICOM)`);
          }
          resolve();
        }, (error) => {
          console.error(`      Ошибка чтения файла ${item.name}:`, error);
          resolve(); // Продолжаем обработку
        });
      } else if (item.isDirectory) {
        console.log(`    Читаем содержимое папки: ${item.name}`);
        const dirReader = item.createReader();
        
        // Функция для чтения всех файлов в папке (может быть несколько батчей)
        const readAllEntries = (dirReader) => {
          return new Promise((resolveEntries) => {
            const allEntries = [];
            
            const readBatch = () => {
              dirReader.readEntries((entries) => {
                if (entries.length > 0) {
                  console.log(`      Прочитано ${entries.length} элементов в батче`);
                  allEntries.push(...entries);
                  readBatch(); // Читаем следующий батч
                } else {
                  console.log(`      Всего элементов в ${item.name}: ${allEntries.length}`);
                  resolveEntries(allEntries); // Все файлы прочитаны
                }
              }, (error) => {
                console.error(`      Ошибка чтения папки ${item.name}:`, error);
                resolveEntries([]);
              });
            };
            
            readBatch();
          });
        };
        
        readAllEntries(dirReader).then(async (entries) => {
          // Рекурсивно обрабатываем все найденные файлы и папки
          for (const entry of entries) {
            await traverseFileTree(entry, files);
          }
          resolve();
        }).catch((error) => {
          console.error(`    Ошибка обработки папки ${item.name}:`, error);
          resolve(); // Продолжаем обработку
        });
      } else {
        console.log(`    Пропускаем неизвестный тип: ${item.name}`);
        resolve();
      }
    });
  };

  const extractDicomMetadata = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const dicomData = new Uint8Array(arrayBuffer);
      const blob = new Blob([dicomData], { type: 'application/dicom' });
      const url = URL.createObjectURL(blob);
      const imageId = `wadouri:${url}`;
      
      // Предзагружаем для получения метаданных
      await imageLoader.loadAndCacheImage(imageId);
      
      const generalImageModule = metaData.get('generalImageModule', imageId);
      const patientModule = metaData.get('patientModule', imageId);
      const generalStudyModule = metaData.get('generalStudyModule', imageId);
      const generalSeriesModule = metaData.get('generalSeriesModule', imageId);
      
      return {
        imageId,
        fileName: file.name,
        file,
        folderName: file.folderName, // Передаем информацию о папке
        metadata: {
          patientId: patientModule?.patientId || 'Unknown',
          patientName: patientModule?.patientName || 'Unknown Patient',
          studyInstanceUID: generalStudyModule?.studyInstanceUID || 'Unknown Study',
          studyDescription: generalStudyModule?.studyDescription || 'Unknown Study',
          seriesInstanceUID: generalSeriesModule?.seriesInstanceUID || 'Unknown Series',
          seriesDescription: generalSeriesModule?.seriesDescription || 'Unknown Series',
          seriesNumber: generalSeriesModule?.seriesNumber || 0,
          instanceNumber: generalImageModule?.instanceNumber || 0
        }
      };
    } catch (error) {
      console.warn(`Ошибка обработки файла ${file.name}:`, error);
      return null;
    }
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    setStatus(`Обрабатываем ${files.length} файл(ов)...`);
    
    try {
      const filesWithMetadata = [];
      
      // Обрабатываем каждый файл и извлекаем метаданные
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`Обрабатываем файл ${i + 1}/${files.length}: ${file.name}...`);
        
        const fileWithMetadata = await extractDicomMetadata(file);
        if (fileWithMetadata) {
          filesWithMetadata.push(fileWithMetadata);
        }
      }
      
      // Организуем файлы по пациентам, исследованиям и сериям
      setStatus('Добавляем данные...');
      const organizedResult = organizeDicomFiles(filesWithMetadata, patients);
      const { patients: organizedData, stats } = organizedResult;
      
      console.log('Обновленные данные:', organizedData);
      console.log('Статистика:', stats);
      
      setPatients(organizedData);
      
      const totalPatients = organizedData.length;
      const totalStudies = organizedData.reduce((sum, p) => sum + p.studies.length, 0);
      const totalSeries = organizedData.reduce((sum, p) => sum + p.studies.reduce((s, st) => s + st.series.length, 0), 0);
      
      // Формируем статусное сообщение
      let statusMessage = '';
      if (patients.length === 0) {
        statusMessage = `Загружено: ${totalPatients} пациент(ов), ${totalStudies} исследований, ${totalSeries} серий`;
      } else {
        statusMessage = `Добавлено ${stats.addedCount} файлов`;
        if (stats.duplicatesCount > 0) {
          statusMessage += `, пропущено ${stats.duplicatesCount} дубликатов`;
        }
        statusMessage += `. Всего: ${totalPatients} пациент(ов), ${totalStudies} исследований, ${totalSeries} серий`;
      }
      
      setStatus(statusMessage);
      
      return; // Выходим, так как больше не нужно обрабатывать как одну серию
      
      // Остальная логика удалена, так как теперь обрабатываем выше
    } catch (error) {
      setStatus(`Ошибка: ${error.message}`);
    }
  };

  // Функция загрузки серии в конкретный viewport
  const loadSeriesIntoViewport = async (series, viewportId) => {
    if (!series || !series.images || series.images.length === 0) return;
    
    setStatus(`Загружаем серию в ${viewportId}: ${series.description}...`);
    
    try {
      const imageIds = series.images.map(img => img.imageId);
      let sortedImageIds = [...imageIds];
      
      // Сортировка серии
      if (imageIds.length > 1) {
        let sortingSuccess = false;
        
        try {
          console.log('Пробуем сортировку по Image Position Patient...');
          sortedImageIds = await sortByImagePositionPatient(sortedImageIds);
          console.log('Image Position Patient сортировка завершена');
          sortingSuccess = true;
        } catch (positionError) {
          console.warn('Image Position Patient сортировка не удалась:', positionError);
        }
        
        if (!sortingSuccess) {
          try {
            console.log('Пробуем Cornerstone сортировку...');
            const sortingResult = utilities.sortImageIdsAndGetSpacing(sortedImageIds);
            sortedImageIds = sortingResult.sortedImageIds;
            console.log('Cornerstone сортировка успешна');
          } catch (error) {
            console.warn('Cornerstone сортировка не удалась:', error);
          }
        }
      }
      
      // Устанавливаем серию в выбранный viewport
      if (viewports[viewportId]?.viewport) {
        await viewports[viewportId].viewport.setStack(sortedImageIds);
        viewports[viewportId].renderingEngine?.renderViewports([`${viewportId}_STACK`]);
        
        setViewportSeries(prev => ({
          ...prev,
          [viewportId]: {
            ...series,
            sortedImageIds,
            currentIndex: 0
          }
        }));
        
        setStatus(`Серия загружена в ${viewportId}: ${sortedImageIds.length} срез(ов)`);
      }
      
    } catch (error) {
      setStatus(`Ошибка загрузки серии: ${error.message}`);
    }
  };

  // Совместимость - загрузка в первый viewport
  const loadSeries = (series) => {
    loadSeriesIntoViewport(series, 'viewport1');
    setSelectedSeries(series);
  };


  const navigateSlice = (direction, viewportId = 'viewport1') => {
    const series = viewportSeries[viewportId];
    if (!series || !series.sortedImageIds) return;
    
    const maxIndex = series.sortedImageIds.length - 1;
    let newIndex = series.currentIndex || 0;
    
    if (direction === 'next' && newIndex < maxIndex) {
      newIndex++;
    } else if (direction === 'prev' && newIndex > 0) {
      newIndex--;
    }
    
    if (newIndex !== series.currentIndex) {
      viewports[viewportId]?.viewport?.setImageIdIndex(newIndex);
      viewports[viewportId]?.renderingEngine?.renderViewports([`${viewportId}_STACK`]);
      
      setViewportSeries(prev => ({
        ...prev,
        [viewportId]: {
          ...prev[viewportId],
          currentIndex: newIndex
        }
      }));
    }
  };

  // Функции управления layout
  const getLayoutConfig = (layout) => {
    switch (layout) {
      case '1x1': return { cols: 1, rows: 1, viewports: ['viewport1'] };
      case '1x2': return { cols: 2, rows: 1, viewports: ['viewport1', 'viewport2'] };
      case '2x2': return { cols: 2, rows: 2, viewports: ['viewport1', 'viewport2', 'viewport3', 'viewport4'] };
      default: return { cols: 1, rows: 1, viewports: ['viewport1'] };
    }
  };

  // Обработчики drag and drop для серий в viewport'ы
  const handleSeriesDragStart = (e, series) => {
    e.dataTransfer.setData('application/json', JSON.stringify(series));
  };

  const handleViewportDragOver = (e) => {
    e.preventDefault();
  };

  const handleViewportDrop = (e, viewportId) => {
    e.preventDefault();
    try {
      const seriesData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (seriesData) {
        loadSeriesIntoViewport(seriesData, viewportId);
      }
    } catch (error) {
      console.error('Ошибка при перетаскивании серии:', error);
    }
  };

  const layoutConfig = getLayoutConfig(currentLayout);

  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      overflow: 'hidden'
    }}>
      {/* Левая панель (1/5 экрана) */}
      <div style={{
        width: '300px',
        minWidth: '300px',
        backgroundColor: '#fff',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Зона Drag & Drop и кнопки */}
        <div style={{ margin: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Drag & Drop область */}
          <div 
            style={{
              height: '50px',
              border: '2px dashed #007bff',
              borderRadius: '6px',
              backgroundColor: isDragOver ? 'rgba(0, 123, 255, 0.1)' : '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#007bff',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver ? 'Отпустите для загрузки' : 'Drag & Drop DICOM folder (or file)'}
          </div>
          
          {/* Кнопки */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => document.getElementById('folderInput').click()}
              style={{
                flex: 1,
                height: '32px',
                padding: '6px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📁 Open DICOM folder
            </button>
            
            {patients.length > 0 && (
              <button 
                onClick={() => {
                  setPatients([]);
                  setStatus('Все данные очищены');
                }}
                style={{
                  height: '32px',
                  padding: '6px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🗑️
              </button>
            )}
          </div>
          
          {/* Скрытый input для выбора папки */}
          <input
            id="folderInput"
            type="file"
            webkitdirectory="true"
            multiple
            style={{ display: 'none' }}
            onChange={handleFolderSelect}
          />
        </div>
        
        {/* Заголовок и статус */}
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '3px' }}>Серии исследований</div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            {status}
          </div>
        </div>
        
        {/* Область серий */}
        <div style={{ flex: 1, overflow: 'auto', padding: '4px' }}>
          {patients.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#999',
              padding: '20px 10px',
              fontSize: '11px'
            }}>
              Нет загруженных данных
            </div>
          ) : (
            patients.map(patient => (
              <div key={patient.id} style={{ marginBottom: '8px' }}>
                {/* Компактный заголовок пациента */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#555',
                  marginBottom: '4px',
                  padding: '2px 6px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '2px'
                }}>
                  {patient.name}
                </div>
                
                {patient.studies.map(study => 
                  study.series.map(series => (
                    <div 
                      key={series.id} 
                      draggable
                      onDragStart={(e) => handleSeriesDragStart(e, series)}
                      onClick={() => loadSeries(series)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '3px 6px',
                        fontSize: '10px',
                        cursor: 'move',
                        borderRadius: '2px',
                        backgroundColor: selectedSeries?.id === series.id ? '#007bff' : 'transparent',
                        color: selectedSeries?.id === series.id ? 'white' : '#333',
                        marginBottom: '1px',
                        border: selectedSeries?.id === series.id ? '1px solid #0056b3' : '1px solid transparent',
                        userSelect: 'none',
                        ':hover': { backgroundColor: '#f0f0f0' }
                      }}
                      title="Перетащите в viewport или кликните для загрузки"
                    >
                      {/* Иконка типа серии */}
                      <div style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '6px',
                        backgroundColor: series.description.toLowerCase().includes('t1') ? '#4CAF50' :
                                        series.description.toLowerCase().includes('t2') ? '#2196F3' :
                                        series.description.toLowerCase().includes('flair') ? '#FF9800' :
                                        series.description.toLowerCase().includes('dwi') ? '#9C27B0' : '#757575',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {series.number}
                      </div>
                      
                      {/* Название серии */}
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {series.description}
                      </div>
                      
                      {/* Количество изображений */}
                      <div style={{
                        fontSize: '9px',
                        color: selectedSeries?.id === series.id ? '#ccc' : '#888',
                        marginLeft: '4px'
                      }}>
                        {series.images.length}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Правая панель (4/5 экрана) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        {/* Панель кнопок */}
        <div style={{
          height: '42px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px'
        }}>
          {/* Кнопка Layout */}
          <button 
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => {
              const layouts = ['1x1', '1x2', '2x2'];
              const currentIndex = layouts.indexOf(currentLayout);
              const nextLayout = layouts[(currentIndex + 1) % layouts.length];
              setCurrentLayout(nextLayout);
            }}
          >
            Layout: {currentLayout}
          </button>
          
          {/* Кнопка инструкций */}
          <button 
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
            onClick={() => setShowInstructions(true)}
          >
            Инструкция
          </button>
          
          {/* Информация о загруженных сериях */}
          <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
            {Object.values(viewportSeries).filter(series => series !== null).length > 0 && (
              `Загружено серий: ${Object.values(viewportSeries).filter(series => series !== null).length}`
            )}
          </div>
        </div>
        
        {/* Область viewport'ов */}
        <div style={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layoutConfig.rows}, 1fr)`,
          gap: '2px',
          padding: '5px',
          backgroundColor: '#333'
        }}>
          {layoutConfig.viewports.map((viewportId) => (
            <div 
              key={viewportId}
              style={{ 
                position: 'relative', 
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
              onDragOver={handleViewportDragOver}
              onDrop={(e) => handleViewportDrop(e, viewportId)}
            >
              {/* Заголовок viewport с подробной информацией */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                right: '5px',
                color: 'white',
                fontSize: '11px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: '4px 8px',
                borderRadius: '3px',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  {viewportSeries[viewportId] ? (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                        {viewportSeries[viewportId].description}
                      </div>
                      <div style={{ fontSize: '9px', opacity: 0.8 }}>
                        Серия {viewportSeries[viewportId].number} • {viewportSeries[viewportId].images.length} срезов
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '10px', opacity: 0.7 }}>{viewportId}</div>
                  )}
                </div>
                {viewportSeries[viewportId] && (
                  <div style={{ fontSize: '10px', textAlign: 'right' }}>
                    <div>Срез: {(viewportSeries[viewportId].currentIndex || 0) + 1}/{viewportSeries[viewportId].images.length}</div>
                  </div>
                )}
              </div>
              
              {/* Viewport element */}
              <div
                ref={viewportId === 'viewport1' ? viewport1Ref : 
                     viewportId === 'viewport2' ? viewport2Ref :
                     viewportId === 'viewport3' ? viewport3Ref : viewport4Ref}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                onContextMenu={(e) => e.preventDefault()}
              />
              
              {/* Overlay для пустого viewport */}
              {!viewportSeries[viewportId] && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '12px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  textAlign: 'center'
                }}>
                  Перетащите серию сюда<br/>или кликните на серии слева
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Модальное окно с инструкциями */}
      {showInstructions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Инструкция по управлению</h3>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Мышь:</strong><br/>
                • ЛКМ + перетаскивание: Яркость/Контраст<br/>
                • СКМ + перетаскивание: Панорамирование<br/>
                • ПКМ + перетаскивание: Масштабирование<br/>
                • Колесо мыши: Прокрутка срезов
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Клавиатура:</strong><br/>
                • ↑/↓: Навигация по срезам
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Загрузка данных:</strong><br/>
                • Перетащите DICOM файлы в зону загрузки<br/>
                • Перетащите серии из списка в viewport'ы
              </div>
              <div>
                <strong>Layout:</strong><br/>
                • Используйте кнопку Layout для смены раскладки<br/>
                • Доступно: 1x1, 1x2, 2x2
              </div>
            </div>
            <button 
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setShowInstructions(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;