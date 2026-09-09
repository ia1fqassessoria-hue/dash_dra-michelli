import React from "react";
import { MetabaseCardQueryResult } from "../services/metabaseQueries";
import { X, Users, ArrowUpRight } from "lucide-react";

interface LeadsParadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryResult: MetabaseCardQueryResult;
  cardId: number;
}

export const LeadsParadosModal: React.FC<LeadsParadosModalProps> = ({
  isOpen,
  onClose,
  queryResult,
  cardId,
}) => {
  if (!isOpen) return null;

  const { rows, columns, loading } = queryResult;

  // Assuming columns might be ["ID", "Nome do Lead", "Etapa", "Dias Parado"] or similar
  // Adjust according to the actual metabase query result for id 273.

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slideUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display tracking-tight flex items-center gap-2">
                Leads Parados {">"} 24h
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Listagem detalhada dos leads estagnados nas etapas "Em
                Atendimento" e "Tem Interesse". (Card #{cardId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
              <p className="text-sm text-zinc-400 font-medium">
                Carregando lista de leads...
              </p>
            </div>
          ) : rows && rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    {columns?.map((col, i) => (
                      <th
                        key={i}
                        className="px-6 py-4 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 border-b border-white/5"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 text-zinc-300 text-sm font-medium"
                        >
                          {cell !== null && cell !== undefined
                            ? String(cell)
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-1">
                Nenhum lead parado encontrado
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Não há leads estagnados por mais de 24 horas nas etapas
                selecionadas no momento.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-zinc-900 bg-white hover:bg-zinc-200 rounded-full transition-colors focus:outline-none"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
