import React, { useMemo, useState, useId } from 'react'

export interface ChartDataPoint {
    label: string
    value: number
}

export interface MonthlyMetricsChartProps {
    title: string
    chartData?: ChartDataPoint[]
    isLoading?: boolean
    error?: string | null
    valueFormatter?: (value: number) => string
    lineColor?: string
    barColor?: string
    period?: string
    trend?: number
    showPeriodSelector?: boolean
    onPeriodChange?: (period: number) => void
}

export default function MonthlyMetricsChart({
    title,
    chartData = [],
    isLoading = false,
    error = null,
    valueFormatter = (val) => val.toLocaleString(),
    lineColor = '#3b82f6',
    barColor,
    period = 'Últimos 6 meses',
    trend = 0,
    showPeriodSelector = true,
    onPeriodChange
}: MonthlyMetricsChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<number>(6)

    // Use a string without colons for the gradient ID so SVG references work reliably.
    // React's useId returns strings like ":r0:", which breaks in CSS url(#:r0:).
    const rawId = useId()
    const gradientId = `gradient-${rawId.replace(/:/g, '')}`

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = Number(e.target.value)
        setSelectedPeriod(val)
        if (onPeriodChange) onPeriodChange(val)
    }

    const formattedCurrentValue = useMemo(() => {
        if (!chartData || chartData.length === 0) return '0'
        const latestValue = chartData[chartData.length - 1]?.value || 0
        return valueFormatter(latestValue)
    }, [chartData, valueFormatter])

    const formattedTrend = useMemo(() => {
        const sign = trend >= 0 ? '+' : ''
        return `${sign}${trend.toFixed(1)}%`
    }, [trend])

    const trendColorClass = trend >= 0 ? 'text-green-600' : 'text-red-600'
    const effectiveBarColor = barColor || lineColor

    const maxValue = useMemo(() => {
        if (!chartData || chartData.length === 0) return 100
        const max = Math.max(...chartData.map(d => d.value))
        return max * 1.1 // Add 10% padding
    }, [chartData])

    const barWidth = useMemo(() => {
        if (!chartData || chartData.length === 0) return 30
        const totalWidth = 360 // 400 - 40 padding
        const spacing = 8
        const availableWidth = totalWidth - (spacing * (chartData.length - 1))
        return Math.max(15, Math.min(50, availableWidth / chartData.length))
    }, [chartData])

    const getBarX = (index: number) => {
        if (!chartData || chartData.length === 0) return 0
        const totalWidth = 360
        const spacing = 8
        const totalBarWidth = barWidth * chartData.length
        const totalSpacing = spacing * (chartData.length - 1)
        const startX = 20 + (totalWidth - totalBarWidth - totalSpacing) / 2

        return startX + index * (barWidth + spacing)
    }

    const getBarY = (value: number) => {
        const height = 120
        const padding = 20
        const normalizedValue = value / maxValue
        return padding + height - (normalizedValue * height)
    }

    const getBarHeight = (value: number) => {
        const height = 120
        const normalizedValue = value / maxValue
        return Math.max(2, normalizedValue * height)
    }

    const formatShortValue = (value: number) => {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M'
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K'
        }
        return value.toString()
    }

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {!isLoading ? (
                        <div>
                            <p className="text-2xl font-semibold text-gray-900">{formattedCurrentValue}</p>
                            <p className="text-sm text-gray-500">
                                {period}
                                <span className={`ml-1 ${trendColorClass}`}>{formattedTrend}</span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-2xl font-semibold text-gray-400">Cargando...</p>
                            <p className="text-sm text-gray-400">Obteniendo datos...</p>
                        </div>
                    )}
                </div>

                {showPeriodSelector && (
                    <div>
                        <select
                            value={selectedPeriod}
                            onChange={handlePeriodChange}
                            className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value={6}>Últimos 6 meses</option>
                            <option value={12}>Último año</option>
                            <option value={3}>Últimos 3 meses</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Chart Container */}
            <div className="mt-4 h-40 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <span className="text-gray-500 text-sm mt-2 block">Cargando datos...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded">
                        <div className="text-center">
                            <span className="text-red-500 text-sm">{error}</span>
                        </div>
                    </div>
                ) : !chartData || chartData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                        <span className="text-gray-500 text-sm">No hay datos disponibles</span>
                    </div>
                ) : (
                    <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: effectiveBarColor, stopOpacity: 0.8 }} />
                                <stop offset="100%" style={{ stopColor: effectiveBarColor, stopOpacity: 0.3 }} />
                            </linearGradient>
                            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        <g className="text-xs fill-gray-400">
                            <text x="15" y="25" textAnchor="end">{valueFormatter(maxValue)}</text>
                            <text x="15" y="75" textAnchor="end">{valueFormatter(maxValue / 2)}</text>
                            <text x="15" y="125" textAnchor="end">0</text>
                        </g>

                        {chartData.map((point, index) => {
                            const rectX = getBarX(index)
                            const rectY = getBarY(point.value)
                            const rectHeight = getBarHeight(point.value)

                            return (
                                <g key={index}>
                                    <rect
                                        x={rectX}
                                        y={rectY}
                                        width={barWidth}
                                        height={rectHeight}
                                        fill={`url(#${gradientId})`}
                                        stroke={effectiveBarColor}
                                        strokeWidth="1"
                                        rx="2"
                                        ry="2"
                                        className="transition-all duration-300 hover:-translate-y-px"
                                        style={{
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                                        }}
                                    >
                                        <title>{`${point.label}: ${valueFormatter(point.value)}`}</title>
                                    </rect>

                                    {point.value > maxValue * 0.7 ? (
                                        <text
                                            x={rectX + barWidth / 2}
                                            y={rectY - 5}
                                            textAnchor="middle"
                                            className="text-xs fill-gray-600 font-medium pointer-events-none"
                                        >
                                            {formatShortValue(point.value)}
                                        </text>
                                    ) : rectHeight > 15 ? (
                                        <text
                                            x={rectX + barWidth / 2}
                                            y={rectY + 12}
                                            textAnchor="middle"
                                            className="text-xs fill-white font-medium pointer-events-none"
                                        >
                                            {formatShortValue(point.value)}
                                        </text>
                                    ) : null}
                                </g>
                            )
                        })}

                        <g className="text-xs fill-gray-500">
                            {chartData.map((point, index) => (
                                <text
                                    key={`label-${index}`}
                                    x={getBarX(index) + barWidth / 2}
                                    y={155}
                                    textAnchor="middle"
                                    className="text-xs font-medium pointer-events-none"
                                >
                                    {point.label}
                                </text>
                            ))}
                        </g>
                    </svg>
                )}
            </div>
        </div>
    )
}
