import { useEffect, useMemo, useRef } from 'react';
import { Expand } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import absenteeCsv from '../AbsenteeStudents/AbsenteeSpreadsheetClean.csv?raw';

type ScreenLayout = 'card' | 'page' | 'fullscreen';

type MetricOption = {
  label: string;
  value: MetricKey;
};

export const METRIC_OPTIONS = [
  { label: 'Total Absentee Students', value: 'Total Students' },
  { label: 'American Indian or Alaska Native', value: 'American Indian or Alaska Native' },
  { label: 'Hispanic or Latino of any race', value: 'Hispanic or Latino of any race' },
  { label: 'Black or African American', value: 'Black or African American' },
  { label: 'Native Hawaiian or Other Pacific Islander', value: 'Native Hawaiian or Other Pacific Islander' },
  { label: 'Students With Disabilities Served Under IDEA', value: 'Students With Disabilities Served Under IDEA' },
  { label: 'Students With Disabilities Served Only Under Section 504', value: 'Students With Disabilities Served Only Under Section 504' },
  { label: 'English Language Learners', value: 'English Language Learners' },
  { label: 'Students Per School', value: 'Students Per School' },
] as const satisfies readonly MetricOption[];

export type MetricKey = (typeof METRIC_OPTIONS)[number]['value'];

type AbsenteeRow = {
  state: string;
  stateShort: string;
  metrics: Record<MetricKey, number>;
};

type PlotlyDiv = HTMLDivElement & {
  on: (eventName: string, handler: () => void) => void;
  removeAllListeners?: (eventName?: string) => void;
};

type AbsenteeDashboardScreenProps = {
  layout?: ScreenLayout;
  selectedMetric: MetricKey;
  onSelectedMetricChange: (metric: MetricKey) => void;
  onRequestExpand?: () => void;
};

const REQUIRED_COLUMNS = ['State', 'State Short', ...METRIC_OPTIONS.map((option) => option.value)] as const;
const CHART_GEO_BACKGROUND_COLOR = '#f8f2e8';

