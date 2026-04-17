import { useState, useCallback } from 'react'

export function useDestinationSearch(initialLocations: any[] = []) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLocation, setSelectedLocation] = useState<any>(null)

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
