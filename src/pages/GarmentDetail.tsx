import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Calendar, Tag, Shirt, X, MapPin, Package, Sun, Snowflake, Leaf, Flower2, Sparkles } from 'lucide-react';
import { useGarmentStore } from '@/store/garmentStore';
import { MATERIAL_COLORS, SEASON_COLORS, STORAGE_STATUS_COLORS, Garment, StorageStatus } from '@/types/garment';
import CareMethodBadge from '@/components/CareMethodBadge';

export default function GarmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById, remove, setStorageStatus } = useGarmentStore();
  const [garment, setGarment] = useState<Garment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  useEffect(() => {
    if (id) {
      const found = getById(id);
      if (found) {
        setGarment(found);
        setTempLocation(found.storageLocation || '');
      } else {
        navigate('/');
      }
    }
  }, [id, getById, navigate]);

  const handleDelete = () => {
    if (id) {
      remove(id);
      navigate('/');
    }
  };

  const toggleStorageStatus = () => {
    if (!garment) return;
    const newStatus: StorageStatus = garment.storageStatus === '当前可穿' ? '换季收纳' : '当前可穿';
    setStorageStatus(garment.id, newStatus);
    const updated = getById(garment.id);
    if (updated) setGarment(updated);
  };

  const saveLocation = () => {
    if (!garment) return;
    setStorageStatus(garment.id, garment.storageStatus, tempLocation.trim());
    const updated = getById(garment.id);
    if (updated) setGarment(updated);
    setShowLocationEdit(false);
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case '春季': return <Flower2 className="w-4 h-4" />;
      case '夏季': return <Sun className="w-4 h-4" />;
      case '秋季': return <Leaf className="w-4 h-4" />;
      case '冬季': return <Snowflake className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  if (!garment) return null;

  const materialColor = MATERIAL_COLORS[garment.material] || 'bg-gray-100 text-gray-700';
  const seasonColor = SEASON_COLORS[garment.season] || 'bg-gray-100 text-gray-700';
  const storageStatusColor = STORAGE_STATUS_COLORS[garment.storageStatus] || 'bg-gray-100 text-gray-700';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未填写';
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '未填写';
    return `¥${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-200/60">
        <div className="container max-w-2xl flex items-center justify-between py-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-charcoal-400" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-charcoal-500">
            衣物详情
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/edit/${garment.id}`)}
              className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center hover:bg-lavender-50 hover:border-lavender-200 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-lavender-500" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl py-6 space-y-5">
        <section className="bg-white rounded-2xl shadow-soft overflow-hidden border border-cream-200/60 animate-fade-in">
          {garment.labelPhotos.length > 0 && (
            <div className="h-48 sm:h-56 overflow-hidden">
              <img
                src={garment.labelPhotos[0]}
                alt={garment.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-5">
            <h2 className="font-serif text-2xl font-bold text-charcoal-500">
              {garment.name}
            </h2>
            {garment.brand && (
              <p className="text-charcoal-200 text-sm mt-1">{garment.brand}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-medium ${materialColor}`}>
                {garment.material}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-medium bg-cream-200 text-charcoal-300">
                {garment.type}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60 animate-slide-up">
          <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            季节与收纳
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cream-50 flex items-center justify-center flex-shrink-0">
                <span className={seasonColor}>{getSeasonIcon(garment.season)}</span>
              </div>
              <div>
                <p className="text-xs text-charcoal-200">适用季节</p>
                <p className="text-sm font-medium text-charcoal-500 mt-0.5">
                  {garment.season}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-medium ${seasonColor}`}>
              {garment.season}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cream-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-cream-400" />
              </div>
              <div>
                <p className="text-xs text-charcoal-200">收纳状态</p>
                <p className="text-sm font-medium text-charcoal-500 mt-0.5">
                  {garment.storageStatus}
                </p>
              </div>
            </div>
            <button
              onClick={toggleStorageStatus}
              className={`inline-flex items-center px-3 py-1.5 rounded-pill text-xs font-medium transition-all duration-200 ${storageStatusColor} hover:opacity-80`}
            >
              {garment.storageStatus === '当前可穿' ? '标记为收纳' : '标记为可穿'}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cream-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-cream-400" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-200">存放位置</p>
                  {!showLocationEdit && (
                    <p className="text-sm font-medium text-charcoal-500 mt-0.5">
                      {garment.storageLocation || '未设置'}
                    </p>
                  )}
                </div>
              </div>
              {!showLocationEdit && (
                <button
                  onClick={() => {
                    setTempLocation(garment.storageLocation || '');
                    setShowLocationEdit(true);
                  }}
                  className="text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors"
                >
                  编辑
                </button>
              )}
            </div>
            {showLocationEdit ? (
              <div className="flex gap-2 ml-11">
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="如：主卧衣柜顶层"
                  className="flex-1 px-3 py-2 rounded-lg border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all"
                  autoFocus
                />
                <button
                  onClick={saveLocation}
                  className="px-3 py-2 rounded-lg bg-lavender-400 text-white text-xs font-medium hover:bg-lavender-500 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowLocationEdit(false)}
                  className="px-3 py-2 rounded-lg border border-cream-200 text-xs font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
                >
                  取消
                </button>
              </div>
            ) : garment.storageLocation ? (
              <p className="text-xs text-charcoal-200 ml-11">
                {garment.storageLocation}
              </p>
            ) : null}
          </div>

          {(garment.lastStorageDate || garment.lastRetrievalDate) && (
            <div className="pt-3 border-t border-cream-100 space-y-2">
              {garment.lastStorageDate && (
                <div className="flex items-center gap-3 text-xs text-charcoal-200">
                  <span className="w-24 flex-shrink-0">上次收纳</span>
                  <span>{formatDate(garment.lastStorageDate)}</span>
                </div>
              )}
              {garment.lastRetrievalDate && (
                <div className="flex items-center gap-3 text-xs text-charcoal-200">
                  <span className="w-24 flex-shrink-0">上次取出</span>
                  <span>{formatDate(garment.lastRetrievalDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60 animate-slide-up">
          <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            洗护要求
          </h3>
          {garment.careMethods.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {garment.careMethods.map((method) => (
                <CareMethodBadge key={method} method={method} size="lg" />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-cream-50">
              <Shirt className="w-5 h-5 text-cream-400" />
              <p className="text-sm text-charcoal-200">暂未设置洗护要求</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60 animate-slide-up">
          <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            购买信息
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cream-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-cream-400" />
              </div>
              <div>
                <p className="text-xs text-charcoal-200">购买日期</p>
                <p className="text-sm font-medium text-charcoal-500 mt-0.5">
                  {formatDate(garment.purchaseDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cream-50 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-cream-400" />
              </div>
              <div>
                <p className="text-xs text-charcoal-200">购买价格</p>
                <p className="text-sm font-medium text-charcoal-500 mt-0.5">
                  {formatPrice(garment.purchasePrice)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {garment.labelPhotos.length > 0 && (
          <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60 animate-slide-up">
            <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
              洗护标签照片
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {garment.labelPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setEnlargedPhoto(photo)}
                  className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-cream-200 hover:border-lavender-300 transition-colors"
                >
                  <img
                    src={photo}
                    alt={`标签照片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-charcoal-200 mt-2">点击照片放大查看</p>
          </section>
        )}
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-500/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover p-6 mx-4 max-w-sm w-full animate-scale-in">
            <h3 className="font-serif text-lg font-semibold text-charcoal-500 mb-2">
              确认删除
            </h3>
            <p className="text-sm text-charcoal-300 mb-6">
              确定要删除「{garment.name}」吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors active:scale-[0.98]"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-500/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-lg w-full mx-4 animate-scale-in">
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center z-10 hover:bg-cream-50 transition-colors"
            >
              <X className="w-4 h-4 text-charcoal-400" />
            </button>
            <img
              src={enlargedPhoto}
              alt="洗护标签放大图"
              className="w-full rounded-2xl shadow-hover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
