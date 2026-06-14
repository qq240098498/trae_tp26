import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles, X } from 'lucide-react';
import { useGarmentStore } from '@/store/garmentStore';
import { GARMENT_TYPES, MATERIALS, GarmentType, Material } from '@/types/garment';
import GarmentCard from '@/components/GarmentCard';

export default function GarmentList() {
  const navigate = useNavigate();
  const { garments, load, search } = useGarmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const displayedGarments = useMemo(() => {
    let result = searchQuery.trim() ? search(searchQuery) : garments;
    if (selectedType) {
      result = result.filter((g) => g.type === selectedType);
    }
    if (selectedMaterial) {
      result = result.filter((g) => g.material === selectedMaterial);
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [garments, searchQuery, selectedType, selectedMaterial, search]);

  const hasFilters = selectedType || selectedMaterial || searchQuery.trim();

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSelectedMaterial(null);
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-200/60">
        <div className="container max-w-3xl">
          <div className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-500 tracking-tight">
                  衣物洗护管家
                </h1>
                <p className="text-charcoal-200 text-sm mt-0.5">
                  {garments.length > 0
                    ? `共 ${garments.length} 件衣物`
                    : '科学管理，精致护理'}
                </p>
              </div>
              {garments.length > 0 && (
                <button
                  onClick={() => navigate('/add')}
                  className="w-10 h-10 rounded-full bg-lavender-400 text-white flex items-center justify-center shadow-md hover:bg-lavender-500 hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {garments.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
                <input
                  type="text"
                  placeholder="搜索衣物名称、品牌、材质..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cream-200 text-charcoal-300 flex items-center justify-center hover:bg-cream-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {garments.length > 0 && (
            <div className="pb-3 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`flex-shrink-0 px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                    !selectedType
                      ? 'bg-charcoal-500 text-white'
                      : 'bg-white text-charcoal-300 border border-cream-200 hover:border-cream-300'
                  }`}
                >
                  全部
                </button>
                {GARMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedType(selectedType === type ? null : type)
                    }
                    className={`flex-shrink-0 px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                      selectedType === type
                        ? 'bg-lavender-400 text-white'
                        : 'bg-white text-charcoal-300 border border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className={`flex-shrink-0 px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                    !selectedMaterial
                      ? 'bg-charcoal-500 text-white'
                      : 'bg-white text-charcoal-300 border border-cream-200 hover:border-cream-300'
                  }`}
                >
                  全部材质
                </button>
                {MATERIALS.map((mat) => (
                  <button
                    key={mat}
                    onClick={() =>
                      setSelectedMaterial(selectedMaterial === mat ? null : mat)
                    }
                    className={`flex-shrink-0 px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                      selectedMaterial === mat
                        ? 'bg-lavender-400 text-white'
                        : 'bg-white text-charcoal-300 border border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-3xl py-4 pb-24">
        {garments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-lavender-50 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-lavender-300" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-500 mb-2">
              开始录入衣物
            </h2>
            <p className="text-charcoal-200 text-sm text-center max-w-xs mb-8">
              添加您的第一件衣物，记录洗护要求，不再为洗错衣服而烦恼
            </p>
            <button
              onClick={() => navigate('/add')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-lavender-400 text-white font-medium shadow-md hover:bg-lavender-500 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              添加衣物
            </button>
          </div>
        ) : displayedGarments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-cream-400" />
            </div>
            <p className="text-charcoal-300 text-sm mb-2">没有找到匹配的衣物</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-lavender-500 text-sm font-medium hover:text-lavender-600 transition-colors"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {hasFilters && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-charcoal-200">
                  找到 {displayedGarments.length} 件衣物
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors"
                >
                  清除筛选
                </button>
              </div>
            )}
            {displayedGarments.map((garment, i) => (
              <div key={garment.id} style={{ animationDelay: `${i * 50}ms` }}>
                <GarmentCard garment={garment} />
              </div>
            ))}
          </div>
        )}
      </main>

      {garments.length > 0 && (
        <div className="fixed bottom-6 right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20">
          <button
            onClick={() => navigate('/add')}
            className="w-14 h-14 rounded-full bg-lavender-400 text-white flex items-center justify-center shadow-lg hover:bg-lavender-500 hover:shadow-xl transition-all duration-200 active:scale-95 sm:hidden"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
