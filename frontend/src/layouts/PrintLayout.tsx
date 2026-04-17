import { Outlet } from 'react-router'

export default function PrintLayout() {
  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}>
      <Outlet />
    </div>
  )
}
