import { type ReactNode, type FormEvent, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity, ArrowLeft, ArrowRight, Award, BookOpen, BriefcaseMedical,
  Check, CheckCircle2, ChevronRight, CircleHelp, ClipboardCheck, Droplets,
  FileText, HeartPulse, Home as HomeIcon, Info, Landmark, Menu, Move, Pause,
  Pill, RotateCcw, Ruler, Search, ShieldCheck, Sparkles, Star, Stethoscope,
  Target, Timer, Users, X, Zap, type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Procedure = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  time: string;
  icon: LucideIcon;
  steps: string[];
  tags: string[];
};

type PainEntry = {
  id: string;
  zone: string;
  intensity: number;
  note: string;
  date: string;
};

const procedures: Procedure[] = [
  {
    id: 'preparo',
    title: 'Prepare antes de começar',
    eyebrow: 'Base de todo cuidado',
    description: 'Um minuto de preparação pode mudar a qualidade do movimento durante o procedimento.',
    time: '2 min',
    icon: ClipboardCheck,
    tags: ['altura', 'distância', 'ajuda'],
    steps: ['Leia o que será feito e reúna os materiais.', 'Ajuste a altura do leito para trabalhar perto da sua zona confortável.', 'Explique o cuidado ao paciente e combine os movimentos.', 'Peça ajuda quando a tarefa ou a condição do paciente exigir.'],
  },
  {
    id: 'banho',
    title: 'Banho no leito',
    eyebrow: 'Higiene e conforto',
    description: 'Organize materiais e posições para cuidar sem permanecer inclinado por tempo desnecessário.',
    time: '4 min',
    icon: Droplets,
    tags: ['leito', 'alcance', 'pausas'],
    steps: ['Posicione o leito e deixe os materiais próximos.', 'Trabalhe por segmentos, alternando lados quando possível.', 'Mantenha o tronco de frente para a área do cuidado.', 'Faça uma breve pausa para mudar de posição antes de finalizar.'],
  },
  {
    id: 'higiene',
    title: 'Troca de fralda e higiene íntima',
    eyebrow: 'Cuidado próximo',
    description: 'Planeje o alcance e preserve sua base de apoio durante um cuidado que exige atenção e delicadeza.',
    time: '3 min',
    icon: ShieldCheck,
    tags: ['altura', 'pernas', 'apoio'],
    steps: ['Eleve o leito antes de iniciar e mantenha tudo ao alcance.', 'Flexione os joelhos e use as pernas para se aproximar.', 'Evite torcer o tronco para alcançar um lado do leito.', 'Se o paciente precisar ser reposicionado, solicite ajuda.'],
  },
  {
    id: 'mobilizacao',
    title: 'Mobilização e mudança de decúbito',
    eyebrow: 'Movimento compartilhado',
    description: 'Reduza a distância e coordene o movimento: segurança para quem cuida e para quem é cuidado.',
    time: '5 min',
    icon: Move,
    tags: ['coordenação', 'ajuda', 'distância'],
    steps: ['Explique o movimento e combine um sinal para iniciar.', 'Aproxime o paciente e use os recursos disponíveis.', 'Distribua o esforço entre as pessoas da equipe.', 'Faça o movimento com as pernas, sem puxar com a coluna.'],
  },
  {
    id: 'transferencia',
    title: 'Transferência do paciente',
    eyebrow: 'Da cama à cadeira',
    description: 'Antes de mover, olhe para o caminho. O melhor movimento é o que foi preparado.',
    time: '4 min',
    icon: Users,
    tags: ['caminho', 'freios', 'equipe'],
    steps: ['Confira o trajeto, a superfície e os freios dos equipamentos.', 'Ajuste as alturas e aproxime os pontos de transferência.', 'Avalie a necessidade de mais profissionais ou dispositivo auxiliar.', 'Mova de forma coordenada, respeitando a capacidade do paciente.'],
  },
  {
    id: 'acesso',
    title: 'Punção e administração de medicamentos',
    eyebrow: 'Precisão sem sobrecarga',
    description: 'Ajuste sua posição antes de buscar precisão: mãos estáveis começam em um corpo apoiado.',
    time: '3 min',
    icon: Pill,
    tags: ['apoio', 'punho', 'visão'],
    steps: ['Posicione o membro e os materiais para evitar alcance longo.', 'Apoie o corpo quando a tarefa exigir precisão.', 'Mantenha punho e antebraço em posição confortável.', 'Reorganize o ambiente antes de repetir o procedimento.'],
  },
  {
    id: 'dispositivos',
    title: 'Drenos, bolsas coletoras e curativos',
    eyebrow: 'Detalhes que pedem atenção',
    description: 'Aproxime o campo de trabalho e evite deixar tubos ou bolsas criarem uma distância extra.',
    time: '3 min',
    icon: BriefcaseMedical,
    tags: ['alcance', 'organização', 'postura'],
    steps: ['Identifique drenos e bolsas antes de mudar a posição do paciente.', 'Organize o material do curativo próximo ao campo.', 'Evite trabalhar com o tronco torcido ou projetado à frente.', 'Registre o cuidado e sinalize qualquer dificuldade à equipe.'],
  },
  {
    id: 'transporte',
    title: 'Transporte e registros de enfermagem',
    eyebrow: 'Fechar o ciclo',
    description: 'O cuidado continua no deslocamento e no registro: reserve espaço para recuperar o corpo.',
    time: '2 min',
    icon: FileText,
    tags: ['deslocamento', 'registro', 'recuperação'],
    steps: ['Confira o percurso e os equipamentos antes de sair.', 'Alterne a tarefa de conduzir e mantenha os ombros relaxados.', 'No registro, aproxime a tela ou o papel em vez de curvar o pescoço.', 'Ao concluir, pause, mova-se e recupere-se antes do próximo cuidado.'],
  },
];

