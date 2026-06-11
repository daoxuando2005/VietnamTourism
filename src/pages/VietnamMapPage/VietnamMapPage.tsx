import { PageHeader } from '@/components'
import {
  DestinationPanel,
  ProvinceSelector,
  RegionSidebar,
  VietnamMapCanvas,
} from '@/components/map'
import { useMapSelection } from '@/hooks/useMapSelection'

export function VietnamMapPage() {
  const {
    selectedRegion,
    selectedProvinceId,
    selectedProvince,
    selectedPlace,
    selectRegion,
    selectProvince,
  } = useMapSelection({ defaultProvinceId: 'quang-ninh' })

  return (
    <div>
      <PageHeader
        title="Vietnam Interactive Map"
        description="Explore destinations across Northern, Central, and Southern Vietnam."
      />

      <ProvinceSelector
        selectedProvinceId={selectedProvinceId}
        onProvinceSelect={selectProvince}
      />

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-12 lg:gap-5">
        <div className="hidden lg:col-span-3 lg:block">
          <RegionSidebar
            selectedRegion={selectedRegion}
            selectedProvinceId={selectedProvinceId}
            onRegionSelect={selectRegion}
            onProvinceSelect={selectProvince}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="min-h-[360px] lg:min-h-[560px]">
            <VietnamMapCanvas
              selectedProvinceId={selectedProvinceId}
              onProvinceSelect={selectProvince}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="min-h-[320px] lg:min-h-[560px]">
            <DestinationPanel province={selectedProvince} place={selectedPlace} />
          </div>
        </div>
      </div>
    </div>
  )
}
