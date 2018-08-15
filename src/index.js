import './styles.css';

class PWAConfApp {
  constructor() {
    this.init();
  }
  async init() {
    if ('IntersectionObserver' in window) {
      this.setupNavIntersectionObserver();
    }
    this.addLoadingIndicatorDelay();

    await this.loadSpeakers();
    await this.loadSchedule();
  }

  async loadSpeakers() {
    this.speakers = (await import('./speakers.json')).default;
    const speakersDiv = document.querySelector('.speakers');

    speakersDiv.innerHTML = this.speakers.map(this.toSpeakerBlock).join('\n');
  }

  async loadSchedule() {
    const rawSchedule = (await import('./schedule.json')).default;
    // Add speaker details to array
    const schedule = rawSchedule.map(this.addSpeakerDetails, this);
    const scheduleDiv = document.querySelector('.schedule');
    scheduleDiv.innerHTML = schedule.map(this.toScheduleBlock).join('\n');
  }

  toSpeakerBlock(speaker) {
    return `
        <div class="speaker">
          <img src="${speaker.picture}" alt="${speaker.name}">
          <div>${speaker.name}</div>
        </div>`;
  }

  toScheduleBlock(scheduleItem) {
    return `
      <div class="schedule-item ${scheduleItem.category}">
        <div class="title-and-time">
          <div class="time">${scheduleItem.startTime}</div>
          <div class="title-and-speaker">
            <div class="title">${scheduleItem.title}</div>
            <div class="speaker">${
              scheduleItem.speaker ? scheduleItem.speaker.name : '&nbsp;'
            }</div>
          </div>
        </div>
        <p class="description">${scheduleItem.description}</p>
      </div>
    `;
  }

  addSpeakerDetails(item) {
    if (item.speakerId) {
      return Object.assign({}, item, {
        speaker: this.speakers.find(s => s.id === item.speakerId)
      });
    }
    return Object.assign({}, item);
  }

  addLoadingIndicatorDelay() {
    // Only show spinner if we're delayed more than 1s
    setTimeout(() => {
      Array.from(document.querySelectorAll('.loader')).forEach(loader => {
        loader.removeAttribute('hidden');
      });
    }, 1000);
  }

  setupNavIntersectionObserver() {
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const callback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          [nav, header].forEach(e => e.classList.remove('fixed'));
        } else {
          [nav, header].forEach(e => e.classList.add('fixed'));
        }
      });
    };
    const observer = new IntersectionObserver(callback, {
      threshold: [0, 1]
    });
    observer.observe(header);
  }
}

async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      console.log('ServiceWorker registration failed. Sorry about that.', e);
    }
  } else {
    document.querySelector('.alert').removeAttribute('hidden');
  }
}

window.addEventListener('load', e => {
  new PWAConfApp();
  registerSW();
});
