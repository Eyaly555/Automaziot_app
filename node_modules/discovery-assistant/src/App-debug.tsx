import React from 'react';

function App() {
  console.log('App component is rendering');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Discovery Assistant - Debug Mode</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <div
        style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}
      >
        <h2>Debug Information:</h2>
        <ul>
          <li>React Version: {React.version}</li>
          <li>Window Location: {window.location.href}</li>
          <li>
            LocalStorage Available:{' '}
            {typeof Storage !== 'undefined' ? 'Yes' : 'No'}
          </li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a
          href="/"
          style={{
            padding: '10px',
            background: '#3B82F6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Go to Main App
        </a>
      </div>
    </div>
  );
}

export default App;
