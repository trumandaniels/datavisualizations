import { useEffect, useMemo, useRef } from "react";
import { Expand } from "lucide-react";
import Plotly from "plotly.js-dist-min";
import absenteeCsv from "../AbsenteeStudents/AbsenteeSpreadsheetClean.csv?raw";

type ScreenLayout = "card" | "page" | "fullscreen";

type MetricOption = {
  label: string;
  value: MetricKey;
};

export const METRIC_OPTIONS = [
  { label: "Total Absentee Students", value: "Total Students" },
  { label: "American Indian or Alaska Native", value: "American Indian or Alaska Native" },
  { label: "Hispanic or Latino of any race", value: "Hispanic or Latino of any race" },
  { label: "Black or African American", value: "Black or African American" },
  { label: "Native Hawaiian or Other Pacific Islander", value: "Native Hawaiian or Other Pacific Islander" },
  { label: "Students With Disabilities Served Under IDEA", value: "Students With Disabilities Served Under IDEA" },
  { label: "Students With Disabilities Served Only Under Section 504", value: "Students With Disabilities Served Only Under Section 504" },
  { label: "English Language Learners", value: "English Language Learners" },
  { label: "Students Per School", value: "Students Per School" },
] as const satisfies readonly MetricOption[];

export type MetricKey = (typeof METRIC_OPTIONS)[number]["value"];

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

const REQUIRED_COLUMNS = ["State", "State Short", ...METRIC_OPTIONS.map((option) => option.value)] as const;

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
  const headers = headerLine.split(",");
  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  for (const column of REQUIRED_COLUMNS) {
    if (!headerIndex.has(column)) {
      throw new Error(`Absentee CSV is missing required column: ${column}`);
    }
  }

  return rowLines.map((line, rowIndex) => {
    const cells = line.split(",");
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
      state: cells[headerIndex.get("State")!],
      stateShort: cells[headerIndex.get("State Short")!],
      metrics,
    };
  });
}

const absenteeRows = parseAbsenteeCsv(absenteeCsv);

export const ABSENTEE_STATE_COUNT = absenteeRows.length;
export const ABSENTEE_METRIC_COUNT = METRIC_OPTIONS.length;

function getLayoutClasses(layout: ScreenLayout) {
  if (layout === "card") {
    return {
      grid: "grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]",
      panelShell: "card-shadow overflow-hidden border-2 border-stone-800 bg-white",
      panelBody: "space-y-4 p-5",
      eyebrow: "font-label text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color:var(--primary)]",
      title: "font-headline text-[clamp(2rem,3vw,3.2rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.06em] text-stone-950",
      description: "text-sm leading-6 text-stone-700",
      filterShell: "border-2 border-stone-800 bg-[color:var(--surface-low)] p-4",
      cardGrid: "grid gap-3 sm:grid-cols-2 xl:grid-cols-1",
      statCard: "border-2 border-stone-800 bg-[#fffaf3] p-4",
      statTitle: "font-label text-[0.62rem] font-bold uppercase tracking-[0.18em] text-stone-500",
      statValue: "mt-2 font-headline text-2xl font-bold uppercase leading-none tracking-[-0.05em] text-stone-950",
      statBody: "mt-2 text-sm leading-6 text-stone-700",
      chartShell: "card-shadow overflow-hidden border-2 border-stone-800 bg-white",
      chartTitle: "font-headline text-2xl font-extrabold uppercase leading-none tracking-[-0.06em] text-white",
      chartBody: "p-4",
      chartSurface: "border-2 border-stone-800 bg-[color:var(--surface-low)] p-3",
      chartHeight: "h-full min-h-[22rem] w-full",
      expandButton: "ui-button ui-button-light text-[0.68rem]",
    };
  }

  if (layout === "fullscreen") {
    return {
      grid: "grid h-full min-h-0 gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]",
      panelShell: "card-shadow overflow-hidden border-2 border-stone-800 bg-white",
      panelBody: "space-y-5 p-6",
      eyebrow: "font-label text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[color:var(--primary)]",
      title: "font-headline text-5xl font-extrabold uppercase leading-none tracking-[-0.07em] text-stone-950",
      description: "text-base leading-7 text-stone-700",
      filterShell: "border-2 border-stone-800 bg-[color:var(--surface-low)] p-5",
      cardGrid: "grid gap-3 sm:grid-cols-2",
      statCard: "border-2 border-stone-800 bg-[#fffaf3] p-4",
      statTitle: "font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] text-stone-500",
      statValue: "mt-2 font-headline text-4xl font-bold uppercase leading-none tracking-[-0.05em] text-stone-950",
      statBody: "mt-2 text-sm leading-6 text-stone-700",
      chartShell: "card-shadow overflow-hidden border-2 border-stone-800 bg-white",
      chartTitle: "font-headline text-3xl font-extrabold uppercase leading-none tracking-[-0.06em] text-white",
      chartBody: "p-5",
      chartSurface: "border-2 border-stone-800 bg-[color:var(--surface-low)] p-4",
      chartHeight: "h-[calc(100vh-18rem)] min-h-[34rem] w-full",
      expandButton: "ui-button ui-button-light text-[0.72rem]",
    };
  }

  return {
    grid: "grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start",
    panelShell: "card-shadow overflow-hidden border-2 border-stone-800 bg-white",
    panelBody: "space-y-5 p-6",
    eyebrow: "font-label text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[color:var(--primary)]",
    title: "font-headline text-4xl font-extrabold uppercase leading-[0.95] tracking-[-0.07em] text-stone-950 sm:text-5xl",
    description: "text-sm leading-6 text-stone-700 sm:text-base sm:leading-7",
    filterShell: "border-2 border-stone-800 bg-[color:var(--surface-low)] p-4",
    cardGrid: "grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
    statCard: "border-2 border-stone-800 bg-[#fffaf3] p-4",
    statTitle: "font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] text-stone-500",
    statValue: "mt-2 font-headline text-3xl font-bold uppercase leading-none tracking-[-0.05em] text-stone-950",
    statBody: "mt-2 text-sm leading-6 text-stone-700",
    chartShell: "card-shadow overflow-hidden border-2 border-stone-800 bg-white",
    chartTitle: "font-headline text-[1.8rem] font-extrabold uppercase leading-none tracking-[-0.06em] text-white sm:text-[2rem]",
    chartBody: "p-4 sm:p-5",
    chartSurface: "border-2 border-stone-800 bg-[color:var(--surface-low)] p-3 sm:p-4",
    chartHeight: "h-[min(70vh,760px)] min-h-[26rem] w-full",
    expandButton: "ui-button ui-button-light text-[0.68rem] sm:text-[0.72rem]",
  };
}

