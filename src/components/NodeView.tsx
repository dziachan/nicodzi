import type { ComponentNode, DesignTokens } from '../types'

interface Props {
  node: ComponentNode
  tokens: DesignTokens
}

/** Pure presentational rendering of a component, filling its parent box. */
export default function NodeView({ node, tokens }: Props) {
  const p = node.props
  const radius = p.radius ?? tokens.radius
  const align = p.align ?? 'left'
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  const fill: React.CSSProperties = { width: '100%', height: '100%', boxSizing: 'border-box' }

  switch (node.type) {
    case 'topBar':
      return (
        <div
          style={{
            ...fill,
            background: p.bg ?? tokens.primary,
            color: p.textColor ?? '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'left' ? 'flex-start' : justify,
            padding: '0 16px',
            fontSize: p.fontSize ?? 18,
            fontWeight: 700,
          }}
        >
          {p.text}
        </div>
      )

    case 'bottomNav':
      return (
        <div
          style={{
            ...fill,
            background: p.bg ?? tokens.background,
            borderTop: `1px solid ${tokens.text}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {(p.items ?? []).map((it, i) => (
            <div key={it + i} style={{ textAlign: 'center', color: i === 0 ? tokens.primary : `${tokens.text}99`, fontSize: 11, fontWeight: 600 }}>
              <div style={{ width: 18, height: 18, borderRadius: 6, margin: '0 auto 3px', background: i === 0 ? tokens.primary : `${tokens.text}55` }} />
              {it}
            </div>
          ))}
        </div>
      )

    case 'button':
      return (
        <button
          style={{
            ...fill,
            background: p.bg ?? tokens.primary,
            color: p.textColor ?? '#fff',
            border: 'none',
            borderRadius: radius,
            fontSize: p.fontSize ?? 15,
            fontWeight: 600,
            cursor: 'inherit',
          }}
        >
          {p.text}
        </button>
      )

    case 'input':
    case 'searchBar':
      return (
        <div
          style={{
            ...fill,
            background: p.bg ?? '#ffffff',
            color: p.textColor ?? '#9aa0aa',
            border: `1px solid ${tokens.text}33`,
            borderRadius: radius,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            fontSize: p.fontSize ?? 14,
          }}
        >
          {node.type === 'searchBar' && <span style={{ opacity: 0.6 }}>🔍</span>}
          {p.placeholder}
        </div>
      )

    case 'label':
      return (
        <div
          style={{
            ...fill,
            color: p.textColor ?? tokens.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: justify,
            fontSize: p.fontSize ?? 22,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {p.text}
        </div>
      )

    case 'image':
      return p.src ? (
        <img src={p.src} alt="" draggable={false} style={{ ...fill, objectFit: 'cover', borderRadius: radius, display: 'block' }} />
      ) : (
        <div
          style={{
            ...fill,
            borderRadius: radius,
            background: `linear-gradient(135deg, ${tokens.primary}33, ${tokens.secondary}33)`,
            border: `1px dashed ${tokens.text}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: `${tokens.text}88`,
          }}
        >
          🖼
        </div>
      )

    case 'card':
      return (
        <div
          style={{
            ...fill,
            background: p.bg ?? '#ffffff',
            color: p.textColor ?? tokens.text,
            borderRadius: radius,
            boxShadow: '0 6px 18px #0000001a',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: p.fontSize ?? 16 }}>{p.text}</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Beschreibungstext der Card.</div>
        </div>
      )

    case 'list':
      return (
        <div style={{ ...fill, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(p.items ?? []).map((it, i) => (
            <div
              key={it + i}
              style={{
                background: p.bg ?? '#ffffff',
                color: p.textColor ?? tokens.text,
                borderRadius: radius,
                padding: '10px 14px',
                fontSize: p.fontSize ?? 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 2px 8px #00000012',
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 7, background: `${tokens.primary}22`, color: tokens.primary, display: 'grid', placeItems: 'center', fontSize: 11 }}>•</span>
              {it}
            </div>
          ))}
        </div>
      )

    case 'icon':
      return (
        <div style={{ ...fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.min(node.w, node.h) * 0.7, color: p.textColor ?? tokens.primary }}>
          {p.icon}
        </div>
      )

    case 'toggle':
      return (
        <div style={{ ...fill, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: p.textColor ?? tokens.text, fontSize: p.fontSize ?? 14, gap: 10 }}>
          <span>{p.text}</span>
          <span style={{ width: 44, height: 26, borderRadius: 999, background: p.value ? tokens.primary : `${tokens.text}33`, position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: p.value ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </span>
        </div>
      )

    default:
      return null
  }
}
