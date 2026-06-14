import { Garment, MATERIAL_COLORS, SEASON_COLORS, STORAGE_STATUS_COLORS } from '@/types/garment';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shirt, MapPin } from 'lucide-react';
import CareMethodBadge from './CareMethodBadge';

interface GarmentCardProps {
  garment: Garment;
}

export default function GarmentCard({ garment }: GarmentCardProps) {
  const navigate = useNavigate();

  const materialColor = MATERIAL_COLORS[garment.material] || 'bg-gray-100 text-gray-700';
  const seasonColor = SEASON_COLORS[garment.season] || 'bg-gray-100 text-gray-700';
  const storageStatusColor = STORAGE_STATUS_COLORS[garment.storageStatus] || 'bg-gray-100 text-gray-700';

  return (
    <div
      onClick={() => navigate(`/garment/${garment.id}`)}
      className={`group rounded-2xl shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer overflow-hidden border animate-fade-in ${
        garment.storageStatus === '换季收纳'
          ? 'bg-slate-50 border-slate-200/60 opacity-80'
          : 'bg-white border-cream-200/60'
      }`}
    >
      <div className="flex items-stretch">
        <div className={`w-24 sm:w-28 flex-shrink-0 flex items-center justify-center relative overflow-hidden ${
          garment.storageStatus === '换季收纳' ? 'bg-slate-100' : 'bg-cream-100'
        }`}>
          {garment.labelPhotos.length > 0 ? (
            <img
              src={garment.labelPhotos[0]}
              alt={garment.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                garment.storageStatus === '换季收纳' ? 'grayscale-[30%]' : ''
              }`}
            />
          ) : (
            <Shirt className={`w-10 h-10 ${garment.storageStatus === '换季收纳' ? 'text-slate-300' : 'text-cream-400'}`} />
          )}
          {garment.storageStatus === '换季收纳' && (
            <div className="absolute top-1.5 left-1.5">
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-600 text-white">
                收纳中
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-semibold text-base truncate ${
                garment.storageStatus === '换季收纳' ? 'text-slate-500' : 'text-charcoal-500'
              }`}>
                {garment.name}
              </h3>
              <p className="text-charcoal-200 text-sm mt-0.5 truncate">
                {garment.brand || '未填写品牌'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-cream-400 flex-shrink-0 mt-1 group-hover:text-lavender-400 transition-colors" />
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-pill text-[11px] font-medium ${materialColor}`}>
              {garment.material}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-pill text-[11px] font-medium ${seasonColor}`}>
              {garment.season}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-pill text-[11px] font-medium ${storageStatusColor}`}>
              {garment.storageStatus}
            </span>
          </div>

          {garment.storageLocation && garment.storageStatus === '换季收纳' && (
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{garment.storageLocation}</span>
            </div>
          )}

          {garment.careMethods.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {garment.careMethods.slice(0, 2).map((method) => (
                <CareMethodBadge key={method} method={method} size="sm" />
              ))}
              {garment.careMethods.length > 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-pill text-xs font-medium bg-cream-200 text-charcoal-300">
                  +{garment.careMethods.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
