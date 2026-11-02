(() => {
  const islands = ["kalimantan", "jawa", "bali", "papua", "sulawesi", "sumatra"];

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  const menuBtn = qs("[data-menu-toggle]");
  const mobileNav = qs("[data-mobile-nav]");
  const mapRoot = qs("[data-map]");
  const mapCanvas = qs("[data-map-canvas]");
  const tooltip = qs("[data-map-tooltip]");

  const setActiveIsland = (id) => {
    qsa("[data-island]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.island === id);
    });
  };

  const goToIsland = (id) => {
    const section = qs(`#${id}`);
    if (!section) return;
    setActiveIsland(id);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bindIslandTriggers = (root = document) => {
    qsa("[data-island]", root).forEach((el) => {
      const activate = (event) => {
        event.preventDefault();
        goToIsland(el.dataset.island);
        closeMenu();
      };
      el.addEventListener("click", activate);
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") activate(event);
      });
    });
  };

  const closeMenu = () => {
    if (!mobileNav || !menuBtn) return;
    mobileNav.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn?.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("hidden") === false;
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  qsa("[data-mobile-nav] a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  const moveTooltip = (event, name) => {
    if (!tooltip || !mapRoot) return;
    const rect = mapRoot.getBoundingClientRect();
    tooltip.textContent = name;
    tooltip.classList.remove("opacity-0");
    tooltip.style.left = `${event.clientX - rect.left + 14}px`;
    tooltip.style.top = `${event.clientY - rect.top + 14}px`;
  };

  const hideTooltip = () => tooltip?.classList.add("opacity-0");

  const loadMap = async () => {
    if (!mapRoot || !mapCanvas) return;
    const response = await fetch("assets/indonesia-map.svg");
    const svg = await response.text();
    mapCanvas.innerHTML = svg;
    const svgEl = mapCanvas.querySelector("svg");
    if (svgEl) svgEl.setAttribute("class", "h-auto w-full");

    qsa(".island-group", mapCanvas).forEach((group) => {
      group.addEventListener("mouseenter", (event) => {
        setActiveIsland(group.dataset.island);
        moveTooltip(event, group.getAttribute("aria-label"));
      });
      group.addEventListener("mousemove", (event) => {
        moveTooltip(event, group.getAttribute("aria-label"));
      });
      group.addEventListener("mouseleave", hideTooltip);
      group.addEventListener("focus", () => setActiveIsland(group.dataset.island));
    });

    mapRoot.addEventListener("mouseleave", hideTooltip);
    bindIslandTriggers(mapCanvas);
  };

  qsa("[data-back-to-map]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      qs("#kepulauan")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveIsland(visible.target.id);
    },
    { threshold: 0.45 }
  );

  islands.forEach((id) => {
    const section = qs(`#${id}`);
    if (section) observer.observe(section);
  });

  bindIslandTriggers();
  loadMap();
})();
