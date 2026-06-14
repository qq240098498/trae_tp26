import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Search, Shirt, Check, Calendar, MapPin, DollarSign, Bell, AlertCircle } from 'lucide-react';
import { useGarmentStore } from '@/store/garmentStore';
import { useDryCleaningStore } from '@/store/dryCleaningStore';
import { GARMENT_TYPES, MATERIALS, GarmentType, Material, MATERIAL_COLORS, Garment, CareMethod } from '@/types/garment';
import CareMethodBadge from '@/components/CareMethodBadge';

export default function CreateDryCleaning() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { garments, load: loadGarments, search } = useGarmentStore();
  const { create, update, getById } = useDryCleaningStore();

  const isEditing = !!id;

  const [sendDate, setSendDate] = useState('');
  const [laundryShop, setLaundryShop] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [cost, setCost] = useState('');
  const [selectedGarmentIds, setSelectedGarmentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGarments();
  }, [loadGarments]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSendDate(today);
    const defaultPickup = new Date();
    defaultPickup.setDate(defaultPickup.getDate() + 3);
    setPickupDate(defaultPickup.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (isEditing) {
      const record = getById(id);
      if (record) {
        setSendDate(record.sendDate);
        setLaundryShop(record.laundryShop);
        setPickupDate(record.pickupDate);
        setCost(record.cost.toString());
        setSelectedGarmentIds(record.garmentIds);
        setReminderEnabled(record.reminderEnabled);
        setNotes(record.notes || '');
      }
    }
  }, [isEditing, id, getById]);

  const dryCleanOnlyGarments = useMemo(() => {
    return garments.filter((g) => g.careMethods.includes('干洗' as CareMethod));
  }, [garments]);

  const displayedGarments = useMemo(() => {
    let result = searchQuery.trim() ? search(searchQuery) : dryCleanOnlyGarments;
    if (selectedType) {
      result = result.filter((g) => g.type === selectedType);
    }
    if (selectedMaterial) {
      result = result.filter((g) => g.material === selectedMaterial);
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [dryCleanOnlyGarments, searchQuery, selectedType, selectedMaterial, search]);

  const selectedGarments = useMemo(() => {
    return selectedGarmentIds
      .map((gid) => garments.find((g) => g.id === gid))
      .filter((g): g is Garment => !!g);
  }, [selectedGarmentIds, garments]);

  const toggleGarment = (gid: string) => {
    setSelectedGarmentIds((prev) =>
      prev.includes(gid) ? prev.filter((id) => id !== gid) : [...prev, gid]
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
    if (!sendDate) newErrors.sendDate = '请选择送洗日期';
    if (!laundryShop.trim()) newErrors.laundryShop = '请输入洗衣店名称';
    if (!pickupDate) newErrors.pickupDate = '请选择预计取衣日期';
    if (sendDate && pickupDate && new Date(pickupDate) < new Date(sendDate)) {
      newErrors.pickupDate = '取衣日期不能早于送洗日期';
    }
    if (!cost || parseFloat(cost) < 0) newErrors.cost = '请输入有效的花费金额';
    if (selectedGarmentIds.length === 0) newErrors.garments = '请至少选择一件衣物';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      garmentIds: selectedGarmentIds,
      sendDate,
      laundryShop: laundryShop.trim(),
      pickupDate,
      cost: parseFloat(cost),
      reminderEnabled,
      notes: notes.trim() || undefined,
    };

    if (isEditing) {
      update(id, data);
    } else {
      create(data);
    }

    navigate('/dry-cleaning');
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
            {isEditing ? '编辑送洗记录' : '添加送洗记录'}
          </h1>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            {isEditing ? '保存' : '添加'}
          </button>
        </div>
      </header>

      <main className="container max-w-2xl py-6 space-y-5 pb-32">
        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            送洗信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                洗衣店 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
                <input
                  type="text"
                  value={laundryShop}
                  onChange={(e) => {
                    setLaundryShop(e.target.value);
                    if (errors.laundryShop) setErrors((prev) => ({ ...prev, laundryShop: '' }));
                  }}
                  placeholder="如：福奈特干洗店"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.laundryShop
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-cream-200 focus:ring-lavender-200 focus:border-lavender-300'
                  }`}
                />
              </div>
              {errors.laundryShop && (
                <p className="text-red-400 text-xs mt-1">{errors.laundryShop}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                  送洗日期 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
                  <input
                    type="date"
                    value={sendDate}
                    onChange={(e) => {
                      setSendDate(e.target.value);
                      if (errors.sendDate) setErrors((prev) => ({ ...prev, sendDate: '' }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-charcoal-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.sendDate
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-cream-200 focus:ring-lavender-200 focus:border-lavender-300'
                    }`}
                  />
                </div>
                {errors.sendDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.sendDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                  预计取衣 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lavender-400" />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => {
                      setPickupDate(e.target.value);
                      if (errors.pickupDate) setErrors((prev) => ({ ...prev, pickupDate: '' }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-charcoal-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.pickupDate
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-cream-200 focus:ring-lavender-200 focus:border-lavender-300'
                    }`}
                  />
                </div>
                {errors.pickupDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.pickupDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                花费（元） <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => {
                    setCost(e.target.value);
                    if (errors.cost) setErrors((prev) => ({ ...prev, cost: '' }));
                  }}
                  placeholder="如：89.00"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.cost
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-cream-200 focus:ring-lavender-200 focus:border-lavender-300'
                  }`}
                />
              </div>
              {errors.cost && (
                <p className="text-red-400 text-xs mt-1">{errors.cost}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-lavender-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-500">取衣提醒</p>
                  <p className="text-xs text-charcoal-200">预计取衣日提醒取衣服</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  reminderEnabled ? 'bg-lavender-400' : 'bg-cream-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                备注
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="特殊护理要求等..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all resize-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider">
              选择送洗衣物
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

          <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              以下是需要干洗或特殊护理的衣物。普通水洗衣物请使用「洗衣批次」功能。
            </p>
          </div>

          {dryCleanOnlyGarments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
                <Shirt className="w-7 h-7 text-cream-400" />
              </div>
              <p className="text-sm text-charcoal-300 mb-3 text-center">
                还没有需要干洗的衣物
              </p>
              <button
                onClick={() => navigate('/add')}
                className="text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors"
              >
                去添加需要干洗的衣物 →
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
                            ? 'bg-lavender-50 border-lavender-300 shadow-md'
                            : 'bg-white border-cream-100 hover:border-cream-200 hover:shadow-soft'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              isSelected
                                ? 'bg-lavender-500 border-lavender-500'
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
                                {garment.careMethods.slice(0, 3).map((m) => (
                                  <CareMethodBadge key={m} method={m} size="sm" />
                                ))}
                                {garment.careMethods.length > 3 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-cream-50 text-charcoal-300">
                                    +{garment.careMethods.length - 3}
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

        {selectedGarments.length > 0 && (
          <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
            <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
              已选衣物汇总
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedGarments.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-lavender-50 border border-lavender-200"
                >
                  {g.labelPhotos.length > 0 ? (
                    <img
                      src={g.labelPhotos[0]}
                      alt={g.name}
                      className="w-5 h-5 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-md bg-lavender-200 flex items-center justify-center">
                      <Shirt className="w-3 h-3 text-lavender-500" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-lavender-700 truncate max-w-[100px]">
                    {g.name}
                  </span>
                  <button
                    onClick={() => toggleGarment(g.id)}
                    className="w-4 h-4 rounded-full bg-lavender-200 text-lavender-500 flex items-center justify-center hover:bg-lavender-300 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
