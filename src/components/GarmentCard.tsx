import { Garment, MATERIAL_COLORS } from '@/types/garment';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shirt } from 'lucide-react';
import CareMethodBadge from './CareMethodBadge';

interface GarmentCardProps {
  garment: Garment;
}

export default function GarmentCard({ garment }: GarmentCardProps) {
  const navigate = useNavigate();

  const materialColor = MATERIAL_COLORS[garment.material] || 'bg-gray-100 text-gray-700';

  return (
    <div
      onClick={() => navigate(`/garment/${garment.id}`)}
      className="group bg-white rounded-2xl shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer overflow-hidden border border-cream-200/60 animate-fade-in"
    >
      <div className="flex items-stretch">
        <div className="w-24 sm:w-28 flex-shrink-0 bg-cream-100 flex items-center justify-center relative overflow-hidden">
          {garment.labelPhotos.length > 0 ? (
            <img
              src={garment.labelPhotos[0]}
              alt={garment.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <Shirt className="w-10 h-10 text-cream-400" />
          )}
        </div>

        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-charcoal-500 text-base truncate">
                {garment.name}
              </h3>
              <p className="text-charcoal-200 text-sm mt-0.5 truncate">
                {garment.brand || '未填写品牌'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-cream-400 flex-shrink-0 mt-1 group-hover:text-lavender-400 transition-colors" />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium ${materialColor}`}>
              {garment.material}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium bg-cream-200 text-charcoal-300">
              {garment.type}
            </span>
          </div>

          {garment.careMethods.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {garment.careMethods.slice(0, 3).map((method) => (
                <CareMethodBadge key={method} method={method} size="sm" />
              ))}
              {garment.careMethods.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium bg-cream-200 text-charcoal-300">
                  +{garment.careMethods.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