const rules = [
  { number: '01', title: 'Ajuste a altura', text: 'Leito, maca e bancada devem trabalhar a favor do seu corpo.', icon: Ruler },
  { number: '02', title: 'Use as pernas', text: 'Aproxime-se e distribua o esforço na base, não apenas na coluna.', icon: Activity },
  { number: '03', title: 'Encurte a distância', text: 'Traga o paciente, os materiais e os equipamentos para perto.', icon: Target },
  { number: '04', title: 'Evite torcer o tronco', text: 'Mude seus pés e fique de frente para a tarefa.', icon: RotateCcw },
  { number: '05', title: 'Peça ajuda', text: 'Cuidar em equipe também é uma escolha ergonômica.', icon: Users },
  { number: '06', title: 'Pause, mova e recupere', text: 'Pequenas pausas dão ao corpo uma chance de continuar.', icon: Pause },
];

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }, [key, value]);
  return [value, setValue] as const;
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-ergoenf">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[4px_5px_0_hsl(var(--secondary))]">
        <Activity size={22} strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))]" />
      </div>
      <div>
        <div className="font-serif text-xl font-bold leading-none tracking-[-.03em]">ergoenf</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">cuidar de quem cuida</div>
      </div>
    </div>
  );
}

const navItems = [
  { href: '/', label: 'Visão geral', icon: HomeIcon },
  { href: '/learn', label: 'Aprender', icon: BookOpen },
  { href: '/quick', label: 'Protocolo rápido', icon: Zap },
  { href: '/body', label: 'Meu corpo hoje', icon: HeartPulse },
  { href: '/rules', label: 'Regras de ouro', icon: Award },
  { href: '/progress', label: 'Meu progresso', icon: Sparkles },
];

function NavLinkItem({ href, label, icon: Icon, mobile = false }: { href: string; label: string; icon: LucideIcon; mobile?: boolean }) {
  const [location] = useLocation();
  const active = href === '/' ? location === '/' : location.startsWith(href);
  return (
    <Link href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center ${mobile ? 'justify-center' : 'gap-3'} rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_18px_hsl(var(--primary)/.16)]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}>
      <Icon size={18} strokeWidth={active ? 2.4 : 2} />
      {!mobile && <span>{label}</span>}
      {!mobile && active && <ChevronRight size={15} className="ml-auto opacity-70" />}
      {mobile && <span className="sr-only">{label}</span>}
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] px-5 py-7 backdrop-blur-xl lg:flex">
        <LogoMark />
        <div className="mt-14 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Seu plantão, mais seguro</div>
        <nav className="mt-4 flex flex-col gap-1.5">
          {navItems.map((item) => <NavLinkItem key={item.href} {...item} />)}
        </nav>
        <div className="mt-auto rounded-2xl bg-[hsl(var(--secondary)/.32)] p-4">
          <div className="mb-2 flex items-center gap-2 text-[hsl(var(--primary))]"><CircleHelp size={16} /><span className="text-xs font-bold">Um lembrete gentil</span></div>
          <p className="text-xs leading-relaxed text-[hsl(var(--foreground)/.7)]">Seu corpo também faz parte do cuidado. Observe os sinais antes que eles virem urgência.</p>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] px-5 backdrop-blur-lg lg:hidden">
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" data-testid="button-open-menu" className="rounded-xl p-2 hover:bg-[hsl(var(--muted))]"><Menu size={22} /></button>
        <LogoMark />
        <Link href="/quick" data-testid="link-mobile-quick" className="rounded-xl bg-[hsl(var(--primary))] p-2.5 text-[hsl(var(--primary-foreground))]"><Zap size={18} /></Link>
      </header>
      {menuOpen && <div className="fixed inset-0 z-40 bg-[hsl(var(--foreground)/.2)] lg:hidden" onClick={() => setMenuOpen(false)}><div className="h-full w-[82%] max-w-[310px] bg-[hsl(var(--card))] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><LogoMark /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" data-testid="button-close-menu" className="rounded-xl p-2 hover:bg-[hsl(var(--muted))]"><X size={20} /></button></div><nav className="mt-12 flex flex-col gap-1.5">{navItems.map((item) => <div key={item.href} onClick={() => setMenuOpen(false)}><NavLinkItem {...item} /></div>)}</nav></div></div>}
      <main className="pb-24 lg:ml-[252px] lg:pb-0">{children}</main>
      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] px-2 pt-2 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => <NavLinkItem key={item.href} {...item} mobile />)}
      </nav>
    </div>
  );
}

