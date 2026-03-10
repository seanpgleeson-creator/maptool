'use client'

import Link from 'next/link'

const styles = {
  nav: {
    width: 220,
    padding: '1rem 0',
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    margin: '0 0.5rem',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#475569',
  },
  linkSelected: {
    background: '#f1f5f9',
    color: '#0f172a',
    borderLeft: '3px solid #2563eb',
    marginLeft: 0,
    paddingLeft: 'calc(1rem - 3px)',
  },
  icon: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
}

const items = [
  { href: '/itemhub', label: 'Home', icon: '⌂', selected: false },
  { href: '/itemhub', label: 'My Items', icon: '▤', selected: true },
  { href: '/itemhub/review', label: 'My Tasks', icon: '☑', selected: false },
  { href: '/itemhub', label: 'Item Health', icon: '❤', selected: false },
]

export function LeftNav() {
  return (
    <nav style={styles.nav} aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          style={{
            ...styles.link,
            ...(item.selected ? styles.linkSelected : {}),
          }}
        >
          <span style={styles.icon}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
