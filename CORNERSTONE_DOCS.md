# CORNERSTONE.JS DOCUMENTATION STRUCTURE

## 1. GETTING STARTED
https://www.cornerstonejs.org/docs/category/getting-started
*Начальная настройка и установка библиотеки для медицинской визуализации*

Overview
https://www.cornerstonejs.org/docs/getting-started/overview
*Общий обзор возможностей Cornerstone3D: рендеринг, инструменты, аннотации, сегментация*

Scope of Project  
https://www.cornerstonejs.org/docs/getting-started/scope
*Границы и цели проекта, что входит и не входит в библиотеку*

Related Libraries
https://www.cornerstonejs.org/docs/getting-started/related-libraries
*Связанные библиотеки экосистемы: Tools, DICOM Image Loader, Streaming Volume Loader*

Installation
https://www.cornerstonejs.org/docs/getting-started/installation
*Установка через NPM, подключение зависимостей, настройка окружения*

React, Vue, Angular, etc.
https://www.cornerstonejs.org/docs/getting-started/vue-angular-react-etc
*Интеграция с популярными фреймворками, конфигурация Vite*

Cornerstone3D with vite-based React
https://github.com/cornerstonejs/vite-react-cornerstone3d
*Готовый пример React приложения с Cornerstone3D и Vite*

## 2. TUTORIALS
https://www.cornerstonejs.org/docs/category/tutorials
*Пошаговые руководства для изучения основных возможностей*

Introduction
https://www.cornerstonejs.org/docs/tutorials/intro
*Введение в туториалы, общая структура файлов примеров*

Render Stack of Images
https://www.cornerstonejs.org/docs/tutorials/basic-stack
*Отображение стека 2D изображений в Stack Viewport*

Render Volume
https://www.cornerstonejs.org/docs/tutorials/basic-volume
*Рендеринг 3D объемов в разных ориентациях (аксиальная, сагиттальная, корональная)*

Render Video
https://www.cornerstonejs.org/docs/tutorials/basic-video
*Отображение видео файлов в Video Viewport*

Manipulation Tools
https://www.cornerstonejs.org/docs/tutorials/basic-manipulation-tool
*Добавление инструментов манипуляции: zoom, pan, window/level*

Annotation Tools
https://www.cornerstonejs.org/docs/tutorials/basic-annotation-tool
*Создание и использование инструментов аннотации (измерения, разметка)*

Segmentation Tools
https://www.cornerstonejs.org/docs/tutorials/basic-segmentation-tools
*Инструменты для создания и редактирования сегментации (brush, scissors)*

Examples
https://www.cornerstonejs.org/docs/tutorials/examples
*Ссылки на живые примеры и их исходный код*

## 3. HOW-TO GUIDES
https://www.cornerstonejs.org/docs/category/how-to-guides
*Практические руководства для решения конкретных задач*

Custom Image Loader
https://www.cornerstonejs.org/docs/how-to-guides/custom-image-loader
*Создание пользовательского загрузчика изображений для нестандартных форматов*

Custom Metadata Provider
https://www.cornerstonejs.org/docs/how-to-guides/custom-metadata-provider
*Создание провайдера метаданных для дополнительной информации об изображениях*

Custom Volume Loading Order
https://www.cornerstonejs.org/docs/how-to-guides/custom-volume-loading-order
*Настройка порядка загрузки слайсов в объеме*

## 4. CONCEPTS
https://www.cornerstonejs.org/docs/category/concepts
*Глубокое изучение технических концепций библиотеки*

### 4.1 CORNERSTONE CORE
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/
*Основные концепции ядра библиотеки для рендеринга и управления данными*

ImageId
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/imageid/
*URL-схема для идентификации изображений, основа системы загрузки*

Image Loaders
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/imageloader/
*Функции загрузки изображений, возвращающие Promise с Image Object*

Image Object
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/imageobject/
*Структура объекта изображения с пиксельными данными и метаданными*

Metadata Providers
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/metadataprovider/
*Система предоставления метаданных изображений (spacing, orientation, patient info)*

Volumes
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/volumes/
*3D объемы данных с физическими размерами и ориентацией в пространстве*

Voxel Manager
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/voxelmanager/
*Новая архитектура управления воксельными данными, замена scalar arrays*

Volume Loaders
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/volumeloader/
*Загрузчики 3D объемов из наборов 2D изображений или NIFTI файлов*

Geometry Loaders
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/geometryloaders/
*Загрузчики геометрических данных (поверхности, контуры)*

Cache
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/cache/
*Система кэширования изображений и объемов, управление памятью*

Viewports
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/viewports/
*Контейнеры для отображения: Stack, Volume, Video, Volume3D типы*

Rendering Engine
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/
*GPU-ускоренный движок рендеринга на базе vtk.js и WebGL*

Request Pool Manager
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/requestpoolmanager/
*Управление очередями запросов: асинхронная загрузка и декодирование*

Web Workers
https://www.cornerstonejs.org/docs/concepts/cornerstone-core/webworker/
*Использование веб-воркеров для вычислений в фоновых потоках*

### 4.2 PROGRESSIVE LOADING
https://www.cornerstonejs.org/docs/concepts/progressive-loading/
*Прогрессивная загрузка для быстрого отображения изображений*