function PageHeader({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <div className="animate-rise mb-8"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />{kicker}</div><h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.06] tracking-[-.04em] text-[hsl(var(--foreground))] sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">{description}</p></div>;
}

function StatChip({ value, label, icon: Icon }: { value: string; label: string; icon: LucideIcon }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-[var(--shadow-sm)]"><div className="rounded-xl bg-[hsl(var(--muted))] p-2 text-[hsl(var(--primary))]"><Icon size={16} /></div><div><div className="font-serif text-xl font-bold leading-none">{value}</div><div className="mt-1 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">{label}</div></div></div>;
}

function Overview({ completed, favorites, setFavorites }: { completed: string[]; favorites: string[]; setFavorites: (value: string[]) => void }) {
  const done = completed.length;
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <section className="relative overflow-hidden rounded-[28px] bg-[hsl(var(--primary))] px-6 py-8 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] sm:px-10 sm:py-11 lg:px-14 lg:py-14">
        <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border-[34px] border-[hsl(var(--secondary)/.32)]" /><div className="absolute -bottom-28 right-28 h-52 w-52 rounded-full border-[22px] border-[hsl(var(--accent)/.3)]" />
        <div className="relative max-w-2xl animate-rise"><div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--secondary))]"><Sparkles size={14} /> companheira de campo</div><h1 className="font-serif text-[clamp(2.6rem,6vw,5.4rem)] font-bold leading-[.94] tracking-[-.06em]">Seu próximo cuidado começa no seu corpo.</h1><p className="mt-6 max-w-lg text-base leading-7 text-[hsl(var(--primary-foreground)/.78)]">Ergonomia não é um detalhe do procedimento. É uma forma prática de proteger quem sustenta o cuidado todos os dias.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/quick" data-testid="link-start-quick" className="inline-flex items-center gap-2 rounded-2xl bg-[hsl(var(--secondary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--secondary-foreground))] transition-transform hover:-translate-y-0.5">Começar protocolo rápido <ArrowRight size={17} /></Link><Link href="/learn" data-testid="link-start-learning" className="inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--primary-foreground)/.25)] px-5 py-3.5 text-sm font-bold transition-colors hover:bg-[hsl(var(--primary-foreground)/.1)]">Explorar cuidados <BookOpen size={17} /></Link></div></div>
        <div className="relative mt-9 flex items-center gap-3 border-t border-[hsl(var(--primary-foreground)/.16)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.72)] sm:absolute sm:bottom-10 sm:right-12 sm:mt-0 sm:border-0 sm:pt-0"><div className="flex -space-x-2"><div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-xs font-bold text-[hsl(var(--foreground))]">A</div><div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-xs font-bold">M</div><div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] text-xs font-bold text-[hsl(var(--foreground))]">J</div></div><span>feito para a rotina real da enfermagem</span></div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3"><StatChip value={`${done}/8`} label="procedimentos vistos" icon={BookOpen} /><StatChip value={`${favorites.length}`} label="cuidados salvos" icon={Star} /><StatChip value="1 min" label="para começar hoje" icon={Timer} /></section>

      <section className="mt-14 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div><div className="mb-5 flex items-end justify-between"><div><div className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Trilha de hoje</div><h2 className="mt-2 font-serif text-3xl font-bold tracking-[-.03em]">Escolha um momento do plantão</h2></div><Link href="/learn" data-testid="link-see-all-procedures" className="hidden items-center gap-1 text-sm font-bold text-[hsl(var(--primary))] sm:flex">Ver todos <ArrowRight size={15} /></Link></div><div className="grid gap-3">{procedures.slice(0, 4).map((procedure, index) => <ProcedureRow key={procedure.id} procedure={procedure} index={index} done={completed.includes(procedure.id)} favorite={favorites.includes(procedure.id)} onFavorite={() => setFavorites(favorites.includes(procedure.id) ? favorites.filter((id) => id !== procedure.id) : [...favorites, procedure.id])} />)}</div></div>
        <div className="space-y-4"><div className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-sm)]"><div className="flex items-start justify-between"><div><div className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Agora, com você</div><h3 className="mt-2 font-serif text-2xl font-bold">Como está seu corpo?</h3></div><HeartPulse className="text-[hsl(var(--accent))]" size={25} /></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Registre um sinal rápido. Perceber cedo ajuda a escolher melhor o próximo movimento.</p><Link href="/body" data-testid="link-body-checkin" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.6)]">Fazer check-in <ArrowRight size={16} /></Link></div><div className="dot-grid rounded-[24px] border border-[hsl(var(--border))] p-6"><div className="flex items-center gap-2 text-[hsl(var(--primary))]"><Landmark size={18} /><span className="text-xs font-bold uppercase tracking-[.14em]">Por que isso importa</span></div><p className="mt-4 font-serif text-xl font-semibold leading-snug">Em hospitais universitários brasileiros, cuidar também é lidar com ritmo, carga e improviso.</p><Link href="/about" data-testid="link-about-project" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">Conhecer o projeto <ChevronRight size={15} /></Link></div></div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[28px] bg-[hsl(var(--secondary)/.42)] p-6 sm:p-9"><div className="grid items-center gap-7 lg:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]"><Award size={16} /> as seis regras de ouro</div><h2 className="mt-3 max-w-xl font-serif text-3xl font-bold leading-tight tracking-[-.03em]">Pequenos ajustes. Menos sobrecarga. Mais presença.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--foreground)/.72)]">Um lembrete visual para consultar antes, durante ou depois de qualquer procedimento.</p></div><Link href="/rules" data-testid="link-golden-rules" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))]">Ver as regras <ArrowRight size={17} /></Link></div></section>

      <AboutProject />
    </div>
  );
}

