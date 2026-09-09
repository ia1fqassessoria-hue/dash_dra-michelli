import React, { useState } from 'react';
import logoImg from '../assets/logofq.png';
import { PeriodFilter, MetabaseConnectionStatus } from '../types';
import { 
  Download, 
  RotateCw, 
  Calendar, 
  Check,
  Share2,
  X,
  Activity,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';

interface HeaderProps {
  selectedPeriod: PeriodFilter;
  onSelectPeriod: (period: PeriodFilter) => void;
  customRange: { startDate: string; endDate: string };
  onCustomRangeChange: (range: { startDate: string; endDate: string }) => void;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: (enabled: boolean) => void;
  secondsToNextRefresh?: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  isFromCache?: boolean;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  metabaseStatus: MetabaseConnectionStatus | null;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onShareLink?: () => void;
  copiedLink?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPeriod,
  onSelectPeriod,
  customRange,
  onCustomRangeChange,
  onManualRefresh,
  isRefreshing,
  onExportPdf,
  isExportingPdf,
  onShareLink,
  copiedLink = false,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const periodOptions: { id: PeriodFilter; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: '7days', label: 'Últimos 7 dias' },
    { id: '30days', label: 'Últimos 30 dias' },
    { id: '90days', label: 'Últimos 90 dias' },
    { id: 'this_month', label: 'Este Mês' },
    { id: 'last_month', label: 'Mês Anterior' },
    { id: 'custom', label: 'Período Personalizado...' },
  ];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PeriodFilter;
    onSelectPeriod(val);
    if (val !== 'custom') {
      setIsFilterOpen(false); // Close mobile drawer after selecting
    }
  };

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-3 no-print transition-all w-full">
      <div className="w-full bg-zinc-900 border border-white/10 rounded-2xl md:rounded-full px-4 sm:px-6 lg:px-8 py-3 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 w-full">
          
          {/* Top Bar on Mobile / Left Section on Desktop */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Brand Logo & Tag */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                <img 
                  src={logoImg || '/logofq.png'} 
                  alt="Logo FQ" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== window.location.origin + '/logofq.svg') {
                      target.src = '/logofq.svg';
                    }
                  }}
                />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 shadow-sm shrink-0">
                Dra. Michelli Pacheco
              </span>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button 
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className="md:hidden p-2 min-h-[36px] min-w-[36px] rounded-full bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
              aria-label={isFilterOpen ? 'Fechar filtros' : 'Abrir filtros'}
              title={isFilterOpen ? 'Fechar filtros' : 'Abrir filtros'}
            >
              {isFilterOpen ? <X className="w-4 h-4 text-zinc-300" /> : <SlidersHorizontal className="w-4 h-4 text-zinc-400" />}
            </button>
          </div>

          {/* Controls & Filters (Desktop Horizontal / Mobile Drawer) */}
          <div className={`${isFilterOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 transition-all`}>
            
            {/* Primary Filter: Period Selector */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:flex-none">
                <label htmlFor="period-select" className="sr-only">Selecione o Período</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <select 
                    id="period-select" 
                    value={selectedPeriod}
                    onChange={handlePeriodChange}
                    className="w-full md:w-auto pl-9 pr-8 py-1.5 min-h-[36px] rounded-full bg-zinc-800/90 hover:bg-zinc-700/90 border border-white/10 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer transition-all"
                  >
                    {periodOptions.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-zinc-900 text-zinc-200">{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-[9px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Custom Date Range Picker */}
              {selectedPeriod === 'custom' && (
                <div className="flex flex-col sm:flex-row items-center gap-1.5 w-full md:w-auto">
                  <input 
                    type="date" 
                    value={customRange.startDate}
                    onChange={(e) => onCustomRangeChange({ ...customRange, startDate: e.target.value })}
                    className="w-full sm:w-auto px-3 py-1.5 min-h-[36px] rounded-full bg-zinc-800/90 border border-white/10 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50" 
                  />
                  <span className="text-[11px] text-zinc-500 hidden sm:inline">até</span>
                  <input 
                    type="date" 
                    value={customRange.endDate}
                    onChange={(e) => onCustomRangeChange({ ...customRange, endDate: e.target.value })}
                    className="w-full sm:w-auto px-3 py-1.5 min-h-[36px] rounded-full bg-zinc-800/90 border border-white/10 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50" 
                  />
                </div>
              )}
            </div>

            {/* Vertical Divider for Desktop */}
            <div className="hidden md:block w-px h-5 bg-white/10 mx-0.5" />

            {/* Utility Actions Group */}
            <div className="flex items-center justify-end gap-2 pt-1 md:pt-0">
              {/* Refresh Data */}
              <button 
                type="button"
                onClick={onManualRefresh}
                disabled={isRefreshing}
                title="Atualizar dados" 
                aria-label="Atualizar dados"
                className="p-2 min-h-[36px] min-w-[36px] rounded-full bg-zinc-800/90 hover:bg-zinc-700/90 border border-white/10 text-zinc-300 hover:text-white transition-all flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              </button>
              
              {/* Share Link */}
              {onShareLink && (
                <button 
                  type="button"
                  onClick={onShareLink}
                  className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full border text-xs font-medium transition-all no-print shrink-0 active:scale-95 ${
                    copiedLink
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-zinc-800/90 border-white/10 hover:bg-zinc-700/90 text-zinc-300 hover:text-white'
                  }`}
                  title={copiedLink ? 'Link copiado' : 'Copiar link do painel'}
                  aria-label={copiedLink ? 'Link copiado' : 'Copiar link do painel'}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Export PDF CTA */}
              <button 
                type="button"
                onClick={onExportPdf}
                disabled={isExportingPdf}
                title="Exportar relatório em PDF" 
                aria-label="Exportar relatório em PDF"
                className="flex-1 md:flex-none px-4 py-1.5 min-h-[36px] rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs border border-white/20 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              >
                <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};


