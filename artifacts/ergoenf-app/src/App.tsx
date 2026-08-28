import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity, ArrowLeft, ArrowRight, Award, BookOpen, BriefcaseMedical, Check,
  CheckCircle2, ChevronRight, CircleHelp, ClipboardCheck, Droplets, FileText,
  HeartPulse, Home as HomeIcon, Info, Landmark, Menu, Move, Pause, Pill,
  RotateCcw, Ruler, Search, ShieldCheck, Sparkles, Star, Stethoscope, Target,
  Timer, Users, X, Zap, type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type MediaKind = 'photo' | 'diagram';
type Procedure = {
  id: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  command: string;
  focus: string;
  description: string;
  context: string;
  risks: string;
  image: string;
  imageAlt: string;
  mediaKind: MediaKind;
  time: string;
  icon: LucideIcon;
  steps: string[];
  tags: string[];
};

type PainEntry = { id: string; zone: string; intensity: number; note: string; date: string };

const procedures: Procedure[] = [
  {
    id: 'preparo', title: 'Prepare o leito', shortTitle: 'Preparo do leito',
    eyebrow: 'Antes de começar', command: 'Aproxime o leito antes de tocar no paciente.',
    focus: 'Altura, materiais e caminho livres', description: 'O primeiro movimento é organizar o cenário.',
    context: 'Antes de qualquer técnica específica, existe um conjunto de decisões que se aplica a toda situação de trabalho. A organização do ambiente, a regulagem da altura do leito e a antecipação dos materiais diminuem a improvisação e tornam o movimento mais previsível.',
    risks: 'Alcances longos, flexões lombares repetidas, materiais fora do campo de trabalho e movimentos imprevistos durante a assistência.',
    image: '/ebook-images/ebook-04.webp', imageAlt: 'Profissional ajustando a altura do leito antes de um cuidado',
    mediaKind: 'photo', time: '2 min', icon: ClipboardCheck, tags: ['altura', 'distância', 'ajuda'],
    steps: ['Leia o que será feito e reúna os materiais.', 'Ajuste a altura do leito para trabalhar perto da sua zona confortável.', 'Explique o cuidado ao paciente e combine os movimentos.', 'Peça ajuda quando a tarefa ou a condição do paciente exigir.'],
  },
  {
    id: 'banho', title: 'Banho no leito', shortTitle: 'Banho no leito',
    eyebrow: 'Higiene e conforto', command: 'Alterne os lados; não sustente o cuidado inclinado.',
    focus: 'Leito ajustado e alcance curto', description: 'Organize o cuidado por partes para não permanecer inclinado.',
    context: 'O banho no leito exige permanência próxima ao paciente, repetição e mudanças de lado. A postura protegida combina leito ajustado, materiais ao alcance e alternância de apoio para que o cuidado não seja sustentado pela lombar.',
    risks: 'Inclinação anterior prolongada, postura estática, repetição de flexões e torção do tronco ao alcançar o lado oposto do leito.',
    image: '/ebook-images/ebook-05.webp', imageAlt: 'Duas profissionais realizando higiene no leito com o corpo próximo à tarefa',
    mediaKind: 'photo', time: '4 min', icon: Droplets, tags: ['leito', 'alcance', 'pausas'],
    steps: ['Posicione o leito e deixe os materiais próximos.', 'Trabalhe por segmentos, alternando lados quando possível.', 'Mantenha o tronco de frente para a área do cuidado.', 'Faça uma breve pausa para mudar de posição antes de finalizar.'],
  },
  {
    id: 'higiene', title: 'Higiene íntima', shortTitle: 'Higiene íntima',
    eyebrow: 'Cuidado próximo', command: 'Desça com as pernas; não alcance curvando a coluna.',
    focus: 'Base firme e paciente reposicionado com ajuda', description: 'Proximidade e delicadeza também precisam de apoio.',
    context: 'A higiene íntima combina proximidade, delicadeza e mobilização do paciente. Elevar o leito, preparar todos os materiais e usar a base das pernas para se aproximar são escolhas simples que evitam sobrecarga acumulativa.',
    risks: 'Flexão lombar sustentada, rotação brusca para reposicionar o paciente e esforço concentrado na musculatura paravertebral.',
    image: '/ebook-images/ebook-07.webp', imageAlt: 'Profissional realizando higiene íntima em posição próxima ao leito',
    mediaKind: 'photo', time: '3 min', icon: ShieldCheck, tags: ['altura', 'pernas', 'apoio'],
    steps: ['Eleve o leito antes de iniciar e mantenha tudo ao alcance.', 'Flexione os joelhos e use as pernas para se aproximar.', 'Evite torcer o tronco para alcançar um lado do leito.', 'Se o paciente precisar ser reposicionado, solicite ajuda.'],
  },
  {
    id: 'mobilizacao', title: 'Mobilização e decúbito', shortTitle: 'Mobilizar / mudar decúbito',
    eyebrow: 'Movimento compartilhado', command: 'Combine o sinal antes de iniciar o movimento.',
    focus: 'Equipe, ritmo e dispositivo auxiliar', description: 'Mobilizar não é puxar. É aproximar, coordenar e dividir.',
    context: 'Mobilizar não é puxar. É aproximar, explicar, combinar um sinal e dividir o esforço. Lençóis móveis e dispositivos auxiliares, quando disponíveis, devem fazer parte do planejamento para reduzir a carga manual.',
    risks: 'Tração com a coluna, ausência de sincronismo, torção do tronco, distância excessiva e tentativa de realizar sozinho um movimento que exige equipe.',
    image: '/ebook-images/ebook-09.webp', imageAlt: 'Profissional apoiando paciente sentado à beira do leito',
    mediaKind: 'photo', time: '5 min', icon: Move, tags: ['coordenação', 'ajuda', 'distância'],
    steps: ['Explique o movimento e combine um sinal para iniciar.', 'Aproxime o paciente e use os recursos disponíveis.', 'Distribua o esforço entre as pessoas da equipe.', 'Faça o movimento com as pernas, sem puxar com a coluna.'],
  },
  {
    id: 'transferencia', title: 'Transferência do paciente', shortTitle: 'Transferir',
    eyebrow: 'Da cama à cadeira', command: 'Confira freios, caminho e apoio antes de levantar.',
    focus: 'Trajeto livre e capacidade de participação', description: 'O melhor movimento é aquele que foi preparado.',
    context: 'A transferência começa antes do primeiro movimento: confira o trajeto, os freios, a superfície e a capacidade de participação do paciente. Aproximar cama e cadeira reduz a distância e permite que a equipe trabalhe com mais controle.',
    risks: 'Queda, perda de equilíbrio, distância entre superfícies, equipamento sem freio e esforço de uma única pessoa acima do limite biomecânico.',
    image: '/ebook-images/ebook-10.webp', imageAlt: 'Dispositivos auxiliares usados para transferência segura de pacientes',
    mediaKind: 'diagram', time: '4 min', icon: Users, tags: ['caminho', 'freios', 'equipe'],
    steps: ['Confira o trajeto, a superfície e os freios dos equipamentos.', 'Ajuste as alturas e aproxime os pontos de transferência.', 'Avalie a necessidade de mais profissionais ou dispositivo auxiliar.', 'Mova de forma coordenada, respeitando a capacidade do paciente.'],
  },
  {
    id: 'acesso', title: 'Punção e medicação', shortTitle: 'Punção / medicação',
    eyebrow: 'Precisão sem sobrecarga', command: 'Apoie o membro e ajuste sua altura antes da punção.',
    focus: 'Visão, punho e antebraço apoiados', description: 'Mãos estáveis começam em um corpo apoiado.',
    context: 'Procedimentos de precisão também podem gerar carga quando repetidos muitas vezes. Ajustar a bancada, apoiar o membro, manter pescoço neutro e alternar entre sentado e em pé ajudam a preservar ombros, punhos e visão.',
    risks: 'Pescoço inclinado, punho sem apoio, alcance lateral, postura fixa e organização tardia de materiais e medicações.',
    image: '/ebook-images/ebook-12.webp', imageAlt: 'Profissional sentada realizando punção com o braço do paciente apoiado',
    mediaKind: 'photo', time: '3 min', icon: Pill, tags: ['apoio', 'punho', 'visão'],
    steps: ['Posicione o membro e os materiais para evitar alcance longo.', 'Apoie o corpo quando a tarefa exigir precisão.', 'Mantenha punho e antebraço em posição confortável.', 'Reorganize o ambiente antes de repetir o procedimento.'],
  },
  {
    id: 'dispositivos', title: 'Drenos e curativos', shortTitle: 'Drenos / curativos',
    eyebrow: 'Detalhes que pedem atenção', command: 'Fique de frente para o campo e aproxime o material.',
    focus: 'Coluna alinhada no acesso baixo', description: 'O detalhe não precisa custar uma postura desfavorável.',
    context: 'Drenos, bolsas e curativos pedem atenção aos detalhes sem deixar que o profissional alcance o campo de trabalho de forma desfavorável. Posicione o corpo de frente e dobre os joelhos quando o acesso estiver baixo.',
    risks: 'Acesso baixo com coluna curvada, tubos criando obstáculos, apoio insuficiente dos pés e inclinação do pescoço por tempo prolongado.',
    image: '/ebook-images/ebook-14.webp', imageAlt: 'Prancha didática com postura correta e incorreta para acesso a dreno',
    mediaKind: 'diagram', time: '3 min', icon: BriefcaseMedical, tags: ['alcance', 'organização', 'postura'],
    steps: ['Identifique drenos e bolsas antes de mudar a posição do paciente.', 'Organize o material do curativo próximo ao campo.', 'Evite trabalhar com o tronco torcido ou projetado à frente.', 'Registre o cuidado e sinalize qualquer dificuldade à equipe.'],
  },
  {
    id: 'transporte', title: 'Transporte e registros', shortTitle: 'Transporte / registro',
    eyebrow: 'Fechar o ciclo', command: 'Termine o cuidado sem carregar a fadiga para o próximo.',
    focus: 'Percurso, tela e recuperação', description: 'Deslocar, registrar e recuperar fazem parte do cuidado.',
    context: 'Carregar materiais, conduzir equipamentos e registrar informações também acumulam carga ao longo do turno. No posto, monitor na altura dos olhos, antebraços apoiados e alternância entre sentar e ficar em pé protegem o corpo.',
    risks: 'Carregamento incorreto, fadiga acumulada, desequilíbrio postural, cabeça inclinada diante da tela e longos períodos sem pausa.',
    image: '/ebook-images/ebook-15.webp', imageAlt: 'Profissional em estação de registro com tela elevada e apoio para os pés',
    mediaKind: 'photo', time: '2 min', icon: FileText, tags: ['deslocamento', 'registro', 'recuperação'],
    steps: ['Confira o percurso e os equipamentos antes de sair.', 'Alterne a tarefa de conduzir e mantenha os ombros relaxados.', 'No registro, aproxime a tela ou o papel em vez de curvar o pescoço.', 'Ao concluir, pause, mova-se e recupere-se antes do próximo cuidado.'],
  },
];

