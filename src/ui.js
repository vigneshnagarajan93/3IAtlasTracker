export function initUI(startTime, endTime, onTimeChange) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '10px';
  container.style.left = '10px';
  container.style.background = 'rgba(0, 0, 0, 0.5)';
  container.style.padding = '10px';
  container.style.color = '#fff';
  container.style.fontFamily = 'sans-serif';

  const playPauseBtn = document.createElement('button');
  playPauseBtn.id = 'play-pause';
  playPauseBtn.textContent = 'Pause';
  container.appendChild(playPauseBtn);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'date-slider';
  slider.min = startTime.getTime();
  slider.max = endTime.getTime();
  slider.step = 24 * 60 * 60 * 1000; // one day
  slider.value = Math.min(Math.max(Date.now(), startTime.getTime()), endTime.getTime());
  slider.style.width = '300px';
  slider.style.marginLeft = '10px';
  container.appendChild(slider);

  const dateDisplay = document.createElement('div');
  dateDisplay.id = 'current-date';
  dateDisplay.style.marginTop = '8px';
  container.appendChild(dateDisplay);

  document.body.appendChild(container);

  let playing = true;
  let currentTime = new Date(Number(slider.value));
  dateDisplay.textContent = currentTime.toISOString();
  onTimeChange(currentTime);

  playPauseBtn.addEventListener('click', () => {
    playing = !playing;
    playPauseBtn.textContent = playing ? 'Pause' : 'Play';
  });

  slider.addEventListener('input', () => {
    playing = false;
    playPauseBtn.textContent = 'Play';
    currentTime = new Date(Number(slider.value));
    dateDisplay.textContent = currentTime.toISOString();
    onTimeChange(currentTime);
  });

  function updateCurrentTime(now) {
    if (!playing) return;
    const clamped = new Date(
      Math.min(Math.max(now.getTime(), startTime.getTime()), endTime.getTime())
    );
    currentTime = clamped;
    slider.value = clamped.getTime();
    dateDisplay.textContent = clamped.toISOString();
    onTimeChange(clamped);
  }

  return {
    updateCurrentTime,
    getCurrentTime: () => currentTime,
  };
}
