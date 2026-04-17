import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowUpRight, Expand, X } from "lucide-react";
import {
  ABSENTEE_METRIC_COUNT,
  ABSENTEE_STATE_COUNT,
  AbsenteeDashboardScreen,
  type MetricKey,
} from "./AbsenteeDashboardScreen";

type DetailCard = {
  label: string;
  title: string;
  body: string;
};

type ProjectRecord = {
  label: string;
  value: string;
  body: string;
};

const CASE_STUDY_DETAILS: DetailCard[] = [
  {
    label: "Question",
    title: "Where is absenteeism concentrated?",
    body: "The project reframes a raw state-level table into a quick geographic comparison so a reader can find patterns before digging into any single state.",
  },
  {
    label: "Audience",
    title: "Recruiters, hiring managers, and collaborators",
    body: "The page is built as a portfolio case study, so the writeup explains the framing decisions while the live map proves the interaction quality directly.",
  },
  {
    label: "Interaction",
    title: "One focused control, one immediate view",
    body: "Rather than burying the chart under a dense control rail, the experience keeps one metric selector near the map and lets the visual carry the analytical load.",
  },
  {
    label: "Delivery",
    title: "Hosted natively inside the portfolio",
    body: "The dashboard sits on its own route inside the site, so the project feels like part of a cohesive body of work instead of a link-out to a separate app.",
  },
];

const DESIGN_NOTES: DetailCard[] = [
  {
    label: "Map-First",
    title: "The visualization is the hero",
    body: "The choropleth sits inside a framed project shell so the first thing a visitor encounters is the actual work, not a wall of explanatory prose.",
  },
  {
    label: "Editorial Structure",
    title: "Writeup sections explain the work clearly",
    body: "The surrounding panels borrow the same rhythm as the main website: strong headers, compact metric blocks, and short paragraphs that make the case study easy to scan.",
  },
  {
    label: "Portfolio Signal",
    title: "Presentation quality is part of the artifact",
    body: "The page is intentionally styled like a finished product because the goal is to show analytical taste and frontend execution at the same time.",
  },
];

const IMPLEMENTATION_NOTES: DetailCard[] = [
  {
    label: "Boundary Parse",
    title: "CSV parsing happens at the edge",
    body: "The route parses the raw absentee CSV into trusted rows before the chart ever renders, which keeps the rest of the visualization logic focused on presentation instead of repeated shape checks.",
  },
  {
    label: "On-Site Demo",
    title: "Fullscreen stays inside the route",
    body: "Visitors can expand the map without leaving the project page, which makes the interaction feel intentional and keeps the project narrative intact.",
  },
];

const PROJECT_RECORDS: ProjectRecord[] = [
  {
    label: "Coverage",
    value: `${ABSENTEE_STATE_COUNT} States`,
    body: "State-level records included in the cleaned absentee dataset.",
  },
  {
    label: "Comparison Views",
    value: `${ABSENTEE_METRIC_COUNT} Metrics`,
    body: "Demographic and access-related slices available through the selector.",
  },
  {
    label: "Stack",
    value: "React + Plotly",
    body: "A portfolio route that pairs site structure with an embedded analytical demo.",
  },
  {
    label: "Delivery",
    value: "Hosted On-Site",
    body: "The map runs inside the portfolio instead of redirecting to an external deployment.",
  },
];

const PROJECT_LINKS = [
  {
    label: "Repository Folder",
    href: "https://github.com/trumandaniels/datavisualizations/tree/main/AbsenteeStudents",
  },
  {
    label: "Portfolio Source",
    href: "https://github.com/trumandaniels/datavisualizations/tree/main/portfolio-site",
  },
] as const;

const READING_NOTES = [
  "Use the metric selector to swap the demographic lens without losing the geographic comparison.",
  "Double-click the chart or use the expand button to inspect the hosted fullscreen version.",
  "Treat the surrounding writeup as product framing: it explains why the visualization is structured the way it is.",
] as const;

