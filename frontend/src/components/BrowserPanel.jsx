const BrowserPanel = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#888',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
      <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#a0a0a0' }}>
        No files loaded
      </div>
      <div style={{ fontSize: '13px' }}>
        Select local files or connect to PACS to get started
      </div>
    </div>
  );
};

export default BrowserPanel;
