import { useState } from 'react';

const BrowserPanel = ({ selectedPatient, selectedStudy, selectedSeries, onSeriesSelect, onSeriesLoad }) => {
  if (!selectedPatient) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#888888',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#a0a0a0' }}>
          No files loaded
        </div>
        <div style={{ fontSize: '13px', color: '#888888' }}>
          Select local files or connect to PACS to get started
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      fontSize: '14px',
      color: '#d4d4d4'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Section title="👤 Patient">
          <div style={{ marginLeft: '8px', lineHeight: '1.5' }}>
            <div style={{ fontWeight: '500', color: '#d4d4d4' }}>{selectedPatient.patientName}</div>
            <div style={{ color: '#a0a0a0', fontSize: '13px' }}>ID: {selectedPatient.patientId}</div>
          </div>
        </Section>

        {selectedStudy && (
          <Section title="📋 Study">
            <div style={{ marginLeft: '8px', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '500', color: '#d4d4d4' }}>{selectedStudy.studyDescription}</div>
              <div style={{ color: '#a0a0a0', fontSize: '13px' }}>{selectedStudy.studyDate}</div>
            </div>
          </Section>
        )}

        <Section title="🗂️ Series">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedStudy?.series?.map((series) => (
              <SeriesItem
                key={series.seriesInstanceUID}
                series={series}
                isSelected={selectedSeries?.seriesInstanceUID === series.seriesInstanceUID}
                onSelect={() => onSeriesSelect(series)}
                onLoad={() => onSeriesLoad(series, 'viewport1')}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <div style={{
      fontWeight: '600',
      color: '#3b82f6',
      fontSize: '16px',
      marginBottom: '8px',
      paddingBottom: '8px',
      borderBottom: '2px solid #333333'
    }}>
      {title}
    </div>
    {children}
  </div>
);

const SeriesItem = ({ series, isSelected, onSelect, onLoad }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: isSelected ? '#3a3a3a' : (isHovered ? '#3a3a3a' : '#2d2d2d'),
        cursor: 'pointer',
        border: `1px solid ${isSelected || isHovered ? '#3b82f6' : '#333333'}`,
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        boxShadow: isSelected
          ? '0 0 12px rgba(59, 130, 246, 0.3)'
          : (isHovered ? '0 2px 8px rgba(59, 130, 246, 0.2)' : '0 1px 3px rgba(0,0,0,0.2)'),
        transform: isHovered && !isSelected ? 'translateY(-1px)' : 'translateY(0)'
      }}
      onClick={onSelect}
      onDoubleClick={onLoad}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        width: '40px',
        height: '40px',
        backgroundColor: '#1e1e1e',
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        fontSize: '16px',
        border: '1px solid #333333'
      }}>
        🖼️
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: '#3b82f6', marginBottom: '2px' }}>
          {series.modality}
        </div>
        <div style={{ fontSize: '13px', color: '#a0a0a0', marginBottom: '2px' }}>
          {series.seriesDescription}
        </div>
        <div style={{ fontSize: '12px', color: '#888888' }}>
          {series.images.length} images
        </div>
      </div>
    </div>
  );
};

export default BrowserPanel;
