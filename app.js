// Настройки
const EARNINGS_PER_HOUR = 450;          // ₽ в час
const EARNINGS_PER_SECOND = EARNINGS_PER_HOUR / 3600;

let selectedHours = 8;
let totalSeconds = selectedHours * 3600;
let remainingSeconds = totalSeconds;
let earnings = 0;
let interval = null;
let isRunning = false;

// Элементы
const timerEl = document.getElementById('timer');
const earningsEl = document.getElementById('earnings');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const modeBtns = document.querySelectorAll('.mode-selector button');

// Форматирование времени HH:MM:SS
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Обновление экрана
function updateDisplay() {
  timerEl.textContent = formatTime(remainingSeconds);
  earningsEl.textContent = earnings.toFixed(2) + ' ₽';
}

// Выбор режима
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (isRunning) return; // нельзя менять во время работы
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedHours = parseInt(btn.dataset.hours);
    totalSeconds = selectedHours * 3600;
    remainingSeconds = totalSeconds;
    earnings = 0;
    updateDisplay();
  });
});

// Старт
startBtn.addEventListener('click', () => {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  interval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      earnings += EARNINGS_PER_SECOND;
      updateDisplay();
    } else {
      clearInterval(interval);
      isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      alert('Время вышло! Заработано: ' + earnings.toFixed(2) + ' ₽');
      // navigator.vibrate?.(200); // вибрация, если хочешь включить
    }
  }, 1000);
});

// Пауза
pauseBtn.addEventListener('click', () => {
  clearInterval(interval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

// Сброс
resetBtn.addEventListener('click', () => {
  clearInterval(interval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  remainingSeconds = totalSeconds;
  earnings = 0;
  updateDisplay();
});

// Восстановление состояния при загрузке страницы
window.addEventListener('load', () => {
  const saved = localStorage.getItem('timerState');
  if (saved) {
    const data = JSON.parse(saved);
    selectedHours = data.hours || 8;
    remainingSeconds = data.remaining || selectedHours * 3600;
    earnings = data.earnings || 0;
    updateDisplay();
    modeBtns.forEach(b => {
      if (parseInt(b.dataset.hours) === selectedHours) {
        b.classList.add('active');
      }
    });
  } else {
    // если нет сохранённого — выбираем "День" по умолчанию
    document.querySelector('[data-hours="8"]').classList.add('active');
  }
});

// Сохранение перед уходом со страницы
window.addEventListener('beforeunload', () => {
  localStorage.setItem('timerState', JSON.stringify({
    hours: selectedHours,
    remaining: remainingSeconds,
    earnings: earnings
  }));
});

// Регистрация Service Worker (для оффлайн и PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered!', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
