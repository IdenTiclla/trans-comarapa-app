import type { ReactNode } from 'react'

interface DashboardStatCardProps {
    title: string
    value: string | number
    trend?: number
    icon: ReactNode
    borderColor?: string
    iconBgColor?: string
}

export default function DashboardStatCard({
    title,
    value,
    trend,
    icon,
    borderColor = 'border-blue-600',
    iconBgColor = 'bg-blue-100',
}: DashboardStatCardProps) {
    const isPositive = (trend ?? 0) >= 0
    const trendArrow = isPositive
        ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
        : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'

    return (
        <div
            className={`bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${borderColor}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">{value}</p>
                    {trend !== undefined && (
                        <div className="flex items-center">
                            <svg
                                className={`h-4 w-4 mr-1 flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendArrow} />
                            </svg>
                            <span
                                className={`text-sm font-medium truncate ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {trend}% vs. ayer
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className={`ml-4 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 ${iconBgColor} rounded-xl flex-shrink-0`}
                >
                    {icon}
                </div>
            </div>
        </div>
    )
}
