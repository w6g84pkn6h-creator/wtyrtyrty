// Настройки
const EARNINGS_PER_HOUR = 450;          // ₽ в час
const EARNINGS_PER_SECOND = EARNINGS_PER_HOUR / 3600;

let selectedHours = 8;
let totalSeconds = selectedHours * 3600;
let remainingSeconds = totalSeconds;
let displayedEarnings = 0;              // то, что показываем (плавное)
let targetEarnings = 0;                 // реальное накопленное значение
let lastTime = 0;
let interval = null;
let isRunning = false;
let animationFrameId = null;

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

// Форматирование заработка (можно убрать .00 если хочешь целые рубли)
function formatEarnings(value) {
  return value.toFixed(2) + ' ₽';
}

// Плавная анимация заработка
function animateEarnings(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000; // секунды с прошлого кадра
  lastTime = timestamp;

  if (isRunning) {
    // Реальное накопление (независимо от анимации)
    targetEarnings += EARNINGS_PER_SECOND * delta;

    // Плавный подход displayed → target
    const diff = targetEarnings - displayedEarnings;
    if (Math.abs(diff) > 0.0001) {
      displayedEarnings += diff * 0.12; // скорость "догонки" (0.08–0.2 — пробуй)
    } else {
      displayedEarnings = targetEarnings;
    }

    earningsEl.textContent = formatEarnings(displayedEarnings);
  }

  animationFrameId = requestAnimationFrame(animateEarnings);
}

// Обновление таймера (каждую секунду)
function updateTimer() {
  if (remainingSeconds > 0) {
    remainingSeconds--;
    timerEl.textContent = formatTime(remainingSeconds);
  } else {
    clearInterval(interval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    cancelAnimationFrame(animationFrameId);
    alert('Время вышло! Заработано ≈ ' + formatEarnings(targetEarnings));
  }
}

// Выбор режима
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (isRunning) return;
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedHours = parseInt(btn.dataset.hours);
    totalSeconds = selectedHours * 3600;
    remainingSeconds = totalSeconds;
    targetEarnings = 0;
    displayedEarnings = 0;
    timerEl.textContent = formatTime(remainingSeconds);
    earningsEl.textContent = formatEarnings(0);
  });
});

// Старт
startBtn.addEventListener('click', () => {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  lastTime = 0;
  animationFrameId = requestAnimationFrame(animateEarnings);
  interval = setInterval(updateTimer, 1000);
});

// Пауза
pauseBtn.addEventListener('click', () => {
  clearInterval(interval);
  cancelAnimationFrame(animationFrameId);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

// Сброс
resetBtn.addEventListener('click', () => {
  clearInterval(interval);
  cancelAnimationFrame(animationFrameId);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  remainingSeconds = totalSeconds;
  targetEarnings = 0;
  displayedEarnings = 0;
  timerEl.textContent = formatTime(remainingSeconds);
  earningsEl.textContent = formatEarnings(0);
});

// Восстановление состояния
window.addEventListener('load', () => {
  const saved = localStorage.getItem('timerState');
  if (saved) {
    const data = JSON.parse(saved);
    selectedHours = data.hours || 8;
    remainingSeconds = data.remaining || selectedHours * 3600;
    targetEarnings = data.earnings || 0;
    displayedEarnings = targetEarnings; // сразу показываем реальное
    timerEl.textContent = formatTime(remainingSeconds);
    earningsEl.textContent = formatEarnings(displayedEarnings);
    modeBtns.forEach(b => {
      if (parseInt(b.dataset.hours) === selectedHours) b.classList.add('active');
    });
  } else {
    document.querySelector('[data-hours="8"]').classList.add('active');
  }

  // Запускаем анимацию сразу (даже если на паузе — для красоты)
  animationFrameId = requestAnimationFrame(animateEarnings);
});

// Сохранение
window.addEventListener('beforeunload', () => {
  localStorage.setItem('timerState', JSON.stringify({
    hours: selectedHours,
    remaining: remainingSeconds,
    earnings: targetEarnings   // сохраняем реальное значение
  }));
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.log('SW error:', err));
  });
}
