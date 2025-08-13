
// Comets overlay: guaranteed cross-screen traversal
(() => {
  const c = document.getElementById('comets');
  if(!c) return;
  const ctx = c.getContext('2d');
  let dpr=1, w=0, h=0, last=performance.now();
  let comets=[];

  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = c.width = Math.floor(innerWidth*dpr);
    h = c.height = Math.floor(innerHeight*dpr);
    c.style.width = innerWidth+'px';
    c.style.height = innerHeight+'px';
  }
  resize(); addEventListener('resize', resize);

  function spawn(){
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -100*dpr : w + 100*dpr;
    const startY = Math.random()*h*0.95;
    const pxPerMs = (0.30 + Math.random()*0.40) * dpr; // speed
    const angle = (Math.random()*0.35 - 0.175); // slight diagonal
    const vx = pxPerMs * (fromLeft ? 1 : -1);
    const vy = pxPerMs * Math.tan(angle);
    const trail = 140*dpr + Math.random()*160*dpr;
    const life = (w/pxPerMs) + 2500;
    comets.push({ x:startX, y:startY, vx, vy, trail, born:performance.now(), life });
  }

  function update(now, dt){
    if(comets.length < 2 && Math.random() < 0.012) spawn();
    for(let i=comets.length-1;i>=0;i--){
      const cm = comets[i];
      cm.x += cm.vx * dt;
      cm.y += cm.vy * dt;
      if(now - cm.born > cm.life || cm.x < -220*dpr || cm.x > w+220*dpr || cm.y < -220*dpr || cm.y > h+220*dpr){
        comets.splice(i,1);
      }
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    for(const cm of comets){
      const tx = cm.x, ty = cm.y;
      const bx = tx - cm.vx * cm.trail;
      const by = ty - cm.vy * cm.trail;
      const g = ctx.createLinearGradient(tx,ty,bx,by);
      g.addColorStop(0, 'rgba(200,240,255,0.95)');
      g.addColorStop(1, 'rgba(120,170,255,0.0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2*dpr;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx,ty,2*dpr,0,Math.PI*2); ctx.fillStyle='rgba(220,250,255,0.95)'; ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(now){
    const dt = Math.min(32, now - last); last = now;
    update(now, dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();