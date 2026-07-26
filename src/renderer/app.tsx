import { useStorage } from './hooks/useStorage';

function App() {
  const { data, loading, update } = useStorage();

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  // Get counter from settings or default to 0
  const counter = (data.settings.counter as number) || 0;

  const incrementCounter = () => {
    const newCounter = counter + 1;
    update({ settings: { ...data.settings, counter: newCounter } });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Focus Dashboard</h1>
      <p>Electron + React data layer is working!</p>
      <div style={{ marginTop: '1rem' }}>
        <p>Counter: {counter}</p>
        <button onClick={incrementCounter}>Increment</button>
      </div>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Close and reopen the app — the counter persists.
      </p>
    </div>
  );
}

export default App;