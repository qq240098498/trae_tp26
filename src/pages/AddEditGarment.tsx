import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useGarmentStore } from '@/store/garmentStore';
import { GARMENT_TYPES, MATERIALS, CARE_METHODS, GarmentType, Material, CareMethod } from '@/types/garment';
import PhotoUploader from '@/components/PhotoUploader';
import CareMethodBadge from '@/components/CareMethodBadge';

export default function AddEditGarment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { add, update, getById } = useGarmentStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<GarmentType>('衣服');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState<Material>('棉');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [careMethods, setCareMethods] = useState<CareMethod[]>([]);
  const [labelPhotos, setLabelPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const garment = getById(id);
      if (garment) {
        setName(garment.name);
        setType(garment.type);
        setBrand(garment.brand);
        setMaterial(garment.material);
        setPurchaseDate(garment.purchaseDate);
        setPurchasePrice(garment.purchasePrice.toString());
        setCareMethods(garment.careMethods);
        setLabelPhotos(garment.labelPhotos);
      } else {
        navigate('/');
      }
    }
  }, [isEdit, id, getById, navigate]);

  const toggleCareMethod = (method: CareMethod) => {
    setCareMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = '请输入衣物名称';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const data = {
      name: name.trim(),
      type,
      brand: brand.trim(),
      material,
      purchaseDate,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
      careMethods,
      labelPhotos,
    };

    if (isEdit && id) {
      update(id, data);
    } else {
      add(data);
    }

    navigate(-1);
  };

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
            {isEdit ? '编辑衣物' : '添加衣物'}
          </h1>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            保存
          </button>
        </div>
      </header>

      <main className="container max-w-2xl py-6 space-y-6">
        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            基本信息
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                衣物名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="如：黑色羊绒大衣"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-cream-200 focus:ring-lavender-200 focus:border-lavender-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                  衣物类型
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as GarmentType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all appearance-none bg-white"
                >
                  {GARMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                  材质
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as Material)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all appearance-none bg-white"
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                品牌
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="如：Uniqlo"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                  购买日期
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-400 mb-1.5">
                  购买价格
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-charcoal-200">
                    ¥
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            洗护方式
          </h2>
          <p className="text-xs text-charcoal-200 mb-3">
            点击选择适用的洗护方式（可多选）
          </p>
          <div className="flex flex-wrap gap-2">
            {CARE_METHODS.map((method) => {
              const isSelected = careMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => toggleCareMethod(method)}
                  className={`transition-all duration-200 active:scale-95 ${
                    isSelected ? '' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <CareMethodBadge
                    method={method}
                    size={isSelected ? 'md' : 'sm'}
                  />
                </button>
              );
            })}
          </div>
          {careMethods.length > 0 && (
            <div className="mt-3 pt-3 border-t border-cream-100">
              <p className="text-xs text-charcoal-200">
                已选择 {careMethods.length} 项洗护要求
              </p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h2 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            洗护标签照片
          </h2>
          <PhotoUploader photos={labelPhotos} onChange={setLabelPhotos} />
        </section>

        <div className="flex gap-3 pt-2 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-cream-200 text-sm font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '添加衣物'}
          </button>
        </div>
      </main>
    </div>
  );
}
