import { SimulationProvider } from './state/SimulationContext'
import { useKeyboardControls } from './hooks/useKeyboardControls'
import { Header } from './components/layout/Header'
import { SimBanner } from './components/layout/SimBanner'
import { LeftPanel } from './components/panels/LeftPanel'
import { RightPanel } from './components/panels/RightPanel'
import { BottomPanel } from './components/panels/BottomPanel'
import { SettingsModal } from './components/panels/SettingsModal'
import { LiveControlModal } from './components/panels/LiveControlModal'
import { Scene } from './components/scene/Scene'
import './App.css'

function ControlShell() {
  useKeyboardControls()

  return (
    <div className="app-shell">
      <SimBanner />
      <Header />
      <div className="main-grid">
        <LeftPanel />
        <main className="viewport">
          <Scene />
          <div className="viewport-hint">Hold controls or keys to move · release to stop</div>
        </main>
        <RightPanel />
      </div>
      <BottomPanel />
      <SettingsModal />
      <LiveControlModal />
    </div>
  )
}

export default function App() {
  return (
    <SimulationProvider>
      <ControlShell />
    </SimulationProvider>
  )
}
