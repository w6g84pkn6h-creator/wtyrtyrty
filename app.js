// Настройки
const EARNINGS_PER_HOUR = 50;          // Сколько € за час (можно менять)
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
  earningsEl.textContent = earnings.toFixed(2) + ' €';
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

// Старт / Пауза
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
      alert('Время вышло! Заработано: ' + earnings.toFixed(2) + ' €');
      // Можно добавить вибрацию: navigator.vibrate?.(200);
    }
  }, 1000);
});

pauseBtn.addEventListener('click', () => {
  clearInterval(interval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

resetBtn.addEventListener('click', () => {
  clearInterval(interval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  remainingSeconds = totalSeconds;
  earnings = 0;
  updateDisplay();
});

// Сохранение прогресса (если закрыть и открыть)
window.addEventListener('load', () => {
  const saved = localStorage.getItem('timerState');
  if (saved) {
    const data = JSON.parse(saved);
    selectedHours = data.hours || 8;
    remainingSeconds = data.remaining || selectedHours * 3600;
    earnings = data.earnings || 0;
    updateDisplay();
    modeBtns.forEach(b => {
      if (parseInt(b.dataset.hours) === selectedHours) b.classList.add('active');
    });
  }
});

window.addEventListener('beforeunload', () => {
  localStorage.setItem('timerState', JSON.stringify({
    hours: selectedHours,
    remaining: remainingSeconds,
    earnings
  }));
});

// Service Worker для оффлайн
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.log('SW error:', err));
  });
}
