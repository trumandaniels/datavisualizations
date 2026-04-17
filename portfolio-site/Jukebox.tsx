import { AnimatePresence, motion } from 'motion/react';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import absenteeDashboard from '../AbsenteeStudents/dashboard-screenshot.png';
import budgetFeatureImportance from '../Budgets/FeatureImportance.png';
import h1bApprovals from '../H1B/h-1b_approvals.png';
import mesaLoans from '../mesaloans/mesa-az-loans.png';
import { AbsenteeDashboardScreen, type MetricKey } from './AbsenteeDashboardScreen';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Project = {
  id: number;
  title: string;
  eyebrow: string;
  description: string;
  tags: string[];
  posterImage: string;
  imageFit: string;
  imageTint: string;
  href: string;
  hrefLabel: string;
  locationLabel: string;
  statusLabel: string;
  previewKind: 'absentee' | 'static';
};

const projects: readonly Project[] = [
  {
    id: 1,
    title: 'US Student Absenteeism Dashboard',
    eyebrow: 'Education Dashboard',
    description: 'An interactive state-by-state dashboard for chronic absenteeism and demographic comparisons.',
    tags: ['Dashboard', 'Education', 'Hosted'],
    posterImage: absenteeDashboard,
    imageFit: 'object-cover object-top',
    imageTint: 'from-sky-500/8 via-transparent to-emerald-500/12',
    href: '/projects/absentee-dashboard',
    hrefLabel: 'Open Project Page',
    locationLabel: 'portfolio://absentee-dashboard',
    statusLabel: 'Hosted On-Site',
    previewKind: 'absentee',
  },
  {
    id: 2,
    title: 'Los Angeles Budget Forecasting',
    eyebrow: 'Budget Model Storytelling',
    description: 'Feature-importance storytelling around a city budget prediction model grounded in public finance data.',
    tags: ['Forecasting', 'Finance', 'Notebook'],
    posterImage: budgetFeatureImportance,
    imageFit: 'object-contain',
    imageTint: 'from-amber-500/10 via-transparent to-rose-500/12',
    href: 'https://colab.research.google.com/drive/1iqlMezyD1rOJBr6-OkHf2YEiaGhEilUA',
    hrefLabel: 'Open Notebook',
    locationLabel: 'colab://la-budget-forecasting',
    statusLabel: 'External Notebook',
    previewKind: 'static',
  },
  {
    id: 3,
    title: 'H-1B Approvals Over Time',
    eyebrow: 'Immigration Trends',
    description: 'A clean longitudinal trend view built from fifteen USCIS files merged into one portfolio-ready series.',
    tags: ['Time Series', 'Policy', 'Cleaning'],
    posterImage: h1bApprovals,
    imageFit: 'object-contain',
    imageTint: 'from-blue-500/10 via-transparent to-indigo-500/12',
    href: 'https://colab.research.google.com/drive/1Rz_YG0UtCvS_deUtcmjkV_lxchUd48pN',
    hrefLabel: 'Open Notebook',
    locationLabel: 'colab://h1b-approvals',
    statusLabel: 'External Notebook',
    previewKind: 'static',
  },
  {
    id: 4,
    title: 'Mesa Outstanding Loans',
    eyebrow: 'Municipal Finance',
    description: 'A debt-service time series that turns municipal finance data into a clear single-view narrative.',
    tags: ['Municipal', 'Finance', 'Time Series'],
    posterImage: mesaLoans,
    imageFit: 'object-contain',
    imageTint: 'from-emerald-500/10 via-transparent to-cyan-500/12',
    href: 'https://colab.research.google.com/drive/1iThINxrnoHwjtwq1hIrDGq-pSenZB0yv',
    hrefLabel: 'Open Notebook',
    locationLabel: 'colab://mesa-outstanding-loans',
    statusLabel: 'External Notebook',
    previewKind: 'static',
  },
] as const;

type CardLayout = {
  x: number;
  z: number;
  rotateY: number;
  scale: number;
  absOffset: number;
};

type CardExamineState = {
  index: number;
  originX: number;
  originY: number;
  rotateX: number;
  rotateY: number;
  translateZ: number;
  scale: number;
};

type ScreenMode = 'card' | 'fullscreen';

