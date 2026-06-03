function log(msg) { console.log(msg); }

// Р ВР Р…Р С‘РЎвЂ Р С‘Р В°Р В»Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Р СџРЎР‚Р С‘Р СР ВµР Р…РЎРЏР ВµР С РЎвЂљР ВµР СРЎС“ Telegram
function applyTheme() {
  const root = document.documentElement;
  const params = tg.themeParams;
  if (params.bgColor) root.style.setProperty("--tg-theme-bg-color", params.bgColor);
  if (params.textColor) root.style.setProperty("--tg-theme-text-color", params.textColor);
  if (params.hintColor) root.style.setProperty("--tg-theme-hint-color", params.hintColor);
  if (params.linkColor) root.style.setProperty("--tg-theme-link-color", params.linkColor);
  if (params.buttonColor) root.style.setProperty("--tg-theme-button-color", params.buttonColor);
  if (params.buttonTextColor) root.style.setProperty("--tg-theme-button-text-color", params.buttonTextColor);
  if (params.secondaryBgColor) root.style.setProperty("--tg-theme-secondary-bg-color", params.secondaryBgColor);
}

// Р вЂ“Р Т‘РЎвЂР С Р В·Р В°Р С–РЎР‚РЎС“Р В·Р С”Р С‘ DOM Р С—Р ВµРЎР‚Р ВµР Т‘ Р С‘Р Р…Р С‘РЎвЂ Р С‘Р В°Р В»Р С‘Р В·Р В°РЎвЂ Р С‘Р ВµР в„–
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  applyTheme();
  
  // Р РЋР С•РЎРѓРЎвЂљР С•РЎРЏР Р…Р С‘Р Вµ
  let events = [];
  let plan = [];
  let profile = null;
  let currentCardIndex = 0;

  // Р СњР В°Р Р†Р С‘Р С–Р В°РЎвЂ Р С‘РЎРЏ - РЎРѓ Р С—РЎР‚Р С•Р Р†Р ВµРЎР‚Р С”Р С•Р в„– Р Р…Р В° null
  const tabs = {
    today: document.getElementById("tab-today"),
    plan: document.getElementById("tab-plan"),
    bookings: document.getElementById("tab-bookings"),
    map: document.getElementById("tab-map"),
    profile: document.getElementById("tab-profile"),
  };
  const navBtns = document.querySelectorAll(".nav-btn");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      navBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.values(tabs).forEach((t) => {
        if (t) t.classList.remove("active");
      });
      if (tabs[tabName]) tabs[tabName].classList.add("active");

      if (tabName === "plan") loadPlan();
      if (tabName === "bookings") loadBookings();
      if (tabName === "map") loadMap();
      if (tabName === "profile") loadProfile();
      if (tabName === "today") {
        currentCardIndex = 0;
        renderCards();
      }
    });
  });

  // Р В¤Р С‘Р В»РЎРЉРЎвЂљРЎР‚РЎвЂ№ - РЎРѓ Р С—РЎР‚Р С•Р Р†Р ВµРЎР‚Р С”Р С•Р в„– Р Р…Р В° null
  const filterCategory = document.getElementById("filter-category");
  const filterDistrict = document.getElementById("filter-district");
  if (filterCategory) {
    filterCategory.addEventListener("change", loadEvents);
  }
  if (filterDistrict) {
    filterDistrict.addEventListener("change", loadEvents);
  }

  // Р вЂ”Р В°Р С–РЎР‚РЎС“Р В·Р С”Р В° РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘Р в„–
  async function loadEvents() {
    console.log("loadEvents called");
    const container = document.getElementById("events-container");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Р вЂ”Р В°Р С–РЎР‚РЎС“Р В¶Р В°РЎР‹ РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘РЎРЏ...</div>';

    const params = new URLSearchParams();
    if (filterCategory && filterCategory.value) params.set("category", filterCategory.value);
    if (filterDistrict && filterDistrict.value) params.set("district", filterDistrict.value);
    params.set("mode", "recommended");
    params.set("limit", "50");

    try {
      console.log("Fetching /api/events?" + params.toString());
      const data = await apiGet(`/api/events?${params}`);
      console.log("Events data:", data);
      
      if (data.ok) {
        events = data.events || [];
        console.log("Events count:", events.length);
        currentCardIndex = 0;
        renderCards();
      } else {
        container.innerHTML = '<div class="empty-state">Р С›РЎв‚¬Р С‘Р В±Р С”Р В° Р В·Р В°Р С–РЎР‚РЎС“Р В·Р С”Р С‘</div>';
      }
    } catch (e) {
      console.error("Load events error:", e);
      container.innerHTML = '<div class="empty-state">Р СњР ВµРЎвЂљ РЎРѓР С•Р ВµР Т‘Р С‘Р Р…Р ВµР Р…Р С‘РЎРЏ</div>';
    }
  }

  // API helpers
  async function apiGet(path) {
    try {
      const headers = { ...HEADERS };
      const initData = getInitData();
      if (initData) {
        headers["X-Telegram-Init-Data"] = initData;
      }
      const res = await fetch(API_BASE + path, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      log("СЂСџвЂњВ¦ API GET " + path + " => " + JSON.stringify(data));
      return data;
    } catch (e) {
      log("РІСњРЉ API GET error: " + path + " - " + e.message);
      throw e;
    }
  }

  async function apiPost(path, body) {
    try {
      const headers = { ...HEADERS };
      const initData = getInitData();
      if (initData) {
        headers["X-Telegram-Init-Data"] = initData;
      }
      const res = await fetch(API_BASE + path, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      log("СЂСџвЂњВ¦ API POST " + path + " => " + JSON.stringify(data));
      return data;
    } catch (e) {
      log("РІСњРЉ API POST error: " + path + " - " + e.message);
      throw e;
    }
  }

  const API_BASE = window.location.origin;
  
  // Р СџР С•Р В»РЎС“РЎвЂЎР В°Р ВµР С initData Р С‘Р В· Telegram
  function getInitData() {
    if (tg.initData) return tg.initData;
    return null;
  }
  const HEADERS = { "Content-Type": "application/json" };

  // Р В Р ВµР Р…Р Т‘Р ВµРЎР‚ Р С”Р В°РЎР‚РЎвЂљР С•РЎвЂЎР ВµР С”
  function renderCards() {
    const container = document.getElementById("events-container");
    if (!container) return;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">СЂСџРЉС“</div>
          <div>Р РЋР С•Р В±РЎвЂ№РЎвЂљР С‘Р в„– Р Р…Р ВµРЎвЂљ</div>
        </div>
      `;
      return;
    }

    events.slice(currentCardIndex).forEach((event, idx) => {
      const card = createCard(event, idx === 0);
      if (idx === 0) container.appendChild(card);
    });

    if (events.length > currentCardIndex) {
      const remaining = events.length - currentCardIndex;
      tg.MainButton.show();
      tg.MainButton.setText(`РІРЏВ­ Р СџРЎР‚Р С•Р С—РЎС“РЎРѓРЎвЂљР С‘РЎвЂљРЎРЉ (${remaining})`);
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.setText("РІСљвЂ¦ Р вЂ™РЎРѓР Вµ РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘РЎРЏ Р С—РЎР‚Р С•РЎРѓР СР С•РЎвЂљРЎР‚Р ВµР Р…РЎвЂ№");
      setTimeout(() => tg.MainButton.hide(), 2000);
    }
  }

  function createCard(event, isTop) {
    const card = document.createElement("div");
    card.className = "card" + (isTop ? " swiping" : "");
    card.dataset.eventId = event.id;

    const price = formatPrice(event.price_min, event.price_max);
    const category = translateCategory(event.category);

    card.innerHTML = `
      <img class="card-image" src="${event.image_url || ''}" alt="${event.title}" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'" />
      <div class="card-content">
        <div class="card-title">${escapeHtml(event.title)}</div>
        <div class="card-meta">${category} Р’В· ${escapeHtml(event.venue_name || "")}</div>
        <div class="card-meta">${escapeHtml(event.district || "")}</div>
        <div class="card-price">${price}</div>
        <div class="card-desc">${escapeHtml(event.description || "")}</div>
        <div class="card-actions">
          <button class="btn btn-outline btn-dislike">РІСњРЉ</button>
          <button class="btn btn-secondary btn-add">Р вЂ™ Р С—Р В»Р В°Р Р…</button>
          <button class="btn btn-primary btn-book">СЂСџР‹В« Р вЂР С‘Р В»Р ВµРЎвЂљ</button>
          <button class="btn btn-outline btn-like">РІСњВ¤РїС‘РЏ</button>
        </div>
      </div>
    `;

    if (isTop) setupSwipe(card, event);

    return card;
  }

  // Р РЋР Р†Р В°Р в„–Р С—РЎвЂ№
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isSwiping = false;

  function setupSwipe(card, event) {
    const onDown = (e) => {
      isSwiping = false;
      touchStartX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
      card.style.transition = "none";
    };

    const onMove = (e) => {
      if (touchStartX === 0) return;
      const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
      touchCurrentX = x - touchStartX;
      if (Math.abs(touchCurrentX) > 5) isSwiping = true;
      const rotate = touchCurrentX * 0.05;
      card.style.transform = `translateX(${touchCurrentX}px) rotate(${rotate}deg)`;
    };

    const onEnd = () => {
      if (!isSwiping) {
        card.style.transition = "transform 0.3s";
        card.style.transform = "";
        touchStartX = 0;
        touchCurrentX = 0;
        return;
      }

      const threshold = 80;
      if (touchCurrentX > threshold) {
        swipe(card, event, "right");
      } else if (touchCurrentX < -threshold) {
        swipe(card, event, "left");
      } else {
        card.style.transition = "transform 0.3s";
        card.style.transform = "";
      }
      touchStartX = 0;
      touchCurrentX = 0;
    };

    card.addEventListener("mousedown", onDown);
    card.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);

    card.querySelector(".btn-dislike").addEventListener("click", (e) => {
      e.stopPropagation();
      swipe(card, event, "left");
    });
    card.querySelector(".btn-like").addEventListener("click", (e) => {
      e.stopPropagation();
      swipe(card, event, "right");
    });
    card.querySelector(".btn-add").addEventListener("click", (e) => {
      e.stopPropagation();
      addToPlan(event.id);
    });
    card.querySelector(".btn-book").addEventListener("click", (e) => {
      e.stopPropagation();
      bookEvent(event.id);
    });
  }

  if (events.length > currentCardIndex) {
      const remaining = events.length - currentCardIndex;
      tg.MainButton.show();
      tg.MainButton.setText(`РІРЏВ­ Р СџРЎР‚Р С•Р С—РЎС“РЎРѓРЎвЂљР С‘РЎвЂљРЎРЉ (${remaining})`);
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.setText("РІСљвЂ¦ Р вЂ™РЎРѓР Вµ РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘РЎРЏ Р С—РЎР‚Р С•РЎРѓР СР С•РЎвЂљРЎР‚Р ВµР Р…РЎвЂ№");
      setTimeout(() => tg.MainButton.hide(), 2000);
    }

    try {
      await apiPost("/api/events/swipe", { event_id: event.id, direction: direction === "right" ? "like" : "dislike" });
    } catch (e) {
      console.error("Swipe error:", e);
    }

    setTimeout(() => {
      card.remove();
      currentCardIndex++;
      const nextEvent = events[currentCardIndex];
      if (nextEvent) {
        const container = document.getElementById("events-container");
        const nextCard = createCard(nextEvent, true);
        container.appendChild(nextCard);
      } else {
        renderCards();
      }
    }, 300);
  }

  function onSkip() {
    const card = document.querySelector("#events-container .card");
    if (card) {
      const event = events[currentCardIndex];
      if (event) swipe(card, event, "left");
    }
    tg.HapticFeedback?.impactOccurred("light");
  }

  
  function updateMainButtonText() {
    if (events.length > currentCardIndex) {
      const remaining = events.length - currentCardIndex;
      tg.MainButton.setText(`РІРЏВ­ Р СџРЎР‚Р С•Р С—РЎС“РЎРѓРЎвЂљР С‘РЎвЂљРЎРЉ (${remaining})`);
    }
  }

  // Р СџР В»Р В°Р Р…
  async function loadPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Р вЂ”Р В°Р С–РЎР‚РЎС“Р В¶Р В°РЎР‹ Р С—Р В»Р В°Р Р…...</div>';

    try {
      const data = await apiGet("/api/plan");
      if (data.ok) {
        plan = data.plan || [];
        renderPlan();
      } else {
        container.innerHTML = '<div class="empty-state">Р С›РЎв‚¬Р С‘Р В±Р С”Р В°: ' + (data.error || 'Р СњР ВµР С‘Р В·Р Р†Р ВµРЎРѓРЎвЂљР Р…Р В°РЎРЏ') + '</div>';
      }
    } catch (e) {
      console.error("Load plan error:", e);
      container.innerHTML = '<div class="empty-state">Р СњР ВµРЎвЂљ РЎРѓР С•Р ВµР Т‘Р С‘Р Р…Р ВµР Р…Р С‘РЎРЏ</div>';
    }
  }

  function renderPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    
    if (!plan || plan.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">СЂСџвЂњвЂ¦</div>
          <div>Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘Р в„– Р Р† Р С—Р В»Р В°Р Р…Р Вµ</div>
        </div>
      `;
      return;
    }

    container.innerHTML = plan
      .map((item) => {
        const eventId = item.event_id || item.id;
        return `
        <div class="plan-item">
          <img class="plan-item-image" src="${item.image_url || ''}" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'" />
          <div class="plan-item-content">
            <div class="plan-item-title">${escapeHtml(item.title)}</div>
            <div class="plan-item-meta">${translateCategory(item.category)} Р’В· ${escapeHtml(item.venue_name || "")}</div>
            <div class="plan-item-actions">
              <button class="btn btn-primary btn-attend" data-event-id="${eventId}">Р Р‡ Р В±РЎвЂ№Р В»</button>
              <button class="btn btn-secondary btn-share" data-event-id="${eventId}">Р СџР С•Р Т‘Р ВµР В»Р С‘РЎвЂљРЎРЉРЎРѓРЎРЏ</button>
              <button class="btn btn-outline btn-remove" data-event-id="${eventId}">Р Р€Р Т‘Р В°Р В»Р С‘РЎвЂљРЎРЉ</button>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    container.querySelectorAll(".btn-attend").forEach((btn) => {
      btn.addEventListener("click", () => markAttended(Number(btn.dataset.eventId)));
    });
    container.querySelectorAll(".btn-share").forEach((btn) => {
      btn.addEventListener("click", () => shareEvent(Number(btn.dataset.eventId)));
    });
    container.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", () => removeFromPlan(Number(btn.dataset.eventId)));
    });
  }

  async function addToPlan(eventId) {
    tg.HapticFeedback?.impactOccurred("light");
    try {
      await apiPost("/api/plan/add", { event_id: eventId });
      tg.showPopup({ message: "Р вЂќР С•Р В±Р В°Р Р†Р В»Р ВµР Р…Р С• Р Р† Р С—Р В»Р В°Р Р…!", buttons: [{ type: "ok" }] });
    } catch (e) {
      tg.showPopup({ message: "Р С›РЎв‚¬Р С‘Р В±Р С”Р В°: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function markAttended(eventId) {
    tg.HapticFeedback?.impactOccurred("medium");
    try {
      const data = await apiPost("/api/plan/attend", { event_id: eventId });
      if (data.ok) {
        tg.showPopup({
          title: "СЂСџвЂќТђ Р РЋР ВµРЎР‚Р С‘РЎРЏ!",
          message: `Р СћР Р†Р С•РЎРЏ РЎРѓР ВµРЎР‚Р С‘РЎРЏ: ${data.streak} Р Т‘Р Р….`,
          buttons: [{ type: "ok" }],
        });
        loadPlan();
      }
    } catch (e) {
      tg.showPopup({ message: "Р С›РЎв‚¬Р С‘Р В±Р С”Р В°: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function removeFromPlan(eventId) {
    try {
      await apiPost("/api/plan/remove", { event_id: eventId });
      loadPlan();
    } catch (e) {
      console.error("Remove error:", e);
      tg.showPopup({ message: "Р С›РЎв‚¬Р С‘Р В±Р С”Р В° Р С—РЎР‚Р С‘ РЎС“Р Т‘Р В°Р В»Р ВµР Р…Р С‘Р С‘", buttons: [{ type: "ok" }] });
    }
  }

  async function shareEvent(eventId) {
    const event = plan.find((e) => e.event_id === eventId || e.id === eventId);
    if (!event) return;

    const botUsername = tg.initDataUnsafe?.user?.username || "msk_tonight_bot";
    const shareUrl = `https://t.me/${botUsername}?start=event_${eventId}`;

    if (tg.shareUrl) {
      tg.shareUrl(shareUrl, `Р СџР С•Р в„–Р Т‘РЎвЂР С Р Р…Р В° ${event.title}?`);
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        tg.showPopup({ message: "Р РЋРЎРѓРЎвЂ№Р В»Р С”Р В° РЎРѓР С”Р С•Р С—Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р В°!", buttons: [{ type: "ok" }] });
      } catch (e) {
        tg.showPopup({ message: shareUrl, buttons: [{ type: "ok" }] });
      }
    }
  }

  // Р вЂРЎР‚Р С•Р Р…Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р С‘РЎРЏ
  async function loadBookings() {
    const container = document.getElementById("bookings-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Р вЂ”Р В°Р С–РЎР‚РЎС“Р В¶Р В°РЎР‹ Р В±Р С‘Р В»Р ВµРЎвЂљРЎвЂ№...</div>';

    try {
      const data = await apiGet("/api/bookings");
      if (data.ok) {
        const { bookings, stats } = data;
        renderBookings(bookings, stats);
      } else {
        container.innerHTML = '<div class="empty-state">Р С›РЎв‚¬Р С‘Р В±Р С”Р В° Р В·Р В°Р С–РЎР‚РЎС“Р В·Р С”Р С‘</div>';
      }
    } catch (e) {
      console.error("Load bookings error:", e);
      container.innerHTML = '<div class="empty-state">Р СњР ВµРЎвЂљ РЎРѓР С•Р ВµР Т‘Р С‘Р Р…Р ВµР Р…Р С‘РЎРЏ</div>';
    }
  }

  function renderBookings(bookings, stats) {
    const container = document.getElementById("bookings-container");
    const statsContainer = document.getElementById("booking-stats");
    
    if (statsContainer && stats) {
      statsContainer.innerHTML = `
        <div class="booking-stats">
          <div class="stat-item">
            <div class="stat-value">${stats.totalBookings || 0}</div>
            <div class="stat-label">Р вЂРЎР‚Р С•Р Р…Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р С‘Р в„–</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalTickets || 0}</div>
            <div class="stat-label">Р вЂР С‘Р В»Р ВµРЎвЂљР С•Р Р†</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalSpent || 0}РІвЂљР…</div>
            <div class="stat-label">Р СџР С•РЎвЂљРЎР‚Р В°РЎвЂЎР ВµР Р…Р С•</div>
          </div>
        </div>
      `;
    }
    
    if (!bookings || bookings.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">СЂСџР‹В«</div>
            <div>Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ Р В·Р В°Р В±РЎР‚Р С•Р Р…Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р Р…РЎвЂ№РЎвЂ¦ Р В±Р С‘Р В»Р ВµРЎвЂљР С•Р Р†</div>
          </div>
        `;
      }
      return;
    }

    if (!container) return;

    container.innerHTML = bookings.map((b) => {
      const statusClass = b.status === 'confirmed' ? 'status-confirmed' : 
                          b.status === 'used' ? 'status-used' : 'status-cancelled';
      const statusText = b.status === 'confirmed' ? 'РІСљвЂњ Р СџР С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р В¶Р Т‘Р ВµР Р…Р С•' : 
                         b.status === 'used' ? 'РІСљвЂњ Р ВРЎРѓР С—Р С•Р В»РЎРЉР В·Р С•Р Р†Р В°Р Р…' : 'РІСљвЂ” Р С›РЎвЂљР СР ВµР Р…РЎвЂР Р…';
      
      return `
        <div class="booking-item ${statusClass}">
          <img class="booking-image" src="${b.image_url || ''}" onerror="this.src='https://via.placeholder.com/800x600?text=Ticket'" />
          <div class="booking-content">
            <div class="booking-header">
              <div class="booking-ref">Р вЂРЎР‚Р С•Р Р…РЎРЉ: ${b.booking_reference || 'N/A'}</div>
              <div class="booking-status ${statusClass}">${statusText}</div>
            </div>
            <div class="booking-title">${escapeHtml(b.title)}</div>
            <div class="booking-meta">${escapeHtml(b.venue_name || '')} Р’В· ${b.start_time ? new Date(b.start_time).toLocaleDateString() : ''}</div>
            <div class="booking-details">
              <span>СЂСџР‹Сџ ${b.ticket_count} Р В±Р С‘Р В»Р ВµРЎвЂљР В°</span>
              <span>СЂСџвЂ™В° ${b.total_price}РІвЂљР…</span>
            </div>
            <div class="booking-actions">
              ${b.external_url ? `<a class="btn btn-primary" href="${b.external_url}" target="_blank">Р С›РЎвЂљР С”РЎР‚РЎвЂ№РЎвЂљРЎРЉ Р В±Р С‘Р В»Р ВµРЎвЂљ</a>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-use-booking" data-booking-id="${b.id}">Р Р‡ Р С—Р С•РЎРѓР ВµРЎвЂљР С‘Р В»</button>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-cancel-booking" data-booking-id="${b.id}">Р С›РЎвЂљР СР ВµР Р…Р С‘РЎвЂљРЎРЉ</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-use-booking").forEach((btn) => {
      btn.addEventListener("click", () => useBooking(Number(btn.dataset.bookingId)));
    });
    container.querySelectorAll(".btn-cancel-booking").forEach((btn) => {
      btn.addEventListener("click", () => cancelBooking(Number(btn.dataset.bookingId)));
    });
  }

  async function bookEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const price = event.price_min || 0;
    
    tg.showPopup({
      title: "СЂСџР‹В« Р вЂРЎР‚Р С•Р Р…Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р С‘Р Вµ",
      message: `${event.title}\n\nР вЂР С‘Р В»Р ВµРЎвЂљР С•Р Р†: 1\nР С™ Р С•Р С—Р В»Р В°РЎвЂљР Вµ: ${price}РІвЂљР…`,
      buttons: [
        { type: "ok", text: "Р вЂ”Р В°Р В±РЎР‚Р С•Р Р…Р С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉ" },
        { type: "cancel", text: "Р С›РЎвЂљР СР ВµР Р…Р В°" }
      ]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/create", { event_id: eventId, ticket_count: 1 });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "РІСљвЂ¦ Р Р€РЎРѓР С—Р ВµРЎв‚¬Р Р…Р С•!",
              message: `Р вЂРЎР‚Р С•Р Р…РЎРЉ: ${data.booking.booking_reference}\nР вЂР С‘Р В»Р ВµРЎвЂљ Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р ВµР Р… Р Р†Р С• Р Р†Р С”Р В»Р В°Р Т‘Р С”Р Вµ "Р вЂР С‘Р В»Р ВµРЎвЂљРЎвЂ№"`,
              buttons: [{ type: "ok" }]
            });
          }
        } catch (e) {
          tg.showPopup({ message: "Р С›РЎв‚¬Р С‘Р В±Р С”Р В°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function useBooking(bookingId) {
    tg.showPopup({
      title: "Р СџР С•РЎРѓР ВµРЎвЂљР С‘РЎвЂљРЎРЉ РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘Р Вµ?",
      message: "Р СџР С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р Т‘Р С‘РЎвЂљР Вµ, РЎвЂЎРЎвЂљР С• Р Р†РЎвЂ№ Р С—Р С•РЎРѓР ВµРЎвЂљР С‘Р В»Р С‘ Р СР ВµРЎР‚Р С•Р С—РЎР‚Р С‘РЎРЏРЎвЂљР С‘Р Вµ",
      buttons: [{ type: "ok", text: "Р СџР С•Р Т‘РЎвЂљР Р†Р ВµРЎР‚Р Т‘Р С‘РЎвЂљРЎРЉ" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/use", { booking_id: bookingId });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "СЂСџвЂќТђ Р РЋР ВµРЎР‚Р С‘РЎРЏ!",
              message: `Р СћР Р†Р С•РЎРЏ РЎРѓР ВµРЎР‚Р С‘РЎРЏ: ${data.streak} Р Т‘Р Р….`,
              buttons: [{ type: "ok" }]
            });
            loadBookings();
          }
        } catch (e) {
          tg.showPopup({ message: "Р С›РЎв‚¬Р С‘Р В±Р С”Р В°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function cancelBooking(bookingId) {
    tg.showPopup({
      title: "Р С›РЎвЂљР СР ВµР Р…Р С‘РЎвЂљРЎРЉ Р В±РЎР‚Р С•Р Р…РЎРЉ?",
      message: "Р вЂ™РЎвЂ№ РЎС“Р Р†Р ВµРЎР‚Р ВµР Р…РЎвЂ№, РЎвЂЎРЎвЂљР С• РЎвЂ¦Р С•РЎвЂљР С‘РЎвЂљР Вµ Р С•РЎвЂљР СР ВµР Р…Р С‘РЎвЂљРЎРЉ Р В±РЎР‚Р С•Р Р…Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р С‘Р Вµ?",
      buttons: [{ type: "ok", text: "Р С›РЎвЂљР СР ВµР Р…Р С‘РЎвЂљРЎРЉ" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          await apiPost("/api/bookings/cancel", { booking_id: bookingId });
          tg.HapticFeedback?.notificationOccurred("warning");
          tg.showPopup({ message: "Р вЂРЎР‚Р С•Р Р…РЎРЉ Р С•РЎвЂљР СР ВµР Р…Р ВµР Р…Р В°", buttons: [{ type: "ok" }] });
          loadBookings();
        } catch (e) {
          tg.showPopup({ message: "Р С›РЎв‚¬Р С‘Р В±Р С”Р В°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  
  // Р С™Р С’Р В Р СћР С’
  async function loadMap() {
    const container = document.getElementById("map-container");
    const dateFilter = document.getElementById("filter-map-date");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Р вЂ”Р В°Р С–РЎР‚РЎС“Р В¶Р В°РЎР‹ Р С”Р В°РЎР‚РЎвЂљРЎС“...</div>';
    
    try {
      const dateValue = dateFilter ? dateFilter.value : "today";
      const dateParam = dateValue === "today" ? new Date().toISOString().split('T')[0] : "";
      
      const data = await apiGet("/api/map" + (dateParam ? "?date=" + dateParam : ""));
      log("СЂСџвЂњВ¦ Map data:", data);
      
      if (data.ok && data.events && data.events.length > 0) {
        renderMap(data.events, container);
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">СЂСџвЂ”С”РїС‘РЏ</div>
            <div>Р СњР ВµРЎвЂљ РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘Р в„– Р Р…Р В° Р С”Р В°РЎР‚РЎвЂљР Вµ</div>
          </div>
        `;
      }
    } catch (e) {
      log("РІСњРЉ Map error:", e);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">РІСњРЉ</div>
          <div>Р С›РЎв‚¬Р С‘Р В±Р С”Р В° Р В·Р В°Р С–РЎР‚РЎС“Р В·Р С”Р С‘ Р С”Р В°РЎР‚РЎвЂљРЎвЂ№</div>
        </div>
      `;
    }
  }
  
  function renderMap(events, container) {
    // Р ВРЎРѓР С—Р С•Р В»РЎРЉР В·РЎС“Р ВµР С РЎРѓРЎвЂљР В°РЎвЂљР С‘РЎвЂЎР Р…РЎС“РЎР‹ Р С”Р В°РЎР‚РЎвЂљРЎС“ РЎРѓ Р СР В°РЎР‚Р С”Р ВµРЎР‚Р В°Р СР С‘ (Р В±Р ВµР В· Р Р†Р Р…Р ВµРЎв‚¬Р Р…Р С‘РЎвЂ¦ Р В±Р С‘Р В±Р В»Р С‘Р С•РЎвЂљР ВµР С”)
    const centerLat = 55.7558;
    const centerLng = 37.6173;
    const zoom = 11;
    
    // Р РЋР С•Р В·Р Т‘Р В°РЎвЂР С Р С‘Р Р…РЎвЂљР ВµРЎР‚Р В°Р С”РЎвЂљР С‘Р Р†Р Р…РЎС“РЎР‹ Р С”Р В°РЎР‚РЎвЂљРЎС“ РЎвЂЎР ВµРЎР‚Р ВµР В· OpenStreetMap iframe
    let markers = events.map(e => {
      const color = e.category === "concert" ? "СЂСџР‹Вµ" : 
                   e.category === "theater" ? "СЂСџР‹В­" :
                   e.category === "bar" ? "СЂСџРЊС”" :
                   e.category === "club" ? "СЂСџвЂ™С“" : "СЂСџР‹РЃ";
      return `${color} ${e.title}`;
    }).join('<br>');
    
    container.innerHTML = `
      <div style="width:100%;height:100%;position:relative;">
        <iframe 
          src="https://www.openstreetmap.org/export/embed.html?bbox=37.3,55.5,37.9,55.9&amp;layer=mapnik"
          style="width:100%;height:100%;border:none;"
        ></iframe>
        <div style="position:absolute;bottom:10px;left:10px;right:10px;background:rgba(255,255,255,0.95);padding:15px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2);max-height:200px;overflow-y:auto;">
          <div style="font-weight:600;margin-bottom:10px;">СЂСџвЂњРЊ Р РЋР С•Р В±РЎвЂ№РЎвЂљР С‘РЎРЏ (${events.length})</div>
          <div style="font-size:13px;line-height:1.6;">${markers}</div>
        </div>
      </div>
    `;
  }

  // Р СџРЎР‚Р С•РЎвЂћР С‘Р В»РЎРЉ
  async function loadProfile() {
    try {
      const data = await apiGet("/api/profile");
      if (data.ok) {
        profile = data;
        renderProfile();
      }
    } catch (e) {
      console.error("Load profile error:", e);
    }
  }

  function renderProfile() {
    if (!profile) return;

    const streakEl = document.getElementById("streak-count");
    const plannedEl = document.getElementById("stat-planned");
    const attendedEl = document.getElementById("stat-attended");
    const likesEl = document.getElementById("stat-likes");
    const bookingsEl = document.getElementById("stat-bookings");

    if (streakEl) streakEl.textContent = profile.user?.streak_days || 0;
    if (plannedEl) plannedEl.textContent = profile.stats?.totalPlanned || 0;
    if (attendedEl) attendedEl.textContent = profile.stats?.totalAttended || 0;
    if (likesEl) likesEl.textContent = profile.stats?.likes || 0;
    if (bookingsEl) bookingsEl.textContent = profile.booking_stats?.totalBookings || 0;

    const badgesContainer = document.getElementById("badges-container");
    if (!badgesContainer) return;

    if (!profile.badges || profile.badges.length === 0) {
      badgesContainer.innerHTML = '<div class="empty-state">Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ Р В·Р Р…Р В°РЎвЂЎР С”Р С•Р Р†</div>';
      return;
    }

    badgesContainer.innerHTML = profile.badges
      .map(
        (b) => `
        <div class="badge-item ${b.earned ? "earned" : ""}">
          <div class="badge-emoji">${b.emoji}</div>
          <div class="badge-name">${b.title}</div>
          <div class="badge-desc">${b.description}</div>
        </div>
      `
      )
      .join("");
  }

  // Р Р€РЎвЂљР С‘Р В»Р С‘РЎвЂљРЎвЂ№
  function formatPrice(min, max) {
    if (!min && !max) return "Р вЂР ВµРЎРѓР С—Р В»Р В°РЎвЂљР Р…Р С•";
    if (min === max || !max) return `${min}РІвЂљР…`;
    if (!min) return `Р Т‘Р С• ${max}РІвЂљР…`;
    return `${min}РІР‚вЂњ${max}РІвЂљР…`;
  }

  function translateCategory(cat) {
    const map = {
      concert: "Р С™Р С•Р Р…РЎвЂ Р ВµРЎР‚РЎвЂљ",
      theater: "Р СћР ВµР В°РЎвЂљРЎР‚",
      bar: "Р вЂР В°РЎР‚",
      club: "Р С™Р В»РЎС“Р В±",
      exhibition: "Р вЂ™РЎвЂ№РЎРѓРЎвЂљР В°Р Р†Р С”Р В°",
    };
    return map[cat] || cat;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Р вЂ”Р В°Р С—РЎС“РЎРѓР С” - Р В·Р В°Р С–РЎР‚РЎС“Р В¶Р В°Р ВµР С РЎРѓР С•Р В±РЎвЂ№РЎвЂљР С‘РЎРЏ
  console.log("App initialized, loading events...");
  loadEvents();
}