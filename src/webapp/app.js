function log(msg) { console.log(msg); }

// РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// РџСЂРёРјРµРЅСЏРµРј С‚РµРјСѓ Telegram
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

// Р–РґС‘Рј Р·Р°РіСЂСѓР·РєРё DOM РїРµСЂРµРґ РёРЅРёС†РёР°Р»РёР·Р°С†РёРµР№
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  applyTheme();
  
  // РЎРѕСЃС‚РѕСЏРЅРёРµ
  let events = [];
  let plan = [];
  let profile = null;
  let currentCardIndex = 0;

  // РќР°РІРёРіР°С†РёСЏ - СЃ РїСЂРѕРІРµСЂРєРѕР№ РЅР° null
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

  // Р¤РёР»СЊС‚СЂС‹ - СЃ РїСЂРѕРІРµСЂРєРѕР№ РЅР° null
  const filterCategory = document.getElementById("filter-category");
  const filterDistrict = document.getElementById("filter-district");
  if (filterCategory) {
    filterCategory.addEventListener("change", loadEvents);
  }
  if (filterDistrict) {
    filterDistrict.addEventListener("change", loadEvents);
  }

  // Р—Р°РіСЂСѓР·РєР° СЃРѕР±С‹С‚РёР№
  async function loadEvents() {
    console.log("loadEvents called");
    const container = document.getElementById("events-container");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Р—Р°РіСЂСѓР¶Р°СЋ СЃРѕР±С‹С‚РёСЏ...</div>';

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
        container.innerHTML = '<div class="empty-state">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</div>';
      }
    } catch (e) {
      console.error("Load events error:", e);
      container.innerHTML = '<div class="empty-state">РќРµС‚ СЃРѕРµРґРёРЅРµРЅРёСЏ</div>';
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
      log("рџ“¦ API GET " + path + " => " + JSON.stringify(data));
      return data;
    } catch (e) {
      log("вќЊ API GET error: " + path + " - " + e.message);
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
      log("рџ“¦ API POST " + path + " => " + JSON.stringify(data));
      return data;
    } catch (e) {
      log("вќЊ API POST error: " + path + " - " + e.message);
      throw e;
    }
  }

  const API_BASE = window.location.origin;
  
  // РџРѕР»СѓС‡Р°РµРј initData РёР· Telegram
  function getInitData() {
    if (tg.initData) return tg.initData;
    return null;
  }
  const HEADERS = { "Content-Type": "application/json" };

  // Р РµРЅРґРµСЂ РєР°СЂС‚РѕС‡РµРє
  function renderCards() {
    const container = document.getElementById("events-container");
    if (!container) return;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">рџЊѓ</div>
          <div>РЎРѕР±С‹С‚РёР№ РЅРµС‚</div>
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
      tg.MainButton.setText(`вЏ­ РџСЂРѕРїСѓСЃС‚РёС‚СЊ (${remaining})`);
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.setText("вњ… Р’СЃРµ СЃРѕР±С‹С‚РёСЏ РїСЂРѕСЃРјРѕС‚СЂРµРЅС‹");
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
        <div class="card-meta">${category} В· ${escapeHtml(event.venue_name || "")}</div>
        <div class="card-meta">${escapeHtml(event.district || "")}</div>
        <div class="card-price">${price}</div>
        <div class="card-desc">${escapeHtml(event.description || "")}</div>
        <div class="card-actions">
          <button class="btn btn-outline btn-dislike">вќЊ</button>
          <button class="btn btn-secondary btn-add">Р’ РїР»Р°РЅ</button>
          <button class="btn btn-primary btn-book">рџЋ« Р‘РёР»РµС‚</button>
          <button class="btn btn-outline btn-like">вќ¤пёЏ</button>
        </div>
      </div>
    `;

    if (isTop) setupSwipe(card, event);

    return card;
  }

  // РЎРІР°Р№РїС‹
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
      tg.MainButton.setText(`вЏ­ РџСЂРѕРїСѓСЃС‚РёС‚СЊ (${remaining})`);
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.setText("вњ… Р’СЃРµ СЃРѕР±С‹С‚РёСЏ РїСЂРѕСЃРјРѕС‚СЂРµРЅС‹");
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
      tg.MainButton.setText(`вЏ­ РџСЂРѕРїСѓСЃС‚РёС‚СЊ (${remaining})`);
    }
  }

  // РџР»Р°РЅ
  async function loadPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Р—Р°РіСЂСѓР¶Р°СЋ РїР»Р°РЅ...</div>';

    try {
      const data = await apiGet("/api/plan");
      if (data.ok) {
        plan = data.plan || [];
        renderPlan();
      } else {
        container.innerHTML = '<div class="empty-state">РћС€РёР±РєР°: ' + (data.error || 'РќРµРёР·РІРµСЃС‚РЅР°СЏ') + '</div>';
      }
    } catch (e) {
      console.error("Load plan error:", e);
      container.innerHTML = '<div class="empty-state">РќРµС‚ СЃРѕРµРґРёРЅРµРЅРёСЏ</div>';
    }
  }

  function renderPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    
    if (!plan || plan.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">рџ“…</div>
          <div>РџРѕРєР° РЅРµС‚ СЃРѕР±С‹С‚РёР№ РІ РїР»Р°РЅРµ</div>
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
            <div class="plan-item-meta">${translateCategory(item.category)} В· ${escapeHtml(item.venue_name || "")}</div>
            <div class="plan-item-actions">
              <button class="btn btn-primary btn-attend" data-event-id="${eventId}">РЇ Р±С‹Р»</button>
              <button class="btn btn-secondary btn-share" data-event-id="${eventId}">РџРѕРґРµР»РёС‚СЊСЃСЏ</button>
              <button class="btn btn-outline btn-remove" data-event-id="${eventId}">РЈРґР°Р»РёС‚СЊ</button>
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
      tg.showPopup({ message: "Р”РѕР±Р°РІР»РµРЅРѕ РІ РїР»Р°РЅ!", buttons: [{ type: "ok" }] });
    } catch (e) {
      tg.showPopup({ message: "РћС€РёР±РєР°: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function markAttended(eventId) {
    tg.HapticFeedback?.impactOccurred("medium");
    try {
      const data = await apiPost("/api/plan/attend", { event_id: eventId });
      if (data.ok) {
        tg.showPopup({
          title: "рџ”Ґ РЎРµСЂРёСЏ!",
          message: `РўРІРѕСЏ СЃРµСЂРёСЏ: ${data.streak} РґРЅ.`,
          buttons: [{ type: "ok" }],
        });
        loadPlan();
      }
    } catch (e) {
      tg.showPopup({ message: "РћС€РёР±РєР°: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function removeFromPlan(eventId) {
    try {
      await apiPost("/api/plan/remove", { event_id: eventId });
      loadPlan();
    } catch (e) {
      console.error("Remove error:", e);
      tg.showPopup({ message: "РћС€РёР±РєР° РїСЂРё СѓРґР°Р»РµРЅРёРё", buttons: [{ type: "ok" }] });
    }
  }

  async function shareEvent(eventId) {
    const event = plan.find((e) => e.event_id === eventId || e.id === eventId);
    if (!event) return;

    const botUsername = tg.initDataUnsafe?.user?.username || "msk_tonight_bot";
    const shareUrl = `https://t.me/${botUsername}?start=event_${eventId}`;

    if (tg.shareUrl) {
      tg.shareUrl(shareUrl, `РџРѕР№РґС‘Рј РЅР° ${event.title}?`);
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        tg.showPopup({ message: "РЎСЃС‹Р»РєР° СЃРєРѕРїРёСЂРѕРІР°РЅР°!", buttons: [{ type: "ok" }] });
      } catch (e) {
        tg.showPopup({ message: shareUrl, buttons: [{ type: "ok" }] });
      }
    }
  }

  // Р‘СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ
  async function loadBookings() {
    const container = document.getElementById("bookings-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Р—Р°РіСЂСѓР¶Р°СЋ Р±РёР»РµС‚С‹...</div>';

    try {
      const data = await apiGet("/api/bookings");
      if (data.ok) {
        const { bookings, stats } = data;
        renderBookings(bookings, stats);
      } else {
        container.innerHTML = '<div class="empty-state">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</div>';
      }
    } catch (e) {
      console.error("Load bookings error:", e);
      container.innerHTML = '<div class="empty-state">РќРµС‚ СЃРѕРµРґРёРЅРµРЅРёСЏ</div>';
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
            <div class="stat-label">Р‘СЂРѕРЅРёСЂРѕРІР°РЅРёР№</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalTickets || 0}</div>
            <div class="stat-label">Р‘РёР»РµС‚РѕРІ</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalSpent || 0}в‚Ѕ</div>
            <div class="stat-label">РџРѕС‚СЂР°С‡РµРЅРѕ</div>
          </div>
        </div>
      `;
    }
    
    if (!bookings || bookings.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">рџЋ«</div>
            <div>РџРѕРєР° РЅРµС‚ Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°РЅРЅС‹С… Р±РёР»РµС‚РѕРІ</div>
          </div>
        `;
      }
      return;
    }

    if (!container) return;

    container.innerHTML = bookings.map((b) => {
      const statusClass = b.status === 'confirmed' ? 'status-confirmed' : 
                          b.status === 'used' ? 'status-used' : 'status-cancelled';
      const statusText = b.status === 'confirmed' ? 'вњ“ РџРѕРґС‚РІРµСЂР¶РґРµРЅРѕ' : 
                         b.status === 'used' ? 'вњ“ РСЃРїРѕР»СЊР·РѕРІР°РЅ' : 'вњ— РћС‚РјРµРЅС‘РЅ';
      
      return `
        <div class="booking-item ${statusClass}">
          <img class="booking-image" src="${b.image_url || ''}" onerror="this.src='https://via.placeholder.com/800x600?text=Ticket'" />
          <div class="booking-content">
            <div class="booking-header">
              <div class="booking-ref">Р‘СЂРѕРЅСЊ: ${b.booking_reference || 'N/A'}</div>
              <div class="booking-status ${statusClass}">${statusText}</div>
            </div>
            <div class="booking-title">${escapeHtml(b.title)}</div>
            <div class="booking-meta">${escapeHtml(b.venue_name || '')} В· ${b.start_time ? new Date(b.start_time).toLocaleDateString() : ''}</div>
            <div class="booking-details">
              <span>рџЋџ ${b.ticket_count} Р±РёР»РµС‚Р°</span>
              <span>рџ’° ${b.total_price}в‚Ѕ</span>
            </div>
            <div class="booking-actions">
              ${b.external_url ? `<a class="btn btn-primary" href="${b.external_url}" target="_blank">РћС‚РєСЂС‹С‚СЊ Р±РёР»РµС‚</a>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-use-booking" data-booking-id="${b.id}">РЇ РїРѕСЃРµС‚РёР»</button>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-cancel-booking" data-booking-id="${b.id}">РћС‚РјРµРЅРёС‚СЊ</button>` : ''}
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
      title: "рџЋ« Р‘СЂРѕРЅРёСЂРѕРІР°РЅРёРµ",
      message: `${event.title}\n\nР‘РёР»РµС‚РѕРІ: 1\nРљ РѕРїР»Р°С‚Рµ: ${price}в‚Ѕ`,
      buttons: [
        { type: "ok", text: "Р—Р°Р±СЂРѕРЅРёСЂРѕРІР°С‚СЊ" },
        { type: "cancel", text: "РћС‚РјРµРЅР°" }
      ]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/create", { event_id: eventId, ticket_count: 1 });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "вњ… РЈСЃРїРµС€РЅРѕ!",
              message: `Р‘СЂРѕРЅСЊ: ${data.booking.booking_reference}\nР‘РёР»РµС‚ РґРѕСЃС‚СѓРїРµРЅ РІРѕ РІРєР»Р°РґРєРµ "Р‘РёР»РµС‚С‹"`,
              buttons: [{ type: "ok" }]
            });
          }
        } catch (e) {
          tg.showPopup({ message: "РћС€РёР±РєР°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function useBooking(bookingId) {
    tg.showPopup({
      title: "РџРѕСЃРµС‚РёС‚СЊ СЃРѕР±С‹С‚РёРµ?",
      message: "РџРѕРґС‚РІРµСЂРґРёС‚Рµ, С‡С‚Рѕ РІС‹ РїРѕСЃРµС‚РёР»Рё РјРµСЂРѕРїСЂРёСЏС‚РёРµ",
      buttons: [{ type: "ok", text: "РџРѕРґС‚РІРµСЂРґРёС‚СЊ" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/use", { booking_id: bookingId });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "рџ”Ґ РЎРµСЂРёСЏ!",
              message: `РўРІРѕСЏ СЃРµСЂРёСЏ: ${data.streak} РґРЅ.`,
              buttons: [{ type: "ok" }]
            });
            loadBookings();
          }
        } catch (e) {
          tg.showPopup({ message: "РћС€РёР±РєР°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function cancelBooking(bookingId) {
    tg.showPopup({
      title: "РћС‚РјРµРЅРёС‚СЊ Р±СЂРѕРЅСЊ?",
      message: "Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ РѕС‚РјРµРЅРёС‚СЊ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ?",
      buttons: [{ type: "ok", text: "РћС‚РјРµРЅРёС‚СЊ" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          await apiPost("/api/bookings/cancel", { booking_id: bookingId });
          tg.HapticFeedback?.notificationOccurred("warning");
          tg.showPopup({ message: "Р‘СЂРѕРЅСЊ РѕС‚РјРµРЅРµРЅР°", buttons: [{ type: "ok" }] });
          loadBookings();
        } catch (e) {
          tg.showPopup({ message: "РћС€РёР±РєР°: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  
  // РљРђР РўРђ
  async async function loadMap() {
    const container = document.getElementById("map-container");
    const dateFilter = document.getElementById("filter-map-date");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Р—Р°РіСЂСѓР¶Р°СЋ РєР°СЂС‚Сѓ...</div>';
    
    try {
      const dateValue = dateFilter ? dateFilter.value : "today";
      const dateParam = dateValue === "today" ? new Date().toISOString().split('T')[0] : "";
      
      const data = await apiGet("/api/map" + (dateParam ? "?date=" + dateParam : ""));
      log("рџ“¦ Map data:", data);
      
      if (data.ok && data.events && data.events.length > 0) {
        renderMap(data.events, container);
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">рџ—єпёЏ</div>
            <div>РќРµС‚ СЃРѕР±С‹С‚РёР№ РЅР° РєР°СЂС‚Рµ</div>
          </div>
        `;
      }
    } catch (e) {
      log("вќЊ Map error:", e);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">вќЊ</div>
          <div>РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РєР°СЂС‚С‹</div>
        </div>
      `;
    }
  }
  
  function renderMap(events, container) {
    // РСЃРїРѕР»СЊР·СѓРµРј СЃС‚Р°С‚РёС‡РЅСѓСЋ РєР°СЂС‚Сѓ СЃ РјР°СЂРєРµСЂР°РјРё (Р±РµР· РІРЅРµС€РЅРёС… Р±РёР±Р»РёРѕС‚РµРє)
    const centerLat = 55.7558;
    const centerLng = 37.6173;
    const zoom = 11;
    
    // РЎРѕР·РґР°С‘Рј РёРЅС‚РµСЂР°РєС‚РёРІРЅСѓСЋ РєР°СЂС‚Сѓ С‡РµСЂРµР· OpenStreetMap iframe
    let markers = events.map(e => {
      const color = e.category === "concert" ? "рџЋµ" : 
                   e.category === "theater" ? "рџЋ­" :
                   e.category === "bar" ? "рџЌє" :
                   e.category === "club" ? "рџ’ѓ" : "рџЋЁ";
      return `${color} ${e.title}`;
    }).join('<br>');
    
    container.innerHTML = `
      <div style="width:100%;height:100%;position:relative;">
        <iframe 
          src="https://www.openstreetmap.org/export/embed.html?bbox=37.3,55.5,37.9,55.9&amp;layer=mapnik"
          style="width:100%;height:100%;border:none;"
        ></iframe>
        <div style="position:absolute;bottom:10px;left:10px;right:10px;background:rgba(255,255,255,0.95);padding:15px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2);max-height:200px;overflow-y:auto;">
          <div style="font-weight:600;margin-bottom:10px;">рџ“Ќ РЎРѕР±С‹С‚РёСЏ (${events.length})</div>
          <div style="font-size:13px;line-height:1.6;">${markers}</div>
        </div>
      </div>
    `;
  }

  // РџСЂРѕС„РёР»СЊ
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
      badgesContainer.innerHTML = '<div class="empty-state">РџРѕРєР° РЅРµС‚ Р·РЅР°С‡РєРѕРІ</div>';
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

  // РЈС‚РёР»РёС‚С‹
  function formatPrice(min, max) {
    if (!min && !max) return "Р‘РµСЃРїР»Р°С‚РЅРѕ";
    if (min === max || !max) return `${min}в‚Ѕ`;
    if (!min) return `РґРѕ ${max}в‚Ѕ`;
    return `${min}вЂ“${max}в‚Ѕ`;
  }

  function translateCategory(cat) {
    const map = {
      concert: "РљРѕРЅС†РµСЂС‚",
      theater: "РўРµР°С‚СЂ",
      bar: "Р‘Р°СЂ",
      club: "РљР»СѓР±",
      exhibition: "Р’С‹СЃС‚Р°РІРєР°",
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

  // Р—Р°РїСѓСЃРє - Р·Р°РіСЂСѓР¶Р°РµРј СЃРѕР±С‹С‚РёСЏ
  console.log("App initialized, loading events...");
  loadEvents();
}