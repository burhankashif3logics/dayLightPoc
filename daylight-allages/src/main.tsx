import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Shared styles load first so each world's stylesheet can override them.
import './styles/base.css'
import './styles/app.css'
import './styles/frame.css'

import App from './App'

import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import '@fontsource-variable/roboto-mono'
import '@fontsource-variable/archivo'
import '@fontsource-variable/azeret-mono'
import '@fontsource-variable/public-sans'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
