import { AnimatePresence, motion } from 'motion/react';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import absenteeDashboard from '../AbsenteeStudents/dashboard-screenshot.png';
import budgetFeatureImportance from '../Budgets/FeatureImportance.png';
import h1bApprovals from '../H1B/h-1b_approvals.png';
import mesaLoans from '../mesaloans/mesa-az-loans.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const projects = [
  {
    id: 1,
    title: 'US Student Absenteeism Dashboard',
    description: 'An interactive state-by-state dashboard for chronic absenteeism and demographic comparisons.',
    tags: ['Dashboard', 'Education', 'Dash'],
    image: absenteeDashboard,
    imageFit: 'object-cover object-top',
    imageTint: 'from-sky-500/8 via-transparent to-emerald-500/12',
    href: 'https://absenteestudentsbystate.onrender.com/',
  },
  {
    id: 2,
    title: 'Los Angeles Budget Forecasting',
    description: 'Feature-importance storytelling around a city budget prediction model grounded in public finance data.',
    tags: ['Forecasting', 'Finance', 'Model'],
    image: budgetFeatureImportance,
    imageFit: 'object-contain',
    imageTint: 'from-amber-500/10 via-transparent to-rose-500/12',
    href: 'https://colab.research.google.com/drive/1iqlMezyD1rOJBr6-OkHf2YEiaGhEilUA',
  },
  {
    id: 3,
    title: 'H-1B Approvals Over Time',
    description: 'A clean longitudinal trend view built from fifteen USCIS files merged into one portfolio-ready series.',
    tags: ['Time Series', 'Policy', 'Cleaning'],
    image: h1bApprovals,
    imageFit: 'object-contain',
    imageTint: 'from-blue-500/10 via-transparent to-indigo-500/12',
    href: 'https://colab.research.google.com/drive/1Rz_YG0UtCvS_deUtcmjkV_lxchUd48pN',
  },
  {
    id: 4,
    title: 'Mesa Outstanding Loans',
    description: 'A debt-service time series that turns municipal finance data into a clear single-view narrative.',
    tags: ['Municipal', 'Finance', 'Time Series'],
    image: mesaLoans,
    imageFit: 'object-contain',
    imageTint: 'from-emerald-500/10 via-transparent to-cyan-500/12',
    href: 'https://colab.research.google.com/drive/1iThINxrnoHwjtwq1hIrDGq-pSenZB0yv',
  },
] as const;

type CardLayout = {
  x: number;
  z: number;
  rotateY: number;
  scale: number;
  absOffset: number;
  isSelected: boolean;
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

  return { x, z, rotateY, scale, absOffset, isSelected };
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

export function Jukebox() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [examinedCard, setExaminedCard] = useState<CardExamineState | null>(null);
  const [isExamining, setIsExamining] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setActiveIndex((previous) => Math.max(0, previous - 1));
      } else if (event.key === 'ArrowRight') {
        setActiveIndex((previous) => Math.min(projects.length - 1, previous + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
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
  }, []);

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
    window.open(projects[index].href, '_blank', 'noopener,noreferrer');
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
                    'relative overflow-hidden rounded-[28px] bg-white/96 transition-all duration-300',
                    isSelected
                      ? 'h-[min(62vw,640px)] w-[min(88vw,1040px)] shadow-[0_30px_72px_-34px_rgba(15,23,42,0.34)] ring-1 ring-neutral-900/8'
                      : 'h-[min(44vw,440px)] w-[min(58vw,720px)] shadow-[0_20px_44px_-28px_rgba(15,23,42,0.22)] ring-1 ring-neutral-900/8',
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
                    openProject(index);
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
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/52 via-white/14 to-neutral-900/6" />
                  <div className="pointer-events-none absolute inset-x-[10%] top-0 z-10 h-px bg-white/80 blur-[1px]" />
                  <div className={cn('pointer-events-none absolute inset-0 z-10 bg-gradient-to-br', project.imageTint)} />

                  <div className="absolute inset-[16px] overflow-hidden rounded-[22px] bg-[#f6f1e8] ring-1 ring-neutral-900/6">
                    <img
                      src={project.image}
                      alt={project.title}
                      className={cn('relative z-0 h-full w-full select-none bg-[#f8f6f1] object-center', project.imageFit)}
                      draggable={false}
                      loading={index === activeIndex ? 'eager' : 'lazy'}
                      decoding="async"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                      }}
                    />
                  </div>

                  <div className="absolute left-7 top-7 z-20 inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/82 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-700 shadow-sm backdrop-blur-sm">
                    Featured Project
                  </div>

                  {!isSelected && (
                    <div
                      className={cn(
                        'absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#09101d]/84 via-[#09101d]/40 to-transparent p-6 transition-opacity duration-300',
                        isHovered ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      <h4 className="max-w-xs text-xl font-semibold tracking-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.28)]">
                        {project.title}
                      </h4>
                    </div>
                  )}

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.08 } }}
                        transition={{ delay: 0.08, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-0 bottom-0 z-20 flex h-[48%] flex-col justify-end bg-gradient-to-t from-[#09101d]/92 via-[#09101d]/48 to-transparent p-8 text-white"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/20 bg-white/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/92 backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="mb-2 max-w-xl text-[clamp(2rem,2.8vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
                          {project.title}
                        </h3>
                        <p className="mb-5 max-w-xl text-sm font-medium leading-6 text-white/78">
                          {project.description}
                        </p>

                        <a
                          className="group inline-flex w-fit items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg transition-colors hover:bg-neutral-100"
                          href={project.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Open Project
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 overflow-hidden rounded-[22px]",
                    isSelected ? "h-[14%] w-[70%]" : "h-[10%] w-[58%]",
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
                    transformOrigin: "top center",
                    maskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 28%, transparent 76%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 28%, transparent 76%)",
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                    <img
                      src={project.image}
                      alt=""
                      aria-hidden="true"
                      className={cn("h-full w-full scale-y-[-1] select-none object-center opacity-70", project.imageFit)}
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
    </div>
  );
}
