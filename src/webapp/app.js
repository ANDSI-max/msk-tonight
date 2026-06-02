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
applyTheme();

// API helpers - с обработкой ошибок
const API_BASE = window.location.origin;
const HEADERS = { "Content-Type": "application/json" };

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

// Состояние
let events = [];
let plan = [];
let profile = null;
let currentCardIndex = 0;

// Навигация
const tabs = {
  today: document.getElementById("tab-today"),
  plan: document.getElementById("tab-plan"),
  profile: document.getElementById("tab-profile"),
};
const navBtns = document.querySelectorAll(".nav-btn");

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;
    navBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    Object.values(tabs).forEach((t) => t.classList.remove("active"));
    tabs[tabName].classList.add("active");

    if (tabName === "plan") loadPlan();
    if (tabName === "profile") loadProfile();
    if (tabName === "today") renderCards();
  });
});

// Фильтры
const filterCategory = document.getElementById("filter-category");
const filterDistrict = document.getElementById("filter-district");
[filterCategory, filterDistrict].forEach((el) => {
  el.addEventListener("change", loadEvents);
});

// Загрузка событий
async function loadEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = '<div class="loading">Загружаю события...</div>';

  const params = new URLSearchParams();
  if (filterCategory.value) params.set("category", filterCategory.value);
  if (filterDistrict.value) params.set("district", filterDistrict.value);
  params.set("mode", "recommended");
  params.set("limit", "50");

  try {
    const data = await apiGet(`/api/events?${params}`);
    if (data.ok) {
      events = data.events || [];
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

// Рендер карточек
function renderCards() {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  if (events.length === 0) {
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
    tg.MainButton.show();
    tg.MainButton.setText("Пропустить событие");
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

  // Исправлено: используем event_id для data-атрибута
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
        <button class="btn btn-primary btn-add">В план</button>
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

// ПЛАН - ИСПРАВЛЕНО
async function loadPlan() {
  const container = document.getElementById("plan-container");
  container.innerHTML = '<div class="loading">Загружаю план...</div>';

  try {
    console.log("Loading plan...");
    const data = await apiGet("/api/plan");
    console.log("Plan data:", data);
    
    if (data.ok) {
      plan = data.plan || [];
      console.log("Plan items:", plan.length);
      renderPlan();
    } else {
      container.innerHTML = '<div class="empty-state">Ошибка: ' + (data.error || 'Неизвестная') + '</div>';
    }
  } catch (e) {
    console.error("Load plan error:", e);
    container.innerHTML = '<div class="empty-state">Нет соединения с сервером</div>';
  }
}

function renderPlan() {
  const container = document.getElementById("plan-container");
  
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
      console.log("Render plan item:", item);
      // Исправлено: используем item.event_id для кнопок
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

  document.getElementById("streak-count").textContent = profile.user.streak_days || 0;
  document.getElementById("stat-planned").textContent = profile.stats.totalPlanned;
  document.getElementById("stat-attended").textContent = profile.stats.totalAttended;
  document.getElementById("stat-likes").textContent = profile.stats.likes;

  const badgesContainer = document.getElementById("badges-container");
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

// Старт
loadEvents();