const resizeMap = () => {
  const plot = document.querySelector("#us-map .js-plotly-plot");
  if (plot && window.Plotly?.Plots?.resize) {
    window.requestAnimationFrame(() => window.Plotly.Plots.resize(plot));
  }
};

const setExpanded = (expanded) => {
  const shell = document.getElementById("us-map-shell");
  if (!shell) {
    return;
  }

  shell.classList.toggle("is-fullscreen", expanded);
  document.body.classList.toggle("dashboard-modal-open", expanded);
  resizeMap();
};

const bindFullscreenHandler = () => {
  const plot = document.querySelector("#us-map .js-plotly-plot");
  if (!plot || plot.dataset.fullscreenBound === "true") {
    return Boolean(plot);
  }

  plot.dataset.fullscreenBound = "true";
  plot.on("plotly_doubleclick", () => setExpanded(true));
  return true;
};

const initializeFullscreenMap = () => {
  const closeButton = document.getElementById("minimize-map");
  const shell = document.getElementById("us-map-shell");
  if (!closeButton || !shell || shell.dataset.fullscreenReady === "true") {
    return;
  }

  shell.dataset.fullscreenReady = "true";
  closeButton.addEventListener("click", () => setExpanded(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && shell.classList.contains("is-fullscreen")) {
      setExpanded(false);
    }
  });

  const ensureBound = () => {
    if (!bindFullscreenHandler()) {
      window.setTimeout(ensureBound, 250);
      return;
    }

    if (
      document.querySelector("#us-map .js-plotly-plot")?.dataset.fullscreenBound !== "true"
    ) {
      window.setTimeout(ensureBound, 250);
    }
  };

  ensureBound();

  const observer = new MutationObserver(() => {
    ensureBound();
    if (shell.classList.contains("is-fullscreen")) {
      resizeMap();
    }
  });

  observer.observe(shell, { childList: true, subtree: true });
  window.addEventListener("resize", resizeMap);
};

const bootFullscreenMap = () => {
  if (!document.getElementById("us-map-shell") || !document.getElementById("minimize-map")) {
    window.setTimeout(bootFullscreenMap, 250);
    return;
  }

  initializeFullscreenMap();
};

bootFullscreenMap();
document.addEventListener("DOMContentLoaded", bootFullscreenMap);
window.addEventListener("load", bootFullscreenMap);
