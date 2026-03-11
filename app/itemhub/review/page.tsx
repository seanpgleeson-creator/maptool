import { TopBar } from '../components/TopBar'
import { ReviewerConsole } from './ReviewerConsole'

export default function ItemHubReviewPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <ReviewerConsole />
    </div>
  )
}
