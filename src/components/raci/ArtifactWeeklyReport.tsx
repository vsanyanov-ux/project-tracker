import React, { useState } from 'react';
import type { WeeklyReportData } from '../../types/raci';
import { 
  TrendingUp, 
  Copy, 
  Check, 
  CalendarCheck, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Trash2 
} from 'lucide-react';

interface ArtifactWeeklyReportProps {
  report: WeeklyReportData;
  onUpdateReport: (updated: WeeklyReportData) => void;
  onShowToast: (msg: string) => void;
}

export const ArtifactWeeklyReport: React.FC<ArtifactWeeklyReportProps> = ({
  report,
  onUpdateReport,
  onShowToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<WeeklyReportData>(report);
  const [copied, setCopied] = useState(false);
  const [newIssue, setNewIssue] = useState('');

  // Conversion calculations
  const deliveryRate = formData.totalContacts > 0 
    ? Math.round((formData.deliveredCount / formData.totalContacts) * 100) 
    : 0;

  const responseRate = formData.deliveredCount > 0 
    ? ((formData.dialogStartedCount / formData.deliveredCount) * 100).toFixed(1) 
    : '0';

  const bookingRate = formData.dialogStartedCount > 0 
    ? ((formData.appointmentsBookedCount / formData.dialogStartedCount) * 100).toFixed(1) 
    : '0';

  const visitRate = formData.appointmentsBookedCount > 0 
    ? Math.round((formData.visitsCompletedCount / formData.appointmentsBookedCount) * 100) 
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateReport(formData);
    setIsEditing(false);
    onShowToast('Еженедельный отчет и воронка обновлены! 📊');
  };

  const handleAddIssue = () => {
    if (!newIssue.trim()) return;
    setFormData({
      ...formData,
      issuesList: [...formData.issuesList, newIssue.trim()]
    });
    setNewIssue('');
  };

  const handleRemoveIssue = (index: number) => {
    setFormData({
      ...formData,
      issuesList: formData.issuesList.filter((_, i) => i !== index)
    });
  };

  const copyToClipboard = () => {
    const text = `📊 Отчет по реактивации спящей базы — ${formData.clientName}
📅 Период: ${formData.periodTitle}

1️⃣ База контактов: ${formData.totalContacts} клиентов
2️⃣ Доставлено сообщений: ${formData.deliveredCount} (${deliveryRate}%)
3️⃣ Начали диалог с ботом: ${formData.dialogStartedCount} (${responseRate}%)
4️⃣ Записались на прием: ${formData.appointmentsBookedCount} клиентов
5️⃣ Пришли в клинику и оплатили: ${formData.visitsCompletedCount} пациентов (${visitRate}% доходимость)

💰 Фактическая выручка клиники: ${formData.generatedRevenue.toLocaleString('ru')} ₽
💎 Средний чек процедуры: ${formData.averageTicket.toLocaleString('ru')} ₽

⚠️ Возникшие инциденты и доработки:
${formData.issuesList.map((iss, i) => `${i + 1}. ${iss}`).join('\n')}

🚀 План на следующую неделю:
${formData.nextWeekPlan}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Готовый отчет скопирован в буфер обмена для отправки в WhatsApp! 📋');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Артефакт №4
            </span>
            <span className="text-xs text-slate-400">Воронка возврата и выручка</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Еженедельный отчет по реактивации базы
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Founder (A) отчитывается перед клиникой не за отправленные спам-сообщения, а за реальные деньги в кассе.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано!' : 'Скопировать для WhatsApp'}
          </button>

          {isEditing ? (
            <button
              onClick={() => {
                setFormData(report);
                setIsEditing(false);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10"
            >
              Отмена
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Изменить цифры
            </button>
          )}
        </div>
      </div>

      {/* Main Funnel Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* База */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Спящая база</div>
          {isEditing ? (
            <input
              type="number"
              value={formData.totalContacts}
              onChange={(e) => setFormData({ ...formData, totalContacts: Number(e.target.value) })}
              className="w-full glass-input px-2 py-1 text-center font-bold text-sm"
            />
          ) : (
            <div className="text-xl font-black text-white">{formData.totalContacts}</div>
          )}
          <div className="text-[10px] text-slate-500 mt-1">100% базы</div>
        </div>

        {/* Доставлено */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Доставлено</div>
          {isEditing ? (
            <input
              type="number"
              value={formData.deliveredCount}
              onChange={(e) => setFormData({ ...formData, deliveredCount: Number(e.target.value) })}
              className="w-full glass-input px-2 py-1 text-center font-bold text-sm"
            />
          ) : (
            <div className="text-xl font-black text-cyan-400">{formData.deliveredCount}</div>
          )}
          <div className="text-[10px] text-cyan-500 font-semibold mt-1">{deliveryRate}% охват</div>
        </div>

        {/* Диалоги */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Начали диалог</div>
          {isEditing ? (
            <input
              type="number"
              value={formData.dialogStartedCount}
              onChange={(e) => setFormData({ ...formData, dialogStartedCount: Number(e.target.value) })}
              className="w-full glass-input px-2 py-1 text-center font-bold text-sm"
            />
          ) : (
            <div className="text-xl font-black text-purple-400">{formData.dialogStartedCount}</div>
          )}
          <div className="text-[10px] text-purple-400 font-semibold mt-1">{responseRate}% отклик</div>
        </div>

        {/* Записи */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Записались</div>
          {isEditing ? (
            <input
              type="number"
              value={formData.appointmentsBookedCount}
              onChange={(e) => setFormData({ ...formData, appointmentsBookedCount: Number(e.target.value) })}
              className="w-full glass-input px-2 py-1 text-center font-bold text-sm"
            />
          ) : (
            <div className="text-xl font-black text-amber-400">{formData.appointmentsBookedCount}</div>
          )}
          <div className="text-[10px] text-amber-400 font-semibold mt-1">{bookingRate}% конверсия</div>
        </div>

        {/* Дошли */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Визиты (Оплата)</div>
          {isEditing ? (
            <input
              type="number"
              value={formData.visitsCompletedCount}
              onChange={(e) => setFormData({ ...formData, visitsCompletedCount: Number(e.target.value) })}
              className="w-full glass-input px-2 py-1 text-center font-bold text-sm"
            />
          ) : (
            <div className="text-xl font-black text-emerald-400">{formData.visitsCompletedCount}</div>
          )}
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">{visitRate}% доходимость</div>
        </div>

        {/* Выручка */}
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-center">
          <div className="text-[10px] uppercase font-extrabold text-emerald-300 mb-1">Выручка клиники</div>
          {isEditing ? (
            <input
              type="number"
              value={formData.generatedRevenue}
              onChange={(e) => setFormData({ ...formData, generatedRevenue: Number(e.target.value) })}
              className="w-full glass-input px-2 py-1 text-center font-black text-sm text-emerald-300"
            />
          ) : (
            <div className="text-lg font-black text-emerald-300">{formData.generatedRevenue.toLocaleString('ru')} ₽</div>
          )}
          <div className="text-[10px] text-emerald-400/80 font-bold mt-1">Чек ~{formData.averageTicket.toLocaleString('ru')} ₽</div>
        </div>

      </div>

      {/* Visual Funnel Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Графическая воронка возврата</span>
        </div>

        <div className="space-y-2">
          {/* Контакты */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Спящая база</span>
              <span className="font-bold text-white">{formData.totalContacts} (100%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-slate-600 rounded-full w-full" />
            </div>
          </div>

          {/* Доставлено */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Доставлено</span>
              <span className="font-bold text-cyan-400">{formData.deliveredCount} ({deliveryRate}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${deliveryRate}%` }} />
            </div>
          </div>

          {/* Диалоги */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Начали диалог с ботом</span>
              <span className="font-bold text-purple-400">{formData.dialogStartedCount} ({((formData.dialogStartedCount / formData.totalContacts) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(formData.dialogStartedCount / formData.totalContacts) * 100}%` }} />
            </div>
          </div>

          {/* Записи */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Записались на прием</span>
              <span className="font-bold text-amber-400">{formData.appointmentsBookedCount}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(5, (formData.appointmentsBookedCount / formData.totalContacts) * 100)}%` }} />
            </div>
          </div>

          {/* Дошли */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Фактически пришли в клинику</span>
              <span className="font-bold text-emerald-400">{formData.visitsCompletedCount} пациентов</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(4, (formData.visitsCompletedCount / formData.totalContacts) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Issues List & Next Week Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Список инцидентов и проблем */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Список проблем & сбоев за неделю
          </div>

          <div className="space-y-2">
            {formData.issuesList.map((issue, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 flex items-start justify-between gap-2">
                <span>⚠️ {issue}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveIssue(idx)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                placeholder="Добавить возникшую проблему или жалобу"
                className="w-full glass-input px-3 py-1.5 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddIssue}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* План на следующую неделю */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            План масштабирования на следующую неделю
          </div>

          {isEditing ? (
            <textarea
              value={formData.nextWeekPlan}
              onChange={(e) => setFormData({ ...formData, nextWeekPlan: e.target.value })}
              rows={4}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
            />
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
              {formData.nextWeekPlan}
            </div>
          )}
        </div>

      </div>

      {/* Save Button for Form */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Сохранить отчет недели
          </button>
        </div>
      )}
    </div>
  );
};
