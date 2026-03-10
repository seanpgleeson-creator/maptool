'use client'

import Link from 'next/link'

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    gap: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 700,
    fontSize: '1.125rem',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#dc2626',
  },
  search: {
    flex: 1,
    maxWidth: 360,
    margin: '0 auto',
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: '0.875rem',
    color: '#64748b',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    borderRadius: 8,
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '1.125rem',
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#22c55e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  avatarName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#0f172a',
  },
}

export function TopBar() {
  return (
    <header style={styles.bar}>
      <Link href="/itemhub" style={styles.logo}>
        <span style={styles.logoIcon} aria-hidden />
        ItemHub
      </Link>
      <input
        type="search"
        placeholder="Q Search"
        aria-label="Search"
        style={styles.search}
        readOnly
      />
      <div style={styles.right}>
        <button type="button" style={styles.iconBtn} aria-label="Help">
          ?
        </button>
        <button type="button" style={styles.iconBtn} aria-label="Notifications">
          🔔
        </button>
        <div style={styles.avatar}>
          <span style={styles.avatarCircle}>JD</span>
          <span style={styles.avatarName}>John Doe</span>
        </div>
      </div>
    </header>
  )
}
