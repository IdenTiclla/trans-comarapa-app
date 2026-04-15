import React from 'react'
import { User, UserCheck, ShieldCheck, Mail, Phone, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StakeholderCardProps {
  title: string
  name: string
  subtitle?: string
  icon: React.ReactNode
  colorClass: string
  bgColorClass: string
  details?: {
    label: string
    value: string
    icon?: React.ReactNode
  }[]
}

const StakeholderCard = ({ title, name, subtitle, icon, colorClass, bgColorClass, details }: StakeholderCardProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full", bgColorClass, colorClass)}>
          {title}
        </span>
        <div className={cn("p-2.5 rounded-xl", bgColorClass)}>
          {React.cloneElement(icon as React.ReactElement, { className: cn("w-5 h-5", colorClass) })}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner", bgColorClass)}>
          {initials}
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight leading-none mb-1">{name}</h3>
          {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>
      </div>

      {details && details.length > 0 && (
        <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col gap-3">
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                {detail.icon || <Fingerprint className="w-3.5 h-3.5" />}
                <span className="text-[10px] uppercase font-bold tracking-wider">{detail.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface PackageStakeholdersProps {
  sender?: any
  recipient?: any
  secretary?: any
  senderName?: string
  recipientName?: string
}

export default function PackageStakeholders({ sender, recipient, secretary, senderName, recipientName }: PackageStakeholdersProps) {
  const finalSenderName = sender && (sender.firstname || sender.lastname) 
    ? `${sender.firstname || ''} ${sender.lastname || ''}`.trim()
    : senderName || 'Desconocido'

  const finalRecipientName = recipient && (recipient.firstname || recipient.lastname)
    ? `${recipient.firstname || ''} ${recipient.lastname || ''}`.trim()
    : recipientName || 'Desconocido'

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StakeholderCard
        title="Remitente"
        name={finalSenderName}
        subtitle="Cliente Origen"
        icon={<User />}
        colorClass="text-[#16499B]"
        bgColorClass="bg-blue-50"
        details={[
          { label: 'C.I.', value: sender?.document_id || 'N/A' },
          { label: 'Teléfono', value: sender?.phone || 'N/A', icon: <Phone className="w-3.5 h-3.5" /> }
        ]}
      />

      <StakeholderCard
        title="Destinatario"
        name={finalRecipientName}
        subtitle="Cliente Destino"
        icon={<UserCheck />}
        colorClass="text-[#932720]"
        bgColorClass="bg-red-50"
        details={[
          { label: 'C.I.', value: recipient?.document_id || 'N/A' },
          { label: 'Teléfono', value: recipient?.phone || 'N/A', icon: <Phone className="w-3.5 h-3.5" /> }
        ]}
      />

      <StakeholderCard
        title="Registrado Por"
        name={`${secretary?.firstname || ''} ${secretary?.lastname || ''}`.trim() || 'No asignado'}
        subtitle="Personal de Agencia"
        icon={<ShieldCheck />}
        colorClass="text-emerald-700"
        bgColorClass="bg-emerald-50"
        details={[
          { label: 'Agencia', value: secretary?.office?.name || secretary?.branch?.name || 'Oficina Origen' },
          { label: 'Cargo', value: 'Secretaría', icon: <Mail className="w-3.5 h-3.5" /> }
        ]}
      />
    </div>
  )
}