export function AbsenteeDashboardScreen({
  layout = "page",
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
  const showExpandButton = typeof onRequestExpand === "function";

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
        type: "choropleth",
        locationmode: "USA-states",
        locations: absenteeRows.map((row) => row.stateShort),
        z: absenteeRows.map((row) => row.metrics[selectedMetric]),
        text: absenteeRows.map((row) => row.state),
        colorscale: "Sunsetdark",
        marker: {
          line: {
            color: "rgba(82, 71, 58, 0.48)",
            width: 1.2,
          },
        },
        colorbar: {
          title: selectedOption.label,
          tickfont: { color: "#3d342b", size: 12 },
          titlefont: { color: "#3d342b", size: 12 },
        },
        hovertemplate: "<b>%{text}</b><br>%{z:,} students<extra></extra>",
      },
    ];

    const chartLayout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 0, r: 0, t: 0, b: 0 },
      dragmode: false,
      font: {
        family: "Inter, ui-sans-serif, system-ui, sans-serif",
        color: "#2f2923",
      },
      geo: {
        scope: "usa",
        projection: { type: "albers usa" },
        showlakes: false,
        bgcolor: "rgba(0,0,0,0)",
      },
    };

    const chartConfig = {
      responsive: true,
      displaylogo: false,
      doubleClick: false,
      modeBarButtonsToRemove: ["select2d", "lasso2d", "toggleSpikelines"],
    };

    void Plotly.react(graphDiv, chartData, chartLayout, chartConfig).then(() => {
      if (showExpandButton) {
        graphDiv.addEventListener("dblclick", handleExpand);
        graphDiv.on("plotly_doubleclick", handleExpand);
      }
      Plotly.Plots.resize(graphDiv);
    });

    return () => {
      graphDiv.removeEventListener("dblclick", handleExpand);
      graphDiv.removeAllListeners?.("plotly_doubleclick");
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

    window.addEventListener("resize", handleResize);
    window.requestAnimationFrame(handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [layout]);

  return (
    <section className={classes.grid}>
      <div className={classes.panelShell}>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 px-4 py-2 font-label text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white">
          <span>Interactive Demo</span>
          <span>{layout === "card" ? "Embedded Preview" : "Hosted Route"}</span>
        </div>
        <div className={classes.panelBody}>
          <div className="space-y-3">
            <p className={classes.eyebrow}>Education Dashboard</p>
            <h2 className={classes.title}>US Student Absenteeism</h2>
            <p className={classes.description}>
              A state-by-state choropleth for students with 15 or more absences in a school year.
              Switch the demographic lens, compare national spread quickly, and open the hosted map in a
              full-screen view when you want more room to inspect it.
            </p>
          </div>

          <div className={classes.filterShell}>
            <label
              htmlFor={`absentee-metric-${layout}`}
              className="font-label text-[0.68rem] font-bold uppercase tracking-[0.18em] text-stone-600"
            >
              Filter Metric
            </label>
            <select
              id={`absentee-metric-${layout}`}
              value={selectedMetric}
              onChange={(event) => onSelectedMetricChange(event.target.value as MetricKey)}
              className="mt-3 w-full border-2 border-stone-800 bg-white px-4 py-3 text-sm font-medium text-stone-800 outline-none transition focus:bg-stone-50"
            >
              {METRIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={classes.cardGrid}>
            <div className={classes.statCard}>
              <p className={classes.statTitle}>Coverage</p>
              <p className={classes.statValue}>{ABSENTEE_STATE_COUNT} States</p>
              <p className={classes.statBody}>
                Every state-level record in the cleaned absentee dataset is available in the hosted demo.
              </p>
            </div>
            <div className={classes.statCard}>
              <p className={classes.statTitle}>Comparison Lenses</p>
              <p className={classes.statValue}>{ABSENTEE_METRIC_COUNT} Views</p>
              <p className={classes.statBody}>
                The selector keeps the dashboard focused while still allowing demographic and access-based comparisons.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className={classes.chartShell}>
        <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900 px-4 py-3 sm:px-5">
          <div>
            <p className="font-label text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[color:var(--primary-strong)]">
              Map View
            </p>
            <h2 className={classes.chartTitle}>{selectedOption.label}</h2>
          </div>
          {showExpandButton && (
            <button type="button" onClick={onRequestExpand} className={classes.expandButton}>
              <Expand className="h-4 w-4" />
              Expand
            </button>
          )}
        </div>

        <div className={classes.chartBody}>
          <div className={classes.chartSurface}>
            <div ref={plotRef} className={classes.chartHeight} />
          </div>
        </div>
      </section>
    </section>
  );
}
