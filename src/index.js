import './styles.css';

class PWAConfApp {
  constructor() {
    this.init();
  }
  async init() {
    this.loadSpeakers();
    this.loadSchedule();
    this.registerSW();
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

  async registerSW() {
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
}

window.addEventListener('load', e => {
  new PWAConfApp();
});