function ProcedureRow({ procedure, index, done, favorite, onFavorite }: { procedure: Procedure; index: number; done: boolean; favorite: boolean; onFavorite: () => void }) {
  const Icon = procedure.icon;
  return <div className={`animate-rise delay-${Math.min(index + 1, 4)} group flex items-center gap-3 rounded-[20px] border bg-[hsl(var(--card))] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] ${done ? 'border-[hsl(var(--primary)/.35)]' : 'border-[hsl(var(--border))]'}`} data-testid={`card-procedure-${procedure.id}`}><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Icon size={21} /></div><Link href={`/learn?procedure=${procedure.id}`} data-testid={`link-procedure-${procedure.id}`} className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-[15px] font-bold">{procedure.title}</span>{done && <CheckCircle2 size={15} className="shrink-0 text-[hsl(var(--primary))]" />}</div><div className="mt-1 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><span>{procedure.eyebrow}</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--border))]" /><span>{procedure.time}</span></div></Link><button type="button" onClick={onFavorite} aria-label={favorite ? `Remover ${procedure.title} dos salvos` : `Salvar ${procedure.title}`} data-testid={`button-favorite-${procedure.id}`} className={`rounded-xl p-2 transition-colors ${favorite ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`}><Star size={17} fill={favorite ? 'currentColor' : 'none'} /></button><ChevronRight size={17} className="mr-1 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-0.5" /></div>;
}

