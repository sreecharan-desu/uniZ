import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Layout } from './layout.tsx'
import { RecoilRoot } from 'recoil'

createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    <Layout>
      <App />
    </Layout>
  </RecoilRoot>
)
