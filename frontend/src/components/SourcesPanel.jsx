import Button from './Button';

const SourcesPanel = ({ onPacs }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      width: '100%',
      height: '100%',
      alignItems: 'center'
    }}>
      <Button variant="source">
        📁 Local Files
      </Button>
      <Button variant="source" onClick={onPacs}>
        🌐 PACS
      </Button>
    </div>
  );
};

export default SourcesPanel;
