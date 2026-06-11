import { regionGroups } from '@/data/mockMapPlaces'
import type { Province } from '@/types/place'

interface ProvinceSelectorProps {
  selectedProvinceId: string
  onProvinceSelect: (province: Province) => void
}

export function ProvinceSelector({ selectedProvinceId, onProvinceSelect }: ProvinceSelectorProps) {
  const allProvinces = regionGroups.flatMap((g) => g.provinces)

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
      <label htmlFor="province-select" className="text-xs font-medium text-gray-500">
        Select province
      </label>
      <select
        id="province-select"
        value={selectedProvinceId}
        onChange={(e) => {
          const province = allProvinces.find((p) => p.id === e.target.value)
          if (province) onProvinceSelect(province)
        }}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        {regionGroups.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {group.provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