const MAX_EXAMINE_ROTATION = 8;
const MAX_EXAMINE_SWIPE = 120;
const EXAMINE_LIFT = 18;
const EXAMINE_SCALE = 1.01;
const TRACK_SPRING = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 28,
  mass: 0.78,
};
const CARD_SPRING = {
  type: 'spring' as const,
  stiffness: 310,
  damping: 24,
  mass: 0.62,
};
const REFLECTION_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 26,
  mass: 0.74,
};
const WINDOW_PORTAL_SPRING = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 26,
  mass: 0.86,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCardLayout(index: number, activeIndex: number, hoveredIndex: number | null): CardLayout {
  const offset = index - activeIndex;
  const isSelected = offset === 0;
  const isHovered = hoveredIndex === index;
  const absOffset = Math.abs(offset);
  const sign = Math.sign(offset);
  const baseX = 360;
  const spreadX = 92;

  let x = 0;
  let z = 0;
  let rotateY = 0;
  let scale = 1;

  if (!isSelected) {
    x = sign * (baseX + (absOffset - 1) * spreadX);
    if (isHovered) {
      z = -absOffset * 120 + 34;
      x += sign * 14;
    } else {
      z = -absOffset * 120;
    }
    rotateY = sign * -24;
    scale = Math.max(0.78, 1 - absOffset * 0.08);
  } else {
    z = 72;
  }

  return { x, z, rotateY, scale, absOffset };
}

function getCardExamineState(
  index: number,
  originX: number,
  originY: number,
  clientX: number,
  clientY: number,
): CardExamineState {
  const normalizedX = clamp((clientX - originX) / MAX_EXAMINE_SWIPE, -1, 1);
  const normalizedY = clamp((clientY - originY) / MAX_EXAMINE_SWIPE, -1, 1);
  const intensity = Math.min(Math.hypot(normalizedX, normalizedY), 1);

  return {
    index,
    originX,
    originY,
    rotateX: normalizedY * -MAX_EXAMINE_ROTATION,
    rotateY: normalizedX * MAX_EXAMINE_ROTATION,
    translateZ: EXAMINE_LIFT + intensity * 8,
    scale: EXAMINE_SCALE,
  };
}

function getAdjacentIndexFromClick(clickX: number, containerWidth: number, activeIndex: number) {
  const relativeX = clickX - containerWidth / 2;
  const activeHalfWidth = 300;

  if (Math.abs(relativeX) <= activeHalfWidth) {
    return activeIndex;
  }

  return relativeX < 0 ? Math.max(0, activeIndex - 1) : Math.min(projects.length - 1, activeIndex + 1);
}

function ScreenWindowFrame({
  project,
  mode,
  children,
}: {
  project: Project;
  mode: ScreenMode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden border border-white/55 bg-white/56 ring-1 ring-white/55 backdrop-blur-[38px] supports-[backdrop-filter]:bg-white/34',
        mode === 'fullscreen'
          ? 'rounded-[2rem] shadow-[0_32px_110px_-52px_rgba(15,23,42,0.38)]'
          : 'rounded-[1.65rem] shadow-[0_24px_72px_-40px_rgba(15,23,42,0.28)]',
      )}
    >
      <div className="flex items-center gap-3 border-b border-neutral-900/8 bg-[#fcfaf6]/60 px-4 py-3 backdrop-blur-[32px] supports-[backdrop-filter]:bg-[#fcfaf6]/38">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff8679]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f6c152]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#66c374]" />
        </div>
        <span className="rounded-full border border-neutral-900/8 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
          {project.statusLabel}
        </span>
      </div>
      <div className="min-h-0 flex-1 bg-[#f7f2e8] p-3 sm:p-4">{children}</div>
    </div>
  );
}

