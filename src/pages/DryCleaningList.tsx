import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Shirt, CheckCircle, Clock, XCircle, Trash2, Sparkles, Droplets, Star, Bell, Calendar, MapPin, DollarSign, Pencil } from 'lucide-react';
import { useDryCleaningStore } from '@/store/dryCleaningStore';
import { useGarmentStore } from '@/store/garmentStore';
import { DryCleaningStatus, DRY_CLEANING_STATUSES, DryCleaningRecord } from '@/types/garment';

const STATUS_CONFIG: Record<DryCleaningStatus, { icon: React.ReactNode; dotClass: string; textClass: string; bgClass: string }> = {
  送洗中: {
    icon: <Clock className="w-3.5 h-3.5" />,
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  已取回: {
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

export default function DryCleaningList() {
  const navigate = useNavigate();
  const { records, load: loadRecords, remove, updateStatus, getPendingReminders, markReminderShown } = useDryCleaningStore();
  const { garments, load: loadGarments } = useGarmentStore();
  const [selectedStatus, setSelectedStatus] = useState<DryCleaningStatus | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [pendingReminders, setPendingReminders] = useState<DryCleaningRecord[]>([]);

  useEffect(() => {
    loadRecords();
    loadGarments();
  }, [loadRecords, loadGarments]);

  useEffect(() => {
    const reminders = getPendingReminders();
    if (reminders.length > 0) {
      setPendingReminders(reminders);
      setShowReminder(true);
    }
  }, [records, getPendingReminders]);

  const displayedRecords = useMemo(() => {
    let result = records;
    if (selectedStatus) {
      result = result.filter((r) => r.status === selectedStatus);
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [records, selectedStatus]);

  const getRecordGarments = (record: DryCleaningRecord) => {
    return record.garmentIds
      .map((id) => garments.find((g) => g.id === id))
      .filter(Boolean)
      .slice(0, 4);
  };

  const handleDelete = (id: string) => {
    remove(id);
    setRecordToDelete(null);
  };

  const handleDismissReminder = (recordId: string) => {
    markReminderShown(recordId);
    const updated = pendingReminders.filter((r) => r.id !== recordId);
    setPendingReminders(updated);
    if (updated.length === 0) {
      setShowReminder(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr: string) => {
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

  const isOverdue = (pickupDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(pickupDate) < today;
  };

  const isToday = (pickupDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return pickupDate === today;
  };

  const renderStars = (score: number, size = 'w-3.5 h-3.5') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${size} ${s <= score ? 'text-amber-400 fill-amber-400' : 'text-cream-300'}`}
          />
        ))}
      </div>
    );
  };

  const pendingCount = records.filter((r) => r.status === '送洗中').length;
  const overdueCount = records.filter((r) => r.status === '送洗中' && isOverdue(r.pickupDate)).length;

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
                    送洗记录
                  </h1>
                  <p className="text-charcoal-200 text-sm mt-0.5">
                    {records.length > 0
                      ? `${pendingCount > 0 ? `送洗中 ${pendingCount} 件` : '暂无进行中的送洗'} · 共 ${records.length} 条记录`
                      : '记录干洗和特殊护理衣物'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dry-cleaning/create')}
                className="w-10 h-10 rounded-full bg-lavender-400 text-white flex items-center justify-center shadow-md hover:bg-lavender-500 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {overdueCount > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  有 <span className="font-semibold">{overdueCount}</span> 件衣物已超过预计取衣日期，请尽快取回
                </p>
              </div>
            )}

            {records.length > 0 && (
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
                {DRY_CLEANING_STATUSES.map((status) => (
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
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-lavender-50 flex items-center justify-center mb-6">
              <Droplets className="w-10 h-10 text-lavender-300" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-500 mb-2">
              开始记录送洗
            </h2>
            <p className="text-charcoal-200 text-sm text-center max-w-xs mb-8">
              记录需要干洗或特殊护理的衣物，设置取衣提醒，评价洗衣店服务
            </p>
            <button
              onClick={() => navigate('/dry-cleaning/create')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-lavender-400 text-white font-medium shadow-md hover:bg-lavender-500 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              添加送洗记录
            </button>
          </div>
        ) : displayedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-cream-400" />
            </div>
            <p className="text-charcoal-300 text-sm">该状态下暂无送洗记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedRecords.map((record, i) => {
              const recordGarments = getRecordGarments(record);
              const statusConfig = STATUS_CONFIG[record.status];
              const overdue = record.status === '送洗中' && isOverdue(record.pickupDate);
              const todayPickup = record.status === '送洗中' && isToday(record.pickupDate);

              return (
                <div
                  key={record.id}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={`bg-white rounded-2xl shadow-soft border overflow-hidden animate-fade-in hover:shadow-hover transition-all duration-300 ${
                    overdue ? 'border-red-200' : todayPickup ? 'border-amber-200' : 'border-cream-200/60'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-charcoal-500 text-base truncate">
                            {record.laundryShop}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium border ${statusConfig.bgClass} ${statusConfig.textClass}`}
                          >
                            {statusConfig.icon}
                            {record.status}
                          </span>
                          {overdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                              <Bell className="w-3 h-3" />
                              已逾期
                            </span>
                          )}
                          {todayPickup && !overdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                              <Bell className="w-3 h-3" />
                              今日可取
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {record.status === '送洗中' && (
                          <button
                            onClick={() => updateStatus(record.id, '已取回')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="标记已取回"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {record.status === '送洗中' && (
                          <button
                            onClick={() => updateStatus(record.id, '已取消')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-300 hover:bg-cream-100 transition-colors"
                            title="取消"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/dry-cleaning/edit/${record.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-300 hover:bg-cream-100 transition-colors"
                          title="编辑记录"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(record.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                          title="删除记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-cream-400 flex-shrink-0" />
                        <div>
                          <p className="text-charcoal-200 text-xs">送洗日期</p>
                          <p className="text-charcoal-400 font-medium">{formatDate(record.sendDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-lavender-400 flex-shrink-0" />
                        <div>
                          <p className="text-charcoal-200 text-xs">取衣日期</p>
                          <p className={`font-medium ${overdue ? 'text-red-500' : todayPickup ? 'text-amber-500' : 'text-charcoal-400'}`}>
                            {formatDate(record.pickupDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-cream-400 flex-shrink-0" />
                        <div>
                          <p className="text-charcoal-200 text-xs">花费</p>
                          <p className="text-charcoal-400 font-medium">¥{record.cost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-cream-400 flex-shrink-0" />
                        <div>
                          <p className="text-charcoal-200 text-xs">洗衣店</p>
                          <p className="text-charcoal-400 font-medium truncate">{record.laundryShop}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm mb-3">
                      <Shirt className="w-4 h-4 text-cream-400" />
                      <span className="text-charcoal-300">
                        {record.garmentIds.length} 件衣物
                      </span>
                    </div>

                    {recordGarments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {recordGarments.map((g) =>
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
                        {record.garmentIds.length > 4 && (
                          <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-cream-50 border border-cream-200">
                            <span className="text-xs font-medium text-charcoal-300">
                              +{record.garmentIds.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {record.rating && (
                      <div className="mt-3 pt-3 border-t border-cream-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-charcoal-200">评价：</span>
                          {renderStars(record.rating.score)}
                          {record.rating.comment && (
                            <span className="text-xs text-charcoal-300 ml-2">
                              {record.rating.comment}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {record.status === '已取回' && !record.rating && (
                      <div className="mt-3 pt-3 border-t border-cream-100">
                        <button
                          onClick={() => navigate(`/dry-cleaning/rate/${record.id}`)}
                          className="text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          评价洗衣店
                        </button>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mt-3 pt-3 border-t border-cream-100">
                        <p className="text-xs text-charcoal-200 mb-1">备注</p>
                        <p className="text-sm text-charcoal-400">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {records.length > 0 && (
        <div className="fixed bottom-6 right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20">
          <button
            onClick={() => navigate('/dry-cleaning/create')}
            className="w-14 h-14 rounded-full bg-lavender-400 text-white flex items-center justify-center shadow-lg hover:bg-lavender-500 hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <Droplets className="w-6 h-6" />
          </button>
        </div>
      )}

      {showReminder && pendingReminders.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-500/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover p-6 mx-4 max-w-sm w-full animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-charcoal-500">
                  取衣提醒
                </h3>
                <p className="text-sm text-charcoal-300">
                  {pendingReminders.length} 件衣物可以取回了
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {pendingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 rounded-xl bg-cream-50 border border-cream-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal-500 text-sm">
                        {reminder.laundryShop}
                      </p>
                      <p className="text-xs text-charcoal-300 mt-0.5">
                        {reminder.garmentIds.length} 件衣物 · 预计 {formatFullDate(reminder.pickupDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismissReminder(reminder.id)}
                      className="text-xs text-lavender-500 font-medium hover:text-lavender-600 transition-colors flex-shrink-0"
                    >
                      知道了
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReminder(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
              >
                稍后提醒
              </button>
              <button
                onClick={() => {
                  pendingReminders.forEach((r) => markReminderShown(r.id));
                  setShowReminder(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-lavender-400 text-white text-sm font-medium hover:bg-lavender-500 transition-colors active:scale-[0.98]"
              >
                全部知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-500/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover p-6 mx-4 max-w-sm w-full animate-scale-in">
            <h3 className="font-serif text-lg font-semibold text-charcoal-500 mb-2">
              确认删除
            </h3>
            <p className="text-sm text-charcoal-300 mb-6">
              确定要删除这条送洗记录吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRecordToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm font-medium text-charcoal-300 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(recordToDelete)}
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