const rules = [
  { number: '01', title: 'Suba o leito.', text: 'Leito, maca e bancada devem trabalhar a favor do seu corpo.', icon: Ruler },
  { number: '02', title: 'Fique de frente.', text: 'Mude os pés antes de torcer o tronco para alcançar a tarefa.', icon: RotateCcw },
  { number: '03', title: 'Traga para perto.', text: 'Paciente, materiais e equipamentos devem estar dentro do alcance.', icon: Target },
  { number: '04', title: 'Use as pernas.', text: 'Aproxime-se e distribua o esforço na base, não apenas na coluna.', icon: Activity },
  { number: '05', title: 'Chame alguém.', text: 'Cuidar em equipe também é uma escolha de segurança.', icon: Users },
  { number: '06', title: 'Pare antes de insistir.', text: 'Se a posição não funciona, reorganize o cenário e recomece.', icon: Pause },
];

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) as T : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } }, [key, value]);
  return [value, setValue] as const;
}

function LogoMark() {
  return <div className="flex items-center gap-3" data-testid="brand-ergoenf"><div className="brand-mark"><Activity size={20} strokeWidth={2.6} /><span /></div><div><div className="font-serif text-xl font-bold leading-none tracking-[-.04em]">ergoenf</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[.22em] text-[hsl(var(--muted-foreground))]">decida antes de mover</div></div></div>;
}

