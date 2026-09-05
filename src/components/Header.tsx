import React, { useState } from 'react';
import { Nurse, Sector, ShiftConfig } from '../types';
import { HMWGLogo } from './HMWGLogo';
import {
  Bed,
  Users,
  ClipboardList,
  GitPullRequest,
  Printer,
  Calendar,
  Clock,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  sectors: Sector[];
  selectedSectorId: string;
  onSelectSector: (sectorId: string) => void;
  currentUser: Nurse | null;
  currentShift: ShiftConfig;
  nurses: Nurse[];
  activeTab: 'mapa' | 'atribuicao' | 'vagas' | 'plantao' | 'impressao';
  onSelectTab: (tab: 'mapa' | 'atribuicao' | 'vagas' | 'plantao' | 'impressao') => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sectors,
  selectedSectorId,
  onSelectSector,
  currentUser,
  currentShift,
  nurses,
  activeTab,
  onSelectTab,
  onOpenLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentSector = sectors.find((s) => s.id === selectedSectorId) || sectors[0];

  // Responsible nurses for current shift
  const responsibleNurses = currentShift.enfermeirosResponsaveisIds
    .map((id) => nurses.find((n) => n.id === id))
    .filter(Boolean) as Nurse[];

  const navTabs = [
    { key: 'mapa' as const, label: 'Mapa de Leitos', icon: Bed, color: 'sky' },
    { key: 'atribuicao' as const, label: 'Atribuição de Cuidados', icon: ClipboardList, color: 'cyan' },
    { key: 'vagas' as const, label: 'Solicitação de Vagas', icon: GitPullRequest, color: 'amber' },
    { key: 'plantao' as const, label: 'Plantão & Equipe', icon: Users, color: 'indigo' },
    { key: 'impressao' as const, label: 'Folha A4', icon: Printer, color: 'emerald' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner - Hospital Identification */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 text-white px-3 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Hospital Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <HMWGLogo size="md" showText={false} className="border-white/30 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                  HMWG
                </span>
                <span className="hidden lg:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-sky-600/60 text-sky-100 border border-sky-400/30">
                  Pronto-Socorro & Trauma
                </span>
              </div>
              <h1 className="text-[10px] sm:text-sm font-semibold text-sky-100 leading-tight truncate">
                Hospital Monsenhor Walfredo Gurgel
              </h1>
              <p className="text-[9px] sm:text-[10px] text-cyan-200 hidden sm:block">
                Sistema Integrado de Gestão da Assistência de Enfermagem
              </p>
            </div>
          </div>

          {/* Right side: shift info + login */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-shrink-0">
            {/* Shift Details - hidden on very small, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
              <span className="font-medium text-slate-100 whitespace-nowrap">{currentShift.data}</span>
              <span className="text-white/40">|</span>
              <Clock className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
              <span className="font-medium text-cyan-200 whitespace-nowrap">{currentShift.turno}</span>
            </div>

            {/* Responsible Nurses - compact on mobile */}
            <div className="hidden md:flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-slate-300 uppercase font-bold tracking-wider leading-none">
                  Enfs. Responsáveis ({responsibleNurses.length}):
                </span>
                <span className="font-semibold text-white truncate max-w-[180px] lg:max-w-none text-[11px]">
                  {responsibleNurses.length > 0
                    ? responsibleNurses.map((n) => n.nome.replace('Enf. ', '')).join(' • ')
                    : 'Nenhum enfermeiro escalado'}
                </span>
              </div>
            </div>

            {/* User Login Pill */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 sm:gap-2 bg-white text-sky-900 hover:bg-sky-50 px-2 py-1.5 sm:px-3 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer border border-white/40"
              title="Trocar usuário ou fazer login"
            >
              <UserCheck className="w-4 h-4 text-sky-700 flex-shrink-0" />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] leading-none font-bold text-slate-900">
                  {currentUser ? currentUser.nome : 'Fazer Login'}
                </div>
                <div className="text-[9px] text-sky-700 font-medium leading-tight">
                  {currentUser ? currentUser.cargo : 'Acesso Restrito'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              title="Menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Sector Switcher & Navigation Tabs */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2.5 gap-3">
          {/* Sector Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Setor:
            </span>
            <div className="flex items-center gap-1.5">
              {sectors.map((sector) => {
                const isSelected = sector.id === selectedSectorId;
                return (
                  <button
                    key={sector.id}
                    onClick={() => onSelectSector(sector.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: sector.cor }}
                    />
                    {sector.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const colorClasses: Record<string, string> = {
                sky: isActive ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'text-slate-600 hover:bg-slate-100',
                cyan: isActive ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'text-slate-600 hover:bg-slate-100',
                amber: isActive ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600 hover:bg-slate-100',
                indigo: isActive ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' : 'text-slate-600 hover:bg-slate-100',
                emerald: isActive ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100',
              };
              return (
                <button
                  key={tab.key}
                  onClick={() => onSelectTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    colorClasses[tab.color]
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile: Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 space-y-3">
            {/* Sector Switcher - Mobile */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 px-1">
                Setor
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {sectors.map((sector) => {
                  const isSelected = sector.id === selectedSectorId;
                  return (
                    <button
                      key={sector.id}
                      onClick={() => {
                        onSelectSector(sector.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sector.cor }}
                      />
                      {sector.nome}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shift Info - Mobile */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
              <span className="font-medium text-slate-700">{currentShift.data}</span>
              <span className="text-slate-300">|</span>
              <Clock className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
              <span className="font-medium text-slate-700">{currentShift.turno}</span>
            </div>

            {/* Responsible Nurses - Mobile */}
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-emerald-700 font-bold">Enfs. Responsáveis ({responsibleNurses.length}):</span>
                <span className="text-emerald-900 font-medium ml-1 truncate block">
                  {responsibleNurses.length > 0
                    ? responsibleNurses.map((n) => n.nome.replace('Enf. ', '')).join(' • ')
                    : 'Nenhum enfermeiro escalado'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs - Mobile (stacked) */}
            <div className="space-y-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const mobileColorClasses: Record<string, string> = {
                  sky: isActive ? 'bg-sky-100 text-sky-900 border-sky-300' : 'text-slate-600 bg-white border-slate-200',
                  cyan: isActive ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'text-slate-600 bg-white border-slate-200',
                  amber: isActive ? 'bg-amber-100 text-amber-900 border-amber-300' : 'text-slate-600 bg-white border-slate-200',
                  indigo: isActive ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'text-slate-600 bg-white border-slate-200',
                  emerald: isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-800 bg-emerald-50 border-emerald-300',
                };
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      onSelectTab(tab.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors border ${
                      mobileColorClasses[tab.color]
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
