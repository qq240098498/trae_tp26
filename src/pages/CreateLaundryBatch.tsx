import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Check, Search, Shirt, AlertTriangle, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useGarmentStore } from '@/store/garmentStore';
import { useLaundryBatchStore } from '@/store/laundryBatchStore';
import { GARMENT_TYPES, MATERIALS, GarmentType, Material, MATERIAL_COLORS, Garment } from '@/types/garment';
import { checkCompatibility, getConflictSummary } from '@/utils/laundryCompatibility';
import CareMethodBadge from '@/components/CareMethodBadge';

export default function CreateLaundryBatch() {
  const navigate = useNavigate();
  const { garments, load: loadGarments, search } = useGarmentStore();
  const { create } = useLaundryBatchStore();

  const [batchName, setBatchName] = useState('');
  const [selectedGarmentIds, setSelectedGarmentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showConflictsDetail, setShowConflictsDetail] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGarments();
  }, [loadGarments]);

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setBatchName(`洗衣批次 · ${dateStr} ${timeStr}`);
  }, []);

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

  const selectedGarments = useMemo(() => {
    return selectedGarmentIds
      .map((id) => garments.find((g) => g.id === id))
      .filter((g): g is Garment => !!g);
  }, [selectedGarmentIds, garments]);

  const compatibility = useMemo(() => {
    return checkCompatibility(selectedGarments);
  }, [selectedGarments]);

  const conflictTypes = useMemo(() => {
    return getConflictSummary(compatibility.conflicts);
  }, [compatibility.conflicts]);

  const toggleGarment = (id: string) => {
    setSelectedGarmentIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const toggleAllFiltered = () => {
    const filteredIds = displayedGarments.map((g) => g.id);
    const allSelected = filteredIds.every((id) => selectedGarmentIds.includes(id));
    if (allSelected) {
      setSelectedGarmentIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedGarmentIds((prev) => {
        const set = new Set(prev);
        filteredIds.forEach((id) => set.add(id));
        return Array.from(set);
      });
    }
  };

  const clearSelection = () => {
    setSelectedGarmentIds([]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!batchName.trim()) newErrors.batchName = '请输入批次名称';
    if (selectedGarmentIds.length === 0) newErrors.garments = '请至少选择一件衣物';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    create({
      name: batchName.trim(),
      garmentIds: selectedGarmentIds,
    });
    navigate('/laundry');
  };

  const getGarmentConflictInfo = (garmentId: string) => {
    return compatibility.conflicts.filter(
      (c) => c.garmentIds.includes(garmentId)
    );
  };

  const allFilteredSelected =
    displayedGarments.length > 0 &&
    displayedGarments.every((g) => selectedGarmentIds.includes(g.id));

  const hasFilters = selectedType || selectedMaterial || searchQuery.trim();

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
            创建洗衣批次
          </h1>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            创建
          </button>
        </div>
      </header>

      <main className="container max-w-2xl py-6 space-y-5 pb-32">
        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            批次信息
          </h2>
          <div>
            <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
              批次名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => {
                setBatchName(e.target.value);
                if (errors.batchName) setErrors((prev) => ({ ...prev, batchName: '' }));
              }}
              placeholder="如：周六机洗批次"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 transition-all ${
                errors.batchName
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-cream-200 focus:ring-lavender-200 focus:border-lavender-300'
              }`}
            />
            {errors.batchName && (
              <p className="text-red-400 text-xs mt-1">{errors.batchName}</p>
            )}
          </div>
        </section>

        {selectedGarments.length > 0 && (
          <section
            className={`rounded-2xl shadow-soft p-5 border ${
              compatibility.isCompatible
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-red-50/40 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {compatibility.isCompatible ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                )}
                <div>
                  <h3
                    className={`font-semibold ${
                      compatibility.isCompatible
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {compatibility.isCompatible
                      ? '洗护要求兼容，可以同洗'
                      : '检测到洗护冲突，建议分开洗'}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      compatibility.isCompatible
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    已选择 {selectedGarments.length} 件衣物
                    {!compatibility.isCompatible &&
                      ` · 存在 ${compatibility.conflicts.length} 处冲突（${conflictTypes.join('、')}）`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConflictsDetail((v) => !v)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  compatibility.isCompatible
                    ? 'text-emerald-600 hover:bg-emerald-100'
                    : 'text-red-500 hover:bg-red-100'
                } transition-colors`}
              >
                {showConflictsDetail ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {showConflictsDetail && (
              <div className="space-y-3 pt-3 border-t border-white/60">
                {compatibility.isCompatible ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm text-emerald-700">
                      所有衣物洗护要求一致，放心一起洗吧
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-2">
                        冲突详情：
                      </p>
                      <div className="space-y-2">
                        {compatibility.conflicts.map((c, i) => (
                          <div
                            key={i}
                            className="bg-white/70 rounded-xl p-3 border border-red-100"
                          >
                            <div className="flex items-start gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium bg-red-100 text-red-600 flex-shrink-0">
                                {c.type}
                              </span>
                            </div>
                            <p className="text-sm text-charcoal-400 mt-1.5">
                              {c.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {c.conflictingMethods.map((m, mi) => (
                                <CareMethodBadge key={mi} method={m} size="sm" />
                              ))}
                            </div>
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              建议：{c.suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {compatibility.groups.length > 1 && (
                      <div>
                        <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          智能分组建议（可同时创建多个批次）：
                        </p>
                        <div className="space-y-2">
                          {compatibility.groups.map((group, gi) => (
                            <div
                              key={gi}
                              className="bg-white/70 rounded-xl p-3 border border-amber-100"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-lavender-400 text-white text-xs font-medium flex items-center justify-center">
                                  {gi + 1}
                                </span>
                                <span className="text-sm font-medium text-charcoal-500">
                                  第 {gi + 1} 批（{group.length} 件）
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pl-8">
                                {group.map((g) => (
                                  <span
                                    key={g.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded-lg bg-cream-50 border border-cream-200 text-xs text-charcoal-400"
                                  >
                                    {g.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider">
              选择衣物
              {selectedGarmentIds.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-pill text-xs font-medium bg-lavender-100 text-lavender-600 normal-case">
                  已选 {selectedGarmentIds.length}
                </span>
              )}
              {errors.garments && (
                <span className="ml-2 text-xs text-red-400 normal-case">
                  {errors.garments}
                </span>
              )}
            </h2>
            {selectedGarmentIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-charcoal-300 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                清空
              </button>
            )}
          </div>

          {garments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
                <Shirt className="w-7 h-7 text-cream-400" />
              </div>
              <p className="text-sm text-charcoal-300 mb-3 text-center">
                还没有添加衣物
              </p>
              <button
                onClick={() => navigate('/add')}
                className="text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors"
              >
                去添加第一件衣物 →
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
                  <input
                    type="text"
                    placeholder="搜索衣物名称、品牌、材质..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all"
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

                <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
                  <button
                    onClick={() => setSelectedType(null)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                      !selectedType
                        ? 'bg-charcoal-500 text-white'
                        : 'bg-cream-50 text-charcoal-300 border border-cream-200 hover:border-cream-300'
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
                      className={`flex-shrink-0 px-2.5 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                        selectedType === type
                          ? 'bg-lavender-400 text-white'
                          : 'bg-cream-50 text-charcoal-300 border border-cream-200 hover:border-cream-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                      !selectedMaterial
                        ? 'bg-charcoal-500 text-white'
                        : 'bg-cream-50 text-charcoal-300 border border-cream-200 hover:border-cream-300'
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
                      className={`flex-shrink-0 px-2.5 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                        selectedMaterial === mat
                          ? 'bg-lavender-400 text-white'
                          : 'bg-cream-50 text-charcoal-300 border border-cream-200 hover:border-cream-300'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>

                {displayedGarments.length > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={toggleAllFiltered}
                      className="inline-flex items-center gap-1.5 text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors"
                    >
                      {allFilteredSelected ? (
                        <>
                          <Check className="w-3 h-3" />
                          取消全选
                        </>
                      ) : (
                        <>全选当前 {displayedGarments.length} 件</>
                      )}
                    </button>
                    {hasFilters && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedType(null);
                          setSelectedMaterial(null);
                        }}
                        className="text-xs text-charcoal-300 hover:text-charcoal-500 transition-colors"
                      >
                        清除筛选
                      </button>
                    )}
                  </div>
                )}
              </div>

              {displayedGarments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-cream-100 flex items-center justify-center mb-3">
                    <Search className="w-5 h-5 text-cream-400" />
                  </div>
                  <p className="text-sm text-charcoal-300">
                    没有找到匹配的衣物
                  </p>
                </div>
              ) : (
                <div className="space-y-2 -mx-1">
                  {displayedGarments.map((garment) => {
                    const isSelected = selectedGarmentIds.includes(garment.id);
                    const garmentConflicts = getGarmentConflictInfo(garment.id);
                    const hasConflict = garmentConflicts.length > 0 && isSelected;
                    const materialColor =
                      MATERIAL_COLORS[garment.material] ||
                      'bg-gray-100 text-gray-700';

                    return (
                      <button
                        key={garment.id}
                        type="button"
                        onClick={() => toggleGarment(garment.id)}
                        className={`w-full text-left p-3 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected
                            ? hasConflict
                              ? 'bg-red-50 border-red-300 shadow-md'
                              : 'bg-lavender-50 border-lavender-300 shadow-md'
                            : 'bg-white border-cream-100 hover:border-cream-200 hover:shadow-soft'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isSelected
                                ? hasConflict
                                  ? 'bg-red-500 border-red-500'
                                  : 'bg-lavender-500 border-lavender-500'
                                : 'border-cream-300'
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>

                          <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-cream-100">
                            {garment.labelPhotos.length > 0 ? (
                              <img
                                src={garment.labelPhotos[0]}
                                alt={garment.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Shirt className="w-5 h-5 text-cream-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3
                                  className={`font-medium text-sm truncate ${
                                    isSelected ? 'text-charcoal-500' : 'text-charcoal-400'
                                  }`}
                                >
                                  {garment.name}
                                </h3>
                                {garment.brand && (
                                  <p className="text-xs text-charcoal-200 truncate mt-0.5">
                                    {garment.brand}
                                  </p>
                                )}
                              </div>
                              {hasConflict && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-600 flex-shrink-0">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  冲突
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium ${materialColor}`}
                              >
                                {garment.material}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-cream-100 text-charcoal-300">
                                {garment.type}
                              </span>
                            </div>

                            {garment.careMethods.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {garment.careMethods.slice(0, 2).map((m) => (
                                  <CareMethodBadge key={m} method={m} size="sm" />
                                ))}
                                {garment.careMethods.length > 2 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-cream-100 text-charcoal-300">
                                    +{garment.careMethods.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        <div className="flex gap-3 pt-2 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-cream-200 text-sm font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            创建洗衣批次
          </button>
        </div>
      </main>

      {selectedGarments.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-xl border-t border-cream-200/60 pb-[env(safe-area-inset-bottom)]">
          <div className="container max-w-2xl py-3 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {compatibility.isCompatible ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      compatibility.isCompatible
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    {compatibility.isCompatible
                      ? '兼容 · 可同洗'
                      : `${compatibility.conflicts.length} 处冲突 · 建议分开洗`}
                  </p>
                  <p className="text-xs text-charcoal-200 truncate">
                    已选 {selectedGarments.length} 件
                    {!compatibility.isCompatible &&
                      compatibility.groups.length > 1 &&
                      ` · 建议分 ${compatibility.groups.length} 批`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-95 shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
