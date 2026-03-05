import { Outlet } from 'react-router'

export default function PrintLayout() {
  return (
    <div style={{ backgroundColor: '#fff' }}>
      <Outlet />
    </div>
  )
}