const navItems = [
  { href: '/', label: 'Plantão', icon: HomeIcon },
  { href: '/learn', label: 'Cenas do cuidado', icon: BookOpen },
  { href: '/quick', label: 'Antes de mover', icon: Zap },
  { href: '/body', label: 'Sinais do corpo', icon: HeartPulse },
  { href: '/rules', label: 'Seis decisões', icon: Award },
  { href: '/progress', label: 'Repertório', icon: Sparkles },
];

function NavLinkItem({ href, label, icon: Icon, mobile = false }: { href: string; label: string; icon: LucideIcon; mobile?: boolean }) {
  const [location] = useLocation();
  const active = href === '/' ? location === '/' : location.startsWith(href);
  return <Link href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center ${mobile ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}><Icon size={18} strokeWidth={active ? 2.4 : 2} />{!mobile && <span>{label}</span>}{!mobile && active && <ChevronRight size={15} className="ml-auto opacity-70" />}{mobile && <span className="sr-only">{label}</span>}</Link>;
}

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-7 lg:flex">
      <LogoMark />
      <div className="mt-14 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Navegação</div>
      <nav className="mt-4 flex flex-col gap-1">{navItems.map((item) => <NavLinkItem key={item.href} {...item} />)}</nav>
      <div className="mt-auto border-t border-[hsl(var(--border))] pt-5"><div className="flex items-center gap-2 text-[hsl(var(--primary))]"><CircleHelp size={16} /><span className="text-xs font-bold">Quando parar</span></div><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Dor persistente, perda de força ou formigamento pedem pausa e avaliação profissional.</p></div>
    </aside>
    <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.94)] px-5 backdrop-blur-lg lg:hidden"><button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" data-testid="button-open-menu" className="rounded-lg p-2 hover:bg-[hsl(var(--muted))]"><Menu size={22} /></button><LogoMark /><Link href="/quick" data-testid="link-mobile-quick" className="rounded-lg bg-[hsl(var(--primary))] p-2.5 text-[hsl(var(--primary-foreground))]"><Zap size={18} /></Link></header>
    {menuOpen && <div className="fixed inset-0 z-40 bg-[hsl(var(--foreground)/.25)] lg:hidden" onClick={() => setMenuOpen(false)}><div className="h-full w-[86%] max-w-[320px] bg-[hsl(var(--card))] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><LogoMark /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" data-testid="button-close-menu" className="rounded-lg p-2 hover:bg-[hsl(var(--muted))]"><X size={20} /></button></div><nav className="mt-12 flex flex-col gap-1.5">{navItems.map((item) => <div key={item.href} onClick={() => setMenuOpen(false)}><NavLinkItem {...item} /></div>)}</nav></div></div>}
    <main className="pb-24 lg:ml-[248px] lg:pb-0">{children}</main>
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.96)] px-2 pt-2 backdrop-blur-xl lg:hidden">{navItems.slice(0, 5).map((item) => <NavLinkItem key={item.href} {...item} mobile />)}</nav>
  </div>;
}

