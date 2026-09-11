import { useState, useEffect, useMemo } from 'react';
import type { Client, ClientStatus, PipelineStage } from '../types/client';
import { X, Users, MessageSquare, Phone, Mail, Globe, Building2, Calendar, Tag, DollarSign, Layers, RefreshCw, Sparkles } from 'lucide-react';
import { WhatsAppIcon, MaxIcon } from './MessengerIcons';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  clientToEdit?: Client | null;
  initialStage?: PipelineStage;
  existingClients?: Client[];
}

const STATUS_CONFIG: { value: ClientStatus; label: string; icon: string; color: string }[] = [
  { value: 'active', label: 'В работе', icon: '⚡', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
  { value: 'vip', label: 'VIP клиент', icon: '👑', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
  { value: 'regular', label: 'Постоянный', icon: '💎', color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' },
  { value: 'lead', label: 'Лид (Переговоры)', icon: '🌱', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
  { value: 'dormant', label: 'Спящий / Архив', icon: '💤', color: 'border-slate-500/40 text-slate-400 bg-slate-500/10' },
];

const PIPELINE_STAGE_CONFIG: { value: PipelineStage; label: string; icon: string }[] = [
  { value: 'new_lead', label: 'Новый контакт', icon: '📥' },
  { value: 'contact_call', label: 'Созвон / Бриф', icon: '📞' },
  { value: 'negotiation', label: 'Переговоры / КП', icon: '🤝' },
  { value: 'awaiting_payment', label: 'Счёт / Аванс', icon: '💳' },
  { value: 'deal_won', label: 'Успешно закрыта', icon: '🏆' },
  { value: 'deal_lost', label: 'Отказ / Архив', icon: '❌' },
];

export function ClientFormModal({ isOpen, onClose, onSave, clientToEdit, initialStage, existingClients }: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [telegram, setTelegram] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [max, setMax] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('new_lead');
  const [dealValue, setDealValue] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  // Quick picker & base client selection state
  const [selectedBaseClientId, setSelectedBaseClientId] = useState<string>('');
  const [updateExistingFromBase, setUpdateExistingFromBase] = useState(true);

  // Extract unique lists from existing clients for suggestions & datalists
  const existingNames = useMemo(() => {
    if (!existingClients) return [];
    const set = new Set<string>();
    existingClients.forEach((c) => {
      if (c.name?.trim()) set.add(c.name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [existingClients]);

  const existingCompanies = useMemo(() => {
    if (!existingClients) return [];
    const set = new Set<string>();
    existingClients.forEach((c) => {
      if (c.company?.trim()) set.add(c.company.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [existingClients]);

  const existingLpr = useMemo(() => {
    if (!existingClients) return [];
    const set = new Set<string>();
    existingClients.forEach((c) => {
      if (c.contactPerson?.trim()) set.add(c.contactPerson.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [existingClients]);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setCompany(clientToEdit.company || '');
      setContactPerson(clientToEdit.contactPerson || '');
      setTelegram(clientToEdit.telegram || '');
      setPhone(clientToEdit.phone || '');
      setWhatsapp(clientToEdit.whatsapp || clientToEdit.phone || '');
      setMax(clientToEdit.max || clientToEdit.phone || '');
      setEmail(clientToEdit.email || '');
      setWebsite(clientToEdit.website || '');
      setStatus(clientToEdit.status || 'lead');
      setPipelineStage(clientToEdit.pipelineStage || (clientToEdit.status === 'lead' ? 'negotiation' : 'deal_won'));
      setDealValue(clientToEdit.dealValue ? clientToEdit.dealValue.toString() : '');
      setNextFollowUp(clientToEdit.nextFollowUp || '');
      setTagsInput((clientToEdit.tags || []).join(', '));
      setNotes(clientToEdit.notes || '');
      setSelectedBaseClientId(clientToEdit.id);
      setUpdateExistingFromBase(true);
    } else {
      setName('');
      setCompany('');
      setContactPerson('');
      setTelegram('');
      setPhone('');
      setWhatsapp('');
      setMax('');
      setEmail('');
      setWebsite('');
      setStatus('lead');
      setPipelineStage(initialStage || 'new_lead');
      setDealValue('');
      setNextFollowUp('');
      setTagsInput('');
      setNotes('');
      setSelectedBaseClientId('');
      setUpdateExistingFromBase(true);
    }
  }, [clientToEdit, isOpen, initialStage]);

  // Autofill client data from existing client in base
  const applyClientData = (c: Client) => {
    setName(c.name || '');
    setCompany(c.company || '');
    setContactPerson(c.contactPerson || '');
    setTelegram(c.telegram || '');
    setPhone(c.phone || '');
    setWhatsapp(c.whatsapp || c.phone || '');
    setMax(c.max || c.phone || '');
    setEmail(c.email || '');
    setWebsite(c.website || '');
    if (!clientToEdit) {
      if (c.status) setStatus(c.status);
      if (c.pipelineStage && !initialStage) setPipelineStage(c.pipelineStage);
    }
    if (c.dealValue) setDealValue(c.dealValue.toString());
    if (c.tags && c.tags.length > 0) setTagsInput(c.tags.join(', '));
    if (c.notes) setNotes(c.notes);
    if (c.nextFollowUp) setNextFollowUp(c.nextFollowUp);
    setSelectedBaseClientId(c.id);
  };

  const handleSelectFromBase = (clientId: string) => {
    if (!clientId) {
      setSelectedBaseClientId('');
      return;
    }
    const found = (existingClients || []).find((c) => c.id === clientId);
    if (found) {
      applyClientData(found);
    }
  };

  // Smart change handlers supporting arbitrary input and datalist auto-matching
  const handleNameChange = (val: string) => {
    setName(val);
    const match = (existingClients || []).find(
      (c) => c.name.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      if (!company && match.company) setCompany(match.company);
      if (!contactPerson && match.contactPerson) setContactPerson(match.contactPerson);
      if (!telegram && match.telegram) setTelegram(match.telegram);
      if (!phone && match.phone) {
        setPhone(match.phone);
        if (!whatsapp) setWhatsapp(match.whatsapp || match.phone);
        if (!max) setMax(match.max || match.phone);
      }
      if (!email && match.email) setEmail(match.email);
      if (!website && match.website) setWebsite(match.website);
      if (!dealValue && match.dealValue) setDealValue(match.dealValue.toString());
      if (!tagsInput && match.tags && match.tags.length > 0) setTagsInput(match.tags.join(', '));
      if (!notes && match.notes) setNotes(match.notes);
    }
  };

  const handleCompanyChange = (val: string) => {
    setCompany(val);
    const match = (existingClients || []).find(
      (c) => c.company?.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      if (!name && match.name) setName(match.name);
      if (!contactPerson && match.contactPerson) setContactPerson(match.contactPerson);
      if (!telegram && match.telegram) setTelegram(match.telegram);
      if (!phone && match.phone) {
        setPhone(match.phone);
        if (!whatsapp) setWhatsapp(match.whatsapp || match.phone);
        if (!max) setMax(match.max || match.phone);
      }
      if (!email && match.email) setEmail(match.email);
    }
  };

  const handleContactPersonChange = (val: string) => {
    setContactPerson(val);
    const match = (existingClients || []).find(
      (c) => c.contactPerson?.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      if (!name && match.name) setName(match.name);
      if (!company && match.company) setCompany(match.company);
      if (!telegram && match.telegram) setTelegram(match.telegram);
      if (!phone && match.phone) {
        setPhone(match.phone);
        if (!whatsapp) setWhatsapp(match.whatsapp || match.phone);
        if (!max) setMax(match.max || match.phone);
      }
    }
  };

  // Find if current typed inputs match an existing client in database
  const matchedClient = useMemo(() => {
    if (!existingClients || (!name.trim() && !company.trim() && !contactPerson.trim())) return null;
    const n = name.trim().toLowerCase();
    const comp = company.trim().toLowerCase();
    const lpr = contactPerson.trim().toLowerCase();
    return (
      existingClients.find(
        (c) =>
          c.id !== clientToEdit?.id &&
          ((n && c.name.toLowerCase() === n) ||
            (comp && c.company && c.company.toLowerCase() === comp) ||
            (lpr && c.contactPerson && c.contactPerson.toLowerCase() === lpr))
      ) || null
    );
  }, [existingClients, name, company, contactPerson, clientToEdit]);

  // Handle phone change with reactive auto-population of WhatsApp and MAX
  const handlePhoneChange = (newPhone: string) => {
    if (!whatsapp || whatsapp === phone) {
      setWhatsapp(newPhone);
    }
    if (!max || max === phone) {
      setMax(newPhone);
    }
    setPhone(newPhone);
  };

  const handleSyncWithPhone = () => {
    setWhatsapp(phone);
    setMax(phone);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Пожалуйста, укажите имя или название компании клиента.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const parsedDeal = parseFloat(dealValue.replace(/\s+/g, ''));

    let targetId: string;
    if (clientToEdit) {
      targetId = clientToEdit.id;
    } else if (selectedBaseClientId && updateExistingFromBase) {
      targetId = selectedBaseClientId;
    } else {
      targetId = 'client-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    }

    const clientData: Client = {
      id: targetId,
      name: name.trim(),
      company: company.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      telegram: telegram.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      max: max.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      status,
      pipelineStage,
      dealValue: !isNaN(parsedDeal) && parsedDeal > 0 ? parsedDeal : undefined,
      nextFollowUp: nextFollowUp || undefined,
      tags,
      notes: notes.trim() || undefined,
      createdAt: clientToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(clientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-panel my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {clientToEdit ? 'Редактирование клиента' : 'Новый клиент CRM'}
              </h2>
              <p className="text-xs text-slate-400">
                {clientToEdit ? 'Обновление контактной информации и заметок' : 'Добавление клиента в базу и настройка касаний'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Quick Select from Existing Clients in Base */}
          {existingClients && existingClients.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Выбрать из текущей базы клиентов</span>
                </label>
                {selectedBaseClientId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBaseClientId('');
                      if (!clientToEdit) {
                        setName('');
                        setCompany('');
                        setContactPerson('');
                        setTelegram('');
                        setPhone('');
                        setWhatsapp('');
                        setMax('');
                        setEmail('');
                        setWebsite('');
                        setDealValue('');
                        setNotes('');
                        setTagsInput('');
                      }
                    }}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Очистить / Сбросить
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedBaseClientId}
                  onChange={(e) => handleSelectFromBase(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white bg-slate-900/90 border-indigo-500/30 cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    -- Ввести произвольно или выберите клиента из базы ({existingClients.length}) --
                  </option>
                  {existingClients.map((c) => {
                    const extra = [c.company, c.contactPerson ? `ЛПР: ${c.contactPerson}` : '']
                      .filter(Boolean)
                      .join(' • ');
                    return (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name} {extra ? `(${extra})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBaseClientId && !clientToEdit && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-300/80">
                  <input
                    type="checkbox"
                    id="update-base-client"
                    checked={updateExistingFromBase}
                    onChange={(e) => setUpdateExistingFromBase(e.target.checked)}
                    className="rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="update-base-client" className="cursor-pointer">
                    Обновить карточку этого клиента в воронке (иначе создать отдельную копию)
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Matched Client Suggestion Badge */}
          {matchedClient && matchedClient.id !== selectedBaseClientId && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 animate-fade-in">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">
                  Найден в базе: <strong>{matchedClient.name}</strong>
                  {matchedClient.company ? ` • ${matchedClient.company}` : ''}
                  {matchedClient.contactPerson ? ` • ЛПР: ${matchedClient.contactPerson}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => applyClientData(matchedClient)}
                className="ml-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shrink-0 transition-all cursor-pointer shadow-sm"
              >
                Подставить данные
              </button>
            </div>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Имя / Клиент <span className="text-rose-400">*</span>
                </label>
                {existingNames.length > 0 && (
                  <span className="text-[10px] text-slate-500">из базы или произвольно</span>
                )}
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  list="crm-client-names-list"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ИП Гладкая, ООО Вектор, Алексей..."
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Организация / Компания
                </label>
                {existingCompanies.length > 0 && (
                  <span className="text-[10px] text-slate-500">из базы или произвольно</span>
                )}
              </div>
              <input
                type="text"
                list="crm-client-companies-list"
                value={company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                placeholder="Например: Салон красоты, IT стартап"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Contact Person & Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Контактное лицо / ЛПР
                </label>
                {existingLpr.length > 0 && (
                  <span className="text-[10px] text-slate-500">из базы или произвольно</span>
                )}
              </div>
              <input
                type="text"
                list="crm-client-lpr-list"
                value={contactPerson}
                onChange={(e) => handleContactPersonChange(e.target.value)}
                placeholder="Татьяна (директор), Михаил"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telegram (чат для связи)
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username или ссылка t.me/..."
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Телефон
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp & MAX (Phone numbers) */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                <span>Мессенджеры по номеру телефона</span>
              </span>
              {phone && (whatsapp !== phone || max !== phone) && (
                <button
                  type="button"
                  onClick={handleSyncWithPhone}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Скопировать основной номер телефона в WhatsApp и МАКС"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Синхронизировать с телефоном</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </span>
                  <span className="text-[10px] text-slate-400">только номер</span>
                </label>
                <div className="relative">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MaxIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>МАКС (MAX)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">номер или max.ru/u/...</span>
                </label>
                <div className="relative">
                  <MaxIcon className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    placeholder="+7 (999) 000-00-00 или max.ru/u/..."
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              💡 <em>В WhatsApp чат открывается сразу по номеру. В МАКС номер копируется для быстрого поиска, либо можно указать профиль <code className="text-indigo-300">max.ru/u/...</code> для моментального входа в диалог.</em>
            </p>
          </div>

          {/* Website & Next Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Сайт / Ссылка на проект
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://client-site.ru"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Дата следующего контакта (Follow-up) ⏰
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Pipeline Stage & Deal Value */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Этап воронки продаж (Pipeline)</span>
              </label>
              <span className="text-[10px] text-slate-400">Для канбан-воронки лидов</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PIPELINE_STAGE_CONFIG.map((stageItem) => (
                <button
                  type="button"
                  key={stageItem.value}
                  onClick={() => setPipelineStage(stageItem.value)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 cursor-pointer ${
                    pipelineStage === stageItem.value
                      ? 'bg-indigo-600/30 border-indigo-400 text-white ring-1 ring-indigo-400/50 scale-[1.01]'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                  }`}
                >
                  <span className="text-sm">{stageItem.icon}</span>
                  <span className="truncate">{stageItem.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Потенциальный бюджет сделки (₽)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="Например: 65000"
                  className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm font-semibold text-emerald-300"
                />
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Тип / Статус в базе
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_CONFIG.map((st) => (
                <button
                  type="button"
                  key={st.value}
                  onClick={() => setStatus(st.value)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 cursor-pointer ${
                    status === st.value
                      ? `${st.color} ring-1 ring-white/30 scale-[1.02]`
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                  }`}
                >
                  <span className="text-base">{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Теги / Сфера (через запятую)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="AI, Косметология, Telegram-бот, Fullstack, E-commerce"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Заметки, предпочтения и договорённости 📝
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Предпочитает общение в TG, планирует второй этап в ноябре, оплата всегда вовремя 50/50..."
              className="w-full glass-input p-3.5 rounded-xl text-sm resize-y"
            />
          </div>

          {/* Datalists for selecting from current client database or typing arbitrarily */}
          {existingClients && existingClients.length > 0 && (
            <>
              <datalist id="crm-client-names-list">
                {existingNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              <datalist id="crm-client-companies-list">
                {existingCompanies.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <datalist id="crm-client-lpr-list">
                {existingLpr.map((lpr) => (
                  <option key={lpr} value={lpr} />
                ))}
              </datalist>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {clientToEdit ? 'Сохранить изменения' : 'Создать клиента'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