function parseNumberCell(value: string, rowIndex: number, column: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${column} on absentee row ${rowIndex + 2}: ${value}`);
  }

  return parsed;
}

function parseAbsenteeCsv(csvText: string): AbsenteeRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  const [headerLine, ...rowLines] = lines;
  const headers = headerLine.split(',');
  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  for (const column of REQUIRED_COLUMNS) {
    if (!headerIndex.has(column)) {
      throw new Error(`Absentee CSV is missing required column: ${column}`);
    }
  }

  return rowLines.map((line, rowIndex) => {
    const cells = line.split(',');
    if (cells.length !== headers.length) {
      throw new Error(
        `Absentee CSV row ${rowIndex + 2} has ${cells.length} cells, expected ${headers.length}.`,
      );
    }

    const metrics = Object.fromEntries(
      METRIC_OPTIONS.map((option) => [
        option.value,
        parseNumberCell(cells[headerIndex.get(option.value)!], rowIndex, option.value),
      ]),
    ) as Record<MetricKey, number>;

    return {
      state: cells[headerIndex.get('State')!],
      stateShort: cells[headerIndex.get('State Short')!],
      metrics,
    };
  });
}

const absenteeRows = parseAbsenteeCsv(absenteeCsv);

function getLayoutClasses(layout: ScreenLayout) {
  if (layout === 'card') {
    return {
      grid: 'grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]',
      panel: 'space-y-4 rounded-[1.7rem] border border-neutral-900/8 bg-white/82 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.24)]',
      eyebrow: 'text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-500',
      title: 'text-[clamp(2rem,3.1vw,3.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-neutral-950',
      description: 'text-sm leading-6 text-neutral-600',
      cardGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-1',
      statTitle: 'text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500',
      statValue: 'mt-2 text-[1.85rem] font-semibold tracking-[-0.05em] text-neutral-950',
      statBody: 'mt-2 text-sm leading-6 text-neutral-600',
      chartHeader: 'mb-3 flex items-center justify-between gap-4 px-1',
      chartTitle: 'text-base font-semibold tracking-[-0.03em] text-neutral-950',
      chartHeight: 'h-full min-h-[21rem] w-full',
      chartSurface: 'flex h-full min-h-0 flex-col rounded-[1.65rem] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f2e8_100%)] p-3 ring-1 ring-neutral-900/6',
    };
  }

  if (layout === 'fullscreen') {
    return {
      grid: 'grid h-full min-h-0 gap-6 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]',
      panel: 'space-y-5 rounded-[2rem] border border-neutral-900/8 bg-white/82 p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.28)] backdrop-blur-sm',
      eyebrow: 'text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500',
      title: 'text-5xl font-semibold leading-none tracking-[-0.05em] text-neutral-950',
      description: 'text-base leading-7 text-neutral-600',
      cardGrid: 'grid gap-3 sm:grid-cols-2',
      statTitle: 'text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500',
      statValue: 'mt-2 text-4xl font-semibold tracking-[-0.04em] text-neutral-950',
      statBody: 'mt-2 text-sm leading-6 text-neutral-600',
      chartHeader: 'mb-4 flex items-center justify-between gap-4 px-2',
      chartTitle: 'text-xl font-semibold tracking-[-0.03em] text-neutral-950',
      chartHeight: 'h-[calc(100vh-14rem)] min-h-[32rem] w-full',
      chartSurface: 'rounded-[1.85rem] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f2e8_100%)] p-4 ring-1 ring-neutral-900/6 sm:p-5',
    };
  }

  return {
    grid: 'grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start',
    panel: 'space-y-5 rounded-[2rem] border border-neutral-900/8 bg-white/78 p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.28)] backdrop-blur-sm',
    eyebrow: 'text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500',
    title: 'text-4xl font-semibold leading-none tracking-[-0.04em] text-neutral-950 sm:text-5xl',
    description: 'text-sm leading-6 text-neutral-600 sm:text-base',
    cardGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2',
    statTitle: 'text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500',
    statValue: 'mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950',
    statBody: 'mt-2 text-sm leading-6 text-neutral-600',
    chartHeader: 'mb-4 flex items-center justify-between gap-4 px-2',
    chartTitle: 'text-lg font-semibold tracking-[-0.03em] text-neutral-950',
    chartHeight: 'h-[min(72vh,760px)] min-h-[24rem] w-full',
    chartSurface: 'rounded-[1.75rem] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f2e8_100%)] p-3 ring-1 ring-neutral-900/6 sm:p-4',
  };
}

export function AbsenteeDashboardScreen({
  layout = 'page',
  selectedMetric,
  onSelectedMetricChange,
  onRequestExpand,
}: AbsenteeDashboardScreenProps) {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = useMemo(
    () => METRIC_OPTIONS.find((option) => option.value === selectedMetric) ?? METRIC_OPTIONS[0],
    [selectedMetric],
  );
  const classes = getLayoutClasses(layout);
  const showExpandButton = typeof onRequestExpand === 'function';

  useEffect(() => {
    const graphDiv = plotRef.current as PlotlyDiv | null;
    if (!graphDiv) {
      return;
    }

    const handleExpand = () => {
      onRequestExpand?.();
    };

    const chartData = [
      {
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: absenteeRows.map((row) => row.stateShort),
        z: absenteeRows.map((row) => row.metrics[selectedMetric]),
        text: absenteeRows.map((row) => row.state),
        colorscale: 'Sunsetdark',
        marker: {
          line: {
            color: 'rgba(82, 71, 58, 0.48)',
            width: 1.2,
          },
        },
        colorbar: {
          title: selectedOption.label,
          tickfont: { color: '#3d342b', size: 12 },
          titlefont: { color: '#3d342b', size: 12 },
        },
        hovertemplate: '<b>%{text}</b><br>%{z:,} students<extra></extra>',
      },
    ];

    const chartLayout = {
      paper_bgcolor: CHART_GEO_BACKGROUND_COLOR,
      plot_bgcolor: CHART_GEO_BACKGROUND_COLOR,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      dragmode: false,
      font: {
        family: 'Inter, ui-sans-serif, system-ui, sans-serif',
        color: '#2f2923',
      },
      geo: {
        scope: 'usa',
        projection: { type: 'albers usa' },
        showlakes: true,
        lakecolor: CHART_GEO_BACKGROUND_COLOR,
        showocean: true,
        oceancolor: CHART_GEO_BACKGROUND_COLOR,
        bgcolor: CHART_GEO_BACKGROUND_COLOR,
      },
    };

    const chartConfig = {
      responsive: true,
      displaylogo: false,
      doubleClick: false,
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'toggleSpikelines'],
    };

    void Plotly.react(graphDiv, chartData, chartLayout, chartConfig).then(() => {
      if (showExpandButton) {
        graphDiv.addEventListener('dblclick', handleExpand);
        graphDiv.on('plotly_doubleclick', handleExpand);
      }
      Plotly.Plots.resize(graphDiv);
    });

    return () => {
      graphDiv.removeEventListener('dblclick', handleExpand);
      graphDiv.removeAllListeners?.('plotly_doubleclick');
      Plotly.purge(graphDiv);
    };
  }, [onRequestExpand, selectedMetric, selectedOption.label, showExpandButton]);

  useEffect(() => {
    const graphDiv = plotRef.current as PlotlyDiv | null;
    if (!graphDiv) {
      return;
    }

    const handleResize = () => {
      Plotly.Plots.resize(graphDiv);
    };

    window.addEventListener('resize', handleResize);
    window.requestAnimationFrame(handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [layout]);

  return (
    <section className={classes.grid}>
      <div className={classes.panel}>
        <div className="space-y-3">
          <p className={classes.eyebrow}>Education Dashboard</p>
          <h1 className={classes.title}>US Student Absenteeism</h1>
          <p className={classes.description}>
            A state-by-state choropleth for students with 15 or more absences in a school year. Filter the map by demographic segment, then double-click the chart to open a full-screen demo inside the site.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-neutral-900/8 bg-[#fbf7f1] p-4">
          <label
            htmlFor={`absentee-metric-${layout}`}
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500"
          >
            Filter Metric
          </label>
          <select
            id={`absentee-metric-${layout}`}
            value={selectedMetric}
            onChange={(event) => onSelectedMetricChange(event.target.value as MetricKey)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-neutral-500"
          >
            {METRIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={classes.cardGrid}>
          <div className="rounded-[1.5rem] border border-neutral-900/8 bg-[#fffaf3] p-4">
            <p className={classes.statTitle}>Coverage</p>
            <p className={classes.statValue}>50 States</p>
            <p className={classes.statBody}>The dashboard maps every state-level record included in the absentee dataset.</p>
          </div>
          <div className="rounded-[1.5rem] border border-neutral-900/8 bg-[#fffaf3] p-4">
            <p className={classes.statTitle}>Interaction</p>
            <p className={classes.statValue}>Double Click</p>
            <p className={classes.statBody}>Open the chart as a full-screen demo, then use the small `x` or `Esc` to minimize it.</p>
          </div>
        </div>
      </div>

      <section className="relative min-h-0">
        <div className="rounded-[2rem] border border-neutral-900/8 bg-white/88 p-4 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-5">
          <div className={classes.chartHeader}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Interactive Demo</p>
              <h2 className={classes.chartTitle}>{selectedOption.label}</h2>
            </div>
            {showExpandButton && (
              <button
                type="button"
                onClick={onRequestExpand}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950"
              >
                <Expand className="h-4 w-4" />
                Expand
              </button>
            )}
          </div>

          <div className={classes.chartSurface}>
            <div ref={plotRef} className={classes.chartHeight} />
          </div>
        </div>
      </section>
    </section>
  );
}
