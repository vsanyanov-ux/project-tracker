import React, { useState } from 'react';
import type { ClientCardArtifact } from '../../types/raci';
import { 
  Building2, 
  UserCheck, 
  Target, 
  MessageCircle, 
  DollarSign, 
  PhoneCall, 
  FileText, 
  Save, 
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface ArtifactClientCardProps {
  card: ClientCardArtifact;
  onUpdateCard: (updated: ClientCardArtifact) => void;
  onShowToast: (msg: string) => void;
}

export const ArtifactClientCard: React.FC<ArtifactClientCardProps> = ({
  card,
  onUpdateCard,
  onShowToast
}) => {
  const [formData, setFormData] = useState<ClientCardArtifact>(card);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClientCardArtifact = {
      ...formData,
      updatedAt: new Date().toISOString()
    };
    onUpdateCard(updated);
    setIsEditing(false);
    onShowToast('Карточка клиента и параметры кампании успешно сохранены! 💾');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Артефакт №1
            </span>
            <span className="text-xs text-slate-400">Паспорт кампании реактивации</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Карточка клиента & Параметры запуска
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Фиксирует единого владельца решения (A) от клиники, целевой сегмент, оффер и пороги окупаемости.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={() => {
                setFormData(card);
                setIsEditing(false);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
            >
              Отмена
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              Редактировать карточку
            </button>
          )}
        </div>
      </div>

      {/* Main Content / Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Top Grid: Clinic & Approver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Клиника */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Заказчик (Клиника)
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Название клиники / бренда</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                  required
                />
              ) : (
                <div className="text-sm font-bold text-white">{formData.clientName}</div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Контактное лицо & Телефон</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Имя врача"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+7 (...)"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-200">
                  {formData.contactPerson} • <span className="text-slate-400">{formData.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Владелец решения (Accountable) */}
          <div className="glass-card p-5 rounded-2xl border border-rose-500/20 bg-rose-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Владелец решения (Accountable от клиники)
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Роль A
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Кто утверждает запуск и оффер</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.approverName}
                    onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                    placeholder="ФИО собственника"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={formData.approverRole}
                    onChange={(e) => setFormData({ ...formData, approverRole: e.target.value })}
                    placeholder="Должность"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              ) : (
                <div className="text-sm font-bold text-white">
                  {formData.approverName} <span className="text-xs text-slate-400 font-normal">({formData.approverRole})</span>
                </div>
              )}
            </div>

            {/* Статус согласия */}
            <div className="pt-1">
              {isEditing ? (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.isApprovedWritten}
                    onChange={(e) => setFormData({ ...formData, isApprovedWritten: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-white/20 bg-slate-900"
                  />
                  <span className="font-semibold">Письменное согласие на оффер и запуск получено</span>
                </label>
              ) : (
                <div className="flex items-center gap-2">
                  {formData.isApprovedWritten ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> Письменное согласие утверждено
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> Требуется письменный аппрув!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Campaign Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Цель & Сегмент */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              Цель кампании & Спящая база
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Главная цель реактивации</label>
              {isEditing ? (
                <textarea
                  value={formData.campaignGoal}
                  onChange={(e) => setFormData({ ...formData, campaignGoal: e.target.value })}
                  rows={2}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              ) : (
                <div className="text-xs text-slate-200 leading-relaxed">{formData.campaignGoal}</div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Сегмент базы клиентов</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                ) : (
                  <div className="text-xs text-slate-300 font-medium">{formData.targetAudience}</div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Объем спящей базы (контактов)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.databaseSize}
                    onChange={(e) => setFormData({ ...formData, databaseSize: Number(e.target.value) })}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                ) : (
                  <div className="text-sm font-black text-cyan-400">{formData.databaseSize} контактов</div>
                )}
              </div>
            </div>
          </div>

          {/* Канал & Бюджет */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              Канал & Экономика
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Основной канал связи</label>
              {isEditing ? (
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900"
                >
                  <option value="WhatsApp">WhatsApp Business</option>
                  <option value="Telegram">Telegram</option>
                  <option value="SMS">SMS</option>
                  <option value="Комбинированный">Комбинированный</option>
                </select>
              ) : (
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {formData.channel}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Бюджет запуска (₽)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              ) : (
                <div className="text-sm font-black text-amber-400">{formData.budget.toLocaleString('ru')} ₽</div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Целевой KPI</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.targetKpi}
                  onChange={(e) => setFormData({ ...formData, targetKpi: e.target.value })}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              ) : (
                <div className="text-xs text-slate-200">{formData.targetKpi}</div>
              )}
            </div>
          </div>

        </div>

        {/* Offer & Handoff Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Текст оффера */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              Утвержденный текст оффера
            </div>
            {isEditing ? (
              <textarea
                value={formData.offerDescription}
                onChange={(e) => setFormData({ ...formData, offerDescription: e.target.value })}
                rows={3}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                placeholder="«Персональный подарочный депозит...»"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 leading-relaxed italic">
                {formData.offerDescription}
              </div>
            )}
          </div>

          {/* Дежурный администратор для перехвата */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="w-4 h-4" />
              Дежурный администратор клиники (Handoff)
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.backupAdminName}
                onChange={(e) => setFormData({ ...formData, backupAdminName: e.target.value })}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                placeholder="ФИО администратора и телефон"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-semibold">
                {formData.backupAdminName}
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Лицо, принимающее эскалацию диалога при вопросах о здоровье, противопоказаниях или согласовании сложного времени.
            </p>
          </div>

        </div>

        {/* Save Bar */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Сохранить изменения
            </button>
          </div>
        )}

      </form>
    </div>
  );
};
