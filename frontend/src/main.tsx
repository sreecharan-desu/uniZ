import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Layout } from './layout.tsx'
import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    <BrowserRouter>
      <Layout>
        <App />
      </Layout>
    </BrowserRouter>
  </RecoilRoot>
)
