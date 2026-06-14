import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Star, Calendar, MapPin, DollarSign, Shirt } from 'lucide-react';
import { useDryCleaningStore } from '@/store/dryCleaningStore';
import { useGarmentStore } from '@/store/garmentStore';

export default function RateDryCleaning() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getById, addRating, load: loadRecords } = useDryCleaningStore();
  const { garments, load: loadGarments } = useGarmentStore();

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverScore, setHoverScore] = useState(0);

  useEffect(() => {
    loadRecords();
    loadGarments();
  }, [loadRecords, loadGarments]);

  const record = id ? getById(id) : undefined;

  useEffect(() => {
    if (record?.rating) {
      setScore(record.rating.score);
      setComment(record.rating.comment || '');
    }
  }, [record]);

  if (!record) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-charcoal-300">记录不存在</p>
      </div>
    );
  }

  const recordGarments = record.garmentIds
    .map((gid) => garments.find((g) => g.id === gid))
    .filter(Boolean)
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
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

  const handleSubmit = () => {
    if (!id) return;
    addRating(id, {
      score,
      comment: comment.trim(),
    });
    navigate('/dry-cleaning');
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
            评价洗衣店
          </h1>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            保存
          </button>
        </div>
      </header>

      <main className="container max-w-2xl py-6 space-y-5 pb-24">
        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-lavender-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-lavender-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-charcoal-500 text-lg">
                {record.laundryShop}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-charcoal-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>送洗 {formatDate(record.sendDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>花费 ¥{record.cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {recordGarments.length > 0 && (
            <div className="pt-3 border-t border-cream-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Shirt className="w-3.5 h-3.5 text-cream-400" />
                <span className="text-xs text-charcoal-300">送洗衣物</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recordGarments.map((g) =>
                  g ? (
                    <div
                      key={g.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cream-50 border border-cream-200"
                    >
                      {g.labelPhotos.length > 0 ? (
                        <img
                          src={g.labelPhotos[0]}
                          alt={g.name}
                          className="w-5 h-5 rounded object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded bg-cream-200 flex items-center justify-center">
                          <Shirt className="w-3 h-3 text-cream-400" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-charcoal-400 truncate max-w-[80px]">
                        {g.name}
                      </span>
                    </div>
                  ) : null
                )}
                {record.garmentIds.length > 5 && (
                  <span className="text-xs text-charcoal-300 px-2 py-1">
                    +{record.garmentIds.length - 5} 件
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
            服务评分
          </h3>
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => {
                const active = (hoverScore || score) >= s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScore(s)}
                    onMouseEnter={() => setHoverScore(s)}
                    onMouseLeave={() => setHoverScore(0)}
                    className="p-1 transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-150 ${
                        active
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-cream-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-charcoal-300">
              {score === 1 && '很差'}
              {score === 2 && '较差'}
              {score === 3 && '一般'}
              {score === 4 && '满意'}
              {score === 5 && '非常满意'}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-soft p-5 border border-cream-200/60">
          <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
            评价内容
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="洗得干净吗？服务态度如何？有什么想分享的..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-cream-200 text-sm text-charcoal-500 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-300 transition-all resize-none"
          />
          <p className="text-xs text-charcoal-200 mt-2 text-right">
            {comment.length}/200
          </p>
        </section>

        <section className="bg-cream-50 rounded-2xl p-4 border border-cream-200">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => { setScore(5); setComment('洗得很干净，服务很好，下次还会再来！'); }}
              className="p-3 rounded-xl bg-white border border-cream-200 text-xs text-charcoal-400 hover:border-lavender-300 hover:bg-lavender-50 transition-colors"
            >
              ⭐⭐⭐⭐⭐ 非常满意
            </button>
            <button
              onClick={() => { setScore(4); setComment('整体还不错，比较满意。'); }}
              className="p-3 rounded-xl bg-white border border-cream-200 text-xs text-charcoal-400 hover:border-lavender-300 hover:bg-lavender-50 transition-colors"
            >
              ⭐⭐⭐⭐ 比较满意
            </button>
            <button
              onClick={() => { setScore(3); setComment('一般般，中规中矩。'); }}
              className="p-3 rounded-xl bg-white border border-cream-200 text-xs text-charcoal-400 hover:border-lavender-300 hover:bg-lavender-50 transition-colors"
            >
              ⭐⭐⭐ 一般
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
