import { Outlet } from 'react-router-dom'
import { Header } from './components/Header'

type PublicLayoutProps = {
  title?: string
  logo?: React.ReactNode
  showHeader?: boolean
}

export function PublicLayout({
  title,
  logo,
  showHeader = true,
}: PublicLayoutProps) {
  return (
    <div className="shell-layout shell-layout-public">
      {showHeader && <Header title={title} logo={logo} />}
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
