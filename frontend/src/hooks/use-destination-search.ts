import { useState, useCallback } from 'react'

interface Location {
    name: string
    department?: string
    [key: string]: unknown
}

export function useDestinationSearch(initialLocations: Location[] = []) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

    const filteredLocations = useCallback(() => {
        if (!searchTerm) return initialLocations
        const term = searchTerm.toLowerCase()
        return initialLocations.filter(loc =>
            loc.name.toLowerCase().includes(term) ||
            (loc.department && loc.department.toLowerCase().includes(term))
        )
    }, [initialLocations, searchTerm])

    return {
        searchTerm,
        setSearchTerm,
        selectedLocation,
        setSelectedLocation,
        filteredLocations: filteredLocations()
    }
}