export function AbsenteeDashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("Total Students");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="portfolio-page font-body selection:bg-[color:var(--primary-strong)] selection:text-white">
      <header className="sticky inset-x-0 top-0 z-40 border-b-2 border-stone-800 bg-[color:var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <Link
            to="/"
            className="font-headline text-xl font-extrabold uppercase tracking-[-0.08em] text-stone-950 sm:text-2xl"
          >
            Truman Daniels
          </Link>
          <nav className="hidden md:block" aria-label="Project page">
            <ul className="flex items-center gap-6 font-label text-xs font-bold uppercase tracking-[0.22em] text-stone-600">
              <li>
                <Link to="/" className="border-b-4 border-[color:var(--primary-strong)] pb-1 text-stone-950">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/trumandaniels/datavisualizations"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b-4 border-transparent pb-1 transition-colors hover:text-[color:var(--primary)]"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-10 sm:pt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-label text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[color:var(--primary)] hover:text-[color:var(--primary-strong)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back To Projects
        </Link>

        <section className="mt-6 border-l-8 border-[color:var(--primary-strong)] py-6 pl-6">
          <p className="font-label text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--primary)]">
            [portfolio_case_study]
          </p>
          <h1 className="mt-4 font-headline text-5xl font-extrabold uppercase leading-none tracking-[-0.08em] text-stone-950 sm:text-7xl">
            US Student Absenteeism
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
            An on-site project writeup that pairs a hosted Plotly choropleth with the same editorial,
            dashboard-led visual language used on the main website. The goal is to make the actual
            portfolio artifacts feel designed, not merely embedded.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="border border-stone-300 bg-stone-100 px-3 py-1 font-label text-[0.62rem] font-bold uppercase tracking-[0.18em] text-stone-700">
              Education Dashboard
            </span>
            <span className="border border-stone-300 bg-stone-100 px-3 py-1 font-label text-[0.62rem] font-bold uppercase tracking-[0.18em] text-stone-700">
              Hosted Interactive Demo
            </span>
            <span className="border border-stone-300 bg-stone-100 px-3 py-1 font-label text-[0.62rem] font-bold uppercase tracking-[0.18em] text-stone-700">
              Website Design Language
            </span>
          </div>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <section className="card-shadow overflow-hidden border-2 border-stone-800 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 px-4 py-2 font-label text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white">
                <span>Project Framing</span>
                <span>Case Study Shell</span>
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                {CASE_STUDY_DETAILS.map((detail) => (
                  <article key={detail.title} className="space-y-3 border-l-4 border-[color:var(--primary-strong)] pl-4">
                    <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--primary)]">
                      {detail.label}
                    </p>
                    <h2 className="font-headline text-2xl font-extrabold uppercase leading-none tracking-[-0.05em] text-stone-950">
                      {detail.title}
                    </h2>
                    <p className="text-sm leading-6 text-stone-700">{detail.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel-shadow border-2 border-stone-800 bg-[color:var(--surface-low)] p-4 sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-stone-800 pl-4">
                <div>
                  <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                    Interactive Dashboard
                  </p>
                  <h2 className="mt-2 font-headline text-3xl font-extrabold uppercase leading-none tracking-[-0.06em] text-stone-950 sm:text-4xl">
                    Embedded Project View
                  </h2>
                </div>
                <button type="button" onClick={() => setIsExpanded(true)} className="ui-button ui-button-light">
                  <Expand className="h-4 w-4" />
                  Fullscreen
                </button>
              </div>

              <AbsenteeDashboardScreen
                layout="page"
                selectedMetric={selectedMetric}
                onSelectedMetricChange={setSelectedMetric}
                onRequestExpand={() => setIsExpanded(true)}
              />
            </section>

            <section className="card-shadow overflow-hidden border-2 border-stone-800 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 px-4 py-2 font-label text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white">
                <span>Design Notes</span>
                <span>Editorial + Dashboard</span>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-3 sm:p-8">
                {DESIGN_NOTES.map((detail) => (
                  <article key={detail.title} className="border-2 border-stone-800 bg-[#fffaf3] p-5">
                    <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--primary)]">
                      {detail.label}
                    </p>
                    <h2 className="mt-3 font-headline text-2xl font-extrabold uppercase leading-none tracking-[-0.05em] text-stone-950">
                      {detail.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-stone-700">{detail.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel-shadow border-2 border-stone-800 bg-white p-6 sm:p-8">
              <div className="border-l-4 border-[color:var(--primary-strong)] pl-4">
                <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                  Implementation Notes
                </p>
                <h2 className="mt-2 font-headline text-3xl font-extrabold uppercase leading-none tracking-[-0.06em] text-stone-950 sm:text-4xl">
                  How The Route Is Put Together
                </h2>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {IMPLEMENTATION_NOTES.map((detail) => (
                  <article key={detail.title} className="border-2 border-stone-800 bg-[color:var(--surface-low)] p-5">
                    <p className="font-label text-[0.68rem] font-bold uppercase tracking-[0.2em] text-stone-500">
                      {detail.label}
                    </p>
                    <h3 className="mt-3 font-headline text-2xl font-extrabold uppercase leading-none tracking-[-0.05em] text-stone-950">
                      {detail.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-700">{detail.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <section className="panel-shadow border-2 border-stone-800 bg-white p-6">
              <div className="font-headline text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                Project Record
              </div>
              <div className="mt-6 space-y-4">
                {PROJECT_RECORDS.map((record) => (
                  <div key={record.label} className="border-b border-stone-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-end justify-between gap-4">
                      <span className="font-label text-[0.62rem] font-bold uppercase tracking-[0.2em] text-stone-500">
                        {record.label}
                      </span>
                      <span className="font-headline text-2xl font-bold uppercase leading-none tracking-[-0.05em] text-stone-950">
                        {record.value}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-700">{record.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-2 border-stone-800 bg-[color:var(--surface-panel-strong)] p-6">
              <div className="border-l-4 border-stone-800 pl-3 font-headline text-xs font-bold uppercase tracking-[0.24em] text-stone-900">
                Project Links
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {PROJECT_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-button ui-button-dark justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </section>

            <section className="border-2 border-stone-800 bg-white p-6">
              <div className="font-headline text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                How To Read This Page
              </div>
              <div className="mt-5 space-y-4">
                {READING_NOTES.map((note, index) => (
                  <div key={note} className="border-l-4 border-stone-800 pl-4">
                    <p className="font-label text-[0.62rem] font-bold uppercase tracking-[0.2em] text-stone-500">
                      Note {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-700">{note}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t-2 border-stone-800 bg-[color:var(--surface-low)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-stone-500">
            Visualization Portfolio Case Study
          </p>
          <nav className="flex flex-wrap gap-6 font-label text-[0.65rem] font-bold uppercase tracking-[0.24em] text-stone-600">
            <Link to="/" className="hover:text-[color:var(--primary)]">
              Home
            </Link>
            <a
              href="https://github.com/trumandaniels/datavisualizations/tree/main/AbsenteeStudents"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--primary)]"
            >
              Absentee Source
            </a>
            <a
              href="https://github.com/trumandaniels/datavisualizations"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--primary)]"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-[color:var(--background)] p-4 pt-20 sm:p-6 sm:pt-20">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-white shadow-lg transition hover:bg-stone-800"
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
