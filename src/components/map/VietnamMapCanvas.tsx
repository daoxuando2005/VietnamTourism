import { provinces } from '@/data/mockMapPlaces'
import type { Province } from '@/types/place'

interface VietnamMapCanvasProps {
  selectedProvinceId: string
  onProvinceSelect: (province: Province) => void
}

function VietnamSilhouette() {
  return (
    <path
      d="M 95 8
         C 108 6, 118 12, 120 22
         C 122 32, 115 38, 118 48
         C 122 58, 128 65, 125 78
         C 122 90, 128 100, 130 115
         C 132 130, 128 145, 130 160
         C 132 175, 128 190, 125 205
         C 122 220, 118 235, 115 250
         C 112 265, 108 280, 105 295
         C 100 310, 95 325, 88 340
         C 80 355, 68 365, 58 372
         C 48 378, 42 385, 50 390
         C 58 395, 68 392, 78 385
         C 88 378, 95 365, 100 350
         C 105 335, 108 318, 112 300
         C 115 282, 118 262, 120 242
         C 122 222, 118 202, 115 182
         C 112 162, 108 142, 105 122
         C 102 102, 98 82, 95 62
         C 92 42, 88 22, 95 8 Z"
      className="fill-teal-100 stroke-teal-600"
      strokeWidth="1.5"
    />
  )
}

export function VietnamMapCanvas({ selectedProvinceId, onProvinceSelect }: VietnamMapCanvasProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Vietnam Map</h2>
        <p className="text-xs text-gray-500">Click a province marker to view details</p>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-sky-50 to-teal-50/30 p-4">
        <svg
          viewBox="0 0 200 400"
          className="h-full max-h-[520px] w-full max-w-[280px]"
          role="img"
          aria-label="Interactive map of Vietnam"
        >
          <VietnamSilhouette />

          {provinces.map((province) => {
            const isSelected = province.id === selectedProvinceId
            const cx = province.mapX * 2
            const cy = province.mapY * 4

            return (
              <g key={province.id}>
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={10}
                    className="fill-amber-400/40"
                    aria-hidden="true"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4.5}
                  className={[
                    'cursor-pointer transition-all',
                    isSelected
                      ? 'fill-amber-500 stroke-white'
                      : 'fill-teal-600 stroke-white hover:fill-teal-500',
                  ].join(' ')}
                  strokeWidth={isSelected ? 2 : 1.5}
                  onClick={() => onProvinceSelect(province)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${province.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onProvinceSelect(province)
                    }
                  }}
                />
                {isSelected && (
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    className="fill-gray-800 text-[7px] font-semibold"
                  >
                    {province.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-center text-xs text-gray-500">
          {provinces.length} provinces · Placeholder map — Google Maps integration coming soon
        </p>
      </div>
    </div>
  )
}
