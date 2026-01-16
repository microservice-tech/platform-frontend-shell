type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function Spinner({ size = 'md', message }: SpinnerProps) {
  return (
    <div className={`shell-spinner shell-spinner-${size}`}>
      <div className="shell-spinner-circle" />
      {message && <p className="shell-spinner-message">{message}</p>}
    </div>
  )
}
