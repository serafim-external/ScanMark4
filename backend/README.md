# Backend для DICOM Viewer

Эта папка предназначена для будущего Python бэкенда.

## Планируемая архитектура

- **FastAPI** - веб-фреймворк
- **Pydicom** - работа с DICOM файлами  
- **Orthanc** - DICOM сервер
- **SQLAlchemy** - ORM для базы данных

## Планируемые возможности

- REST API для загрузки DICOM файлов
- Интеграция с Orthanc DICOM сервером
- Обработка серий изображений
- Метаданные DICOM
- Поиск и фильтрация исследований

## Установка (когда будет реализовано)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```