function Learn({ completed, setCompleted, favorites, setFavorites }: { completed: string[]; setCompleted: (value: string[]) => void; favorites: string[]; setFavorites: (value: string[]) => void }) {
  const [selectedId, setSelectedId] = useState(procedures[0].id);
  const selected = procedures.find((procedure) => procedure.id === selectedId) ?? procedures[0];
  const Icon = selected.icon;
  const isDone = completed.includes(selected.id);
  const toggleDone = () => setCompleted(isDone ? completed.filter((id) => id !== selected.id) : [...completed, selected.id]);
  return <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><PageHeader kicker="Aprender fazendo" title="Cuidado seguro começa no preparo." description="Escolha um procedimento para transformar orientação ergonômica em uma decisão possível no seu próximo cuidado." /><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]"><div className="grid gap-3 sm:grid-cols-2">{procedures.map((procedure, index) => { const ProcedureIcon = procedure.icon; const active = selected.id === procedure.id; return <button type="button" key={procedure.id} onClick={() => setSelectedId(procedure.id)} data-testid={`button-select-procedure-${procedure.id}`} className={`animate-rise delay-${Math.min(index + 1, 4)} group relative flex min-h-[142px] flex-col items-start rounded-[22px] border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] ${active ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}><div className="flex w-full items-center justify-between"><div className={`rounded-xl p-2.5 ${active ? 'bg-[hsl(var(--primary-foreground)/.14)]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'}`}><ProcedureIcon size={20} /></div>{completed.includes(procedure.id) ? <CheckCircle2 size={18} /> : <span className={`text-xs font-bold ${active ? 'text-[hsl(var(--secondary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{procedure.time}</span>}</div><div className="mt-auto pt-4"><div className="text-[15px] font-bold leading-snug">{procedure.title}</div><div className={`mt-1 text-xs ${active ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}`}>{procedure.eyebrow}</div></div></button>; })}</div><aside className="h-fit rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-md)] xl:sticky xl:top-8"><div className="flex items-start justify-between"><div className="rounded-2xl bg-[hsl(var(--muted))] p-3 text-[hsl(var(--primary))]"><Icon size={23} /></div><button type="button" onClick={() => setFavorites(favorites.includes(selected.id) ? favorites.filter((id) => id !== selected.id) : [...favorites, selected.id])} aria-label="Salvar procedimento" data-testid="button-save-selected-procedure" className={`rounded-xl p-2 ${favorites.includes(selected.id) ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}><Star size={19} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} /></button></div><div className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">{selected.eyebrow}</div><h2 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-[-.03em]">{selected.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{selected.description}</p><div className="my-6 h-px bg-[hsl(var(--border))]" /><div className="space-y-4">{selected.steps.map((step, index) => <div key={step} className="flex gap-3 text-sm leading-5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-xs font-bold text-[hsl(var(--foreground))]">{index + 1}</span><span>{step}</span></div>)}</div><button type="button" onClick={toggleDone} data-testid="button-complete-procedure" className={`mt-7 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors ${isDone ? 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'}`}>{isDone ? <><Check size={17} /> Revisar concluído</> : <><CheckCircle2 size={17} /> Marcar como visto</>}</button></aside></div><div className="mt-12 rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)] p-6 sm:p-8"><div className="flex items-start gap-4"><div className="rounded-2xl bg-[hsl(var(--card))] p-3 text-[hsl(var(--primary))]"><Info size={20} /></div><div><h3 className="font-serif text-xl font-bold">Onde o corpo costuma sofrer</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Pescoço, ombros, lombar, punhos e pernas podem sinalizar sobrecarga. Dor persistente, formigamento, perda de força ou limitação de movimento merecem atenção e avaliação profissional.</p><Link href="/body" data-testid="link-learn-body-check" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">Observar meu corpo <ArrowRight size={15} /></Link></div></div></div></div>;
}

function QuickProtocol() {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const prompts = [
    { kicker: 'Antes de qualquer procedimento', title: 'Pare por um instante.', body: 'Você sabe o que vai fazer, quais materiais precisa e como vai terminar?', icon: ClipboardCheck },
    { kicker: 'Prepare o espaço', title: 'Traga tudo para perto.', body: 'Ajuste a altura do leito, organize os materiais e confira o caminho.', icon: Ruler },
    { kicker: 'Prepare o movimento', title: 'Fique de frente.', body: 'Aproxime-se, use as pernas e combine o movimento com o paciente e a equipe.', icon: Users },
    { kicker: 'Depois do cuidado', title: 'Recupere para continuar.', body: 'Pause, mova o corpo e registre o que precisa ser sinalizado.', icon: HeartPulse },
  ];
  const current = prompts[step];
  const CurrentIcon = current.icon;
  const toggle = () => setChecked((items) => items.map((item, index) => index === step ? !item : item));
  return <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><PageHeader kicker="Modo plantão" title="Quatro perguntas antes de mover." description="Um protocolo curto para consultar entre um cuidado e outro. Sem substituir avaliação clínica ou os protocolos da sua instituição." /><div className="overflow-hidden rounded-[30px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)]"><div className="flex items-center justify-between border-b border-[hsl(var(--primary-foreground)/.15)] px-6 py-5 sm:px-10"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--secondary))]"><Zap size={15} /> protocolo ergoenf</div><div className="text-sm font-bold">{step + 1}<span className="opacity-50"> / 4</span></div></div><div className="grid gap-8 px-6 py-10 sm:px-10 sm:py-14 md:grid-cols-[160px_1fr] md:items-center"><div className="flex h-32 w-32 items-center justify-center rounded-[34px] bg-[hsl(var(--primary-foreground)/.1)] text-[hsl(var(--secondary))] md:h-40 md:w-40"><CurrentIcon size={62} strokeWidth={1.3} /></div><div><div className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">{current.kicker}</div><h2 className="mt-3 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-6xl">{current.title}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--primary-foreground)/.75)]">{current.body}</p><button type="button" onClick={toggle} data-testid={`button-check-protocol-${step + 1}`} className={`mt-7 inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${checked[step] ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]' : 'border border-[hsl(var(--primary-foreground)/.28)]'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-lg ${checked[step] ? 'bg-[hsl(var(--primary)/.18)]' : 'bg-[hsl(var(--primary-foreground)/.1)]'}`}>{checked[step] && <Check size={15} />}</span>{checked[step] ? 'Feito para este cuidado' : 'Confirmar esta pergunta'}</button></div></div><div className="flex items-center justify-between border-t border-[hsl(var(--primary-foreground)/.15)] px-6 py-5 sm:px-10"><button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} data-testid="button-previous-protocol" className="inline-flex items-center gap-2 text-sm font-bold opacity-70 disabled:opacity-30"><ArrowLeft size={16} /> anterior</button><div className="flex gap-1.5">{prompts.map((prompt, index) => <button type="button" key={prompt.title} onClick={() => setStep(index)} aria-label={`Ir para etapa ${index + 1}`} data-testid={`button-protocol-dot-${index + 1}`} className={`h-2 rounded-full transition-all ${index === step ? 'w-8 bg-[hsl(var(--secondary))]' : 'w-2 bg-[hsl(var(--primary-foreground)/.3)]'}`} />)}</div><button type="button" onClick={() => setStep(Math.min(3, step + 1))} disabled={step === 3} data-testid="button-next-protocol" className="inline-flex items-center gap-2 text-sm font-bold disabled:opacity-30">próxima <ArrowRight size={16} /></button></div></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><Move className="text-[hsl(var(--accent))]" size={19} /><div className="mt-4 font-bold">Encurte o alcance</div><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Distância curta é esforço distribuído.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><Users className="text-[hsl(var(--accent))]" size={19} /><div className="mt-4 font-bold">Divida o esforço</div><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Peça ajuda quando precisar.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><Pause className="text-[hsl(var(--accent))]" size={19} /><div className="mt-4 font-bold">Dê uma pausa</div><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Recuperar também é parte do plantão.</p></div></div></div>;
}

