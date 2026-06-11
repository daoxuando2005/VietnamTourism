import { useCallback, useMemo, useState } from 'react'
import { getPlaceByProvinceId, getProvinceById, provinces } from '@/data/mockMapPlaces'
import type { Place, Province, VietnamRegion } from '@/types/place'

interface UseMapSelectionOptions {
  defaultProvinceId?: string
}

export function useMapSelection(options: UseMapSelectionOptions = {}) {
  const defaultProvince = options.defaultProvinceId
    ? getProvinceById(options.defaultProvinceId)
    : provinces[0]

  const [selectedRegion, setSelectedRegion] = useState<VietnamRegion>(
    defaultProvince?.region ?? 'north',
  )
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    defaultProvince?.id ?? provinces[0].id,
  )

  const selectedProvince = useMemo(
    () => getProvinceById(selectedProvinceId),
    [selectedProvinceId],
  )

  const selectedPlace = useMemo(
    () => getPlaceByProvinceId(selectedProvinceId),
    [selectedProvinceId],
  )

  const selectRegion = useCallback((region: VietnamRegion) => {
    setSelectedRegion(region)
    const firstInRegion = provinces.find((p) => p.region === region)
    if (firstInRegion) setSelectedProvinceId(firstInRegion.id)
  }, [])

  const selectProvince = useCallback((province: Province) => {
    setSelectedProvinceId(province.id)
    setSelectedRegion(province.region)
  }, [])

  return {
    selectedRegion,
    selectedProvinceId,
    selectedProvince,
    selectedPlace,
    selectRegion,
    selectProvince,
  }
}

export type MapSelection = ReturnType<typeof useMapSelection>
export type { Place, Province, VietnamRegion }
