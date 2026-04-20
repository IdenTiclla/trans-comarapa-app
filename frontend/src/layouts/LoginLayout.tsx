import { Outlet } from 'react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const heroImages = [
  '/images/buses_challa.jpeg',
  '/images/flota_blanca_rene.png',
  '/images/doble_piso_verde.png',
  '/images/flota roja.jpeg',
]

export default function LoginLayout() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-inter">
      {/* Left side - Image slider (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 w-full h-full">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${image}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-comarapa-dark/90 via-comarapa-medium/80 to-comarapa-dark/90" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-8 lg:px-12 xl:px-16 text-white">
          <div className="w-full max-w-lg mx-auto text-center">
            <div className="mb-6 lg:mb-8 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-5 lg:p-6 rounded-2xl lg:rounded-3xl shadow-2xl">
                <svg className="h-12 w-12 lg:h-16 lg:w-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6v6m8-6v6m-10 0h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 lg:mb-4">Trans Comarapa</h1>
            <p className="text-lg lg:text-xl text-white/90 mb-6 lg:mb-8">Sistema de Gestión de Transporte</p>

            <div className="grid grid-cols-3 gap-4 lg:gap-6 mt-6 lg:mt-8">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-2 lg:mb-3 inline-flex justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-xl lg:text-2xl font-bold">23</div>
                <div className="text-xs lg:text-sm text-white/80">Localidades</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-2 lg:mb-3 inline-flex justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="text-xl lg:text-2xl font-bold">10+</div>
                <div className="text-xs lg:text-sm text-white/80">Años</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-2 lg:mb-3 inline-flex justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="text-xl lg:text-2xl font-bold">4</div>
                <div className="text-xs lg:text-sm text-white/80">Oficinas</div>
              </div>
            </div>

            <div className="mt-8 lg:mt-12">
              <p className="text-white/80 italic text-base lg:text-lg">&quot;Conectando el corazón de Bolivia con seguridad y confianza&quot;</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {heroImages.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 lg:w-3 lg:h-3 min-w-0 rounded-full p-0 transition-all duration-300 hover:scale-110 ${
                index === currentSlide
                  ? 'bg-white shadow-lg scale-125 hover:bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-gradient-to-br from-comarapa-gray via-white to-comarapa-gray">
        <div className="w-full max-w-sm sm:max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