function BodyCheckin() {
  const [entries, setEntries] = useStoredState<PainEntry[]>('ergoenf-pain-checkins', []);
  const [zone, setZone] = useState('Lombar');
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  const zones = ['Pescoço', 'Ombros', 'Lombar', 'Punhos', 'Pernas'];
  const save = (event: FormEvent) => { event.preventDefault(); const entry = { id: String(Date.now()), zone, intensity, note, date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }; setEntries([entry, ...entries].slice(0, 6)); setNote(''); setIntensity(3); };
  return <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><PageHeader kicker="Escuta corporal" title="Como está seu corpo hoje?" description="Um registro rápido não diagnostica nada. Ele ajuda você a perceber padrões e decidir quando procurar apoio." /><div className="grid gap-8 lg:grid-cols-[1fr_360px]"><form onSubmit={save} className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-sm)] sm:p-8"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[hsl(var(--secondary)/.55)] p-3 text-[hsl(var(--primary))]"><HeartPulse size={22} /></div><div><h2 className="font-serif text-2xl font-bold">Registre um sinal</h2><p className="text-sm text-[hsl(var(--muted-foreground))]">Leva menos de um minuto.</p></div></div><fieldset className="mt-8"><legend className="text-sm font-bold">Onde você sente mais hoje?</legend><div className="mt-3 flex flex-wrap gap-2">{zones.map((item) => <button type="button" key={item} onClick={() => setZone(item)} data-testid={`button-zone-${item.toLowerCase()}`} className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${zone === item ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}>{item}</button>)}</div></fieldset><div className="mt-8"><div className="flex items-center justify-between"><label htmlFor="intensity" className="text-sm font-bold">Intensidade percebida</label><span className="rounded-lg bg-[hsl(var(--secondary))] px-2.5 py-1 text-sm font-bold">{intensity}/5</span></div><input id="intensity" type="range" min="1" max="5" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} data-testid="input-pain-intensity" className="mt-5 h-2 w-full cursor-pointer accent-[hsl(var(--primary))]" /><div className="mt-2 flex justify-between text-[11px] text-[hsl(var(--muted-foreground))]"><span>leve</span><span>forte</span></div></div><div className="mt-8"><label htmlFor="pain-note" className="text-sm font-bold">Quer deixar uma nota?</label><textarea id="pain-note" value={note} onChange={(event) => setNote(event.target.value)} data-testid="input-pain-note" placeholder="Ex.: apareceu depois de transferências..." className="mt-3 min-h-[96px] w-full resize-none rounded-2xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3.5 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)/.2)]" /></div><button type="submit" data-testid="button-save-pain-checkin" className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--primary))] px-4 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))]"><Check size={17} /> Salvar check-in</button></form><div className="space-y-4"><div className="rounded-[26px] bg-[hsl(var(--secondary)/.4)] p-6"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]"><Info size={15} /> sinais de atenção</div><p className="mt-4 text-sm leading-6">Dor persistente, formigamento, perda de força ou limitação de movimento não devem ser ignorados.</p><p className="mt-3 text-xs leading-5 text-[hsl(var(--foreground)/.65)]">Este check-in é educativo e não substitui avaliação clínica. Converse com um profissional de saúde quando necessário.</p></div><div className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center justify-between"><h3 className="font-serif text-xl font-bold">Seus registros</h3>{entries.length > 0 && <span className="text-xs text-[hsl(var(--muted-foreground))]">{entries.length} salvos</span>}</div>{entries.length === 0 ? <div className="py-8 text-center"><Activity className="mx-auto text-[hsl(var(--muted-foreground))]" size={25} /><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Ainda não há registros.</p></div> : <div className="mt-5 space-y-3">{entries.slice(0, 4).map((entry) => <div key={entry.id} className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3 last:border-0 last:pb-0"><div><div className="text-sm font-bold">{entry.zone}</div><div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{entry.date}{entry.note && ` · ${entry.note}`}</div></div><span className={`rounded-lg px-2 py-1 text-xs font-bold ${entry.intensity >= 4 ? 'bg-[hsl(var(--accent)/.18)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'}`}>{entry.intensity}/5</span></div>)}</div>}</div></div></div></div>;
}