function PageHeader({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return <div className="mb-9 max-w-3xl"><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-2 w-2 bg-[hsl(var(--accent))]" />{kicker}</div><h1 className="font-serif text-4xl font-bold leading-[1.02] tracking-[-.05em] sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">{description}</p></div>;
}

function ImageFrame({ procedure, compact = false }: { procedure: Procedure; compact?: boolean }) {
  return <figure className={`media-frame ${procedure.mediaKind === 'diagram' ? 'media-diagram' : ''} ${compact ? 'media-compact' : ''}`}><img src={procedure.image} alt={procedure.imageAlt} loading={compact ? 'lazy' : undefined} decoding="async" /><figcaption>{procedure.mediaKind === 'diagram' ? 'Prancha do guia · consulte a leitura completa' : 'Cena de referência do guia'}</figcaption></figure>;
}

function ProcedureRow({ procedure, done, favorite, onFavorite }: { procedure: Procedure; done: boolean; favorite: boolean; onFavorite: () => void }) {
  const Icon = procedure.icon;
  return <div className={`procedure-row ${done ? 'procedure-row-done' : ''}`} data-testid={`card-procedure-${procedure.id}`}><Link href={`/learn?procedure=${procedure.id}`} data-testid={`link-procedure-${procedure.id}`} className="flex min-w-0 flex-1 items-center gap-3"><div className="procedure-icon"><Icon size={20} /></div><div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate text-[15px] font-bold">{procedure.shortTitle}</span>{done && <CheckCircle2 size={15} className="shrink-0 text-[hsl(var(--primary))]" />}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><span>{procedure.command}</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--border))]" /><span>{procedure.time}</span></div></div></Link><button type="button" onClick={onFavorite} aria-label={favorite ? `Remover ${procedure.title} dos salvos` : `Salvar ${procedure.title}`} data-testid={`button-favorite-${procedure.id}`} className={`rounded-lg p-2 transition-colors ${favorite ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`}><Star size={17} fill={favorite ? 'currentColor' : 'none'} /></button><ChevronRight size={17} className="text-[hsl(var(--muted-foreground))]" /></div>;
}

function Overview({ completed, favorites, setFavorites }: { completed: string[]; favorites: string[]; setFavorites: (value: string[]) => void }) {
  const quickChoices = procedures.slice(0, 4);
  return <div className="mx-auto max-w-[1320px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
    <div className="mb-8 flex items-end justify-between gap-4"><div><div className="section-kicker">ErgoEnf / consulta de plantão</div><h1 className="mt-2 font-serif text-3xl font-bold tracking-[-.04em] sm:text-4xl">O que você vai fazer agora?</h1></div><Link href="/quick" className="hidden items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] sm:inline-flex"><Zap size={16} /> Antes de mover</Link></div>
    <section className="home-hero"><div className="home-hero-copy"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--secondary))]"><span className="signal-dot" /> decisão em menos de um minuto</div><h2 className="mt-5 max-w-xl font-serif text-5xl font-bold leading-[.97] tracking-[-.06em] sm:text-6xl">Antes de mover,<br />prepare o cuidado.</h2><p className="mt-5 max-w-lg text-[15px] leading-7 text-[hsl(var(--primary-foreground)/.76)]">Uma ferramenta para reconhecer o risco, aproximar o trabalho e escolher quando dividir o movimento.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/quick" data-testid="link-start-quick" className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--secondary))] px-4 py-3 text-sm font-bold text-[hsl(var(--secondary-foreground))]">Abrir as 4 perguntas <ArrowRight size={16} /></Link><Link href="/learn" data-testid="link-start-learning" className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--primary-foreground)/.3)] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Escolher um cuidado <BookOpen size={16} /></Link></div></div><div className="home-hero-image"><img src="/ebook-images/ebook-03.webp" alt="Equipe de enfermagem trabalhando ao redor de um leito hospitalar" decoding="async" /><div className="image-note"><span className="note-line" /><span>O cenário também faz parte da ergonomia.</span></div></div></section>
    <section className="mt-10 grid gap-8 xl:grid-cols-[1fr_340px]"><div><div className="mb-4 flex items-end justify-between"><div><div className="section-kicker">Escolha a cena</div><h2 className="mt-2 font-serif text-2xl font-bold tracking-[-.03em]">Onde está o seu próximo movimento?</h2></div><Link href="/learn" className="hidden items-center gap-1 text-sm font-bold text-[hsl(var(--primary))] sm:flex">8 cenas <ArrowRight size={15} /></Link></div><div className="grid gap-2">{quickChoices.map((procedure) => <ProcedureRow key={procedure.id} procedure={procedure} done={completed.includes(procedure.id)} favorite={favorites.includes(procedure.id)} onFavorite={() => setFavorites(favorites.includes(procedure.id) ? favorites.filter((id) => id !== procedure.id) : [...favorites, procedure.id])} />)}</div><Link href="/learn" className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] px-4 py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">Ver as outras cenas do cuidado <ArrowRight size={15} className="ml-2" /></Link></div><div className="space-y-3"><div className="decision-card"><div className="flex items-start justify-between"><div><div className="section-kicker text-[hsl(var(--accent))]">Sinal corporal</div><h2 className="mt-2 font-serif text-2xl font-bold">Há algo que muda sua decisão?</h2></div><HeartPulse className="text-[hsl(var(--accent))]" size={25} /></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Registre dor, tensão ou formigamento e veja qual cuidado faz sentido agora.</p><Link href="/body" data-testid="link-body-checkin" className="mt-5 flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] px-4 py-3 text-sm font-bold">Escutar o corpo <ArrowRight size={16} /></Link></div><div className="mini-stat"><div className="flex items-center justify-between"><span>Repertório revisado</span><strong>{completed.length}<small>/8</small></strong></div><div className="progress-track mt-3"><span style={{ width: `${(completed.length / procedures.length) * 100}%` }} /></div><Link href="/progress" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">Ver o que falta <ArrowRight size={15} /></Link></div></div></section>
    <section className="mt-12 border-t border-[hsl(var(--border))] pt-8"><div className="grid gap-7 lg:grid-cols-[1fr_1fr]"><div><div className="section-kicker"><Landmark size={14} /> fonte e contexto</div><h2 className="mt-3 max-w-xl font-serif text-3xl font-bold leading-tight">A postura é uma escolha feita antes do esforço.</h2></div><div className="text-sm leading-7 text-[hsl(var(--muted-foreground))]"><p>O ErgoEnf transforma o guia de educação postural e ergonomia hospitalar em decisões consultáveis durante a rotina. O foco não é pontuar desempenho: é tornar visível o próximo ajuste possível.</p><Link href="/about" className="mt-4 inline-flex items-center gap-2 font-bold text-[hsl(var(--primary))]">Entender o projeto <ArrowRight size={15} /></Link></div></div></section>
  </div>;
}

