import { useEffect, useState } from 'react';

export const useKeyboardShortcuts = (resetViewport) => {
  const [keySequence, setKeySequence] = useState('');
  const [keyTimeout, setKeyTimeout] = useState(null);
  const [displaySequence, setDisplaySequence] = useState('');

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;

      if (!/^[1-5]$/.test(key)) return;

      event.preventDefault();

      if (keyTimeout) clearTimeout(keyTimeout);

      const newSequence = keySequence + key;
      setKeySequence(newSequence);
      setDisplaySequence(newSequence);

      if (newSequence.length === 2) {
        handleKeySequence(newSequence);
        setKeySequence('');
        setKeyTimeout(null);
        setTimeout(() => setDisplaySequence(''), 1500);
      } else {
        const timeout = setTimeout(() => {
          setKeySequence('');
          setKeyTimeout(null);
          setDisplaySequence('');
        }, 1000);
        setKeyTimeout(timeout);
      }
    };

    const handleKeySequence = (sequence) => {
      const actions = {
        '11': () => console.log('Layout tool activated (11)'),
        '12': () => console.log('Stack tool activated (12)'),
        '21': () => console.log('Zoom tool activated (21)'),
        '22': () => console.log('W/L tool activated (22)'),
        '31': () => console.log('Length tool activated (31)'),
        '32': () => console.log('Angle tool activated (32)'),
        '41': () => {
          resetViewport();
          console.log('Reset activated (41)');
        },
        '51': () => console.log('Preset tool activated (51)')
      };

      const action = actions[sequence];
      if (action) {
        action();
      } else {
        console.log(`Unknown key sequence: ${sequence}`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (keyTimeout) clearTimeout(keyTimeout);
    };
  }, [resetViewport, keySequence, keyTimeout]);

  return { displaySequence };
};
