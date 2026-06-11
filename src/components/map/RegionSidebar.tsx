import { regionGroups } from '@/data/mockMapPlaces'
import type { Province, VietnamRegion } from '@/types/place'

interface RegionSidebarProps {
  selectedRegion: VietnamRegion
  selectedProvinceId: string
  onRegionSelect: (region: VietnamRegion) => void
  onProvinceSelect: (province: Province) => void
}

export function RegionSidebar({
  selectedRegion,
  selectedProvinceId,
  onRegionSelect,
  onProvinceSelect,
}: RegionSidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Regions</h2>
        <p className="text-xs text-gray-500">Select a province to explore</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {regionGroups.map((group) => {
          const isRegionActive = selectedRegion === group.id

          return (
            <div key={group.id} className="mb-2">
              <button
                type="button"
                onClick={() => onRegionSelect(group.id)}
                className={[
                  'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                  isRegionActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <span>{group.label}</span>
                <span className="text-xs font-normal text-gray-400">
                  {group.provinces.length}
                </span>
              </button>

              {isRegionActive && (
                <ul className="mt-1 space-y-0.5 pl-2">
                  {group.provinces.map((province) => (
                    <li key={province.id}>
                      <button
                        type="button"
                        onClick={() => onProvinceSelect(province)}
                        className={[
                          'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          selectedProvinceId === province.id
                            ? 'bg-teal-700 font-medium text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        ].join(' ')}
                      >
                        {province.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