function GoldenRules() {
  return <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><PageHeader kicker="Para lembrar no movimento" title="Seis regras. Um jeito mais sustentável de cuidar." description="Não são passos rígidos: são escolhas simples para observar no ambiente e no próprio corpo." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rules.map((rule, index) => { const Icon = rule.icon; return <div key={rule.number} className={`animate-rise delay-${Math.min(index + 1, 4)} group relative overflow-hidden rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]`}><span className="absolute -right-2 -top-6 font-serif text-[100px] font-bold leading-none text-[hsl(var(--muted))]">{rule.number}</span><div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary)/.55)] text-[hsl(var(--primary))]"><Icon size={22} /></div><div className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">regra {rule.number}</div><h2 className="mt-2 font-serif text-2xl font-bold tracking-[-.03em]">{rule.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{rule.text}</p></div></div>; })}</div><div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[26px] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:flex-row sm:items-center sm:p-9"><div><div className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--secondary))]">leve para o próximo cuidado</div><h2 className="mt-2 font-serif text-2xl font-bold">Qual regra você precisa lembrar agora?</h2></div><Link href="/quick" data-testid="link-rules-to-quick" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[hsl(var(--secondary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--foreground))]">Abrir protocolo <Zap size={16} /></Link></div></div>;
}

function Progress({ completed, favorites }: { completed: string[]; favorites: string[] }) {
  const percentage = Math.round((completed.length / procedures.length) * 100);
  return <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><PageHeader kicker="Seu caminho" title="Progresso que cabe no plantão." description="Não é uma prova. É um jeito de voltar ao que funciona e construir repertório aos poucos." /><div className="grid gap-5 md:grid-cols-[280px_1fr]"><div className="flex flex-col items-center justify-center rounded-[28px] bg-[hsl(var(--primary))] p-8 text-center text-[hsl(var(--primary-foreground))]"><div className="relative flex h-48 w-48 items-center justify-center rounded-full" style={{ background: `conic-gradient(hsl(var(--secondary)) ${percentage}%, hsl(var(--primary-foreground) / .14) 0)` }}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[hsl(var(--primary))]"><span className="font-serif text-5xl font-bold">{percentage}%</span><span className="mt-1 text-xs opacity-70">da trilha</span></div></div><div className="mt-6 text-sm opacity-75">{completed.length} de {procedures.length} procedimentos vistos</div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><BookOpen className="text-[hsl(var(--primary))]" size={21} /><div className="mt-6 font-serif text-3xl font-bold">{completed.length}</div><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">procedimentos concluídos</div></div><div className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><Star className="text-[hsl(var(--accent))]" size={21} /><div className="mt-6 font-serif text-3xl font-bold">{favorites.length}</div><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">cuidados salvos para rever</div></div><div className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:col-span-2"><div className="flex items-center gap-2 text-[hsl(var(--primary))]"><Target size={19} /><span className="text-sm font-bold">Próximo passo sugerido</span></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{completed.length === 0 ? 'Comece pelo preparo antes de qualquer procedimento. É a base para os outros cuidados.' : completed.length < 4 ? 'Continue pelos cuidados de mobilização: aproximar, coordenar e pedir ajuda fazem diferença.' : 'Você já percorreu bastante. Reveja suas regras de ouro e observe o que mudou na rotina.'}</p><Link href={completed.length < 4 ? '/learn' : '/rules'} data-testid="link-progress-next-step" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">Continuar trilha <ArrowRight size={15} /></Link></div></div></div><div className="mt-10 rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="font-serif text-2xl font-bold">Mapa de procedimentos</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Volte onde fizer sentido para você.</p></div><span className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">8 temas</span></div><div className="mt-6 grid gap-2 sm:grid-cols-2">{procedures.map((procedure) => <Link href="/learn" key={procedure.id} data-testid={`link-progress-procedure-${procedure.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-[hsl(var(--muted))]"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${completed.includes(procedure.id) ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{completed.includes(procedure.id) ? <Check size={15} /> : <procedure.icon size={15} />}</div><span className="flex-1 text-sm font-semibold">{procedure.title}</span>{completed.includes(procedure.id) && <span className="text-xs font-bold text-[hsl(var(--primary))]">visto</span>}</Link>)}</div></div></div>;
}

