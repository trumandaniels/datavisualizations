import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';
import { AbsenteeDashboardScreen, type MetricKey } from './AbsenteeDashboardScreen';

export function AbsenteeDashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('Total Students');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f2ea] text-neutral-900 selection:bg-amber-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(247,242,234,0))]" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur-sm transition hover:border-neutral-400 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <span className="rounded-full border border-emerald-600/15 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
            Hosted On-Site
          </span>
        </div>

        <AbsenteeDashboardScreen
          selectedMetric={selectedMetric}
          onSelectedMetricChange={setSelectedMetric}
          onRequestExpand={() => setIsExpanded(true)}
        />
      </main>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-[#fffdf8] p-4 pt-18 sm:p-6 sm:pt-20">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950/82 text-white shadow-lg transition hover:bg-neutral-950"
            aria-label="Minimize expanded map"
          >
            <X className="h-5 w-5" />
          </button>
          <AbsenteeDashboardScreen
            layout="fullscreen"
            selectedMetric={selectedMetric}
            onSelectedMetricChange={setSelectedMetric}
          />
        </div>
      )}
    </div>
  );
}
