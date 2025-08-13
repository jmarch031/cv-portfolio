// Footer year
document.getElementById('y').textContent = new Date().getFullYear();

// Magnetic buttons
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const mx = clamp((e.clientX - rect.left) / rect.width * 100, 0, 100);
    const my = clamp((e.clientY - rect.top) / rect.height * 100, 0, 100);
    btn.style.setProperty('--mx', mx + '%');
    btn.style.setProperty('--my', my + '%');
  });
});

// Click ripple
(function(){
  const ripple = document.getElementById('ripple');
  addEventListener('click', e => {
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.opacity = 1;
    ripple.style.transition = 'none';
    ripple.style.width = '12px'; ripple.style.height = '12px';
    requestAnimationFrame(()=>{
      ripple.style.transition = 'opacity .6s ease, width .6s ease, height .6s ease';
      ripple.style.width = '240px'; ripple.style.height = '240px';
      ripple.style.opacity = 0;
    });
  });
})();

// Reveal on scroll
(function initReveal(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(n => io.observe(n));
})();

// Timeline expand
document.querySelectorAll('.tl-item').forEach(item => {
  const head = item.querySelector('.tl-head');
  head.addEventListener('click', () => item.classList.toggle('expanded'));
});

// Projects filter
(function initFilter(){
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#projectGrid .card');
  function apply(tag){
    cards.forEach(c => {
      if(tag==='all'){ c.style.display = ''; return; }
      const tags = (c.getAttribute('data-tags') || '').split(/\s+/);
      c.style.display = tags.includes(tag) ? '' : 'none';
    });
  }
  buttons.forEach(b => b.addEventListener('click', () => {
    buttons.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    apply(b.dataset.filter);
  }));
})();

// Theme toggle with persistence
(function themeToggle(){
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  const key = 'jm-theme';
  const saved = localStorage.getItem(key);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initTheme = saved || (prefersLight ? 'light' : 'dark');
  document.body.setAttribute('data-theme', initTheme);

  btn.addEventListener('click', () => {
    const cur = document.body.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem(key, next);
  });
})();

// Typed effect for multiple elements
(function initTypedAll(){
  const els = document.querySelectorAll('.typed');
  if(!els.length) return;
  els.forEach(el => {
    const items = JSON.parse(el.getAttribute('data-rotate') || '[]');
    let i=0, j=0, dir=1, text='';
    const speed = () => 28 + Math.random()*42;
    (function loop(){
      const target = items[i] || '';
      if(dir>0){
        text = target.slice(0, j++);
        if(j>target.length + 12){ dir=-1; }
      } else {
        text = target.slice(0, j--);
        if(j<=0){ dir=1; i=(i+1)%items.length; }
      }
      el.textContent = text + (Date.now()%800<400 ? '' : ' ');
      setTimeout(loop, speed());
    })();
  });
})();

// Extra filter for talks/articles section
(function initContentFilter(){
  const buttons = document.querySelectorAll('#talks .filter-btn');
  const cards = document.querySelectorAll('#contentGrid .card');
  if(!buttons.length) return;
  function apply(tag){
    cards.forEach(c => {
      if(tag==='all'){ c.style.display = ''; return; }
      const tags = (c.getAttribute('data-tags') || '').split(/\s+/);
      c.style.display = tags.includes(tag) ? '' : 'none';
    });
  }
  buttons.forEach(b => b.addEventListener('click', () => {
    buttons.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    apply(b.dataset.filter);
  }));
})();

