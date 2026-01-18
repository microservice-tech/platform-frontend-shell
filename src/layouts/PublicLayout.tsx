import { Outlet } from 'react-router-dom'
import { Header, type HeaderLink } from './components/Header'
import { Footer, type FooterLink } from './components/Footer'

type PublicLayoutProps = {
  title?: string
  logo?: React.ReactNode
  showHeader?: boolean
  headerLinks?: HeaderLink[]
  footerLinks?: FooterLink[]
  language?: string
  version?: string
  children?: React.ReactNode
}

export function PublicLayout({
  title,
  logo,
  showHeader = true,
  headerLinks,
  footerLinks,
  language,
  version,
  children,
}: PublicLayoutProps) {
  return (
    <div className="shell-layout shell-layout-public">
      {showHeader && (
        <Header
          title={title}
          logo={logo}
          showAuthButtons={true}
          utilityLinks={headerLinks}
        />
      )}
      <main className="shell-main">
        {children || <Outlet />}
      </main>
      <Footer links={footerLinks} language={language} version={version} />
    </div>
  )
}
