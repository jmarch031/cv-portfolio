// Advanced comet and particle system for enhanced visual effects
(() => {
  const canvas = document.getElementById('comets');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let dpr = 1, w = 0, h = 0, last = performance.now();
  let mouse = { x: -9999, y: -9999 };
  let scrollY = 0;

  // Particle systems
  let shootingStars = [];
  let dustParticles = [];
  let lightTrails = [];
  let energyBursts = [];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);

    w = canvas.width = Math.round(viewportWidth * dpr);
    h = canvas.height = Math.round(viewportHeight * dpr);
    canvas.style.width = viewportWidth + 'px';
    canvas.style.height = viewportHeight + 'px';

    canvas.style.maxWidth = '100vw';
    canvas.style.maxHeight = '100vh';
    canvas.style.overflow = 'hidden';
  }

  function spawnShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.002) {
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25; // 45-135 degrees
      const speed = 3 + Math.random() * 4;
      const startSide = Math.random() < 0.5 ? 'top' : 'left';

      let startX, startY;
      if (startSide === 'top') {
        startX = Math.random() * w;
        startY = -50;
      } else {
        startX = -50;
        startY = Math.random() * h * 0.6;
      }

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        born: performance.now(),
        life: 2000 + Math.random() * 3000,
        hue: 190 + Math.random() * 80,
        brightness: 0.6 + Math.random() * 0.4,
        trailParticles: []
      });
    }
  }

  function spawnDustParticles() {
    // Spawn ambient dust particles
    while (dustParticles.length < 40) {
      dustParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 0.3 + Math.random() * 0.8,
        alpha: 0.1 + Math.random() * 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.001 + Math.random() * 0.002,
        parallaxSpeed: 0.005 + Math.random() * 0.01
      });
    }
  }

  function updateShootingStars(dt, now) {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const star = shootingStars[i];

      // Remove expired stars
      if (now - star.born > star.life) {
        // Create burst effect when star expires
        createEnergyBurst(star.x, star.y, star.hue);
        shootingStars.splice(i, 1);
        continue;
      }

      // Update position
      star.x += star.vx * dt * 0.1;
      star.y += star.vy * dt * 0.1;

      // Add trail particles
      if (Math.random() < 0.3) {
        star.trailParticles.push({
          x: star.x + (Math.random() - 0.5) * 4,
          y: star.y + (Math.random() - 0.5) * 4,
          alpha: star.brightness * 0.8,
          life: 0,
          maxLife: 600 + Math.random() * 400,
          hue: star.hue
        });
      }

      // Update trail particles
      for (let j = star.trailParticles.length - 1; j >= 0; j--) {
        const particle = star.trailParticles[j];
        particle.life += dt;
        particle.alpha *= 0.98;

        if (particle.life > particle.maxLife || particle.alpha < 0.01) {
          star.trailParticles.splice(j, 1);
        }
      }

      // Remove if off screen
      if (star.x > w + 100 || star.y > h + 100) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function createEnergyBurst(x, y, hue) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 1 + Math.random() * 2;

      energyBursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 800 + Math.random() * 400,
        hue: hue,
        alpha: 0.8
      });
    }
  }

  function updateDustParticles(dt) {
    for (const particle of dustParticles) {
      particle.x += particle.vx * dt * 0.01;
      particle.y += particle.vy * dt * 0.01;
      particle.twinkle += particle.twinkleSpeed * dt;

      // Wrap around screen
      if (particle.x < -10) particle.x = w + 10;
      if (particle.x > w + 10) particle.x = -10;
      if (particle.y < -10) particle.y = h + 10;
      if (particle.y > h + 10) particle.y = -10;
    }
  }

  function updateEnergyBursts(dt) {
    for (let i = energyBursts.length - 1; i >= 0; i--) {
      const burst = energyBursts[i];

      burst.x += burst.vx * dt * 0.05;
      burst.y += burst.vy * dt * 0.05;
      burst.life += dt;
      burst.alpha *= 0.995;
      burst.vx *= 0.99;
      burst.vy *= 0.99;

      if (burst.life > burst.maxLife || burst.alpha < 0.01) {
        energyBursts.splice(i, 1);
      }
    }
  }

  function createLightTrail(x, y, hue, intensity = 1) {
    lightTrails.push({
      x: x,
      y: y,
      life: 0,
      maxLife: 1000 + Math.random() * 500,
      hue: hue,
      intensity: intensity * (0.3 + Math.random() * 0.4),
      radius: 20 + Math.random() * 30
    });
  }

  function updateLightTrails(dt) {
    for (let i = lightTrails.length - 1; i >= 0; i--) {
      const trail = lightTrails[i];

      trail.life += dt;
      trail.radius += dt * 0.02;
      trail.intensity *= 0.992;

      if (trail.life > trail.maxLife || trail.intensity < 0.01) {
        lightTrails.splice(i, 1);
      }
    }
  }

  function draw(dt, now) {
    ctx.clearRect(0, 0, w, h);

    // Draw light trails first (background layer)
    ctx.globalCompositeOperation = 'lighter';
    for (const trail of lightTrails) {
      const alpha = trail.intensity * (1 - trail.life / trail.maxLife);
      const gradient = ctx.createRadialGradient(
        trail.x, trail.y, 0,
        trail.x, trail.y, trail.radius
      );
      gradient.addColorStop(0, `hsla(${trail.hue}, 70%, 70%, ${alpha * 0.6})`);
      gradient.addColorStop(0.7, `hsla(${trail.hue}, 60%, 60%, ${alpha * 0.2})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw dust particles
    ctx.globalCompositeOperation = 'source-over';
    for (const particle of dustParticles) {
      const parallaxY = scrollY * particle.parallaxSpeed * dpr;
      const twinkleFactor = 0.5 + 0.5 * Math.sin(particle.twinkle);
      const alpha = particle.alpha * twinkleFactor;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y + parallaxY, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
      ctx.fill();
    }

    // Draw shooting stars and their trails
    ctx.globalCompositeOperation = 'lighter';
    for (const star of shootingStars) {
      const age = (now - star.born) / star.life;
      const fadeAlpha = 1 - Math.pow(age, 2); // Quadratic fade

      // Draw trail particles
      for (const particle of star.trailParticles) {
        const particleAge = particle.life / particle.maxLife;
        const particleAlpha = particle.alpha * (1 - particleAge) * fadeAlpha;

        if (particleAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 1 + particleAge * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particle.hue}, 70%, 80%, ${particleAlpha})`;
          ctx.fill();
        }
      }

      // Draw main star with enhanced glow
      if (fadeAlpha > 0.01) {
        // Outer glow
        const outerGlow = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, 20
        );
        outerGlow.addColorStop(0, `hsla(${star.hue}, 80%, 90%, ${fadeAlpha * star.brightness * 0.8})`);
        outerGlow.addColorStop(0.3, `hsla(${star.hue}, 70%, 70%, ${fadeAlpha * star.brightness * 0.4})`);
        outerGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, 90%, 95%, ${fadeAlpha})`;
        ctx.fill();

        // Create light trail at current position
        if (Math.random() < 0.1) {
          createLightTrail(star.x, star.y, star.hue, star.brightness * fadeAlpha);
        }
      }
    }

    // Draw energy bursts
    for (const burst of energyBursts) {
      const burstAge = burst.life / burst.maxLife;
      const size = 2 + burstAge * 4;
      const alpha = burst.alpha * (1 - burstAge);

      if (alpha > 0.01) {
        const gradient = ctx.createRadialGradient(
          burst.x, burst.y, 0,
          burst.x, burst.y, size * 2
        );
        gradient.addColorStop(0, `hsla(${burst.hue}, 80%, 80%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${burst.hue}, 70%, 60%, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function step(now) {
    const dt = Math.min(now - last, 50);
    last = now;

    spawnShootingStar();
    spawnDustParticles();

    updateShootingStars(dt, now);
    updateDustParticles(dt);
    updateEnergyBursts(dt);
    updateLightTrails(dt);

    draw(dt, now);

    requestAnimationFrame(step);
  }

  // Event listeners
  addEventListener('resize', resize);
  addEventListener('mousemove', e => {
    mouse.x = (e.clientX || 0) * dpr;
    mouse.y = (e.clientY || 0) * dpr;

    // Create interactive light trail when mouse moves
    if (Math.random() < 0.3) {
      createLightTrail(mouse.x, mouse.y, 220 + Math.random() * 40, 0.5);
    }
  });
  addEventListener('scroll', () => {
    scrollY = window.scrollY || 0;
  });

  // Touch support
  addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mouse.x = touch.clientX * dpr;
      mouse.y = touch.clientY * dpr;

      if (Math.random() < 0.4) {
        createLightTrail(mouse.x, mouse.y, 200 + Math.random() * 60, 0.6);
      }
    }
  });

  resize();
  requestAnimationFrame(step);
})();