// Card tilt and glow following mouse
(function cardTilt(){
  const cards = document.querySelectorAll('.card');
  if(!cards.length) return;
  cards.forEach(card => {
    let raf=0;
    function onMove(e){
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(700px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-2px)`;
        card.style.boxShadow = `0 18px 40px rgba(20,35,80,0.22)`;
      });
    }
    function reset(){ card.style.transform=''; card.style.boxShadow=''; }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
  });
})();

// Parallax on hero and section titles
(function parallax(){
  const heroL = document.querySelector('.hero-left');
  const heroR = document.querySelector('.hero-right');
  const titles = document.querySelectorAll('.section-title');
  function onScroll(){
    const y = window.scrollY || 0;
    if(heroL) heroL.style.transform = `translateY(${y*0.02}px)`;
    if(heroR) heroR.style.transform = `translateY(${y*0.03}px)`;
    titles.forEach(t => {
      const rect = t.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight*0.5)*0.04;
      t.style.transform = `translateY(${offset}px)`;
    });
  }
  addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

// Dock: build links from sections & hide on footer overlap
(function dynamicDock(){
  const dock = document.getElementById('dockNav');
  if(!dock) return;
  const sections = [...document.querySelectorAll('section[id]')];
  dock.innerHTML = sections.map(sec => {
    const label = (sec.querySelector('.section-title')?.textContent || sec.id).trim();
    return `<a href="#${sec.id}" aria-label="${label}"><span>${label}</span></a>`;
  }).join('');
  const links = dock.querySelectorAll('a');
  const onScroll = () => {
    const y = window.scrollY + window.innerHeight*0.35;
    let active = 0;
    sections.forEach((sec, idx)=>{
      const top = sec.getBoundingClientRect().top + window.scrollY;
      if(y >= top) active = idx;
    });
    links.forEach((a,i)=>a.classList.toggle('active', i===active));
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  const footer = document.querySelector('footer.footer');
  if(footer && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e => dock.classList.toggle('hide', e.isIntersecting && e.intersectionRatio > 0));
    }, { threshold:[0,.01,.1] });
    io.observe(footer);
  }
})();

// Timeline v3: rebuild meta column and insert sticky year headers
(function timelineV3(){
  const container = document.querySelector('.timeline-v3 .timeline-list');
  if(!container) return;
  const items = [...container.querySelectorAll('.tl-item')];
  // Build meta col from head info
  items.forEach(it => {
    const head = it.querySelector('.tl-head');
    const body = it.querySelector('.tl-body');
    if(!head || !body) return;
    let inner = body.querySelector('.tl-body-inner');
    if(!inner){
      inner = document.createElement('div');
      inner.className = 'tl-body-inner';
      while(body.firstChild){ inner.appendChild(body.firstChild); }
      body.appendChild(inner);
    }
    if(!it.querySelector('.tl-meta')){
      const meta = document.createElement('div');
      meta.className = 'tl-meta';
      const place = head.querySelector('.place')?.textContent?.trim() || '';
      const time = head.querySelector('.time')?.textContent?.trim() || '';
      meta.innerHTML = `<div>${place}</div><div>${time}</div>`;
      it.insertBefore(meta, it.firstChild);
    }
  });
  // Sticky year headers
  const seen = new Set();
  items.forEach(it => {
    const yearTxt = it.querySelector('.time')?.textContent || '';
    const m = yearTxt.match(/(20\d{2}|19\d{2})/);
    const year = m ? m[1] : null;
    if(year && !seen.has(year)){
      const h = document.createElement('div');
      h.className = 'year-header';
      h.textContent = year;
      container.insertBefore(h, it);
      seen.add(year);
    }
  });
})();

// Timeline CLEAN: build meta column from header + year separators
(function timelineClean(){
  const container = document.querySelector('.timeline-clean .timeline-list');
  if(!container) return;
  const items = [...container.querySelectorAll('.tl-item')];
  // Year separators
  let lastYear = null;
  items.forEach(it => {
    const head = it.querySelector('.tl-head');
    const body = it.querySelector('.tl-body');
    if(!head || !body) return;

    // Create body-inner wrapper
    let inner = body.querySelector('.tl-body-inner');
    if(!inner){
      inner = document.createElement('div');
      inner.className = 'tl-body-inner';
      while(body.firstChild){ inner.appendChild(body.firstChild); }
      body.appendChild(inner);
    }

    // Build meta column
    if(!it.querySelector('.tl-meta')){
      const meta = document.createElement('div');
      meta.className = 'tl-meta';
      const place = head.querySelector('.place')?.textContent?.trim() || '';
      const time = head.querySelector('.time')?.textContent?.trim() || '';
      meta.innerHTML = `<div>${place}</div><div>${time}</div>`;
      it.insertBefore(meta, it.firstChild);
    }

    const yearTxt = head.querySelector('.time')?.textContent || '';
    const m = yearTxt.match(/(20\d{2}|19\d{2})/);
    const year = m ? m[1] : null;
    if(year && year !== lastYear){
      const sep = document.createElement('div');
      sep.className = 'year-sep';
      sep.textContent = year;
      container.insertBefore(sep, it);
      lastYear = year;
    }

    // Ensure expanded
    it.setAttribute('aria-expanded','true');
  });
})();

// Ensure timeline nodes exist (for the left rail)
(function timelineNodes(){
  const list = document.querySelector('.timeline-classic .timeline-list');
  if(!list) return;
  list.querySelectorAll('.tl-item').forEach(it => {
    if(!it.querySelector('.node')){
      const n = document.createElement('span');
      n.className = 'node';
      it.appendChild(n);
    }
  });
})();

