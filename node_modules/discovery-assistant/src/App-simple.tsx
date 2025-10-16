function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Discovery Assistant</h1>
      <p>Simple test - if you see this, React routing might be the issue</p>
      <button onClick={() => (window.location.href = '/')}>
        Click to test navigation
      </button>
    </div>
  );
}

export default App;
