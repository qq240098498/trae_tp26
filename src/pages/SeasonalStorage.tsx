import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  Sparkles,
  Package,
  Shirt,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useGarmentStore } from '@/store/garmentStore';
import {
  Garment,
  Season,
  StorageStatus,
  SEASONS,
  SEASON_COLORS,
  STORAGE_STATUS_COLORS,
} from '@/types/garment';

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '春季';
  if (month >= 6 && month <= 8) return '夏季';
  if (month >= 9 && month <= 11) return '秋季';
  return '冬季';
}

function getNextSeason(current: Season): Season {
  const order: Season[] = ['春季', '夏季', '秋季', '冬季'];
  const idx = order.indexOf(current);
  if (idx === -1) return '春季';
  return order[(idx + 1) % 4];
}

function getSeasonIcon(season: Season, size: 'sm' | 'md' | 'lg' = 'md') {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  switch (season) {
    case '春季':
      return <Flower2 className={sizeClass} />;
    case '夏季':
      return <Sun className={sizeClass} />;
    case '秋季':
      return <Leaf className={sizeClass} />;
    case '冬季':
      return <Snowflake className={sizeClass} />;
    default:
      return <Sparkles className={sizeClass} />;
  }
}

export default function SeasonalStorage() {
  const navigate = useNavigate();
  const { garments, load, setStorageStatus } = useGarmentStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('toStore');
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const currentSeason = useMemo(() => getCurrentSeason(), []);
  const nextSeason = useMemo(() => getNextSeason(currentSeason), []);

  useEffect(() => {
    load();
  }, [load]);

  const displaySeason = selectedSeason || currentSeason;
  const displayNextSeason = selectedSeason ? getNextSeason(selectedSeason) : nextSeason;

  const toStoreGarments = useMemo(() => {
    const prevSeasonOrder: Season[] = ['冬季', '春季', '夏季', '秋季'];
    const idx = prevSeasonOrder.indexOf(displaySeason);
    const prevSeason = idx === -1 ? '冬季' : prevSeasonOrder[idx];
    
    return garments.filter((g) => {
      if (g.season === '四季') return false;
      if (g.storageStatus === '换季收纳') return false;
      return g.season === prevSeason;
    });
  }, [garments, displaySeason]);

  const toRetrieveGarments = useMemo(() => {
    return garments.filter((g) => {
      if (g.season === '四季') return false;
      if (g.storageStatus !== '换季收纳') return false;
      return g.season === displaySeason || g.season === displayNextSeason;
    });
  }, [garments, displaySeason, displayNextSeason]);

  const storedGarments = useMemo(() => {
    return garments.filter((g) => g.storageStatus === '换季收纳');
  }, [garments]);

  const wearableGarments = useMemo(() => {
    return garments.filter((g) => g.storageStatus === '当前可穿');
  }, [garments]);

  const toggleStore = (id: string, store: boolean) => {
    const newStatus: StorageStatus = store ? '换季收纳' : '当前可穿';
    setStorageStatus(id, newStatus);
  };

  const batchStore = () => {
    toStoreGarments.forEach((g) => {
      setStorageStatus(g.id, '换季收纳');
    });
  };

  const batchRetrieve = () => {
    toRetrieveGarments.forEach((g) => {
      setStorageStatus(g.id, '当前可穿');
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const seasonColor = SEASON_COLORS[displaySeason] || 'bg-gray-100 text-gray-700';
  const nextSeasonColor = SEASON_COLORS[displayNextSeason] || 'bg-gray-100 text-gray-700';

  const GarmentItem = ({ garment, actionLabel, onAction, actionVariant }: {
    garment: Garment;
    actionLabel: string;
    onAction: () => void;
    actionVariant: 'store' | 'retrieve';
  }) => (
    <div className="flex items-stretch gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200 hover:border-cream-300 transition-all">
      <div className="w-12 h-12 rounded-lg bg-cream-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {garment.labelPhotos.length > 0 ? (
          <img
            src={garment.labelPhotos[0]}
            alt={garment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Shirt className="w-5 h-5 text-cream-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-charcoal-500 truncate">
              {garment.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${SEASON_COLORS[garment.season] || 'bg-gray-100 text-gray-700'}`}>
                {garment.season}
              </span>
            </div>
          </div>
          <button
            onClick={onAction}
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              actionVariant === 'store'
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            <Check className="w-3 h-3" />
            {actionLabel}
          </button>
        </div>
        {garment.storageLocation && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-charcoal-200">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{garment.storageLocation}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-200/60">
        <div className="container max-w-2xl flex items-center justify-between py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-charcoal-400" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-charcoal-500">
            换季收纳清单
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="container max-w-2xl py-6 space-y-5 pb-24">
        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider">
              当前季节
            </h2>
            <div className="flex gap-1">
              {SEASONS.filter((s) => s !== '四季').map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(selectedSeason === s ? null : s)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    (selectedSeason || currentSeason) === s
                      ? `${SEASON_COLORS[s]} ring-2 ring-offset-1 ring-lavender-300`
                      : 'bg-cream-50 text-charcoal-300 hover:bg-cream-100'
                  }`}
                  title={s}
                >
                  {getSeasonIcon(s, 'sm')}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl ${seasonColor} bg-opacity-30`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${seasonColor} flex items-center justify-center flex-shrink-0`}>
                {getSeasonIcon(displaySeason, 'lg')}
              </div>
              <div className="flex-1">
                <p className="text-xs text-charcoal-200">现在是</p>
                <p className="text-xl font-bold text-charcoal-500 mt-0.5">
                  {displaySeason}
                </p>
                <p className="text-xs text-charcoal-300 mt-1">
                  适合穿 {displaySeason} 季的衣物
                </p>
              </div>
            </div>
          </div>

          {!selectedSeason && (toStoreGarments.length > 0 || toRetrieveGarments.length > 0) && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-700">换季提醒</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {toStoreGarments.length > 0 && `有 ${toStoreGarments.length} 件换季衣物需要收纳`}
                  {toStoreGarments.length > 0 && toRetrieveGarments.length > 0 && '，'}
                  {toRetrieveGarments.length > 0 && `有 ${toRetrieveGarments.length} 件应季衣物可以取出`}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-soft p-4 border border-cream-200/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-200">已收纳</p>
                <p className="text-lg font-bold text-slate-600">{storedGarments.length}</p>
              </div>
            </div>
            <p className="text-[11px] text-charcoal-200">件衣物</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4 border border-cream-200/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Shirt className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-charcoal-200">可穿着</p>
                <p className="text-lg font-bold text-emerald-600">{wearableGarments.length}</p>
              </div>
            </div>
            <p className="text-[11px] text-charcoal-200">件衣物</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft border border-cream-200/60 overflow-hidden">
          <button
            onClick={() => toggleSection('toStore')}
            className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-charcoal-500">
                  需要收纳
                  {toStoreGarments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {toStoreGarments.length} 件
                    </span>
                  )}
                </h3>
                <p className="text-xs text-charcoal-200 mt-0.5">
                  上一季 {getNextSeason(displaySeason) === '春季' ? '冬季' : getNextSeason(displaySeason) === '夏季' ? '春季' : getNextSeason(displaySeason) === '秋季' ? '夏季' : '秋季'} 的衣物
                </p>
              </div>
            </div>
            {expandedSection === 'toStore' ? (
              <ChevronUp className="w-5 h-5 text-charcoal-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-charcoal-300" />
            )}
          </button>

          {expandedSection === 'toStore' && (
            <div className="px-4 pb-4 border-t border-cream-100">
              {toStoreGarments.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-cream-400" />
                  </div>
                  <p className="text-sm text-charcoal-300">所有换季衣物都已收纳好啦</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 pt-3">
                    {toStoreGarments.map((g) => (
                      <GarmentItem
                        key={g.id}
                        garment={g}
                        actionLabel="收纳"
                        actionVariant="store"
                        onAction={() => toggleStore(g.id, true)}
                      />
                    ))}
                  </div>
                  {toStoreGarments.length > 1 && (
                    <button
                      onClick={batchStore}
                      className="w-full mt-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-4 h-4" />
                      全部收纳
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-soft border border-cream-200/60 overflow-hidden">
          <button
            onClick={() => toggleSection('toRetrieve')}
            className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${nextSeasonColor} bg-opacity-30`}>
                <ArrowRight className="w-5 h-5 text-charcoal-500" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-charcoal-500">
                  可以取出
                  {toRetrieveGarments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
                      {toRetrieveGarments.length} 件
                    </span>
                  )}
                </h3>
                <p className="text-xs text-charcoal-200 mt-0.5">
                  本季和下一季可以穿的衣物
                </p>
              </div>
            </div>
            {expandedSection === 'toRetrieve' ? (
              <ChevronUp className="w-5 h-5 text-charcoal-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-charcoal-300" />
            )}
          </button>

          {expandedSection === 'toRetrieve' && (
            <div className="px-4 pb-4 border-t border-cream-100">
              {toRetrieveGarments.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-cream-400" />
                  </div>
                  <p className="text-sm text-charcoal-300">没有待取出的收纳衣物</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 pt-3">
                    {toRetrieveGarments.map((g) => (
                      <GarmentItem
                        key={g.id}
                        garment={g}
                        actionLabel="取出"
                        actionVariant="retrieve"
                        onAction={() => toggleStore(g.id, false)}
                      />
                    ))}
                  </div>
                  {toRetrieveGarments.length > 1 && (
                    <button
                      onClick={batchRetrieve}
                      className="w-full mt-3 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      全部取出
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-soft border border-cream-200/60 overflow-hidden">
          <button
            onClick={() => toggleSection('allStored')}
            className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-charcoal-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-charcoal-500">
                  全部收纳
                  {storedGarments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-400">
                      {storedGarments.length} 件
                    </span>
                  )}
                </h3>
                <p className="text-xs text-charcoal-200 mt-0.5">
                  查看所有已收纳的衣物及存放位置
                </p>
              </div>
            </div>
            {expandedSection === 'allStored' ? (
              <ChevronUp className="w-5 h-5 text-charcoal-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-charcoal-300" />
            )}
          </button>

          {expandedSection === 'allStored' && (
            <div className="px-4 pb-4 border-t border-cream-100">
              {storedGarments.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-cream-400" />
                  </div>
                  <p className="text-sm text-charcoal-300">还没有收纳的衣物</p>
                </div>
              ) : (
                <div className="space-y-2 pt-3">
                  {storedGarments.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-stretch gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {g.labelPhotos.length > 0 ? (
                          <img
                            src={g.labelPhotos[0]}
                            alt={g.name}
                            className="w-full h-full object-cover grayscale-[30%]"
                          />
                        ) : (
                          <Shirt className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-slate-700 truncate">
                              {g.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${SEASON_COLORS[g.season] || 'bg-gray-100 text-gray-700'}`}>
                                {g.season}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-200 text-slate-600">
                                收纳中
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleStore(g.id, false)}
                            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
                          >
                            <ArrowRight className="w-3 h-3" />
                            取出
                          </button>
                        </div>
                        {g.storageLocation ? (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{g.storageLocation}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/edit/${g.id}`)}
                            className="text-xs text-lavender-500 mt-1.5 hover:text-lavender-600"
                          >
                            + 添加存放位置
                          </button>
                        )}
                        {g.lastStorageDate && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            收纳于 {new Date(g.lastStorageDate).toLocaleDateString('zh-CN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
