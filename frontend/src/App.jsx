
import HalalTradeApp from './components/HalalTradeApp'
import { ToastProvider } from './components/common/Toast'

function App() {
  return (
    <ToastProvider>
      <HalalTradeApp />
    </ToastProvider>
  )
}

export default App
