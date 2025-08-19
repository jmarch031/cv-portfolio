// Enhanced background with advanced parallax and interactive effects
(() => {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d', { alpha: true });
  let dpr = 1, w = 0, h = 0, last = performance.now();
  let mouse = { x: -9999, y: -9999, smoothX: 0, smoothY: 0 };
  let scrollY = 0, lastScrollY = 0;

  // Enhanced particle systems with improved depth layers
  let starsNear = [], starsFar = [], starsUltraFar = [], orbs = [], nodes = [];
  let floatingParticles = [], nebulaLayers = [], dustParticles = [];
  let desktopNebulae = []; // Nouvelles nébuleuses pour desktop

  let hueCycle = 200, time = 0;

  // Parallax configuration for enhanced movement
  const PARALLAX_CONFIG = {
    ultraFar: { scroll: 0.015, mouse: 0.0003, drift: 0.00004 },
    far: { scroll: 0.045, mouse: 0.0008, drift: 0.00008 },
    near: { scroll: 0.12, mouse: 0.0015, drift: 0.00012 },
    floating: { scroll: 0.25, mouse: 0.0025, drift: 0.0002 },
    foreground: { scroll: 0.45, mouse: 0.005, drift: 0.0003 },
    space: { scroll: 0.1, mouse: 0.001, drift: 0.00006 }
  };

  // Performance optimization
  let frameCount = 0;
  const MAX_PARTICLES = 150;
  const QUALITY_LEVELS = {
    high: { stars: 1.0, particles: 1.0, effects: 1.0, spaceEvents: 1.0 },
    medium: { stars: 0.7, particles: 0.7, effects: 0.8, spaceEvents: 0.8 },
    low: { stars: 0.5, particles: 0.5, effects: 0.6, spaceEvents: 0.6 }
  };
  let quality = 'high';

  // Device detection for mobile optimization and desktop enhancement
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTouch = 'ontouchstart' in window;
  const isDesktop = () => window.innerWidth >= 1024 && !isMobile && !isTouch;

  // Enhanced color palette with improved desktop link visibility
  const PAL = {
    dark: {
      base: 'rgba(8,8,18,1)',
      nebula: [
        'rgba(70,110,180,0.12)',
        'rgba(120,170,255,0.08)',
        'rgba(90,140,220,0.15)',
        'rgba(100,160,240,0.06)'
      ],
      // Nouvelles couleurs de nébuleuses pour desktop - réduites et plus subtiles
      desktopNebula: [
        'rgba(138,43,226,0.08)',     // Violet intense - réduit
        'rgba(75,0,130,0.07)',       // Indigo profond - réduit
        'rgba(255,20,147,0.06)',     // Rose magenta - réduit
        'rgba(0,191,255,0.08)',      // Bleu cyan - réduit
        'rgba(50,205,50,0.05)',      // Vert lime - réduit
        'rgba(255,69,0,0.06)',       // Rouge orangé - réduit
        'rgba(148,0,211,0.08)',      // Violet foncé - réduit
        'rgba(64,224,208,0.07)'      // Turquoise - réduit
      ],
      starUltraFar: c => `rgba(130,145,170,${c})`,
      starFar: c => `rgba(150,170,210,${c})`,
      starNear: c => `rgba(220,235,255,${c})`,
      link: a => `hsla(210, 70%, 80%, ${a})`,
      core: 'rgba(240,245,255,0.95)',
      orb: (h, a) => `hsla(${h}, 64%, 66%, ${a})`,
      dust: (h, a) => `hsla(${h}, 45%, 55%, ${a})`,
      node: a => `hsla(${hueCycle}, 75%, 75%, ${a})`,
      energy: a => `hsla(${(hueCycle + 60) % 360}, 85%, 80%, ${a})`,
      particle: (h, a) => `hsla(${h}, 65%, 70%, ${a})`,
      comet: (color, a) => color.replace(')', `, ${a})`).replace('rgb', 'rgba')
    }
  };

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);

    w = canvas.width = Math.round(viewportWidth * dpr);
    h = canvas.height = Math.round(viewportHeight * dpr);
    canvas.style.width = viewportWidth + 'px';
    canvas.style.height = viewportHeight + 'px';

    canvas.style.maxWidth = '100vw';
    canvas.style.maxHeight = '100vh';
    canvas.style.overflow = 'hidden';

    buildParticleSystems();
  }

  function buildParticleSystems() {
    const qualityMod = QUALITY_LEVELS[quality];

    // Enhanced multi-layer star system
    buildStars(qualityMod);
    buildOrbs(qualityMod);
    buildNodes(qualityMod);
    buildFloatingParticles(qualityMod);
    buildNebulaLayers(qualityMod);
    buildDesktopNebulae(qualityMod); // Ajouter l'appel pour les nébuleuses desktop
    buildDustParticles(qualityMod);
  }

  function buildStars(qualityMod) {
    const area = w * h;
    const baseStarDensity = isMobile ? 80000 : 60000;

    // Ultra far stars (deepest parallax layer) - augmenté pour plus d'étoiles scintillantes
    const ultraFarCount = Math.floor(area / (baseStarDensity * 0.5) * qualityMod.stars); // Réduit de 1.5 à 1.0
    const farCount = Math.floor(area / baseStarDensity * qualityMod.stars);
    const nearCount = Math.floor(area / (baseStarDensity * 1.8) * qualityMod.stars);

    starsUltraFar = [];
    starsFar = [];
    starsNear = [];

    // Ultra far stars - slowest parallax avec plus de variété dans le scintillement
    for (let i = 0; i < ultraFarCount; i++) {
      starsUltraFar.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        r: 0.2 + Math.random() * 0.8,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.3 + Math.random() * 0.8, // Variété accrue dans la vitesse de scintillement
        layer: 0.1 + Math.random() * 0.2,
        hue: 190 + Math.random() * 80
      });
    }

    // Far stars - medium parallax
    for (let i = 0; i < farCount; i++) {
      starsFar.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        r: 0.3 + Math.random() * 1.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.8 + Math.random() * 0.7,
        layer: 0.2 + Math.random() * 0.3,
        hue: 200 + Math.random() * 60
      });
    }

    // Near stars - fastest parallax
    for (let i = 0; i < nearCount; i++) {
      starsNear.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        r: 0.8 + Math.random() * 2.0,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.0 + Math.random(),
        layer: 0.6 + Math.random() * 0.4,
        hue: 210 + Math.random() * 40
      });
    }
  }

  function buildOrbs(qualityMod) {
    const num = Math.max(isMobile ? 6 : 8, Math.round(Math.min(w, h) / (isMobile ? 220 : 180) * qualityMod.effects));
    orbs = [];

    for (let i = 0; i < num; i++) {
      const minSide = Math.min(w, h);
      const base = Math.random() * minSide * 0.35 + minSide * 0.15;
      const r = base * (0.06 + Math.random() * 0.1);

      let hue;
      const roll = Math.random();
      if (roll < 0.4) hue = 205 + Math.random() * 25;
      else if (roll < 0.65) hue = 165 + Math.random() * 20;
      else if (roll < 0.85) hue = 285 + Math.random() * 20;
      else hue = 25 + Math.random() * 25;

      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        r,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.18,
        hue,
        intensity: 0.12 + Math.random() * 0.12,
        driftRadius: 15 + Math.random() * 25
      });
    }
  }

  function buildNodes(qualityMod) {
    const count = Math.round(Math.min(isMobile ? 60 : 80, Math.max(25, Math.sqrt(w * h) / (isMobile ? 60 : 50))) * qualityMod.particles);
    nodes = [];

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        vx: (Math.random() * 2 - 1) * 0.08,
        vy: (Math.random() * 2 - 1) * 0.08,
        energy: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  function buildFloatingParticles(qualityMod) {
    const count = Math.round((isMobile ? MAX_PARTICLES * 0.4 : MAX_PARTICLES * 0.6) * qualityMod.particles);
    floatingParticles = [];

    for (let i = 0; i < count; i++) {
      floatingParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        vx: (Math.random() * 2 - 1) * 0.05,
        vy: (Math.random() * 2 - 1) * 0.05,
        r: 0.4 + Math.random() * 1.2,
        life: Math.random(),
        maxLife: 0.6 + Math.random() * 0.6,
        hue: 180 + Math.random() * 80
      });
    }
  }

  function buildNebulaLayers(qualityMod) {
    const count = Math.round((isMobile ? 3 : 5) * qualityMod.effects);
    nebulaLayers = [];

    for (let i = 0; i < count; i++) {
      nebulaLayers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        r: Math.max(w, h) * (0.35 + Math.random() * 0.5),
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.00001 + Math.random() * 0.00002,
        colorIndex: Math.floor(Math.random() * PAL.dark.nebula.length),
        depth: i / count
      });
    }
  }

  function buildDesktopNebulae(qualityMod) {
    // Réinitialiser le tableau des nébuleuses desktop
    desktopNebulae = [];

    // Générer les nébuleuses uniquement pour les écrans desktop
    if (isDesktop()) {
      // Réduire drastiquement le nombre : 1-2 nébuleuses maximum
      const count = Math.round(1 + Math.random()); // 1 ou 2 nébuleuses seulement

      for (let i = 0; i < count; i++) {
        desktopNebulae.push({
          x: Math.random() * w,
          y: Math.random() * h,
          baseX: Math.random() * w,
          baseY: Math.random() * h,
          r: Math.max(w, h) * (0.3 + Math.random() * 0.4), // Taille réduite
          drift: Math.random() * Math.PI * 2,
          driftSpeed: 0.00001 + Math.random() * 0.00002, // Mouvement plus lent
          colorIndex: Math.floor(Math.random() * PAL.dark.desktopNebula.length),
          depth: i / count,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.000005 + Math.random() * 0.00001 // Pulsation plus lente
        });
      }
    }
  }

  function buildDustParticles(qualityMod) {
    const count = Math.round((isMobile ? 20 : 35) * qualityMod.particles);
    dustParticles = [];

    for (let i = 0; i < count; i++) {
      dustParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        r: 0.3 + Math.random() * 0.8,
        vx: (Math.random() * 2 - 1) * 0.03,
        vy: (Math.random() * 2 - 1) * 0.03,
        hue: 200 + Math.random() * 40,
        alpha: 0.05 + Math.random() * 0.1
      });
    }
  }

  // Adaptive quality based on performance
  function adjustQuality() {
    const fps = 1000 / (performance.now() - last);
    if (fps < 30 && quality === 'high') quality = 'medium';
    else if (fps < 20 && quality === 'medium') quality = 'low';
    else if (fps > 45 && quality === 'medium') quality = 'high';
    else if (fps > 35 && quality === 'low') quality = 'medium';
  }

  function updateMouse() {
    const smoothing = isMobile ? 0.08 : 0.12;
    mouse.smoothX += (mouse.x - mouse.smoothX) * smoothing;
    mouse.smoothY += (mouse.y - mouse.smoothY) * smoothing;
  }

  function updateScrollEffects() {
    lastScrollY = scrollY;
  }

  // Enhanced parallax calculation function with more dynamic movement
  function calculateParallax(element, config) {
    const scrollOffset = scrollY * config.scroll * dpr;
    const mouseOffsetX = (mouse.smoothX - w * 0.5) * config.mouse;
    const mouseOffsetY = (mouse.smoothY - h * 0.5) * config.mouse;

    // Enhanced drift animation with more movement
    const driftX = Math.cos(time * config.drift + element.baseX * 0.001) * 15 * dpr;
    const driftY = Math.sin(time * config.drift * 0.8 + element.baseY * 0.001) * 12 * dpr;

    // Add subtle wave motion for more dynamic movement
    const waveX = Math.sin(time * 0.00005 + element.baseY * 0.002) * 8 * dpr;
    const waveY = Math.cos(time * 0.00003 + element.baseX * 0.0015) * 6 * dpr;

    return {
      x: element.baseX + mouseOffsetX + driftX + waveX,
      y: element.baseY + scrollOffset + mouseOffsetY + driftY + waveY
    };
  }

  function drawEnhancedBackground(dt) {
    // Multi-layer background with animated gradients
    ctx.fillStyle = PAL.dark.base;
    ctx.fillRect(0, 0, w, h);

    // Dynamic nebula layers with enhanced parallax
    for (const layer of nebulaLayers) {
      layer.drift += layer.driftSpeed * dt;
      const pos = calculateParallax(layer, {
        scroll: PARALLAX_CONFIG.ultraFar.scroll * (1 + layer.depth * 0.5),
        mouse: PARALLAX_CONFIG.ultraFar.mouse * (1 + layer.depth * 0.3),
        drift: PARALLAX_CONFIG.ultraFar.drift
      }, dt);

      const x = pos.x + Math.cos(layer.drift) * 25 * dpr;
      const y = pos.y + Math.sin(layer.drift) * 18 * dpr;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layer.r);
      gradient.addColorStop(0, PAL.dark.nebula[layer.colorIndex]);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillRect(0, 0, w, h);
    }

    // Nouvelles nébuleuses pour les écrans desktop
    if (isDesktop()) {
      for (const layer of desktopNebulae) {
        layer.drift += layer.driftSpeed * dt;
        layer.pulsePhase += layer.pulseSpeed * dt;

        const pos = calculateParallax(layer, {
          scroll: PARALLAX_CONFIG.ultraFar.scroll * (1 + layer.depth * 0.5),
          mouse: PARALLAX_CONFIG.ultraFar.mouse * (1 + layer.depth * 0.3),
          drift: PARALLAX_CONFIG.ultraFar.drift
        }, dt);

        const x = pos.x + Math.cos(layer.drift) * 30 * dpr;
        const y = pos.y + Math.sin(layer.drift) * 22 * dpr;

        // Effet de pulsation pour les nébuleuses desktop
        const pulseIntensity = 0.8 + 0.3 * Math.sin(layer.pulsePhase);
        const dynamicRadius = layer.r * pulseIntensity;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, dynamicRadius);

        // Couleur avec intensité variable
        const baseColor = PAL.dark.desktopNebula[layer.colorIndex];
        const enhancedColor = baseColor.replace(/[\d\.]+\)$/g, (match) => {
          const alpha = parseFloat(match.slice(0, -1));
          return `${alpha * pulseIntensity})`;
        });

        gradient.addColorStop(0, enhancedColor);
        gradient.addColorStop(0.4, baseColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillRect(0, 0, w, h);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function drawEnhancedStars(dt) {
    // Ultra far stars - deepest layer
    for (const s of starsUltraFar) {
      s.twinkle += dt * 0.001 * s.twinkleSpeed;
      const pos = calculateParallax(s, PARALLAX_CONFIG.ultraFar);
      const twinkleEffect = 0.2 + 0.1 * Math.sin(s.twinkle);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.r * twinkleEffect, 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.starUltraFar(0.15 * twinkleEffect);
      ctx.fill();
    }

    // Far stars with medium parallax
    for (const s of starsFar) {
      s.twinkle += dt * 0.0012 * s.twinkleSpeed;
      const pos = calculateParallax(s, PARALLAX_CONFIG.far);
      const twinkleEffect = 0.6 + 0.4 * Math.sin(s.twinkle);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.r * twinkleEffect, 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.starFar(0.25 * twinkleEffect);
      ctx.fill();
    }

    // Near stars with strongest parallax
    for (const s of starsNear) {
      s.twinkle += dt * 0.0015 * s.twinkleSpeed;
      const pos = calculateParallax(s, PARALLAX_CONFIG.near);
      const twinkleEffect = 0.7 + 0.3 * Math.sin(s.twinkle);

      // Star core
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.r * twinkleEffect, 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.starNear(0.4 * twinkleEffect);
      ctx.fill();

      // Star glow (optimized)
      if (frameCount % 4 === 0 && !isMobile) {
        const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s.r * 2.5);
        glowGrad.addColorStop(0, PAL.dark.starNear(0.08 * twinkleEffect));
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Interactive connections (reduced for mobile)
      if (!isMobile || frameCount % 2 === 0) {
        const dx = pos.x - mouse.smoothX;
        const dy = pos.y - mouse.smoothY;
        const dist = Math.hypot(dx, dy);

        // Increased detection distance and visibility for desktop
        const maxDist = isMobile ? 150 * dpr : 200 * dpr;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(mouse.smoothX, mouse.smoothY);
          // Enhanced alpha for better visibility on desktop
          const alpha = (0.5 - dist / maxDist) * (isMobile ? 0.4 : 0.7) * twinkleEffect;
          ctx.strokeStyle = PAL.dark.link(alpha);
          ctx.lineWidth = isMobile ? dpr : 1.5 * dpr;
          ctx.stroke();
        }
      }
    }
  }

  function drawEnhancedOrbs(dt) {
    ctx.globalCompositeOperation = 'lighter';

    for (const o of orbs) {
      o.phase += dt * 0.0001 * o.speed;
      const pos = calculateParallax(o, PARALLAX_CONFIG.floating);

      const driftX = Math.cos(o.phase) * o.driftRadius * dpr;
      const driftY = Math.sin(o.phase * 0.7) * o.driftRadius * 0.6 * dpr;

      const x = pos.x + driftX;
      const y = pos.y + driftY;

      // Orb outer glow
      const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, o.r * 1.6);
      outerGrad.addColorStop(0, PAL.dark.orb(o.hue, o.intensity * 0.35));
      outerGrad.addColorStop(0.7, PAL.dark.orb(o.hue, o.intensity * 0.08));
      outerGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(x, y, o.r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, o.r);
      coreGrad.addColorStop(0, PAL.dark.orb(o.hue, o.intensity * 0.8));
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(x, y, o.r, 0, Math.PI * 2);
      ctx.fill();

      // Bright center
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, o.r * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.core;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function drawFloatingParticles(dt) {
    for (let i = floatingParticles.length - 1; i >= 0; i--) {
      const p = floatingParticles[i];

      p.baseX += p.vx * dt * 0.008;
      p.baseY += p.vy * dt * 0.008;
      p.life += dt * 0.00008;

      // Respawn particles
      if (p.life > p.maxLife) {
        p.life = 0;
        p.baseX = Math.random() * w;
        p.baseY = Math.random() * h;
      }

      // Boundary wrap
      if (p.baseX < 0) p.baseX = w;
      if (p.baseX > w) p.baseX = 0;
      if (p.baseY < 0) p.baseY = h;
      if (p.baseY > h) p.baseY = 0;

      const pos = calculateParallax(p, PARALLAX_CONFIG.floating);
      const alpha = Math.sin(p.life / p.maxLife * Math.PI) * 0.12;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.particle(p.hue, alpha);
      ctx.fill();
    }
  }

  function drawDustParticles(dt) {
    for (const d of dustParticles) {
      d.baseX += d.vx * dt * 0.005;
      d.baseY += d.vy * dt * 0.005;

      // Boundary wrap
      if (d.baseX < 0) d.baseX = w;
      if (d.baseX > w) d.baseX = 0;
      if (d.baseY < 0) d.baseY = h;
      if (d.baseY > h) d.baseY = 0;

      const pos = calculateParallax(d, PARALLAX_CONFIG.far);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.dust(d.hue, d.alpha);
      ctx.fill();
    }
  }

  function drawNodeConnections(node, nodePos, nodeIndex) {
    // Node to mouse connection with enhanced visibility
    const mdx = nodePos.x - mouse.smoothX;
    const mdy = nodePos.y - mouse.smoothY;
    const mdist = Math.hypot(mdx, mdy);

    // Increased distance and visibility for desktop
    const mouseConnectDist = isMobile ? 140 * dpr : 180 * dpr;
    if (mdist < mouseConnectDist) {
      ctx.beginPath();
      ctx.moveTo(nodePos.x, nodePos.y);
      ctx.lineTo(mouse.smoothX, mouse.smoothY);
      const alpha = (0.5 - mdist / mouseConnectDist) * (isMobile ? 0.4 : 0.6);
      ctx.strokeStyle = PAL.dark.energy(alpha);
      ctx.lineWidth = isMobile ? 1.0 * dpr : 1.5 * dpr;
      ctx.stroke();
    }

    // Inter-node connections with enhanced visibility on desktop
    if (!isMobile) {
      for (let j = nodeIndex + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const posB = calculateParallax(b, PARALLAX_CONFIG.foreground);
        const dx = nodePos.x - posB.x;
        const dy = nodePos.y - posB.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 150 * dpr) {
          ctx.beginPath();
          ctx.moveTo(nodePos.x, nodePos.y);
          ctx.lineTo(posB.x, posB.y);
          const alpha = (1.0 - dist / (150 * dpr)) * 0.4; // Increased from 0.25
          ctx.strokeStyle = PAL.dark.node(alpha);
          ctx.lineWidth = 1.2 * dpr; // Increased from 0.8
          ctx.stroke();
        }
      }
    }
    // Mobile inter-node connections
    else {
      for (let j = nodeIndex + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const posB = calculateParallax(b, PARALLAX_CONFIG.foreground);
        const dx = nodePos.x - posB.x;
        const dy = nodePos.y - posB.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 110 * dpr) {
          ctx.beginPath();
          ctx.moveTo(nodePos.x, nodePos.y);
          ctx.lineTo(posB.x, posB.y);
          const alpha = (1.0 - dist / (110 * dpr)) * 0.5;
          ctx.strokeStyle = PAL.dark.node(alpha);
          ctx.lineWidth = 1.5 * dpr;
          ctx.stroke();
        }
      }
    }
  }

  function drawEnhancedNodes(dt) {
    hueCycle = (hueCycle + dt * 0.006) % 360;

    // Update node positions with parallax
    for (const n of nodes) {
      n.baseX += n.vx * dt * 0.008;
      n.baseY += n.vy * dt * 0.008;

      // Bounce off boundaries with energy conservation
      if (n.baseX < 0 || n.baseX > w) {
        n.vx *= -0.7;
        n.baseX = Math.max(0, Math.min(w, n.baseX));
      }
      if (n.baseY < 0 || n.baseY > h) {
        n.vy *= -0.7;
        n.baseY = Math.max(0, Math.min(h, n.baseY));
      }
    }

    // Draw enhanced connections and nodes
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const pos = calculateParallax(a, PARALLAX_CONFIG.foreground);

      // Node rendering
      const nodeSize = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = PAL.dark.node(0.5);
      ctx.fill();

      // Draw connections using separate function
      drawNodeConnections(a, pos, i);
    }
  }

  function render() {
    const now = performance.now();
    const dt = Math.min(now - last, 32); // Cap delta time for stability
    last = now;
    time += dt;

    frameCount++;
    if (frameCount % 60 === 0) adjustQuality();

    ctx.clearRect(0, 0, w, h);

    updateMouse();
    updateScrollEffects();

    // Render layers in depth order
    drawEnhancedBackground(dt);
    drawDustParticles(dt);
    drawEnhancedStars(dt);
    drawFloatingParticles(dt);
    drawEnhancedOrbs(dt);
    drawEnhancedNodes(dt);

    requestAnimationFrame(render);
  }

  // Event listeners with enhanced mobile support
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      mouse.x = (e.touches[0].clientX - rect.left) * scaleX;
      mouse.y = (e.touches[0].clientY - rect.top) * scaleY;
    }
  }

  function handleScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }

  // Initialize
  if (canvas) {
    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (isTouch) {
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    render();
  }
})();
