import { Outlet } from 'react-router-dom'
import StartupHeader from '../components/layout/StartupHeader'
import { Footer } from '../components/layout'
import './StartupLayout.css'

const StartupLayout = () => {
  return (
    <div className="startup-layout">
      <StartupHeader />
      <main className="startup-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default StartupLayout
