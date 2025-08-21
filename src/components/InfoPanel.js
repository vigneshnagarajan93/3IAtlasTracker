const AU = 149597870.7; // kilometers per astronomical unit

export default class InfoPanel {
  constructor(ephemeris) {
    this.ephemeris = ephemeris;
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '10px';
    this.container.style.left = '10px';
    this.container.style.padding = '8px';
    this.container.style.background = 'rgba(0, 0, 0, 0.5)';
    this.container.style.color = '#fff';
    this.container.style.fontFamily = 'sans-serif';
    this.container.style.fontSize = '14px';

    this.distanceEl = document.createElement('div');
    this.velocityEl = document.createElement('div');
    this.container.appendChild(this.distanceEl);
    this.container.appendChild(this.velocityEl);

    document.body.appendChild(this.container);
  }

  update(now = new Date()) {
    const state = this._interpolateState(now);
    if (!state) {
      return;
    }

    const distanceKm = Math.hypot(...state.position) * AU;
    const velocityKms = Math.hypot(...state.velocity);

    this.distanceEl.textContent = `Distance: ${distanceKm.toFixed(0)} km`;
    this.velocityEl.textContent = `Velocity: ${velocityKms.toFixed(2)} km/s`;
  }

  _interpolateState(now) {
    const ephemeris = this.ephemeris;
    if (!ephemeris || ephemeris.length === 0) {
      return null;
    }

    if (now <= ephemeris[0].time) {
      return {
        position: ephemeris[0].position,
        velocity: ephemeris[0].velocity,
      };
    }

    const last = ephemeris[ephemeris.length - 1];
    if (now >= last.time) {
      return {
        position: last.position,
        velocity: last.velocity,
      };
    }

    for (let i = 0; i < ephemeris.length - 1; i++) {
      const e0 = ephemeris[i];
      const e1 = ephemeris[i + 1];
      if (now >= e0.time && now <= e1.time) {
        const alpha = (now - e0.time) / (e1.time - e0.time);
        const position = [
          e0.position[0] + (e1.position[0] - e0.position[0]) * alpha,
          e0.position[1] + (e1.position[1] - e0.position[1]) * alpha,
          e0.position[2] + (e1.position[2] - e0.position[2]) * alpha,
        ];
        const velocity = [
          e0.velocity[0] + (e1.velocity[0] - e0.velocity[0]) * alpha,
          e0.velocity[1] + (e1.velocity[1] - e0.velocity[1]) * alpha,
          e0.velocity[2] + (e1.velocity[2] - e0.velocity[2]) * alpha,
        ];
        return { position, velocity };
      }
    }

    return null;
  }
}

