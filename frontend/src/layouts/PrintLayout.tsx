import { Outlet } from 'react-router'

export default function PrintLayout() {
  return (
    <div className="m-0 p-0 bg-white">
      <Outlet />
    </div>
  )
}
