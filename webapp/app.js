/**
* МСК.Tonight - Frontend Logic
* Updated: UX Refactor (Integrated Map & Tabs)
*/
const state = {
events: [],
plan: [],
profile: null,
currentCardIndex: 0
};
const API_BASE = window.location.origin;
const HEADERS = { "Content-Type": "application/json" };
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
// --- Utils ---
function escapeHtml(str) {
if (!str) return "";
return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatPrice(min, max) {
if (!min && !max) return "Бесплатно";
if (min === max || !max) return `${min}?`;
if (!min) return `до ${max}?`;
return `${min}–${max}?`;
}
function translateCategory(cat) {
const map = { concert: "Концерт", theater: "Театр", bar: "Бар", club: "Клуб", exhibition: "Выставка" };
return map[cat] || cat;
}
function getInitData() {
if (tg.initData) return tg.initData;
const urlParams = new URLSearchParams(window.location.search);
return urlParams.get("tgInitData") || null;
}
// --- API ---
async function apiGet(path) {
try {
const headers = { ...HEADERS };
const initData = getInitData();
if (initData) headers['X-Telegram-Init-Data'] = initData;
const res = await fetch(API_BASE + path, { headers });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (e) {
console.error("API GET error:", e, "path:", path);
throw e;
}
}
async function apiPost(path, body) {
try {
const headers = { ...HEADERS };
const initData = getInitData();
if (initData) headers['X-Telegram-Init-Data'] = initData;
const res = await fetch(API_BASE + path, {
method: "POST",
headers: headers,
body: JSON.stringify(body),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (e) {
console.error("API POST error:", e, "path:", path);
throw e;
}
}
// --- Interface Logic ---
async function loadEvents() {
const container = document.getElementById("events-container");
if (!container) return;
container.innerHTML = '<div class="loading">Загружаю события...</div>';
const filterCategory = document.getElementById("filter-category");
const filterDistrict = document.getElementById("filter-district");
const params = new URLSearchParams();
if (filterCategory && filterCategory.value) params.set("category", filterCategory.value);
if (filterDistrict && filterDistrict.value) params.set("district", filterDistrict.value);
params.set("mode", "recommended");
params.set("limit", "50");
try {
const data = await apiGet(`/api/events?${params}`);
if (data.ok) {
state.events = data.events || [];
state.currentCardIndex = 0;
renderCards();
} else {
container.innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
}
} catch (e) {
container.innerHTML = '<div class="empty-state">Нет соединения</div>';
}
}
function loadMap() {
const container = document.getElementById("map-container");
if (!container) return;
container.innerHTML = '<div class="loading">Загружаю карту...</div>';
apiGet("/api/map").then(data => {
if (data.ok && data.events && data.events.length > 0) {
const markers = data.events.map(e => {
const color = e.category === "concert" ? "??" : e.category === "theater" ? "??" : e.category === "bar" ? "??" : "??";
return `${color} ${e.title}`;
}).join("<br>");
container.innerHTML = `
<div style="width:100%;height:100%;position:relative;">
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=37.3,55.5,37.9,55.9&layer=mapnik" style="width:100%;height:100%;border:none;"></iframe>
<div style="position:absolute;bottom:10px;left:10px;right:10px;background:rgba(255,255,255,0.95);padding:15px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2);max-height:120px;overflow-y:auto;font-size:12px;">
<div style="font-weight:600;margin-bottom:5px;">?События рядом:</div>
<div>${markers}</div>
</div>
</div>`;
} else {
container.innerHTML = '<div class="empty-state">Карта временно недоступна</div>';
}
}).catch(() => {
container.innerHTML = '<div class="empty-state">Ошибка карты</div>';
});
}
function renderCards() {
const container = document.getElementById("events-container");
if (!container) return;
container.innerHTML = "";
if (!state.events || state.events.length === 0) {
container.innerHTML = '<div class="empty-state">??<div>Событий нет</div></div>';
return;
}
state.events.slice(state.currentCardIndex).forEach((event, idx) => {
const card = createCard(event, idx === 0);
if (idx === 0) container.appendChild(card);
});
if (state.events.length > state.currentCardIndex) {
tg.MainButton.setParams({ text: "Пропустить событие", isEnabled: true });
tg.MainButton.show();
tg.MainButton.onClick(onSkip);
} else {
tg.MainButton.hide();
}
}
function createCard(event, isTop) {
const card = document.createElement("div");
card.className = "card" + (isTop ? " swiping" : "");
card.dataset.eventId = event.id;
card.innerHTML = `
<img class="card-image" src="${event.image_url || ''}" onerror="this.src='https://placehold.co/800x600/3390ec/ffffff?text=No+Image'" />
<div class="card-content">
<div class="card-title">${escapeHtml(event.title)}</div>
<div class="card-meta">${translateCategory(event.category)} · ${escapeHtml(event.venue_name || "")}</div>
<div class="card-meta">${escapeHtml(event.district || "")}</div>
<div class="card-price">${formatPrice(event.price_min, event.price_max)}</div>
<div class="card-desc">${escapeHtml(event.description || "")}</div>
<div class="card-actions">
<button class="btn btn-outline btn-dislike">?</button>
<button class="btn btn-secondary btn-add">В план</button>
<button class="btn btn-primary btn-book">Билет</button>
<button class="btn btn-outline btn-like">??</button>
</div>
</div>`;
if (isTop) setupSwipe(card, event);
card.querySelector(".btn-dislike").onclick = () => swipe(card, event, "left");
card.querySelector(".btn-like").onclick = () => swipe(card, event, "right");
card.querySelector(".btn-add").onclick = () => addToPlan(event.id);
card.querySelector(".btn-book").onclick = () => bookEvent(event.id);
return card;
}
function setupSwipe(card, event) {
let touchStartX = 0, touchCurrentX = 0, isSwiping = false;
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
card.style.transform = `translateX(${touchCurrentX}px) rotate(${touchCurrentX * 0.05}deg)`;
};
const onEnd = () => {
if (!isSwiping) {
card.style.transition = "transform 0.3s";
card.style.transform = "";
touchStartX = 0; touchCurrentX = 0;
return;
}
const threshold = 80;
if (touchCurrentX > threshold) swipe(card, event, "right");
else if (touchCurrentX < -threshold) swipe(card, event, "left");
else { card.style.transition = "transform 0.3s"; card.style.transform = ""; }
touchStartX = 0; touchCurrentX = 0;
};
card.addEventListener("mousedown", onDown);
card.addEventListener("touchstart", onDown, { passive: true });
document.addEventListener("mousemove", onMove);
document.addEventListener("touchmove", onMove, { passive: true });
document.addEventListener("mouseup", onEnd);
document.addEventListener("touchend", onEnd);
}
async function swipe(card, event, direction) {
tg.HapticFeedback?.impactOccurred("medium");
card.classList.add(direction === "left" ? "swipe-left" : "swipe-right");
try {
await apiPost("/api/events/swipe", { event_id: event.id, direction: direction === "right" ? "like" : "dislike" });
} catch (e) { console.error("Swipe error:", e); }
setTimeout(() => {
card.remove();
state.currentCardIndex++;
const nextEvent = state.events[state.currentCardIndex];
if (nextEvent) {
const container = document.getElementById("events-container");
container.appendChild(createCard(nextEvent, true));
} else { renderCards(); }
}, 300);
}
function onSkip() {
const card = document.querySelector("#events-container .card");
if (card) {
const event = state.events[state.currentCardIndex];
if (event) swipe(card, event, "left");
}
}
async function addToPlan(eventId) {
tg.HapticFeedback?.impactOccurred("light");
try {
const data = await apiPost("/api/plan/add", { event_id: eventId });
if (data.ok) alert("Добавлено в план!");
} catch (e) { alert("Ошибка: " + e.message); }
}
async function loadPlan() {
const container = document.getElementById("plan-container");
if (!container) return;
container.innerHTML = '<div class="loading">Загружаю план...</div>';
try {
const data = await apiGet("/api/plan");
if (data.ok) { state.plan = data.plan || []; renderPlan(); }
} catch (e) { container.innerHTML = '<div class="empty-state">Нет соединения</div>'; }
}
function renderPlan() {
const container = document.getElementById("plan-container");
if (!container) return;
if (!state.plan || state.plan.length === 0) {
container.innerHTML = '<div class="empty-state">??<div>Пока нет событий в плане</div></div>';
return;
}
container.innerHTML = state.plan.map((item) => {
const eventId = item.event_id || item.id;
return `<div class="plan-item">
<img class="plan-item-image" src="${item.image_url || ''}" onerror="this.src='https://placehold.co/800x600/3390ec/ffffff?text=No+Image'" />
<div class="plan-item-content">
<div class="plan-item-title">${escapeHtml(item.title)}</div>
<div class="plan-item-meta">${translateCategory(item.category)} · ${escapeHtml(item.venue_name || "")}</div>
<div class="plan-item-actions">
<button class="btn btn-primary btn-attend" data-event-id="${eventId}">Я был</button>
<button class="btn btn-outline btn-remove" data-event-id="${eventId}">Удалить</button>
</div>
</div>
</div>`;
}).join("");
container.querySelectorAll(".btn-attend").forEach(btn => btn.onclick = () => markAttended(Number(btn.dataset.eventId)));
container.querySelectorAll(".btn-remove").forEach(btn => btn.onclick = () => removeFromPlan(Number(btn.dataset.eventId)));
}
async function markAttended(eventId) {
tg.HapticFeedback?.impactOccurred("medium");
try {
const data = await apiPost("/api/plan/attend", { event_id: eventId });
if (data && data.ok) {
alert(`?Серия! Твоя серия: ${data.streak} дн.`);
loadPlan();
}
} catch (e) { alert("Ошибка: " + (e.message || "Неизвестная ошибка")); }
}
async function removeFromPlan(eventId) {
try {
await apiPost("/api/plan/remove", { event_id: eventId });
loadPlan();
} catch (e) { alert("Ошибка при удалении"); }
}
async function bookEvent(eventId) {
const event = state.events.find(e => e.id === eventId);
if (!event) return;
const price = event.price_min || 0;
if (!confirm(`?Бронирование\n\n${event.title}\n\nБилетов: 1\nК оплате: ${price}?`)) return;
try {
const data = await apiPost("/api/bookings/create", { event_id: eventId, ticket_count: 1 });
if (data && data.ok) {
tg.HapticFeedback?.notificationOccurred("success");
alert(`Успешно!\n\nБронь: ${data.booking.booking_reference}\nБилет доступен во вкладке "Билеты"`);
loadBookings();
}
} catch (e) { alert("Ошибка: " + (e.message || "Неизвестная ошибка")); }
}
async function loadBookings() {
const container = document.getElementById("bookings-container");
if (!container) return;
container.innerHTML = '<div class="loading">Загружаю билеты...</div>';
try {
const data = await apiGet("/api/bookings");
if (data.ok) {
const bookings = data.bookings || [];
if (bookings.length === 0) {
container.innerHTML = '<div class="empty-state">??<div>Нет билетов</div></div>';
} else {
container.innerHTML = bookings.map(b => `
<div class="booking-item">
<div class="booking-status">${b.status === "active" ? "Активен" : "Использован"}</div>
<div class="booking-title">${escapeHtml(b.event_title)}</div>
<div class="booking-ref">${b.booking_reference}</div>
</div>`).join("");
}
}
} catch (e) { container.innerHTML = '<div class="empty-state">Нет соединения</div>'; }
}
async function loadProfile() {
try {
const data = await apiGet("/api/profile");
if (data.ok) { state.profile = data; renderProfile(); }
} catch (e) { console.error("Profile error:", e); }
}
function renderProfile() {
if (!state.profile) return;
const streakEl = document.getElementById("streak-count");
if (streakEl) streakEl.textContent = state.profile.user?.streak_days || 0;
const plannedEl = document.getElementById("stat-planned");
if (plannedEl) plannedEl.textContent = state.profile.stats?.totalPlanned || 0;
}
function applyTheme() {
const root = document.documentElement;
const p = tg.themeParams;
if (!p) return;
root.style.setProperty('--tg-theme-bg-color', p.bg_color || '#ffffff');
root.style.setProperty('--tg-theme-text-color', p.text_color || '#000000');
root.style.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color || '#f0f0f0');
}
function initApp() {
applyTheme();
const navBtns = document.querySelectorAll(".nav-btn");
const tabs = {
today: document.getElementById("tab-today"),
plan: document.getElementById("tab-plan"),
bookings: document.getElementById("tab-bookings"),
profile: document.getElementById("tab-profile"),
};
navBtns.forEach((btn) => {
btn.addEventListener("click", () => {
const tabName = btn.dataset.tab;
navBtns.forEach((b) => b.classList.remove("active"));
btn.classList.add("active");
Object.values(tabs).forEach((t) => { if (t) t.classList.remove("active"); });
if (tabs[tabName]) tabs[tabName].classList.add("active");
if (tabName === "plan") loadPlan();
if (tabName === "bookings") loadBookings();
if (tabName === "profile") loadProfile();
if (tabName === "today") { state.currentCardIndex = 0; loadEvents(); loadMap(); }
});
});
const todayBtn = document.querySelector('.nav-btn[data-tab="today"]');
if (todayBtn) {
todayBtn.classList.add("active");
if (tabs.today) tabs.today.classList.add("active");
}
loadEvents();
loadMap();
}
document.addEventListener('DOMContentLoaded', initApp); // DEPLOY VERSION: 20260603-233834