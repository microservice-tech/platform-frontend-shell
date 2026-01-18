import { Link } from 'react-router-dom'

export type FooterLink = {
  label: string
  href: string
}

type FooterProps = {
  links?: FooterLink[]
  language?: string
  version?: string
}

export function Footer({ links, language, version }: FooterProps) {
  return (
    <footer className="shell-footer">
      <div className="shell-footer-content">
        <nav className="shell-footer-links">
          {links && links.length > 0 ? (
            links.map((link) => (
              link.href.startsWith('http') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="shell-footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="shell-footer-link"
                >
                  {link.label}
                </Link>
              )
            ))
          ) : (
            <span className="shell-footer-link">Terms of service</span>
          )}
        </nav>

        <div className="shell-footer-info">
          {language && <span>{language}</span>}
          {language && version && <span className="shell-footer-separator">|</span>}
          {version && <span className="shell-footer-version">{version}</span>}
        </div>
      </div>
    </footer>
  )
}
