import { Component, StrictMode, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')

function showBootstrapError(error) {
  const message = error instanceof Error ? error.message : String(error)
  rootElement.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f8fafc;font-family:system-ui,sans-serif">
      <section style="max-width:720px;padding:32px;border:1px solid #fecaca;border-radius:16px;background:white;color:#7f1d1d;box-shadow:0 8px 24px rgba(15,23,42,.08)">
        <h1 style="margin:0 0 12px;font-size:24px">No se pudo iniciar Animal Health</h1>
        <p style="margin:0 0 12px">El navegador encontró este error:</p>
        <pre style="overflow:auto;white-space:pre-wrap;padding:12px;border-radius:8px;background:#fef2f2">${message.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</pre>
        <p style="margin:12px 0 0">Copia este mensaje para poder corregir la causa exacta.</p>
      </section>
    </main>
  `
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Animal Health render error:', error)
  }

  render() {
    if (this.state.error) {
      return createElement('main', { className: 'bootstrap-error' },
        createElement('section', null,
          createElement('h1', null, 'No se pudo mostrar Animal Health'),
          createElement('p', null, 'React encontró este error:'),
          createElement('pre', null, this.state.error.message),
        ),
      )
    }

    return this.props.children
  }
}

rootElement.innerHTML = '<p style="padding:24px;font-family:system-ui,sans-serif;color:#475569">Iniciando Animal Health…</p>'

import('./App.jsx')
  .then(({ default: App }) => {
    createRoot(rootElement).render(
      <StrictMode>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Animal Health bootstrap error:', error)
    showBootstrapError(error)
  })
