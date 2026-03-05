import { useNavigate } from 'react-router'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'

export function Component() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Registrar Nueva Encomienda</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow min-h-[500px] relative">
        {/* 
                 Instead of duplicating the entire form, we embed the registration modal component 
                 and override its modal behavior by rendering it as a normal block if needed, 
                 but since PackageRegistrationModal is modal-only, we just show it fixed 
                 or we can navigate back after registration. Here we will display it open by default 
                 and navigate back on close.
                */}
        <PackageRegistrationModal
          show={true}
          onClose={() => navigate('/packages')}
          onPackageRegistered={(pkg) => navigate('/packages')}
        />
      </div>
    </div>
  )
}
