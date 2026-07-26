import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Check if we're running in Electron
    if (window.electronAPI) {
      setMessage('Electron + React is working!');
    } else {
      setMessage('Running in browser (no Electron API)');
    }
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Focus Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;