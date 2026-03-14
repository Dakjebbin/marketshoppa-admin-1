import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/auth.context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
    <BrowserRouter>
    <Toaster/>
    <App />
    </BrowserRouter>
    </AuthContextProvider>
  </StrictMode>,
)
