import type { DesignElement, Theme } from '../types'

interface Props {
  el: DesignElement
  theme: Theme
}

/** Renders a single design element using the active theme tokens. */
export default function ElementRenderer({ el, theme }: Props) {
  const p = el.props
  const align = p.align ?? 'left'
  const radius = p.radius ?? theme.radius

  switch (el.type) {
    case 'header':
      return (
        <div style={{ textAlign: align }}>
          <div style={{ fontSize: p.fontSize ?? 26, fontWeight: p.fontWeight ?? 700, color: theme.text, lineHeight: 1.2 }}>
            {p.text}
          </div>
          {p.subtitle && <div style={{ fontSize: 14, color: theme.muted, marginTop: 4 }}>{p.subtitle}</div>}
        </div>
      )

    case 'text':
      return (
        <div style={{ textAlign: align, fontSize: p.fontSize ?? 15, fontWeight: p.fontWeight ?? 400, color: theme.muted, lineHeight: 1.5 }}>
          {p.text}
        </div>
      )

    case 'button': {
      const variant = p.variant ?? 'primary'
      const base: React.CSSProperties = {
        borderRadius: radius,
        padding: '12px 20px',
        fontSize: 15,
        fontWeight: 600,
        border: 'none',
        cursor: 'default',
        width: p.fullWidth ? '100%' : 'auto',
      }
      const styles: Record<string, React.CSSProperties> = {
        primary: { background: theme.primary, color: '#fff' },
        secondary: { background: theme.accent, color: '#fff' },
        outline: { background: 'transparent', color: theme.primary, border: `1.5px solid ${theme.primary}` },
        ghost: { background: 'transparent', color: theme.text },
      }
      return (
        <div style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
          <button style={{ ...base, ...styles[variant] }}>{p.text}</button>
        </div>
      )
    }

    case 'image':
      return (
        <div
          style={{
            height: p.height ?? 160,
            borderRadius: radius,
            background: `linear-gradient(135deg, ${theme.primary}33, ${theme.accent}33)`,
            border: `1px solid ${theme.muted}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.muted,
            fontSize: 28,
          }}
        >
          🖼
        </div>
      )

    case 'input':
      return (
        <div
          style={{
            borderRadius: radius,
            padding: '13px 16px',
            background: theme.mode === 'dark' ? '#ffffff10' : '#00000008',
            border: `1px solid ${theme.muted}33`,
            color: theme.muted,
            fontSize: 15,
          }}
        >
          {p.placeholder}
        </div>
      )

    case 'card':
      return (
        <div
          style={{
            borderRadius: radius,
            padding: 16,
            background: theme.surface,
            boxShadow: theme.mode === 'dark' ? '0 8px 24px #00000040' : '0 6px 18px #0000000f',
            border: `1px solid ${theme.muted}1a`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{p.text}</div>
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>{p.subtitle}</div>
        </div>
      )

    case 'listItem':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${theme.primary}22`,
              color: theme.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            {p.icon}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{p.text}</div>
            {p.subtitle && <div style={{ fontSize: 13, color: theme.muted }}>{p.subtitle}</div>}
          </div>
        </div>
      )

    case 'badge': {
      const bg = p.variant === 'secondary' ? theme.accent : theme.primary
      return (
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            background: `${bg}22`,
            color: bg,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {p.text}
        </span>
      )
    }

    case 'avatar':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: p.height ?? 48,
              height: p.height ?? 48,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{p.text}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{p.subtitle}</div>
          </div>
        </div>
      )

    case 'divider':
      return <div style={{ height: 1, background: `${theme.muted}33`, margin: '4px 0' }} />

    case 'spacer':
      return <div style={{ height: p.height ?? 24 }} />

    default:
      return null
  }
}
