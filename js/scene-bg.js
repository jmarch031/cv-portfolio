// Rich colorful background: auroras, dual-depth stars, node-link network, multi-hue orbs
(() => {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d', { alpha: true });
  let dpr=1, w=0, h=0, last=performance.now();
  let mouse = { x:-9999, y:-9999 }, scrollY=0;
  let starsNear=[], starsFar=[], orbs=[], comets=[], nodes=[];
  let hueCycle = 200; // base hue, will drift over time

  const PAL = {
    dark: {
      base:'rgba(8,8,18,1)',
      neb1:'rgba(70,110,180,0.26)',
      neb2:'rgba(120,170,255,0.18)',
      starNear:c=>`rgba(220,235,255,${c})`,
      starFar:c=>`rgba(150,170,210,${c})`,
      link:a=>`hsla(210, 60%, 72%, ${a})`,
      core:'rgba(240,245,255,0.95)',
      orb:(h,a)=>`hsla(${h}, 64%, 66%, ${a})`,
      auroraA:'rgba(220,120,255,0.10)',
      auroraB:'rgba(80,220,210,0.09)',
      auroraC:'rgba(255,160,120,0.08)',
      node: a => `hsla(${hueCycle}, 70%, 70%, ${a})`
    },
    light: {
      base:'rgba(245,248,255,1)',
      neb1:'rgba(70,130,220,0.12)',
      neb2:'rgba(140,185,255,0.10)',
      starNear:c=>`rgba(60,80,130,${c})`,
      starFar:c=>`rgba(110,130,170,${c})`,
      link:a=>`hsla(214, 40%, 40%, ${a})`,
      core:'rgba(60,80,140,0.85)',
      orb:(h,a)=>`hsla(${h}, 60%, 56%, ${a})`,
      auroraA:'rgba(200,120,255,0.06)',
      auroraB:'rgba(80,220,210,0.05)',
      auroraC:'rgba(255,160,120,0.05)',
      node: a => `hsla(${hueCycle}, 50%, 40%, ${a})`
    }
  };

  function resize(){
    dpr = Math.min(devicePixelRatio||1, 2);
    w = canvas.width  = Math.round(innerWidth*dpr);
    h = canvas.height = Math.round(innerHeight*dpr);
    canvas.style.width = innerWidth+'px';
    canvas.style.height = innerHeight+'px';
    buildStars();
    buildOrbs();
    buildNodes();
  }

  function buildStars(){
    const area = w*h;
    const farCount = Math.floor(area/(75_000*dpr));
    const nearCount = Math.floor(area/(120_000*dpr));
    starsFar = []; starsNear = [];
    for(let i=0;i<farCount;i++){
      starsFar.push({ x:Math.random()*w, y:Math.random()*h, r:0.2+Math.random()*0.8, tw:Math.random()*Math.PI*2, layer:0.3 });
    }
    for(let i=0;i<nearCount;i++){
      starsNear.push({ x:Math.random()*w, y:Math.random()*h, r:0.8+Math.random()*1.8, tw:Math.random()*Math.PI*2, layer:1.2 });
    }
  }

  function buildOrbs(){
    const num = Math.max(12, Math.round(Math.min(innerWidth, innerHeight)/140));
    const minSide = Math.min(w,h);
    orbs = [];
    for(let i=0;i<num;i++){
      const base = Math.random()*minSide*0.42 + minSide*0.16;
      const r = base*0.10;
      const roll = Math.random();
      // diversify hues across blue, teal, magenta, amber
      let hue;
      if(roll < 0.55) hue = 205 + Math.random()*22;         // blue
      else if(roll < 0.75) hue = 165 + Math.random()*14;    // teal
      else if(roll < 0.90) hue = 285 + Math.random()*16;    // magenta
      else hue = 25 + Math.random()*18;                     // amber
      orbs.push({ x:Math.random()*w, y:Math.random()*h, r, phase:Math.random()*Math.PI*2, speed:0.22+Math.random()*0.34, hue });
    }
  }

  function buildNodes(){
    const count = Math.round(Math.min(90, Math.max(40, Math.sqrt(w*h)/42)));
    nodes = [];
    for(let i=0;i<count;i++){
      nodes.push({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()*2-1)*0.15, vy:(Math.random()*2-1)*0.15 });
    }
  }

  function spawnComet(){
    const side = Math.random()<0.5 ? 'left' : 'right';
    comets.push({ x: side==='left'? -40*dpr : w+40*dpr, y: Math.random()*h*0.75, vx: side==='left'? (0.5+Math.random()*0.35)*dpr : -(0.5+Math.random()*0.35)*dpr, vy:(Math.random()*0.22-0.11)*dpr, born: performance.now(), life:900+Math.random()*1100 });
  }

  function nebulaBackground(t, now){
    ctx.fillStyle = PAL[t].base; ctx.fillRect(0,0,w,h);
    const yShift = scrollY*0.04*dpr;
    let g1 = ctx.createRadialGradient(w*0.2, h*0.18 + yShift, 0, w*0.2, h*0.18 + yShift, Math.max(w,h)*0.85);
    g1.addColorStop(0, PAL[t].neb1); g1.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle=g1; ctx.globalCompositeOperation='lighter'; ctx.fillRect(0,0,w,h);
    let g2 = ctx.createRadialGradient(w*0.78, h*0.3 + yShift*0.6, 0, w*0.78, h*0.3 + yShift*0.6, Math.max(w,h)*0.7);
    g2.addColorStop(0, PAL[t].neb2); g2.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle=g2; ctx.fillRect(0,0,w,h);

    // aurora overlays with slow drift and three hues
    const drift = now*0.00005;
    const offx = Math.cos(drift)*60*dpr, offy = Math.sin(drift)*40*dpr;
    const spots = [
      {x:w*0.65+offx, y:h*0.78+offy, r:Math.max(w,h)*0.55, c:PAL[t].auroraA},
      {x:w*0.28-offx, y:h*0.12-offy, r:Math.max(w,h)*0.5,  c:PAL[t].auroraB},
      {x:w*0.5+offx*0.6, y:h*0.45-offy*0.4, r:Math.max(w,h)*0.6, c:PAL[t].auroraC}
    ];
    for(const s of spots){
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      g.addColorStop(0, s.c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    }
    ctx.globalCompositeOperation='source-over';
  }

  function drawOrbs(t, dt){
    for(const o of orbs){
      o.phase += dt*0.00014*o.speed;
      const px = Math.cos(o.phase)*18*dpr, py = Math.sin(o.phase*0.85)*14*dpr;
      const x = o.x + px + (mouse.x - w*0.5)*0.0006*22;
      const y = o.y + py + (mouse.y - h*0.5)*0.0006*22 + (scrollY/innerHeight)*12*dpr;
      const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
      g.addColorStop(0, PAL[t].orb(o.hue, 0.22));
      g.addColorStop(1, PAL[t].orb(o.hue, 0.0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, o.r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, o.r*0.06), 0, Math.PI*2); ctx.fillStyle = PAL[t].core; ctx.fill();
    }
  }

  function drawStars(t, dt){
    // far
    for(const s of starsFar){
      const tw = 0.25 + 0.25*Math.sin(s.tw += dt*0.0018);
      const parY = (scrollY/innerHeight)*6*dpr;
      ctx.beginPath(); ctx.arc(s.x, s.y+parY, s.r*(0.9+tw*0.25), 0, Math.PI*2);
      ctx.fillStyle = PAL[t].starFar(0.18 + tw*0.18); ctx.fill();
    }
    // near, with mouse links
    for(const s of starsNear){
      const tw = 0.35 + 0.35*Math.sin(s.tw += dt*0.0022);
      const x = s.x + (mouse.x - w*0.5)*0.0005*14;
      const y = s.y + (mouse.y - h*0.5)*0.0005*14 + (scrollY/innerHeight)*10*dpr;
      ctx.beginPath(); ctx.arc(x, y, s.r*(0.9+tw*0.35), 0, Math.PI*2);
      ctx.fillStyle = PAL[t].starNear(0.28 + tw*0.28); ctx.fill();

      const dx = x - mouse.x, dy = y - mouse.y, dist=Math.hypot(dx,dy);
      if(dist<160*dpr){
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = PAL[t].link(0.5 - dist/(160*dpr)); ctx.lineWidth=1.1*dpr; ctx.stroke();
      }
    }
  }

  function drawNodes(t, dt){
    hueCycle = (hueCycle + dt*0.01) % 360;
    // move
    for(const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if(n.x<0||n.x>w) n.vx*=-1;
      if(n.y<0||n.y>h) n.vy*=-1;
    }
    // draw connections
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      // point
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6*dpr, 0, Math.PI*2);
      ctx.fillStyle = PAL[t].node(0.7); ctx.fill();
      
      // link node to mouse for stronger hover interaction
      const mdx = a.x - mouse.x, mdy = a.y - mouse.y, md = Math.hypot(mdx, mdy);
      if(md < 240*dpr){
        const malpha = 0.65 - md/(240*dpr);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = PAL[t].node(malpha);
        ctx.lineWidth = 1.3*dpr;
        ctx.stroke();
      }
for(let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if(d<200*dpr){
          const alpha = 0.6 - d/(200*dpr);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = PAL[t].node(alpha*0.8);
          ctx.lineWidth = 1.1*dpr;
          ctx.stroke();
        }
      }
    }
  }

  function drawComets(t, now){
    comets = comets.filter(c => now - c.born < c.life);
    for(const c of comets){
      c.x += c.vx; c.y += c.vy;
      const trail = 120*dpr;
      const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx*trail, c.y - c.vy*trail);
      const head = t==='light' ? 'rgba(60,80,140,0.85)' : 'rgba(240,245,255,0.95)';
      const tail0 = t==='light' ? 'rgba(80,110,170,0.5)' : 'rgba(200,220,255,0.7)';
      grad.addColorStop(0, tail0); grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2*dpr;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - c.vx*trail, c.y - c.vy*trail); ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x, c.y, 2.0*dpr, 0, Math.PI*2); ctx.fillStyle=head; ctx.fill();
    }
    if(Math.random()<0.008) spawnComet();
  }

  function step(now){
    const dt = now - last; last = now;
    const t = 'dark'; // Utilisation fixe du thème sombre
    nebulaBackground(t, now);
    ctx.globalCompositeOperation='lighter';
    drawOrbs(t, dt);
    ctx.globalCompositeOperation='source-over';
    drawStars(t, dt);
    drawNodes(t, dt);
    drawComets(t, now);
    requestAnimationFrame(step);
  }

  addEventListener('resize', resize);
  addEventListener('mousemove', e => { mouse.x = (e.clientX||0)*dpr; mouse.y = (e.clientY||0)*dpr; });
  addEventListener('mouseleave', () => { mouse.x=-9999; mouse.y=-9999; });
  addEventListener('scroll', () => { scrollY = window.scrollY||0; });

  resize(); requestAnimationFrame(step);
})();
