import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';

interface CardEditWrapperProps {
  isEditMode: boolean;
  cardKey: string;
  cardTitle: string;
  currentCardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
  children: React.ReactNode;
}

export const CardEditWrapper: React.FC<CardEditWrapperProps> = ({
  isEditMode,
  cardKey,
  cardTitle,
  currentCardId,
  onUpdateCardId,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(currentCardId));

  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      onUpdateCardId(cardKey, num);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative rounded-3xl transition-all ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/10">
      {/* Children content */}
      {children}

      {/* Edit Mode Badge at Top Right - High z-index (z-50) placed after children so it never gets obscured on hover */}
      <div className="absolute top-3 right-3 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setInputValue(String(currentCardId));
            setIsEditing(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300 ring-2 ring-amber-400/50"
          title={`Alterar ID do Metabase (${currentCardId})`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Alterar ID ({currentCardId})</span>
        </button>
      </div>

      {/* Popover Inline Modal over Card when editing */}
      {isEditing && (
        <div className="absolute inset-0 z-[70] bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-center items-center border border-amber-400/70 shadow-2xl animate-fadeIn text-white">
          <form onSubmit={handleSave} className="w-full max-w-xs space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
              <Edit3 className="w-4 h-4" />
              <h3>Alterar Card ID</h3>
            </div>
            
            <p className="text-xs text-slate-300">
              {cardTitle}
            </p>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400 text-left">
                Novo ID do Metabase:
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: 130"
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-white font-mono text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-center"
              />
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
