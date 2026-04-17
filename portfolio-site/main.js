const projects = [
  {
    title: "US Student Absenteeism Dashboard",
    eyebrow: "Education dashboard",
    summary:
      "An interactive US map that lets visitors explore absenteeism rates across states and demographics.",
    detail:
      "This project pairs data cleaning with a user-facing dashboard, which makes it a strong anchor for demonstrating analytical storytelling plus interface instincts.",
    method:
      "Processed national absenteeism data and surfaced it through a Plotly Dash experience with demographic filtering.",
    tags: ["Dash", "Education", "Map"],
    image: "../AbsenteeStudents/dashboard-screenshot.png",
    primaryLabel: "Open live dashboard",
    primaryHref: "https://absenteestudentsbystate.onrender.com/",
    secondaryLabel: "Open project notes",
    secondaryHref: "../AbsenteeStudents/readme.md"
  },
  {
    title: "Los Angeles Budget Forecasting",
    eyebrow: "Model-driven analysis",
    summary:
      "Gradient boosted decision trees estimate the city budget using merged historical budget data and housing signals.",
    detail:
      "The strongest cue here is analytical framing: the work does not stop at prediction, it also explains relationships through correlation and feature importance views.",
    method:
      "Merged public budget history with the Schiller housing index and trained a CatBoost model to evaluate predictive signal.",
    tags: ["Machine learning", "Forecasting", "Civic data"],
    image: "../Budgets/FeatureImportance.png",
    primaryLabel: "Open notebook",
    primaryHref: "https://colab.research.google.com/drive/1iqlMezyD1rOJBr6-OkHf2YEiaGhEilUA",
    secondaryLabel: "View project summary",
    secondaryHref: "../Budgets/readme.md"
  },
  {
    title: "H-1B Approvals Over Time",
    eyebrow: "Policy time series",
    summary:
      "A cleaned longitudinal view of H-1B employer data that required merging fifteen USCIS CSV files into one usable trend line.",
    detail:
      "This is a strong portfolio signal for data wrangling rigor because the visual comes after multi-file normalization and boundary cleaning work.",
    method:
      "Joined official USCIS data extracts, standardized the shape, and used seaborn plus matplotlib to communicate the resulting trend.",
    tags: ["Time series", "Immigration", "Data cleaning"],
    image: "../H1B/h-1b_approvals.png",
    primaryLabel: "Open notebook",
    primaryHref: "https://colab.research.google.com/drive/1Rz_YG0UtCvS_deUtcmjkV_lxchUd48pN",
    secondaryLabel: "View project summary",
    secondaryHref: "../H1B/readme.md"
  },
  {
    title: "Mesa Outstanding Loans",
    eyebrow: "Municipal finance",
    summary:
      "A public-finance time series that tracks outstanding municipal debt with a clear, portfolio-friendly single-view narrative.",
    detail:
      "Even the simpler studies matter on the homepage because they show range across public policy, finance, and civic datasets rather than repeating one domain.",
    method:
      "Used official Mesa debt-service data to build a seaborn and matplotlib line chart focused on cumulative owed loans over time.",
    tags: ["Finance", "Public data", "Time series"],
    image: "../mesaloans/mesa-az-loans.png",
    primaryLabel: "Open notebook",
    primaryHref: "https://colab.research.google.com/drive/1iThINxrnoHwjtwq1hIrDGq-pSenZB0yv",
    secondaryLabel: "View project summary",
    secondaryHref: "../mesaloans/readme.md"
  }
];

const track = document.getElementById("project-track");
const detailPanel = document.getElementById("project-detail");
const previousButton = document.getElementById("previous-project");
const nextButton = document.getElementById("next-project");

let activeIndex = 0;
let wheelLocked = false;

function clampIndex(index) {
  return Math.min(Math.max(index, 0), projects.length - 1);
}

function renderCards() {
  track.innerHTML = "";

  projects.forEach((project, index) => {
    const card = document.createElement("article");
    const offset = index - activeIndex;
    const distance = Math.abs(offset);
    const direction = Math.sign(offset) || 1;
    const isActive = distance === 0;
    const isHidden = distance > 3;
    const baseX = window.innerWidth < 640 ? 112 : window.innerWidth < 980 ? 180 : 260;
    const spreadX = window.innerWidth < 980 ? 38 : 72;
    const x = isActive ? -50 : -50 + direction * (baseX + (distance - 1) * spreadX);
    const rotateY = isActive ? 0 : direction * -38;
    const scale = isActive ? 1 : Math.max(0.78, 1 - distance * 0.07);
    const z = isActive ? 140 : -distance * 140;
    const opacity = isHidden ? 0 : 1;
    const brightness = isActive ? 1 : Math.max(0.68, 1 - distance * 0.12);

    card.className = "project-card";
    card.dataset.state = isActive ? "active" : "inactive";
    card.setAttribute("aria-label", `Show project ${project.title}`);
    card.innerHTML = `
      <img src="${project.image}" alt="${project.title}" />
      <div class="card-overlay">
        <div class="card-tags">${project.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
      </div>
    `;

    card.style.transform = `translate3d(${x}%, -50%, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
    card.style.opacity = String(opacity);
    card.style.filter = `brightness(${brightness}) saturate(${isActive ? 1 : 0.9})`;
    card.style.zIndex = String(30 - distance);

    card.addEventListener("click", () => setActiveIndex(index));
    track.appendChild(card);
  });
}

function renderDetail() {
  const project = projects[activeIndex];
  detailPanel.innerHTML = `
    <section class="detail-copy">
      <p class="eyebrow">${project.eyebrow}</p>
      <h3>${project.title}</h3>
      <p class="detail-lede">${project.detail}</p>
      <div class="detail-tags">${project.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      <div class="detail-links">
        <a class="project-link primary" href="${project.primaryHref}" target="_blank" rel="noreferrer">
          ${project.primaryLabel}
          <span aria-hidden="true">↗</span>
        </a>
        <a class="project-link" href="${project.secondaryHref}" target="_blank" rel="noreferrer">
          ${project.secondaryLabel}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
    <section class="detail-body">
      <div>
        <h4>Why it belongs on the homepage</h4>
        <p>${project.summary}</p>
      </div>
      <div>
        <h4>Method signal</h4>
        <p>${project.method}</p>
      </div>
    </section>
  `;

  previousButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === projects.length - 1;
}

function setActiveIndex(index) {
  activeIndex = clampIndex(index);
  renderCards();
  renderDetail();
}

function step(direction) {
  setActiveIndex(activeIndex + direction);
}

function handleKeydown(event) {
  if (event.key === "ArrowLeft") {
    step(-1);
  }
  if (event.key === "ArrowRight") {
    step(1);
  }
}

function handleWheel(event) {
  if (wheelLocked || Math.abs(event.deltaY) < 26) {
    return;
  }

  if (event.deltaY > 0) {
    step(1);
  } else {
    step(-1);
  }

  wheelLocked = true;
  window.setTimeout(() => {
    wheelLocked = false;
  }, 380);
}

previousButton.addEventListener("click", () => step(-1));
nextButton.addEventListener("click", () => step(1));
window.addEventListener("keydown", handleKeydown);
track.addEventListener("wheel", handleWheel, { passive: true });
window.addEventListener("resize", () => renderCards());

setActiveIndex(0);
