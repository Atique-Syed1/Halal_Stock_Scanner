import './index.css'
import HalalTradeApp from './HalalTradeScanner'
import { ToastProvider } from './components/common/Toast'

function App() {
  return (
    <ToastProvider>
      <HalalTradeApp />
    </ToastProvider>
  )
}

export default App
