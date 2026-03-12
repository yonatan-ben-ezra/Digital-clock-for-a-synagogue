import { getDailyZmanim } from './src/zmanimProvider.js';

function updateClock() {
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  document.getElementById('clock').textContent = now.toLocaleTimeString('he-IL', options);
}

async function updateZmanim() {
  const status = document.getElementById('zmanimStatus');
  status.textContent = 'טוען זמנים...';

  try {
    const zmanim = await getDailyZmanim(new Date());
    document.getElementById('sunrise').textContent = `זריחה: ${zmanim.sunrise}`;
    document.getElementById('sunset').textContent = `שקיעה: ${zmanim.sunset}`;
    document.getElementById('netzClean25km').textContent = `הנץ בניקוי 25 ק"מ: ${zmanim.netzClean25km}`;
    status.textContent = '';
  } catch (error) {
    console.error(error);
    status.textContent = 'שגיאה בטעינת זמני היום';
  }
}

function initTimer() {
  document.getElementById('startTimer').addEventListener('click', () => {
    const time = document.getElementById('timerInput').value;
    if (!time) {
      return;
    }

    const [hoursInput, minutesInput] = time.split(':');
    const totalSeconds = (Number(hoursInput) * 3600) + (Number(minutesInput) * 60);

    let remaining = totalSeconds;
    const timerDisplay = document.getElementById('timerDisplay');

    const timerInterval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = 'טיימר נגמר!';
        return;
      }

      remaining -= 1;
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      timerDisplay.textContent = `טיימר: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
  });
}

updateClock();
setInterval(updateClock, 1000);
updateZmanim();
initTimer();
