export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>MAPtool</h1>
      <p style={{ color: '#666', textAlign: 'center', maxWidth: '32rem' }}>
        Help merchants in retail organizations negotiate MAP (Minimum Advertised
        Price) policies and values from suppliers.
      </p>
    </main>
  )
}