function StaticProjectScreen({
  project,
  mode,
  onOpenProject,
  onRequestExpand,
}: {
  project: Project;
  mode: ScreenMode;
  onOpenProject: () => void;
  onRequestExpand?: () => void;
}) {
  const isFullscreen = mode === 'fullscreen';

  return (
    <div
      className={cn(
        'grid h-full min-h-0 gap-3',
        isFullscreen ? 'xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]',
      )}
    >
      <div
        className={cn(
          'space-y-4 rounded-[1.7rem] border border-neutral-900/8 bg-white/82',
          isFullscreen ? 'p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.24)]' : 'p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.2)]',
        )}
      >
        <div className="space-y-3">
          <p className={cn('font-semibold uppercase tracking-[0.28em] text-neutral-500', isFullscreen ? 'text-xs' : 'text-[10px]')}>
            {project.eyebrow}
          </p>
          <h2
            className={cn(
              'font-semibold leading-[0.92] tracking-[-0.05em] text-neutral-950',
              isFullscreen ? 'text-[2.75rem]' : 'text-[clamp(1.8rem,2.8vw,3rem)]',
            )}
          >
            {project.title}
          </h2>
          <p className={cn('text-neutral-600', isFullscreen ? 'text-base leading-7' : 'text-sm leading-6')}>
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-900/8 bg-[#fff8ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.4rem] border border-neutral-900/8 bg-[#fffaf3] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Preview</p>
            <p className={cn('mt-2 font-semibold tracking-[-0.05em] text-neutral-950', isFullscreen ? 'text-4xl' : 'text-[1.8rem]')}>
              Screen
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">A framed mini-site presentation instead of a bare exported chart image.</p>
          </div>
          <div className="rounded-[1.4rem] border border-neutral-900/8 bg-[#fffaf3] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Action</p>
            <p className={cn('mt-2 font-semibold tracking-[-0.05em] text-neutral-950', isFullscreen ? 'text-4xl' : 'text-[1.8rem]')}>
              Double Click
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Expand the active screen to inspect the full visualization before jumping to the notebook.</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          onClick={(event) => {
            event.stopPropagation();
            onOpenProject();
          }}
        >
          {project.hrefLabel}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <section className="relative min-h-0">
        <div className="rounded-[1.9rem] border border-neutral-900/8 bg-white/88 p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.24)]">
          <div className="mb-3 flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Visualization Preview</p>
              <h3 className={cn('font-semibold tracking-[-0.03em] text-neutral-950', isFullscreen ? 'text-xl' : 'text-base')}>
                Full figure inside a project screen
              </h3>
            </div>
            {onRequestExpand && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRequestExpand();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
              >
                <Expand className="h-4 w-4" />
                Expand
              </button>
            )}
          </div>

          <div
            className={cn(
              'relative overflow-hidden rounded-[1.65rem] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f2e8_100%)] p-4 ring-1 ring-neutral-900/6',
              isFullscreen ? 'h-[calc(100vh-16rem)] min-h-[30rem]' : 'h-full min-h-[21rem]',
            )}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br', project.imageTint)} />
            <img
              src={project.posterImage}
              alt={project.title}
              className={cn('relative z-10 h-full w-full rounded-[1.1rem] bg-[#fffaf2]', project.imageFit)}
              draggable={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export function Jukebox() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [examinedCard, setExaminedCard] = useState<CardExamineState | null>(null);
  const [isExamining, setIsExamining] = useState(false);
  const [expandedProjectIndex, setExpandedProjectIndex] = useState<number | null>(null);
  const [absenteeMetric, setAbsenteeMetric] = useState<MetricKey>('Total Students');
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const expandedProject = expandedProjectIndex === null ? null : projects[expandedProjectIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (expandedProjectIndex !== null) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((previous) => Math.max(0, previous - 1));
      } else if (event.key === 'ArrowRight') {
        setActiveIndex((previous) => Math.min(projects.length - 1, previous + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedProjectIndex]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpandedProjectIndex(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (expandedProjectIndex !== null) {
        return;
      }

      event.preventDefault();

      if (wheelTimeout.current) {
        return;
      }

      const threshold = 30;
      if (Math.abs(event.deltaX) > threshold || Math.abs(event.deltaY) > threshold) {
        if (event.deltaX > 0 || event.deltaY > 0) {
          setActiveIndex((previous) => Math.min(projects.length - 1, previous + 1));
        } else {
          setActiveIndex((previous) => Math.max(0, previous - 1));
        }

        wheelTimeout.current = setTimeout(() => {
          wheelTimeout.current = null;
        }, 260);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, [expandedProjectIndex]);

  useEffect(() => {
    if (expandedProjectIndex !== null) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [expandedProjectIndex]);

  const handleNext = () => {
    setActiveIndex((previous) => Math.min(projects.length - 1, previous + 1));
  };

  const handlePrev = () => {
    setActiveIndex((previous) => Math.max(0, previous - 1));
  };

  const handleTrackClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextIndex = getAdjacentIndexFromClick(event.clientX - bounds.left, bounds.width, activeIndex);

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const releaseExaminedCard = () => {
    setExaminedCard(null);
    setIsExamining(false);
  };

  const updateExaminedCard = (index: number, event: ReactPointerEvent<HTMLDivElement>) => {
    setExaminedCard((current) => {
      const originX = current?.index === index ? current.originX : event.clientX;
      const originY = current?.index === index ? current.originY : event.clientY;

      return getCardExamineState(index, originX, originY, event.clientX, event.clientY);
    });
  };

  const openProject = (index: number) => {
    const project = projects[index];

    if (project.href.startsWith('/')) {
      navigate(project.href);
      return;
    }

    window.open(project.href, '_blank', 'noopener,noreferrer');
  };

  const openExpandedPreview = (index: number) => {
    setExpandedProjectIndex(index);
  };

  const renderProjectScreen = (project: Project, index: number, mode: ScreenMode, allowExpand = true) => {
    if (project.previewKind === 'absentee') {
      return (
        <AbsenteeDashboardScreen
          layout={mode === 'fullscreen' ? 'fullscreen' : 'card'}
          selectedMetric={absenteeMetric}
          onSelectedMetricChange={setAbsenteeMetric}
          onRequestExpand={allowExpand ? () => openExpandedPreview(index) : undefined}
        />
      );
    }

    return (
      <StaticProjectScreen
        project={project}
        mode={mode}
        onOpenProject={() => openProject(index)}
        onRequestExpand={allowExpand ? () => openExpandedPreview(index) : undefined}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen min-h-[100svh] w-screen items-center justify-center overflow-hidden bg-neutral-100/50 isolate perspective-[1800px] touch-pan-y"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(255,255,255,0))]" />
      <div className="absolute bottom-[11%] h-5 w-[80%] rounded-[100%] bg-gradient-to-r from-neutral-200/0 via-neutral-300/80 to-neutral-200/0 blur-sm" />

      <motion.div
        className="relative flex h-full w-full items-center justify-center touch-none"
        style={{ transformStyle: 'preserve-3d' }}
        drag={isExamining ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onClick={handleTrackClick}
        onDragEnd={(_event, info) => {
          const swipeThreshold = 50;
          if (info.offset.x < -swipeThreshold) {
            handleNext();
          } else if (info.offset.x > swipeThreshold) {
            handlePrev();
          }
        }}
      >
        <AnimatePresence>
          {projects.map((project, index) => {
            const offset = index - activeIndex;
            const isSelected = offset === 0;
            const isHovered = hoveredIndex === index;
            const { x, z, rotateY, scale, absOffset } = getCardLayout(index, activeIndex, hoveredIndex);

            return (
              <motion.div
                key={project.id}
                className={cn(
                  'absolute flex origin-center items-center justify-center will-change-transform transition-shadow duration-500',
                  isExamining && examinedCard?.index === index ? 'cursor-grabbing' : isSelected ? 'cursor-grab' : 'cursor-pointer',
                  isSelected ? 'z-50' : 'z-10',
                )}
                style={{ zIndex: 50 - absOffset }}
                initial={false}
                animate={{
                  x,
                  z,
                  rotateY,
                  scale,
                  y: isSelected ? -10 : 0,
                  opacity: absOffset > 3 ? 0 : 1,
                }}
                transition={TRACK_SPRING}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTap={() => {
                  setActiveIndex(index);
                }}
              >
                <motion.div
                  className={cn(
                    'relative overflow-hidden rounded-[28px] border border-white/55 bg-white/46 backdrop-blur-[42px] supports-[backdrop-filter]:bg-white/26 transition-all duration-300',
                    isSelected
                      ? 'h-[min(66vw,720px)] w-[min(92vw,1160px)] shadow-[0_30px_72px_-34px_rgba(15,23,42,0.34)] ring-1 ring-neutral-900/8'
                      : 'h-[min(48vw,520px)] w-[min(66vw,820px)] shadow-[0_20px_44px_-28px_rgba(15,23,42,0.22)] ring-1 ring-neutral-900/8',
                  )}
                  initial={false}
                  animate={{
                    rotateX: examinedCard?.index === index ? examinedCard.rotateX : 0,
                    rotateY: examinedCard?.index === index ? examinedCard.rotateY : 0,
                    z: examinedCard?.index === index ? examinedCard.translateZ : 0,
                    scale: examinedCard?.index === index ? examinedCard.scale : 1,
                  }}
                  transition={CARD_SPRING}
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  onPointerDownCapture={(event) => {
                    if (event.button === 0 && isSelected) {
                      event.stopPropagation();
                    }
                  }}
                  onPointerDown={(event) => {
                    if (event.button !== 0 || !isSelected) {
                      return;
                    }

                    setIsExamining(true);
                    updateExaminedCard(index, event);
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (!isExamining || examinedCard?.index !== index) {
                      return;
                    }

                    if ((event.buttons & 1) !== 1) {
                      releaseExaminedCard();
                      return;
                    }

                    updateExaminedCard(index, event);
                  }}
                  onDoubleClick={(event) => {
                    if (!isSelected) {
                      return;
                    }

                    event.stopPropagation();
                    openExpandedPreview(index);
                  }}
                  onPointerUp={(event) => {
                    if (event.button !== 0) {
                      return;
                    }

                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }

                    releaseExaminedCard();
                  }}
                  onPointerCancel={releaseExaminedCard}
                  onLostPointerCapture={releaseExaminedCard}
                >
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/72 via-white/30 to-neutral-900/12" />
                  <div className="pointer-events-none absolute inset-x-[10%] top-0 z-10 h-px bg-white/80 blur-[1px]" />
                  <div className={cn('pointer-events-none absolute inset-0 z-10 bg-gradient-to-br', project.imageTint)} />

                  <div
                    className={cn(
                      'absolute inset-[14px] z-0 transition-opacity duration-150',
                      expandedProjectIndex === index ? 'opacity-0' : 'opacity-100',
                    )}
                  >
                    <motion.div
                      layoutId={`project-window-${project.id}`}
                      className="h-full"
                      transition={WINDOW_PORTAL_SPRING}
                    >
                      <ScreenWindowFrame project={project} mode="card">
                        {renderProjectScreen(project, index, 'card')}
                      </ScreenWindowFrame>
                    </motion.div>
                  </div>

                  <div className="absolute left-7 top-7 z-20 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/58 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-700 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.5)] backdrop-blur-[26px] supports-[backdrop-filter]:bg-white/34">
                    {isSelected ? 'Double Click to Expand' : 'Mini Project Screen'}
                  </div>

                  {isSelected && (
                    <div
                      className={cn(
                        'pointer-events-none absolute left-7 right-7 bottom-7 z-20 rounded-[1.2rem] border border-white bg-white px-5 py-4 text-neutral-900 shadow-[0_24px_48px_-26px_rgba(15,23,42,0.32)] transition-opacity duration-300',
                        isHovered ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">{project.eyebrow}</p>
                      <h4 className="mt-1 text-[clamp(1.5rem,2.1vw,2.25rem)] font-semibold tracking-[-0.03em] text-neutral-950">{project.title}</h4>
                    </div>
                  )}

                  {!isSelected && (
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-x-5 bottom-5 z-20 rounded-[1.2rem] border border-white bg-white px-4 py-3 text-neutral-900 shadow-[0_24px_48px_-26px_rgba(15,23,42,0.32)] transition-opacity duration-300',
                        isHovered ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">{project.eyebrow}</p>
                      <h4 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-neutral-950">{project.title}</h4>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className={cn(
                    'pointer-events-none absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 overflow-hidden rounded-[22px]',
                    isSelected ? 'h-[14%] w-[70%]' : 'h-[10%] w-[58%]',
                  )}
                  initial={false}
                  animate={{
                    opacity: isSelected ? 0.16 : isHovered ? 0.05 : 0.025,
                    y: isSelected ? 2 : 6,
                    scaleY: isSelected ? 0.92 : 0.82,
                    scaleX: isSelected ? 0.98 : 0.9,
                  }}
                  transition={REFLECTION_SPRING}
                  style={{
                    transformOrigin: 'top center',
                    maskImage:
                      'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 28%, transparent 76%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 28%, transparent 76%)',
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                    <img
                      src={project.posterImage}
                      alt=""
                      aria-hidden="true"
                      className={cn('h-full w-full scale-y-[-1] select-none object-center opacity-70', project.imageFit)}
                      draggable={false}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/22 via-[#f7f4ee]/44 to-[#fdfcfb]/98" />
                  <div className="absolute inset-0 backdrop-blur-[3px]" />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="pointer-events-none absolute left-4 right-4 top-1/2 z-50 flex -translate-y-1/2 justify-between sm:left-8 sm:right-8">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200/60 bg-white/88 text-neutral-600 shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={activeIndex === projects.length - 1}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200/60 bg-white/88 text-neutral-600 shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {expandedProject && (
          <motion.div
            className="fixed inset-0 z-[120] bg-[#fdfaf2]/22 p-3 backdrop-blur-[3px] sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.46),_rgba(253,250,242,0.12)_58%,_rgba(253,250,242,0.02)_100%)]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            />
            <button
              type="button"
              onClick={() => setExpandedProjectIndex(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/78 text-white shadow-lg transition hover:bg-neutral-950 sm:right-5 sm:top-5"
              aria-label="Close expanded project preview"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0.92, scale: 0.986, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0.94, scale: 0.992, y: 6 }}
              transition={WINDOW_PORTAL_SPRING}
            >
              <motion.div
                layoutId={`project-window-${expandedProject.id}`}
                className="h-full w-full p-4 sm:p-6"
                transition={WINDOW_PORTAL_SPRING}
              >
                {renderProjectScreen(expandedProject, expandedProjectIndex, 'fullscreen', false)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
