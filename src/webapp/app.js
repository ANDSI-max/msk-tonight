function log(msg) { console.log(msg); }

// Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Р В РЎСџР РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРЎвЂњ Telegram
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

// Р В РІР‚вЂњР В РўвЂР РЋРІР‚ВР В РЎВ Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В РЎвЂ DOM Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В РўвЂ Р В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В Р’ВµР В РІвЂћвЂ“
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  applyTheme();
  
  // Р В Р Р‹Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ
  let events = [];
  let plan = [];
  let profile = null;
  let currentCardIndex = 0;

  // Р В РЎСљР В Р’В°Р В Р вЂ Р В РЎвЂР В РЎвЂ“Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ - Р РЋР С“ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР В РЎвЂўР В РІвЂћвЂ“ Р В Р вЂ¦Р В Р’В° null
  const tabs = {
    today: document.getElementById("tab-today"),
    plan: document.getElementById("tab-plan"),
    bookings: document.getElementById("tab-bookings"),
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
      if (tabName === "profile") loadProfile();
      if (tabName === "today") {
        currentCardIndex = 0;
        renderCards();
      }
    });
  });

  // Р В Р’В¤Р В РЎвЂР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋР вЂљР РЋРІР‚в„– - Р РЋР С“ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂќР В РЎвЂўР В РІвЂћвЂ“ Р В Р вЂ¦Р В Р’В° null
  const filterCategory = document.getElementById("filter-category");
  const filterDistrict = document.getElementById("filter-district");
  if (filterCategory) {
    filterCategory.addEventListener("change", loadEvents);
  }
  if (filterDistrict) {
    filterDistrict.addEventListener("change", loadEvents);
  }

  // Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’В° Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В РІвЂћвЂ“
  async function loadEvents() {
    console.log("loadEvents called");
    const container = document.getElementById("events-container");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В¶Р В Р’В°Р РЋР вЂ№ Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР РЋР РЏ...</div>';

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
        container.innerHTML = '<div class="empty-state">Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В РЎвЂ</div>';
      }
    } catch (e) {
      console.error("Load events error:", e);
      container.innerHTML = '<div class="empty-state">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р РЋР С“Р В РЎвЂўР В Р’ВµР В РўвЂР В РЎвЂР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ</div>';
    }
  }

  // API helpers
  async function apiGet(path) {
    try {
      const res = await fetch(API_BASE + path, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("API GET", path, "=>", data);
      return data;
    } catch (e) {
      console.error("API GET error:", e, "path:", path);
      throw e;
    }
  }

  async function apiPost(path, body) {
    try {
      const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("API POST", path, "=>", data);
      return data;
    } catch (e) {
      console.error("API POST error:", e, "path:", path);
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

  // Р В Р’В Р В Р’ВµР В Р вЂ¦Р В РўвЂР В Р’ВµР РЋР вЂљ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
  function renderCards() {
    const container = document.getElementById("events-container");
    if (!container) return;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">РЎР‚РЎСџР Р‰РЎвЂњ</div>
          <div>Р В Р Р‹Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В РІвЂћвЂ“ Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™</div>
        </div>
      `;
      return;
    }

    events.slice(currentCardIndex).forEach((event, idx) => {
      const card = createCard(event, idx === 0);
      if (idx === 0) container.appendChild(card);
    });

    if (events.length > currentCardIndex) {
      tg.MainButton.show();
      tg.MainButton.setText("Р В РЎСџР РЋР вЂљР В РЎвЂўР В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ");
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.hide();
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
        <div class="card-meta">${category} Р вЂ™Р’В· ${escapeHtml(event.venue_name || "")}</div>
        <div class="card-meta">${escapeHtml(event.district || "")}</div>
        <div class="card-price">${price}</div>
        <div class="card-desc">${escapeHtml(event.description || "")}</div>
        <div class="card-actions">
          <button class="btn btn-outline btn-dislike">Р Р†РЎСљР Р‰</button>
          <button class="btn btn-secondary btn-add">Р В РІР‚в„ў Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦</button>
          <button class="btn btn-primary btn-book">РЎР‚РЎСџР вЂ№Р’В« Р В РІР‚ВР В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™</button>
          <button class="btn btn-outline btn-like">Р Р†РЎСљР’В¤Р С—РЎвЂР РЏ</button>
        </div>
      </div>
    `;

    if (isTop) setupSwipe(card, event);

    return card;
  }

  // Р В Р Р‹Р В Р вЂ Р В Р’В°Р В РІвЂћвЂ“Р В РЎвЂ”Р РЋРІР‚в„–
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

  async function swipe(card, event, direction) {
    tg.HapticFeedback?.impactOccurred("medium");
    card.classList.add(direction === "left" ? "swipe-left" : "swipe-right");

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
  }

  // Р В РЎСџР В Р’В»Р В Р’В°Р В Р вЂ¦
  async function loadPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В¶Р В Р’В°Р РЋР вЂ№ Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦...</div>';

    try {
      const data = await apiGet("/api/plan");
      if (data.ok) {
        plan = data.plan || [];
        renderPlan();
      } else {
        container.innerHTML = '<div class="empty-state">Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В°: ' + (data.error || 'Р В РЎСљР В Р’ВµР В РЎвЂР В Р’В·Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ¦Р В Р’В°Р РЋР РЏ') + '</div>';
      }
    } catch (e) {
      console.error("Load plan error:", e);
      container.innerHTML = '<div class="empty-state">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р РЋР С“Р В РЎвЂўР В Р’ВµР В РўвЂР В РЎвЂР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ</div>';
    }
  }

  function renderPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    
    if (!plan || plan.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">РЎР‚РЎСџРІР‚СљРІР‚В¦</div>
          <div>Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В° Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В РІвЂћвЂ“ Р В Р вЂ  Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦Р В Р’Вµ</div>
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
            <div class="plan-item-meta">${translateCategory(item.category)} Р вЂ™Р’В· ${escapeHtml(item.venue_name || "")}</div>
            <div class="plan-item-actions">
              <button class="btn btn-primary btn-attend" data-event-id="${eventId}">Р В Р вЂЎ Р В Р’В±Р РЋРІР‚в„–Р В Р’В»</button>
              <button class="btn btn-secondary btn-share" data-event-id="${eventId}">Р В РЎСџР В РЎвЂўР В РўвЂР В Р’ВµР В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰Р РЋР С“Р РЋР РЏ</button>
              <button class="btn btn-outline btn-remove" data-event-id="${eventId}">Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>
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
      tg.showPopup({ message: "Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂў Р В Р вЂ  Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦!", buttons: [{ type: "ok" }] });
    } catch (e) {
      tg.showPopup({ message: "Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В°: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function markAttended(eventId) {
    tg.HapticFeedback?.impactOccurred("medium");
    try {
      const data = await apiPost("/api/plan/attend", { event_id: eventId });
      if (data.ok) {
        tg.showPopup({
          title: "РЎР‚РЎСџРІР‚СњРўС’ Р В Р Р‹Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋР РЏ!",
          message: `Р В РЎС›Р В Р вЂ Р В РЎвЂўР РЋР РЏ Р РЋР С“Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋР РЏ: ${data.streak} Р В РўвЂР В Р вЂ¦.`,
          buttons: [{ type: "ok" }],
        });
        loadPlan();
      }
    } catch (e) {
      tg.showPopup({ message: "Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В°: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function removeFromPlan(eventId) {
    try {
      await apiPost("/api/plan/remove", { event_id: eventId });
      loadPlan();
    } catch (e) {
      console.error("Remove error:", e);
      tg.showPopup({ message: "Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂ", buttons: [{ type: "ok" }] });
    }
  }

  async function shareEvent(eventId) {
    const event = plan.find((e) => e.event_id === eventId || e.id === eventId);
    if (!event) return;

    const botUsername = tg.initDataUnsafe?.user?.username || "msk_tonight_bot";
    const shareUrl = `https://t.me/${botUsername}?start=event_${eventId}`;

    if (tg.shareUrl) {
      tg.shareUrl(shareUrl, `Р В РЎСџР В РЎвЂўР В РІвЂћвЂ“Р В РўвЂР РЋРІР‚ВР В РЎВ Р В Р вЂ¦Р В Р’В° ${event.title}?`);
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        tg.showPopup({ message: "Р В Р Р‹Р РЋР С“Р РЋРІР‚в„–Р В Р’В»Р В РЎвЂќР В Р’В° Р РЋР С“Р В РЎвЂќР В РЎвЂўР В РЎвЂ”Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р’В°!", buttons: [{ type: "ok" }] });
      } catch (e) {
        tg.showPopup({ message: shareUrl, buttons: [{ type: "ok" }] });
      }
    }
  }

  // Р В РІР‚ВР РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ
  async function loadBookings() {
    const container = document.getElementById("bookings-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В¶Р В Р’В°Р РЋР вЂ№ Р В Р’В±Р В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–...</div>';

    try {
      const data = await apiGet("/api/bookings");
      if (data.ok) {
        const { bookings, stats } = data;
        renderBookings(bookings, stats);
      } else {
        container.innerHTML = '<div class="empty-state">Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В РЎвЂ</div>';
      }
    } catch (e) {
      console.error("Load bookings error:", e);
      container.innerHTML = '<div class="empty-state">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р РЋР С“Р В РЎвЂўР В Р’ВµР В РўвЂР В РЎвЂР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ</div>';
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
            <div class="stat-label">Р В РІР‚ВР РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РІвЂћвЂ“</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalTickets || 0}</div>
            <div class="stat-label">Р В РІР‚ВР В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™Р В РЎвЂўР В Р вЂ </div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalSpent || 0}Р Р†РІР‚С™Р вЂ¦</div>
            <div class="stat-label">Р В РЎСџР В РЎвЂўР РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂў</div>
          </div>
        </div>
      `;
    }
    
    if (!bookings || bookings.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">РЎР‚РЎСџР вЂ№Р’В«</div>
            <div>Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В° Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р В Р’В·Р В Р’В°Р В Р’В±Р РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В Р’В±Р В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™Р В РЎвЂўР В Р вЂ </div>
          </div>
        `;
      }
      return;
    }

    if (!container) return;

    container.innerHTML = bookings.map((b) => {
      const statusClass = b.status === 'confirmed' ? 'status-confirmed' : 
                          b.status === 'used' ? 'status-used' : 'status-cancelled';
      const statusText = b.status === 'confirmed' ? 'Р Р†РЎС™РІР‚Сљ Р В РЎСџР В РЎвЂўР В РўвЂР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР В Р’В¶Р В РўвЂР В Р’ВµР В Р вЂ¦Р В РЎвЂў' : 
                         b.status === 'used' ? 'Р Р†РЎС™РІР‚Сљ Р В Р’ВР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦' : 'Р Р†РЎС™РІР‚вЂќ Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚ВР В Р вЂ¦';
      
      return `
        <div class="booking-item ${statusClass}">
          <img class="booking-image" src="${b.image_url || ''}" onerror="this.src='https://via.placeholder.com/800x600?text=Ticket'" />
          <div class="booking-content">
            <div class="booking-header">
              <div class="booking-ref">Р В РІР‚ВР РЋР вЂљР В РЎвЂўР В Р вЂ¦Р РЋР Р‰: ${b.booking_reference || 'N/A'}</div>
              <div class="booking-status ${statusClass}">${statusText}</div>
            </div>
            <div class="booking-title">${escapeHtml(b.title)}</div>
            <div class="booking-meta">${escapeHtml(b.venue_name || '')} Р вЂ™Р’В· ${b.start_time ? new Date(b.start_time).toLocaleDateString() : ''}</div>
            <div class="booking-details">
              <span>РЎР‚РЎСџР вЂ№РЎСџ ${b.ticket_count} Р В Р’В±Р В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™Р В Р’В°</span>
              <span>РЎР‚РЎСџРІР‚в„ўР’В° ${b.total_price}Р Р†РІР‚С™Р вЂ¦</span>
            </div>
            <div class="booking-actions">
              ${b.external_url ? `<a class="btn btn-primary" href="${b.external_url}" target="_blank">Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В Р’В±Р В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™</a>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-use-booking" data-booking-id="${b.id}">Р В Р вЂЎ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р В Р’ВµР РЋРІР‚С™Р В РЎвЂР В Р’В»</button>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-cancel-booking" data-booking-id="${b.id}">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>` : ''}
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
      title: "РЎР‚РЎСџР вЂ№Р’В« Р В РІР‚ВР РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ",
      message: `${event.title}\n\nР В РІР‚ВР В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™Р В РЎвЂўР В Р вЂ : 1\nР В РЎв„ў Р В РЎвЂўР В РЎвЂ”Р В Р’В»Р В Р’В°Р РЋРІР‚С™Р В Р’Вµ: ${price}Р Р†РІР‚С™Р вЂ¦`,
      buttons: [
        { type: "ok", text: "Р В РІР‚вЂќР В Р’В°Р В Р’В±Р РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰" },
        { type: "cancel", text: "Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°" }
      ]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/create", { event_id: eventId, ticket_count: 1 });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "Р Р†РЎС™РІР‚В¦ Р В Р в‚¬Р РЋР С“Р В РЎвЂ”Р В Р’ВµР РЋРІвЂљВ¬Р В Р вЂ¦Р В РЎвЂў!",
              message: `Р В РІР‚ВР РЋР вЂљР В РЎвЂўР В Р вЂ¦Р РЋР Р‰: ${data.booking.booking_reference}\nР В РІР‚ВР В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™ Р В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋРЎвЂњР В РЎвЂ”Р В Р’ВµР В Р вЂ¦ Р В Р вЂ Р В РЎвЂў Р В Р вЂ Р В РЎвЂќР В Р’В»Р В Р’В°Р В РўвЂР В РЎвЂќР В Р’Вµ "Р В РІР‚ВР В РЎвЂР В Р’В»Р В Р’ВµР РЋРІР‚С™Р РЋРІР‚в„–"`,
              buttons: [{ type: "ok" }]
            });
          }
        } catch (e) {
          tg.showPopup({ message: "Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function useBooking(bookingId) {
    tg.showPopup({
      title: "Р В РЎСџР В РЎвЂўР РЋР С“Р В Р’ВµР РЋРІР‚С™Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ?",
      message: "Р В РЎСџР В РЎвЂўР В РўвЂР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР В РўвЂР В РЎвЂР РЋРІР‚С™Р В Р’Вµ, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂў Р В Р вЂ Р РЋРІР‚в„– Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р В Р’ВµР РЋРІР‚С™Р В РЎвЂР В Р’В»Р В РЎвЂ Р В РЎВР В Р’ВµР РЋР вЂљР В РЎвЂўР В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋР РЏР РЋРІР‚С™Р В РЎвЂР В Р’Вµ",
      buttons: [{ type: "ok", text: "Р В РЎСџР В РЎвЂўР В РўвЂР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР В РўвЂР В РЎвЂР РЋРІР‚С™Р РЋР Р‰" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/use", { booking_id: bookingId });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "РЎР‚РЎСџРІР‚СњРўС’ Р В Р Р‹Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋР РЏ!",
              message: `Р В РЎС›Р В Р вЂ Р В РЎвЂўР РЋР РЏ Р РЋР С“Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋР РЏ: ${data.streak} Р В РўвЂР В Р вЂ¦.`,
              buttons: [{ type: "ok" }]
            });
            loadBookings();
          }
        } catch (e) {
          tg.showPopup({ message: "Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function cancelBooking(bookingId) {
    tg.showPopup({
      title: "Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В±Р РЋР вЂљР В РЎвЂўР В Р вЂ¦Р РЋР Р‰?",
      message: "Р В РІР‚в„ўР РЋРІР‚в„– Р РЋРЎвЂњР В Р вЂ Р В Р’ВµР РЋР вЂљР В Р’ВµР В Р вЂ¦Р РЋРІР‚в„–, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂў Р РЋРІР‚В¦Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В±Р РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ?",
      buttons: [{ type: "ok", text: "Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          await apiPost("/api/bookings/cancel", { booking_id: bookingId });
          tg.HapticFeedback?.notificationOccurred("warning");
          tg.showPopup({ message: "Р В РІР‚ВР РЋР вЂљР В РЎвЂўР В Р вЂ¦Р РЋР Р‰ Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В Р’В°", buttons: [{ type: "ok" }] });
          loadBookings();
        } catch (e) {
          tg.showPopup({ message: "Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  // Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰
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
      badgesContainer.innerHTML = '<div class="empty-state">Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В° Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂќР В РЎвЂўР В Р вЂ </div>';
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

  // Р В Р в‚¬Р РЋРІР‚С™Р В РЎвЂР В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋРІР‚в„–
  function formatPrice(min, max) {
    if (!min && !max) return "Р В РІР‚ВР В Р’ВµР РЋР С“Р В РЎвЂ”Р В Р’В»Р В Р’В°Р РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂў";
    if (min === max || !max) return `${min}Р Р†РІР‚С™Р вЂ¦`;
    if (!min) return `Р В РўвЂР В РЎвЂў ${max}Р Р†РІР‚С™Р вЂ¦`;
    return `${min}Р Р†Р вЂљРІР‚Сљ${max}Р Р†РІР‚С™Р вЂ¦`;
  }

  function translateCategory(cat) {
    const map = {
      concert: "Р В РЎв„ўР В РЎвЂўР В Р вЂ¦Р РЋРІР‚В Р В Р’ВµР РЋР вЂљР РЋРІР‚С™",
      theater: "Р В РЎС›Р В Р’ВµР В Р’В°Р РЋРІР‚С™Р РЋР вЂљ",
      bar: "Р В РІР‚ВР В Р’В°Р РЋР вЂљ",
      club: "Р В РЎв„ўР В Р’В»Р РЋРЎвЂњР В Р’В±",
      exhibition: "Р В РІР‚в„ўР РЋРІР‚в„–Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ Р В РЎвЂќР В Р’В°",
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

  // Р В РІР‚вЂќР В Р’В°Р В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р В РЎвЂќ - Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР РЋР РЏ
  console.log("App initialized, loading events...");
  loadEvents();
}