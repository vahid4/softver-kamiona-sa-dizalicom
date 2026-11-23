import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react'

type Props = {
  label: string
  onHoldStart: () => void
  onHoldEnd: () => void
  variant?: 'default' | 'danger' | 'accent' | 'ok'
  disabled?: boolean
  className?: string
  children?: ReactNode
  title?: string
}

export function HoldButton({
  label,
  onHoldStart,
  onHoldEnd,
  variant = 'default',
  disabled,
  className = '',
  children,
  title,
}: Props) {
  const active = useRef(false)

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      active.current = true
      onHoldStart()
    },
    [disabled, onHoldStart],
  )

  const end = useCallback(() => {
    if (!active.current) return
    active.current = false
    onHoldEnd()
  }, [onHoldEnd])

  return (
    <button
      type="button"
      className={`hold-btn hold-btn--${variant} ${className}`}
      disabled={disabled}
      title={title}
      onPointerDown={start}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children ?? label}
    </button>
  )
}

export function ToggleButton({
  label,
  active,
  onClick,
  variant = 'default',
  disabled,
  style,
}: {
  label: string
  active?: boolean
  onClick: () => void
  variant?: 'default' | 'danger' | 'accent' | 'ok'
  disabled?: boolean
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      className={`hold-btn hold-btn--${variant} ${active ? 'is-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {label}
    </button>
  )
}
