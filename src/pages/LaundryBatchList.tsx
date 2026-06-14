import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Shirt, CheckCircle, Clock, XCircle, Trash2, Sparkles, WashingMachine } from 'lucide-react';
import { useLaundryBatchStore } from '@/store/laundryBatchStore';
import { useGarmentStore } from '@/store/garmentStore';
import { LaundryStatus, LAUNDRY_STATUSES, LaundryBatch } from '@/types/garment';
import { checkCompatibility } from '@/utils/laundryCompatibility';

const STATUS_CONFIG: Record<LaundryStatus, { icon: React.ReactNode; dotClass: string; textClass: string; bgClass: string }> = {
  待洗: {
    icon: <Clock className="w-3.5 h-3.5" />,
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  已完成: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  已取消: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    dotClass: 'bg-charcoal-300',
    textClass: 'text-charcoal-400',
    bgClass: 'bg-cream-100 border-cream-200',
  },
};

export default function LaundryBatchList() {
  const navigate = useNavigate();
  const { batches, load: loadBatches, remove, updateStatus } = useLaundryBatchStore();
  const { garments, load: loadGarments } = useGarmentStore();
  const [selectedStatus, setSelectedStatus] = useState<LaundryStatus | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadBatches();
    loadGarments();
  }, [loadBatches, loadGarments]);

  const displayedBatches = useMemo(() => {
    let result = batches;
    if (selectedStatus) {
      result = result.filter((b) => b.status === selectedStatus);
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [batches, selectedStatus]);

  const getBatchGarments = (batch: LaundryBatch) => {
    return batch.garmentIds
      .map((id) => garments.find((g) => g.id === id))
      .filter(Boolean)
      .slice(0, 4);
  };

  const getBatchConflictInfo = (batch: LaundryBatch) => {
    const batchGarments = batch.garmentIds
      .map((id) => garments.find((g) => g.id === id))
      .filter(Boolean);
    return checkCompatibility(batchGarments);
  };

  const handleDelete = (id: string) => {
    remove(id);
    setBatchToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const pendingCount = batches.filter((b) => b.status === '待洗').length;

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-200/60">
        <div className="container max-w-3xl">
          <div className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center hover:bg-cream-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-charcoal-400" />
                </button>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-500 tracking-tight">
                    洗衣批次管理
                  </h1>
                  <p className="text-charcoal-200 text-sm mt-0.5">
                    {batches.length > 0
                      ? `${pendingCount > 0 ? `待洗 ${pendingCount} 批` : '暂无待洗批次'} · 共 ${batches.length} 批`
                      : '创建洗衣批次，智能检查兼容性'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/laundry/create')}
                className="w-10 h-10 rounded-full bg-lavender-400 text-white flex items-center justify-center shadow-md hover:bg-lavender-500 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {batches.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 pt-2">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className={`flex-shrink-0 px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                    !selectedStatus
                      ? 'bg-charcoal-500 text-white'
                      : 'bg-white text-charcoal-300 border border-cream-200 hover:border-cream-300'
                  }`}
                >
                  全部
                </button>
                {LAUNDRY_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setSelectedStatus(selectedStatus === status ? null : status)
                    }
                    className={`flex-shrink-0 px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                      selectedStatus === status
                        ? 'bg-lavender-400 text-white'
                        : 'bg-white text-charcoal-300 border border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-4 pb-24">
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-lavender-50 flex items-center justify-center mb-6">
              <WashingMachine className="w-10 h-10 text-lavender-300" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-500 mb-2">
              开始洗衣管理
            </h2>
            <p className="text-charcoal-200 text-sm text-center max-w-xs mb-8">
              创建洗衣批次，勾选要洗的衣物，系统自动检查洗护要求是否兼容
            </p>
            <button
              onClick={() => navigate('/laundry/create')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-lavender-400 text-white font-medium shadow-md hover:bg-lavender-500 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              创建洗衣批次
            </button>
          </div>
        ) : displayedBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-cream-400" />
            </div>
            <p className="text-charcoal-300 text-sm">该状态下暂无洗衣批次</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedBatches.map((batch, i) => {
              const batchGarments = getBatchGarments(batch);
              const compat = getBatchConflictInfo(batch);
              const statusConfig = STATUS_CONFIG[batch.status];
              return (
                <div
                  key={batch.id}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="bg-white rounded-2xl shadow-soft border border-cream-200/60 overflow-hidden animate-fade-in hover:shadow-hover transition-all duration-300"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-charcoal-500 text-base truncate">
                            {batch.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium border ${statusConfig.bgClass} ${statusConfig.textClass}`}
                          >
                            {statusConfig.icon}
                            {batch.status}
                          </span>
                          <span className="text-xs text-charcoal-200">
                            {formatDate(batch.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {batch.status === '待洗' && (
                          <button
                            onClick={() => updateStatus(batch.id, '已完成')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="标记完成"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {batch.status === '待洗' && (
                          <button
                            onClick={() => updateStatus(batch.id, '已取消')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-300 hover:bg-cream-100 transition-colors"
                            title="取消批次"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setBatchToDelete(batch.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                          title="删除批次"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Shirt className="w-4 h-4 text-cream-400" />
                        <span className="text-charcoal-300">
                          {batch.garmentIds.length} 件衣物
                        </span>
                      </div>
                      {!compat.isCompatible && batch.status === '待洗' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          {compat.conflicts.length} 处冲突，请分开洗
                        </span>
                      )}
                      {compat.isCompatible && batch.status === '待洗' && batch.garmentIds.length > 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          可同洗
                        </span>
                      )}
                    </div>

                    {batchGarments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {batchGarments.map((g) =>
                          g ? (
                            <div
                              key={g.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-cream-50 border border-cream-200"
                            >
                              {g.labelPhotos.length > 0 ? (
                                <img
                                  src={g.labelPhotos[0]}
                                  alt={g.name}
                                  className="w-6 h-6 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-cream-200 flex items-center justify-center">
                                  <Shirt className="w-3 h-3 text-cream-400" />
                                </div>
                              )}
                              <span className="text-xs font-medium text-charcoal-400 truncate max-w-[80px]">
                                {g.name}
                              </span>
                            </div>
                          ) : null
                        )}
                        {batch.garmentIds.length > 4 && (
                          <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-cream-50 border border-cream-200">
                            <span className="text-xs font-medium text-charcoal-300">
                              +{batch.garmentIds.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {!compat.isCompatible && batch.status === '待洗' && (
                      <div className="mt-3 pt-3 border-t border-cream-100">
                        <div className="flex flex-wrap gap-1.5">
                          {compat.groups.slice(0, 3).map((group, gi) => (
                            <div
                              key={gi}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200"
                            >
                              <span className="text-xs font-medium text-amber-700">
                                第{gi + 1}批：
                              </span>
                              <span className="text-xs text-amber-600">
                                {group.map((g) => g.name).join('、')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {batches.length > 0 && (
        <div className="fixed bottom-6 right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20">
          <button
            onClick={() => navigate('/laundry/create')}
            className="w-14 h-14 rounded-full bg-lavender-400 text-white flex items-center justify-center shadow-lg hover:bg-lavender-500 hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <WashingMachine className="w-6 h-6" />
          </button>
        </div>
      )}

      {batchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-500/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover p-6 mx-4 max-w-sm w-full animate-scale-in">
            <h3 className="font-serif text-lg font-semibold text-charcoal-500 mb-2">
              确认删除
            </h3>
            <p className="text-sm text-charcoal-300 mb-6">
              确定要删除这个洗衣批次吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBatchToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(batchToDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors active:scale-[0.98]"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
