function log(msg) { console.log(msg); }

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Применяем тему Telegram
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

// Ждём загрузки DOM перед инициализацией
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  applyTheme();
  
  // Состояние
  let events = [];
  let plan = [];
  let profile = null;
  let currentCardIndex = 0;

  // Навигация - с проверкой на null
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

  // Фильтры - с проверкой на null
  const filterCategory = document.getElementById("filter-category");
  const filterDistrict = document.getElementById("filter-district");
  if (filterCategory) {
    filterCategory.addEventListener("change", loadEvents);
  }
  if (filterDistrict) {
    filterDistrict.addEventListener("change", loadEvents);
  }

  // Загрузка событий
  async function loadEvents() {
    console.log("loadEvents called");
    const container = document.getElementById("events-container");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загружаю события...</div>';

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
        container.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
      }
    } catch (e) {
      console.error("Load events error:", e);
      container.innerHTML = '<div class="empty-state">Нет соединения</div>';
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
      log("📦 API GET " + path + " => " + JSON.stringify(data));
      return data;
    } catch (e) {
      log("❌ API GET error: " + path + " - " + e.message);
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
      log("📦 API POST " + path + " => " + JSON.stringify(data));
      return data;
    } catch (e) {
      log("❌ API POST error: " + path + " - " + e.message);
      throw e;
    }
  }

  const API_BASE = window.location.origin;
  
  // Получаем initData из Telegram
  function getInitData() {
    if (tg.initData) return tg.initData;
    return null;
  }
  const HEADERS = { "Content-Type": "application/json" };

  // Рендер карточек
  function renderCards() {
    const container = document.getElementById("events-container");
    if (!container) return;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">🌃</div>
          <div>Событий нет</div>
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
      tg.MainButton.setText(`⏭ Пропустить (${remaining})`);
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.setText("✅ Все события просмотрены");
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
        <div class="card-meta">${category} · ${escapeHtml(event.venue_name || "")}</div>
        <div class="card-meta">${escapeHtml(event.district || "")}</div>
        <div class="card-price">${price}</div>
        <div class="card-desc">${escapeHtml(event.description || "")}</div>
        <div class="card-actions">
          <button class="btn btn-outline btn-dislike">❌</button>
          <button class="btn btn-secondary btn-add">В план</button>
          <button class="btn btn-primary btn-book">🎫 Билет</button>
          <button class="btn btn-outline btn-like">❤️</button>
        </div>
      </div>
    `;

    if (isTop) setupSwipe(card, event);

    return card;
  }

  // Свайпы
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
      tg.MainButton.setText(`⏭ Пропустить (${remaining})`);
      tg.MainButton.onClick(onSkip);
    } else {
      tg.MainButton.setText("✅ Все события просмотрены");
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
      tg.MainButton.setText(`⏭ Пропустить (${remaining})`);
    }
  }

  // План
  async function loadPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Загружаю план...</div>';

    try {
      const data = await apiGet("/api/plan");
      if (data.ok) {
        plan = data.plan || [];
        renderPlan();
      } else {
        container.innerHTML = '<div class="empty-state">Ошибка: ' + (data.error || 'Неизвестная') + '</div>';
      }
    } catch (e) {
      console.error("Load plan error:", e);
      container.innerHTML = '<div class="empty-state">Нет соединения</div>';
    }
  }

  function renderPlan() {
    const container = document.getElementById("plan-container");
    if (!container) return;
    
    if (!plan || plan.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">📅</div>
          <div>Пока нет событий в плане</div>
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
            <div class="plan-item-meta">${translateCategory(item.category)} · ${escapeHtml(item.venue_name || "")}</div>
            <div class="plan-item-actions">
              <button class="btn btn-primary btn-attend" data-event-id="${eventId}">Я был</button>
              <button class="btn btn-secondary btn-share" data-event-id="${eventId}">Поделиться</button>
              <button class="btn btn-outline btn-remove" data-event-id="${eventId}">Удалить</button>
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
      tg.showPopup({ message: "Добавлено в план!", buttons: [{ type: "ok" }] });
    } catch (e) {
      tg.showPopup({ message: "Ошибка: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function markAttended(eventId) {
    tg.HapticFeedback?.impactOccurred("medium");
    try {
      const data = await apiPost("/api/plan/attend", { event_id: eventId });
      if (data.ok) {
        tg.showPopup({
          title: "🔥 Серия!",
          message: `Твоя серия: ${data.streak} дн.`,
          buttons: [{ type: "ok" }],
        });
        loadPlan();
      }
    } catch (e) {
      tg.showPopup({ message: "Ошибка: " + e.message, buttons: [{ type: "ok" }] });
    }
  }

  async function removeFromPlan(eventId) {
    try {
      await apiPost("/api/plan/remove", { event_id: eventId });
      loadPlan();
    } catch (e) {
      console.error("Remove error:", e);
      tg.showPopup({ message: "Ошибка при удалении", buttons: [{ type: "ok" }] });
    }
  }

  async function shareEvent(eventId) {
    const event = plan.find((e) => e.event_id === eventId || e.id === eventId);
    if (!event) return;

    const botUsername = tg.initDataUnsafe?.user?.username || "msk_tonight_bot";
    const shareUrl = `https://t.me/${botUsername}?start=event_${eventId}`;

    if (tg.shareUrl) {
      tg.shareUrl(shareUrl, `Пойдём на ${event.title}?`);
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        tg.showPopup({ message: "Ссылка скопирована!", buttons: [{ type: "ok" }] });
      } catch (e) {
        tg.showPopup({ message: shareUrl, buttons: [{ type: "ok" }] });
      }
    }
  }

  // Бронирования
  async function loadBookings() {
    const container = document.getElementById("bookings-container");
    if (!container) return;
    container.innerHTML = '<div class="loading">Загружаю билеты...</div>';

    try {
      const data = await apiGet("/api/bookings");
      if (data.ok) {
        const { bookings, stats } = data;
        renderBookings(bookings, stats);
      } else {
        container.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
      }
    } catch (e) {
      console.error("Load bookings error:", e);
      container.innerHTML = '<div class="empty-state">Нет соединения</div>';
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
            <div class="stat-label">Бронирований</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalTickets || 0}</div>
            <div class="stat-label">Билетов</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalSpent || 0}₽</div>
            <div class="stat-label">Потрачено</div>
          </div>
        </div>
      `;
    }
    
    if (!bookings || bookings.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">🎫</div>
            <div>Пока нет забронированных билетов</div>
          </div>
        `;
      }
      return;
    }

    if (!container) return;

    container.innerHTML = bookings.map((b) => {
      const statusClass = b.status === 'confirmed' ? 'status-confirmed' : 
                          b.status === 'used' ? 'status-used' : 'status-cancelled';
      const statusText = b.status === 'confirmed' ? '✓ Подтверждено' : 
                         b.status === 'used' ? '✓ Использован' : '✗ Отменён';
      
      return `
        <div class="booking-item ${statusClass}">
          <img class="booking-image" src="${b.image_url || ''}" onerror="this.src='https://via.placeholder.com/800x600?text=Ticket'" />
          <div class="booking-content">
            <div class="booking-header">
              <div class="booking-ref">Бронь: ${b.booking_reference || 'N/A'}</div>
              <div class="booking-status ${statusClass}">${statusText}</div>
            </div>
            <div class="booking-title">${escapeHtml(b.title)}</div>
            <div class="booking-meta">${escapeHtml(b.venue_name || '')} · ${b.start_time ? new Date(b.start_time).toLocaleDateString() : ''}</div>
            <div class="booking-details">
              <span>🎟 ${b.ticket_count} билета</span>
              <span>💰 ${b.total_price}₽</span>
            </div>
            <div class="booking-actions">
              ${b.external_url ? `<a class="btn btn-primary" href="${b.external_url}" target="_blank">Открыть билет</a>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-use-booking" data-booking-id="${b.id}">Я посетил</button>` : ''}
              ${b.status === 'confirmed' ? `<button class="btn btn-outline btn-cancel-booking" data-booking-id="${b.id}">Отменить</button>` : ''}
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
      title: "🎫 Бронирование",
      message: `${event.title}\n\nБилетов: 1\nК оплате: ${price}₽`,
      buttons: [
        { type: "ok", text: "Забронировать" },
        { type: "cancel", text: "Отмена" }
      ]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/create", { event_id: eventId, ticket_count: 1 });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "✅ Успешно!",
              message: `Бронь: ${data.booking.booking_reference}\nБилет доступен во вкладке "Билеты"`,
              buttons: [{ type: "ok" }]
            });
          }
        } catch (e) {
          tg.showPopup({ message: "Ошибка: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function useBooking(bookingId) {
    tg.showPopup({
      title: "Посетить событие?",
      message: "Подтвердите, что вы посетили мероприятие",
      buttons: [{ type: "ok", text: "Подтвердить" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          const data = await apiPost("/api/bookings/use", { booking_id: bookingId });
          if (data.ok) {
            tg.HapticFeedback?.notificationOccurred("success");
            tg.showPopup({
              title: "🔥 Серия!",
              message: `Твоя серия: ${data.streak} дн.`,
              buttons: [{ type: "ok" }]
            });
            loadBookings();
          }
        } catch (e) {
          tg.showPopup({ message: "Ошибка: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  async function cancelBooking(bookingId) {
    tg.showPopup({
      title: "Отменить бронь?",
      message: "Вы уверены, что хотите отменить бронирование?",
      buttons: [{ type: "ok", text: "Отменить" }, { type: "cancel" }]
    }, async (btn) => {
      if (btn === "ok") {
        try {
          await apiPost("/api/bookings/cancel", { booking_id: bookingId });
          tg.HapticFeedback?.notificationOccurred("warning");
          tg.showPopup({ message: "Бронь отменена", buttons: [{ type: "ok" }] });
          loadBookings();
        } catch (e) {
          tg.showPopup({ message: "Ошибка: " + e.message, buttons: [{ type: "ok" }] });
        }
      }
    });
  }

  
  // КАРТА
  async function loadMap() {
    const container = document.getElementById("map-container");
    const dateFilter = document.getElementById("filter-map-date");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загружаю карту...</div>';
    
    try {
      const dateValue = dateFilter ? dateFilter.value : "today";
      const dateParam = dateValue === "today" ? new Date().toISOString().split('T')[0] : "";
      
      const data = await apiGet("/api/map" + (dateParam ? "?date=" + dateParam : ""));
      log("📦 Map data:", data);
      
      if (data.ok && data.events && data.events.length > 0) {
        renderMap(data.events, container);
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-emoji">🗺️</div>
            <div>Нет событий на карте</div>
          </div>
        `;
      }
    } catch (e) {
      log("❌ Map error:", e);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">❌</div>
          <div>Ошибка загрузки карты</div>
        </div>
      `;
    }
  }
  
  function renderMap(events, container) {
    // Используем статичную карту с маркерами (без внешних библиотек)
    const centerLat = 55.7558;
    const centerLng = 37.6173;
    const zoom = 11;
    
    // Создаём интерактивную карту через OpenStreetMap iframe
    let markers = events.map(e => {
      const color = e.category === "concert" ? "🎵" : 
                   e.category === "theater" ? "🎭" :
                   e.category === "bar" ? "🍺" :
                   e.category === "club" ? "💃" : "🎨";
      return `${color} ${e.title}`;
    }).join('<br>');
    
    container.innerHTML = `
      <div style="width:100%;height:100%;position:relative;">
        <iframe 
          src="https://www.openstreetmap.org/export/embed.html?bbox=37.3,55.5,37.9,55.9&amp;layer=mapnik"
          style="width:100%;height:100%;border:none;"
        ></iframe>
        <div style="position:absolute;bottom:10px;left:10px;right:10px;background:rgba(255,255,255,0.95);padding:15px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2);max-height:200px;overflow-y:auto;">
          <div style="font-weight:600;margin-bottom:10px;">📍 События (${events.length})</div>
          <div style="font-size:13px;line-height:1.6;">${markers}</div>
        </div>
      </div>
    `;
  }

  // Профиль
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
      badgesContainer.innerHTML = '<div class="empty-state">Пока нет значков</div>';
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

  // Утилиты
  function formatPrice(min, max) {
    if (!min && !max) return "Бесплатно";
    if (min === max || !max) return `${min}₽`;
    if (!min) return `до ${max}₽`;
    return `${min}–${max}₽`;
  }

  function translateCategory(cat) {
    const map = {
      concert: "Концерт",
      theater: "Театр",
      bar: "Бар",
      club: "Клуб",
      exhibition: "Выставка",
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

  // Запуск - загружаем события
  console.log("App initialized, loading events...");
  loadEvents();
}