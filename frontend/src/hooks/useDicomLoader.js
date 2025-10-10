import { useState, useCallback } from 'react';
import { metaData, imageLoader } from '@cornerstonejs/core';

export const useDicomLoader = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);

  const organizeDicomFiles = async (files) => {
    const patients = {};

    for (const file of files) {
      try {
        const imageId = 'wadouri:' + URL.createObjectURL(file);
        await imageLoader.loadAndCacheImage(imageId);

        const patientId = metaData.get('00100020', imageId) || 'Unknown';
        const patientName = metaData.get('00100010', imageId) || 'Unknown Patient';
        const studyInstanceUID = metaData.get('0020000d', imageId) || 'Unknown Study';
        const studyDescription = metaData.get('00081030', imageId) || 'Unknown Study';
        const studyDate = metaData.get('00080020', imageId) || '';
        const seriesInstanceUID = metaData.get('0020000e', imageId) || 'Unknown Series';
        const seriesDescription = metaData.get('0008103e', imageId) || 'Unknown Series';
        const modality = metaData.get('00080060', imageId) || 'UN';
        const instanceNumber = parseInt(metaData.get('00200013', imageId) || '1');

        if (!patients[patientId]) {
          patients[patientId] = { patientId, patientName, studies: {} };
        }

        if (!patients[patientId].studies[studyInstanceUID]) {
          patients[patientId].studies[studyInstanceUID] = {
            studyInstanceUID,
            studyDescription,
            studyDate,
            series: {}
          };
        }

        if (!patients[patientId].studies[studyInstanceUID].series[seriesInstanceUID]) {
          patients[patientId].studies[studyInstanceUID].series[seriesInstanceUID] = {
            seriesInstanceUID,
            seriesDescription,
            modality,
            images: []
          };
        }

        patients[patientId].studies[studyInstanceUID].series[seriesInstanceUID].images.push({
          imageId,
          instanceNumber,
          file
        });
      } catch (error) {
        console.error('Error processing DICOM file:', error);
      }
    }

    return Object.values(patients).map(patient => ({
      ...patient,
      studies: Object.values(patient.studies).map(study => ({
        ...study,
        series: Object.values(study.series).map(series => ({
          ...series,
          images: series.images.sort((a, b) => a.instanceNumber - b.instanceNumber)
        }))
      }))
    }));
  };

  const handleFileLoad = useCallback(async (files) => {
    const dicomFiles = Array.from(files).filter(file =>
      file.name.toLowerCase().endsWith('.dcm') ||
      file.name.toLowerCase().endsWith('.dicom') ||
      file.name.toLowerCase().endsWith('.ima') ||
      !file.name.includes('.')
    );

    if (dicomFiles.length === 0) {
      alert('No DICOM files found');
      return;
    }

    const organizedData = await organizeDicomFiles(dicomFiles);

    if (organizedData.length > 0) {
      setSelectedPatient(organizedData[0]);
      if (organizedData[0].studies.length > 0) {
        setSelectedStudy(organizedData[0].studies[0]);
        if (organizedData[0].studies[0].series.length > 0) {
          setSelectedSeries(organizedData[0].studies[0].series[0]);
        }
      }
    }
  }, []);

  return {
    selectedPatient,
    selectedStudy,
    selectedSeries,
    setSelectedSeries,
    handleFileLoad
  };
};
