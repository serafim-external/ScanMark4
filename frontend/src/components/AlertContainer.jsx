import Alert from './Alert';
import './AlertContainer.css';

const AlertContainer = ({ alerts, onRemoveAlert }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          autoClose={alert.autoClose}
          autoCloseDuration={alert.autoCloseDuration}
          onClose={() => onRemoveAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default AlertContainer;
