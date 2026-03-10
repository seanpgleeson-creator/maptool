'use client'

import { AttributeGroupsList } from './AttributeGroupsList'
import { LeftNav } from './LeftNav'
import { TopBar } from './TopBar'

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'system-ui, sans-serif',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: '1.5rem',
  },
  breadcrumb: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  vendorContext: {
    fontSize: '0.8125rem',
    color: '#475569',
    marginBottom: '0.75rem',
    padding: '0.5rem 0',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '0.75rem',
  },
  statusRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  itemsSelected: {
    fontSize: '0.875rem',
    color: '#2563eb',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#ea580c',
  },
  alertIcon: { fontSize: '1.25rem' },
  searchInline: {
    padding: '0.4rem 0.6rem',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    fontSize: '0.8125rem',
    width: 160,
  },
  btnPrimary: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '0.5rem 1rem',
    background: '#fff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  twoCol: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  leftCol: {
    width: 220,
    flexShrink: 0,
    padding: '1rem',
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    height: 'fit-content',
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
    padding: '1rem',
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
}

interface VendorShellProps {
  children: React.ReactNode
  itemCount?: number
}

export function VendorShell({ children, itemCount = 3 }: VendorShellProps) {
  return (
    <div style={styles.layout}>
      <TopBar />
      <div style={styles.body}>
        <LeftNav />
        <main style={styles.main}>
          <div style={styles.breadcrumb}>My Items / Update Item</div>
          <div style={styles.vendorContext}>
            You are signed in as a Vendor user submitting item attributes and pricing information to
            Target.
          </div>
          <h1 style={styles.title}>Update Item</h1>
          <div style={styles.statusRow}>
            <span style={styles.itemsSelected}>{itemCount} items selected</span>
            <span style={styles.alert}>
              <span style={styles.alertIcon}>⚠</span>
              20 attributes need attention across 2 attribute groups.
            </span>
            <input
              type="search"
              placeholder="Q Search"
              aria-label="Search content"
              style={styles.searchInline}
              readOnly
            />
            <button type="button" style={styles.btnPrimary}>
              Smart Fill with AI
            </button>
            <button type="button" style={styles.btnSecondary}>
              Bulk edit
            </button>
          </div>
          <div style={styles.twoCol}>
            <aside style={styles.leftCol}>
              <AttributeGroupsList />
            </aside>
            <div style={styles.rightCol}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