function AboutProject() {
  return <section id="about" className="mt-14 border-t border-[hsl(var(--border))] pt-10"><div className="grid gap-8 lg:grid-cols-[1fr_1fr]"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]"><Landmark size={15} /> sobre este guia</div><h2 className="mt-3 max-w-xl font-serif text-3xl font-bold leading-tight tracking-[-.03em]">Nascido do cotidiano de um hospital universitário brasileiro.</h2></div><div className="text-sm leading-7 text-[hsl(var(--muted-foreground))]"><p>O ErgoEnf organiza temas do ebook sobre ergonomia, carga musculoesquelética e práticas de enfermagem em uma experiência para consulta. O projeto será testado com profissionais para entender se o conteúdo é claro, aplicável e útil durante a rotina.</p><p className="mt-4">A proposta não é criar novas regras para o cuidado: é tornar visíveis escolhas de postura, organização e trabalho em equipe que podem ser feitas antes, durante e depois dos procedimentos.</p></div></div><div className="mt-8 flex items-start gap-3 rounded-2xl bg-[hsl(var(--muted)/.65)] p-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><span><strong className="text-[hsl(var(--foreground))]">Nota de segurança:</strong> este aplicativo é educativo e não substitui avaliação clínica, protocolos institucionais ou orientação de profissionais habilitados.</span></div></section>;
}

function About() {
  return <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><PageHeader kicker="Contexto do projeto" title="Cuidar de quem cuida também é pesquisa." description="O ErgoEnf traduz o conteúdo do ebook em uma ferramenta de consulta para profissionais de enfermagem em hospitais universitários brasileiros." /><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-[26px] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:col-span-2"><Landmark size={24} className="text-[hsl(var(--secondary))]" /><h2 className="mt-8 max-w-xl font-serif text-3xl font-bold">A carga musculoesquelética não aparece só no fim do plantão.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.72)]">Ela pode se acumular em posturas mantidas, alcances longos, torções, transferências e na repetição. Por isso o guia começa antes do procedimento e termina na recuperação.</p></div><div className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7"><Search className="text-[hsl(var(--accent))]" size={22} /><h2 className="mt-6 font-serif text-2xl font-bold">Como será testado</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">A experiência será observada com profissionais para avaliar clareza, aplicabilidade e adequação ao contexto real de trabalho.</p></div><div className="rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7"><Stethoscope className="text-[hsl(var(--primary))]" size={22} /><h2 className="mt-6 font-serif text-2xl font-bold">Para quem é</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Para quem prepara, executa, registra e compartilha cuidados de enfermagem — em cada turno, em cada setor.</p></div></div><Link href="/" data-testid="link-about-home" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><ArrowLeft size={16} /> Voltar para visão geral</Link></div>;
}

function NotFound() {
  return <div className="flex min-h-[80dvh] flex-col items-center justify-center px-5 text-center"><div className="rounded-2xl bg-[hsl(var(--secondary))] p-4"><CircleHelp size={28} /></div><h1 className="mt-6 font-serif text-4xl font-bold">Essa página saiu para uma pausa.</h1><Link href="/" data-testid="link-not-found-home" className="mt-6 rounded-2xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Voltar ao início</Link></div>;
}

function AppContent() {
  const [completed, setCompleted] = useStoredState<string[]>('ergoenf-progress', []);
  const [favorites, setFavorites] = useStoredState<string[]>('ergoenf-favorites', []);
  return <Shell><Switch><Route path="/learn"><Learn completed={completed} setCompleted={setCompleted} favorites={favorites} setFavorites={setFavorites} /></Route><Route path="/quick"><QuickProtocol /></Route><Route path="/body"><BodyCheckin /></Route><Route path="/rules"><GoldenRules /></Route><Route path="/progress"><Progress completed={completed} favorites={favorites} /></Route><Route path="/about"><About /></Route><Route path="/"><Overview completed={completed} favorites={favorites} setFavorites={setFavorites} /></Route><Route component={NotFound} /></Switch></Shell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppContent /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;