function Learn({ completed, setCompleted, favorites, setFavorites }: { completed: string[]; setCompleted: (value: string[]) => void; favorites: string[]; setFavorites: (value: string[]) => void }) {
  const requestedId = new URLSearchParams(window.location.search).get('procedure');
  const [selectedId, setSelectedId] = useState(requestedId && procedures.some((procedure) => procedure.id === requestedId) ? requestedId : procedures[0].id);
  const [query, setQuery] = useState('');
  const selected = procedures.find((procedure) => procedure.id === selectedId) ?? procedures[0];
  const filtered = useMemo(() => procedures.filter((procedure) => `${procedure.title} ${procedure.command} ${procedure.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const Icon = selected.icon;
  const isDone = completed.includes(selected.id);
  const toggleDone = () => setCompleted(isDone ? completed.filter((id) => id !== selected.id) : [...completed, selected.id]);
  return <div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><PageHeader kicker="Biblioteca de decisões" title="Cenas do cuidado." description="Encontre o procedimento e veja qual ajuste reduz o esforço antes que ele vire improviso. As imagens são referências visuais do guia, não substituem protocolo institucional." /><div className="grid gap-8 xl:grid-cols-[390px_1fr]"><section><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cena, gesto ou região" aria-label="Buscar cena" /></label><div className="mt-4 space-y-2">{filtered.map((procedure) => { const ProcedureIcon = procedure.icon; const active = selected.id === procedure.id; return <button type="button" key={procedure.id} onClick={() => setSelectedId(procedure.id)} data-testid={`button-select-procedure-${procedure.id}`} className={`learn-list-item ${active ? 'learn-list-item-active' : ''}`}><div className="procedure-icon"><ProcedureIcon size={19} /></div><div className="min-w-0 text-left"><div className="truncate text-sm font-bold">{procedure.shortTitle}</div><div className={`mt-1 truncate text-xs ${active ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}`}>{procedure.command}</div></div><div className="ml-auto shrink-0">{completed.includes(procedure.id) ? <CheckCircle2 size={17} /> : <span className="text-xs font-bold">{procedure.time}</span>}</div></button>; })}{filtered.length === 0 && <div className="empty-state">Nenhuma cena encontrada.<br />Tente “leito”, “ajuda” ou “alcance”.</div>}</div></section><article className="detail-panel"><ImageFrame procedure={selected} /><div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><div className="section-kicker text-[hsl(var(--accent))]">{selected.eyebrow}</div><h2 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-[-.04em] sm:text-4xl">{selected.title}</h2></div><button type="button" onClick={() => setFavorites(favorites.includes(selected.id) ? favorites.filter((id) => id !== selected.id) : [...favorites, selected.id])} aria-label="Salvar procedimento" data-testid="button-save-selected-procedure" className={`rounded-lg border p-2.5 ${favorites.includes(selected.id) ? 'border-[hsl(var(--accent)/.4)] text-[hsl(var(--accent))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}><Star size={19} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} /></button></div><div className="decision-callout mt-6"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]"><Zap size={14} /> decisão principal</div><p className="mt-2 text-lg font-bold leading-snug">{selected.command}</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{selected.focus}</p></div><div className="mt-7 grid gap-6 md:grid-cols-[1.15fr_.85fr]"><div><h3 className="detail-heading">Por que observar isso</h3><p className="mt-2 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{selected.context}</p><h3 className="detail-heading mt-7">Principais riscos</h3><p className="mt-2 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{selected.risks}</p></div><div><h3 className="detail-heading">Como aplicar</h3><div className="mt-3 space-y-3">{selected.steps.map((step, index) => <div key={step} className="flex gap-3 text-sm leading-6"><span className="step-number">{index + 1}</span><span>{step}</span></div>)}</div><div className="mt-5 flex flex-wrap gap-2">{selected.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div></div></div><button type="button" onClick={toggleDone} data-testid="button-complete-procedure" className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-bold ${isDone ? 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'}`}>{isDone ? <><Check size={17} /> Revisar este cuidado novamente</> : <><CheckCircle2 size={17} /> Registrar que revisei este cuidado</>}</button></div></article></div></div>;
}

function QuickProtocol() {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);
  const [needsHelp, setNeedsHelp] = useState(false);
  const prompts = [
    { kicker: '01 · Pare', title: 'Você sabe o que vai fazer?', body: 'Leia a tarefa, reúna os materiais e antecipe como o cuidado termina.', icon: ClipboardCheck },
    { kicker: '02 · Aproxime', title: 'O espaço trabalha a seu favor?', body: 'Suba o leito, aproxime os materiais e deixe o caminho livre.', icon: Ruler },
    { kicker: '03 · Combine', title: 'Quem participa do movimento?', body: 'Explique, combine um sinal e decida se é hora de chamar alguém.', icon: Users },
    { kicker: '04 · Recupere', title: 'O corpo consegue continuar?', body: 'Pause, mude de posição e sinalize o que precisa ser revisto.', icon: HeartPulse },
  ];
  const current = prompts[step]; const CurrentIcon = current.icon;
  const toggle = () => setChecked((items) => items.map((item, index) => index === step ? !item : item));
  const completedSteps = checked.filter(Boolean).length;
  return <div className="mx-auto max-w-[1060px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><PageHeader kicker="Modo plantão" title="Quatro decisões antes de mover." description="Use entre um cuidado e outro. Não substitui avaliação clínica, treinamento ou protocolo da sua instituição." /><section className="quick-panel"><div className="flex items-center justify-between border-b border-[hsl(var(--primary-foreground)/.14)] px-6 py-4 sm:px-9"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--secondary))]"><Zap size={14} /> antes de mover</div><div className="text-sm font-bold">{String(step + 1).padStart(2, '0')} <span className="opacity-50">/ 04</span></div></div><div className="grid gap-8 px-6 py-10 sm:px-9 sm:py-14 md:grid-cols-[150px_1fr] md:items-center"><div className="quick-icon"><CurrentIcon size={56} strokeWidth={1.4} /></div><div><div className="text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">{current.kicker}</div><h2 className="mt-3 font-serif text-4xl font-bold leading-none tracking-[-.05em] sm:text-6xl">{current.title}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--primary-foreground)/.75)]">{current.body}</p><button type="button" onClick={toggle} data-testid={`button-check-protocol-${step + 1}`} className={`mt-7 inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold ${checked[step] ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]' : 'border border-[hsl(var(--primary-foreground)/.28)] text-[hsl(var(--primary-foreground))]'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-md ${checked[step] ? 'bg-[hsl(var(--primary)/.18)]' : 'bg-[hsl(var(--primary-foreground)/.1)]'}`}>{checked[step] && <Check size={15} />}</span>{checked[step] ? 'Decisão registrada' : 'Confirmar esta decisão'}</button></div></div><div className="flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--primary-foreground)/.14)] px-6 py-4 sm:px-9"><button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} data-testid="button-previous-protocol" className="inline-flex items-center gap-2 text-sm font-bold opacity-70 disabled:opacity-30"><ArrowLeft size={16} /> anterior</button><div className="flex gap-1.5">{prompts.map((prompt, index) => <button type="button" key={prompt.title} onClick={() => setStep(index)} aria-label={`Ir para etapa ${index + 1}`} data-testid={`button-protocol-dot-${index + 1}`} className={`h-2 rounded-full ${index === step ? 'w-8 bg-[hsl(var(--secondary))]' : checked[index] ? 'w-2 bg-[hsl(var(--secondary)/.7)]' : 'w-2 bg-[hsl(var(--primary-foreground)/.3)]'}`} />)}</div><button type="button" onClick={() => setStep(Math.min(3, step + 1))} disabled={step === 3} data-testid="button-next-protocol" className="inline-flex items-center gap-2 text-sm font-bold disabled:opacity-30">próxima <ArrowRight size={16} /></button></div></section><div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><span className="text-sm font-bold">{completedSteps}/4 decisões feitas</span><button type="button" onClick={() => setNeedsHelp(!needsHelp)} className="text-sm font-bold text-[hsl(var(--destructive))]">{needsHelp ? 'Fechar orientação' : 'Não consigo fazer com segurança'}</button></div>{needsHelp && <div className="help-panel mt-3"><div><ShieldCheck className="text-[hsl(var(--destructive))]" size={22} /><h3 className="mt-3 font-serif text-xl font-bold">Interrompa o improviso.</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Peça apoio à equipe, use o dispositivo disponível e siga o protocolo institucional. Se ainda não estiver seguro, não inicie o movimento.</p></div><Link href="/body" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[hsl(var(--foreground))] px-4 py-3 text-sm font-bold text-[hsl(var(--background))]">Registrar um sinal <ArrowRight size={15} /></Link></div>}</div>;
}

function BodyCheckin() {
  const [entries, setEntries] = useStoredState<PainEntry[]>('ergoenf-pain-checkins', []);
  const [zone, setZone] = useState('Lombar'); const [intensity, setIntensity] = useState(3); const [note, setNote] = useState('');
  const zones = ['Pescoço', 'Ombros', 'Lombar', 'Punhos', 'Pernas'];
  const save = (event: FormEvent) => { event.preventDefault(); const entry = { id: String(Date.now()), zone, intensity, note, date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }; setEntries([entry, ...entries].slice(0, 6)); setNote(''); setIntensity(3); };
  const guidance = intensity >= 4 ? { title: 'Mude o plano antes de insistir.', text: 'Peça apoio, reduza o alcance e sinalize se o sinal persistir.' } : intensity === 3 ? { title: 'Adapte o próximo cuidado.', text: 'Suba o leito, aproxime o material e evite sustentar a mesma posição.' } : { title: 'Observe e varie a posição.', text: 'Faça uma pausa curta, mova-se e perceba se o sinal muda.' };
  return <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><PageHeader kicker="Escuta corporal" title="Há algum sinal que muda o próximo cuidado?" description="Um registro rápido não diagnostica nada. Ele ajuda você a perceber padrões e escolher uma resposta mais segura para a próxima tarefa." /><div className="grid gap-8 lg:grid-cols-[1fr_370px]"><form onSubmit={save} className="form-panel"><div className="flex items-center gap-3"><div className="soft-icon"><HeartPulse size={22} /></div><div><h2 className="font-serif text-2xl font-bold">Registrar um sinal</h2><p className="text-sm text-[hsl(var(--muted-foreground))]">Leva menos de um minuto.</p></div></div><fieldset className="mt-8"><legend className="text-sm font-bold">Onde você sente mais hoje?</legend><div className="mt-3 flex flex-wrap gap-2">{zones.map((item) => <button type="button" key={item} onClick={() => setZone(item)} data-testid={`button-zone-${item.toLowerCase()}`} className={`rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${zone === item ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}>{item}</button>)}</div></fieldset><div className="mt-8"><div className="flex items-center justify-between"><label htmlFor="intensity" className="text-sm font-bold">Quanto isso interfere agora?</label><span className={`rounded-md px-2.5 py-1 text-sm font-bold ${intensity >= 4 ? 'bg-[hsl(var(--destructive)/.12)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--secondary))]'}`}>{intensity}/5</span></div><input id="intensity" type="range" min="1" max="5" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} data-testid="input-pain-intensity" className="mt-5 h-2 w-full cursor-pointer accent-[hsl(var(--primary))]" /><div className="mt-2 flex justify-between text-[11px] text-[hsl(var(--muted-foreground))]"><span>quase não interfere</span><span>precisa mudar o plano</span></div></div><div className="mt-8"><label htmlFor="pain-note" className="text-sm font-bold">O que estava acontecendo?</label><textarea id="pain-note" value={note} onChange={(event) => setNote(event.target.value)} data-testid="input-pain-note" placeholder="Ex.: apareceu depois de duas transferências..." className="mt-3 min-h-[96px] w-full resize-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3.5 text-sm outline-none focus:border-[hsl(var(--primary))]" /></div><button type="submit" data-testid="button-save-pain-checkin" className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))]"><Check size={17} /> Registrar e ver a próxima decisão</button></form><div className="space-y-4"><div className="guidance-card"><div className="section-kicker text-[hsl(var(--accent))]">Resposta para {zone.toLowerCase()}</div><h2 className="mt-3 font-serif text-2xl font-bold leading-tight">{guidance.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{guidance.text}</p><Link href="/quick" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]">Abrir as quatro decisões <ArrowRight size={15} /></Link></div><div className="history-panel"><div className="flex items-center justify-between"><h3 className="font-serif text-xl font-bold">Últimos sinais</h3>{entries.length > 0 && <span className="text-xs text-[hsl(var(--muted-foreground))]">{entries.length} registros</span>}</div>{entries.length === 0 ? <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]"><Activity className="mx-auto mb-3" size={24} />Ainda não há registros.</div> : <div className="mt-5 space-y-3">{entries.slice(0, 4).map((entry) => <div key={entry.id} className="history-row"><div><div className="text-sm font-bold">{entry.zone}</div><div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{entry.date}{entry.note && ` · ${entry.note}`}</div></div><span className={`rounded-md px-2 py-1 text-xs font-bold ${entry.intensity >= 4 ? 'bg-[hsl(var(--destructive)/.12)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'}`}>{entry.intensity}/5</span></div>)}</div>}</div></div></div></div>;
}

function GoldenRules() {
  return <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><PageHeader kicker="Consulte antes de mover" title="Seis decisões que evitam improviso." description="Não são passos rígidos. São perguntas simples para observar no ambiente e no próprio corpo antes de insistir em uma posição." /><div className="rules-grid">{rules.map((rule) => { const Icon = rule.icon; return <div key={rule.number} className="rule-card"><div className="flex items-start justify-between"><div className="soft-icon"><Icon size={21} /></div><span className="rule-number">{rule.number}</span></div><div className="mt-7 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">decisão {rule.number}</div><h2 className="mt-2 font-serif text-2xl font-bold tracking-[-.03em]">{rule.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{rule.text}</p></div>; })}</div><div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] sm:flex-row sm:items-center sm:p-8"><div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(var(--secondary))]">leve para o próximo cuidado</div><h2 className="mt-2 font-serif text-2xl font-bold">Qual decisão falta agora?</h2></div><Link href="/quick" data-testid="link-rules-to-quick" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[hsl(var(--secondary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--foreground))]">Abrir antes de mover <Zap size={16} /></Link></div></div>;
}

function Progress({ completed, favorites }: { completed: string[]; favorites: string[] }) {
  const [entries] = useStoredState<PainEntry[]>('ergoenf-pain-checkins', []);
  const percentage = Math.round((completed.length / procedures.length) * 100);
  const next = procedures.find((procedure) => !completed.includes(procedure.id)) ?? procedures[0];
  return <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><PageHeader kicker="Repertório de plantão" title="Volte ao que ajuda você a decidir." description="Aqui ficam as cenas que você já revisou, os cuidados salvos e o último sinal que registrou. Não é uma prova; é memória de trabalho." /><div className="progress-summary"><div><div className="section-kicker text-[hsl(var(--secondary))]">cenas revisadas</div><div className="mt-3 font-serif text-6xl font-bold">{completed.length}<span className="text-3xl opacity-50">/8</span></div><div className="mt-5 progress-track progress-track-light"><span style={{ width: `${percentage}%` }} /></div><p className="mt-3 text-sm text-[hsl(var(--primary-foreground)/.72)]">{percentage}% do repertório consultado</p></div><div className="progress-summary-side"><div><span>cuidados salvos</span><strong>{favorites.length}</strong></div><div><span>último sinal</span><strong>{entries[0]?.zone ?? 'nenhum'}</strong></div></div></div><div className="mt-8 grid gap-4 md:grid-cols-[1fr_320px]"><div className="panel"><div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold">Mapa de cenas</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Abra exatamente onde precisa rever.</p></div><BookOpen className="text-[hsl(var(--primary))]" size={21} /></div><div className="mt-6 grid gap-2 sm:grid-cols-2">{procedures.map((procedure) => <Link href={`/learn?procedure=${procedure.id}`} key={procedure.id} data-testid={`link-progress-procedure-${procedure.id}`} className="flex items-center gap-3 rounded-lg p-3 hover:bg-[hsl(var(--muted))]"><div className={`flex h-8 w-8 items-center justify-center rounded-md ${completed.includes(procedure.id) ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{completed.includes(procedure.id) ? <Check size={15} /> : <procedure.icon size={15} />}</div><span className="flex-1 text-sm font-semibold">{procedure.shortTitle}</span><ChevronRight size={15} className="text-[hsl(var(--muted-foreground))]" /></Link>)}</div></div><div className="panel"><div className="section-kicker"><Target size={14} /> próximo ajuste</div><h2 className="mt-3 font-serif text-2xl font-bold leading-tight">{completed.length === procedures.length ? 'Revisite uma cena importante.' : next.command}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{completed.length === procedures.length ? 'Todo plantão muda. Escolha uma cena e confira se o contexto ainda é o mesmo.' : next.focus}.</p><Link href={`/learn?procedure=${next.id}`} data-testid="link-progress-next-step" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]">Abrir cena <ArrowRight size={15} /></Link></div></div></div>;
}

function About() {
  return <div className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><PageHeader kicker="Sobre o ErgoEnf" title="Uma leitura prática da ergonomia hospitalar." description="O app traduz o conteúdo do guia de educação postural e ergonomia hospitalar para uma consulta rápida durante a rotina de enfermagem." /><div className="about-lead"><Landmark size={24} className="text-[hsl(var(--secondary))]" /><h2 className="mt-8 max-w-xl font-serif text-3xl font-bold">A postura é uma decisão do cenário, da equipe e do corpo.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.75)]">Mobilizações frequentes, posturas prolongadas, repetição e falta de recursos podem somar carga ao longo da jornada. O guia e o app tornam observáveis os ajustes que podem ser feitos antes, durante e depois dos cuidados.</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="panel"><Search className="text-[hsl(var(--accent))]" size={22} /><h2 className="mt-6 font-serif text-2xl font-bold">Como usar</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Escolha uma cena, leia a decisão principal e use o modo “Antes de mover” quando precisar de uma checagem curta.</p></div><div className="panel"><Stethoscope className="text-[hsl(var(--primary))]" size={22} /><h2 className="mt-6 font-serif text-2xl font-bold">Limites</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Este aplicativo é educativo. Não substitui protocolos institucionais, treinamento, avaliação clínica ou orientação de profissionais habilitados.</p></div></div><Link href="/" data-testid="link-about-home" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><ArrowLeft size={16} /> Voltar para o plantão</Link></div>;
}

function NotFound() {
  return <div className="flex min-h-[80dvh] flex-col items-center justify-center px-5 text-center"><div className="soft-icon"><CircleHelp size={28} /></div><h1 className="mt-6 font-serif text-4xl font-bold">Este caminho não existe.</h1><Link href="/" data-testid="link-not-found-home" className="mt-6 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Voltar para os cuidados</Link></div>;
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