Server Requirements
https://www.cornerstonejs.org/docs/concepts/progressive-loading/requirements/
*Требования к серверу: поддержка HTJ2K, byte-range запросов*

Retrieve Configuration
https://www.cornerstonejs.org/docs/concepts/progressive-loading/retrieve-configuration/
*Конфигурация этапов загрузки и опций получения данных*

Usage
https://www.cornerstonejs.org/docs/concepts/progressive-loading/usage/
*Практическое использование через imageRetrieveMetadataProvider*

Stack Progressive Loading
https://www.cornerstonejs.org/docs/concepts/progressive-loading/stackprogressive/
*Прогрессивная загрузка для стековых изображений с примерами производительности*

Volume Progressive Loading
https://www.cornerstonejs.org/docs/concepts/progressive-loading/volumeprogressive/
*Прогрессивная загрузка 3D объемов*

Progressive Loading for non-HTJ2K
https://www.cornerstonejs.org/docs/concepts/progressive-loading/non-htj2k-progressive/
*Прогрессивная загрузка для форматов отличных от HTJ2K (JLS thumbnails)*

Encoding
https://www.cornerstonejs.org/docs/concepts/progressive-loading/encoding/
*Типы кодирования для частичного разрешения изображений*

Static DICOM Web
https://www.cornerstonejs.org/docs/concepts/progressive-loading/static-wado/
*Настройка Static DICOMweb для прогрессивной загрузки*

### 4.3 CORNERSTONE TOOLS
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/
*Библиотека инструментов для манипуляций, аннотаций и сегментации*

Tools
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/tools/
*Базовые концепции инструментов: BaseTool, AnnotationTool, режимы работы*

ToolGroups
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/toolgroups/
*Группировка инструментов для совместного использования в нескольких viewport*

Synchronizers
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/synchronizers/
*Синхронизация действий между viewport (camera, window/level)*

### 4.3.1 ANNOTATIONS
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/
*Система аннотаций в 3D пространстве пациента*

State
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/state/
*Управление состоянием аннотаций в FrameOfReference координатах*

Annotation Manager
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/manager/
*Singleton класс для управления аннотациями в Cornerstone Tools*

Selection
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/selection/
*Выбор и снятие выбора аннотаций (Shift + клик)*

Visibility
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/visibility/
*Управление видимостью аннотаций*

Locking
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/locking/
*Блокировка аннотаций для предотвращения случайных изменений*

Config
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/config/
*Настройка стилей инструментов аннотации*

Annotation Groups
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/groups/
*Группировка связанных аннотаций*

### 4.3.2 SEGMENTATION
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/
*Система сегментации: данные отделены от представления*

State
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/state/
*Управление состоянием сегментаций и их представлений по viewport*

Active Segmentation
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/active-segmentation/
*Активная сегментация в каждом viewport, которая изменяется инструментами*

Segment Locking
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/locking/
*Блокировка отдельных сегментов для предотвращения изменений*

Config
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/config/
*Унифицированная система стилей сегментации по viewport и типам*

Segment Index
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/segment-index/
*Управление индексом активного сегмента для рисования*

Segmentation Tools
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/segmentation-tools/
*Инструменты модификации: Brush, Scissors (Rectangle, Circle, Sphere), Threshold*

Contour Representation
https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/contour-representation/
*Представление сегментации в виде контуров (наборы точек 3D)*

## 5. CONTRIBUTING
https://www.cornerstonejs.org/docs/category/contributing
*Руководство по внесению изменений в проект*

Pull Request
https://www.cornerstonejs.org/docs/contribute/pull-request
*Процесс создания pull request и review*

Bug Report
https://www.cornerstonejs.org/docs/contribute/bug-report
*Как правильно сообщать о найденных ошибках*

Feature Request
https://www.cornerstonejs.org/docs/contribute/feature-request
*Процесс предложения новых возможностей*

## 6. MIGRATION GUIDES
https://www.cornerstonejs.org/docs/migration-guides/2x/general
*Руководства по миграции между версиями библиотеки*

General
https://www.cornerstonejs.org/docs/migration-guides/2x/general/
*Общие изменения в версии 2.x: удаление SharedArrayBuffer, TypeScript 5.5*

@cornerstonejs/core
https://www.cornerstonejs.org/docs/migration-guides/2x/core/
*Изменения в ядре: VoxelManager, новая архитектура кэша, API изменения*

@cornerstonejs/tools
https://www.cornerstonejs.org/docs/migration-guides/2x/tools/
*Изменения в инструментах версии 2.x*

Legacy to Modern
https://www.cornerstonejs.org/docs/migration-guides/legacy/
*Миграция с legacy Cornerstone на Cornerstone3D*

## 7. FAQ
https://www.cornerstonejs.org/docs/faq
*Часто задаваемые вопросы и ответы*

## 8. HELP
https://www.cornerstonejs.org/docs/help
*Информация о получении помощи и поддержки*

## 9. EXAMPLES
https://www.cornerstonejs.org/docs/examples
*Живые примеры работы библиотеки*

## 10. TEST COVERAGE
https://www.cornerstonejs.org/docs/test-coverage/
*Отчет о покрытии тестами (Playwright, без учета Karma тестов)*