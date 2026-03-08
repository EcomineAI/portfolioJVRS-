(function () {

  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function beep(freq, dur, vol) {
    try {
      const ac  = getAudio();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      osc.start(); osc.stop(ac.currentTime + dur);
    } catch(e) {}
  }
  function beepOk()   { beep(880, 0.06, 0.04); }
  function beepDone() { beep(1046, 0.08, 0.05); setTimeout(() => beep(1318, 0.12, 0.05), 90); }

  const bootLines = [
    { cmd: 'boot ecomine_os --user="JuneVic" --lab=gc_ai',        tag: 'ok',   label: 'OK'     },
    { cmd: 'handshake gordon_college --dept=BSCS --year=2',        tag: 'ok',   label: 'LINKED' },
    { cmd: 'spawn lm_studio --runtime=local --no-cloud',           tag: 'ok',   label: 'OK'     },
    { cmd: 'pull gguf_model gemma3-4b --quant=Q4_K_M',             tag: 'ok',   label: 'LOADED' },
    { cmd: 'calibrate neural_weights --vibe=sigma',                tag: 'err',  label: 'ERR'    },
    { cmd: 'retry calibrate --patch=yes --trust_the_process',      tag: 'ok',   label: 'FIXED'  },
    { cmd: 'sync python_backend --port=1234 --middleware=FastAPI', tag: 'ok',   label: 'OK'     },
    { cmd: 'inject prompt_engine --mode=chain_of_thought',         tag: 'ok',   label: 'OK'     },
    { cmd: 'subscribe ai_trends --src=youtube,tiktok,arxiv',       tag: 'warn', label: 'CACHED' },
    { cmd: 'index portfolio_data --projects --certs --skills',     tag: 'ok',   label: 'OK'     },
    { cmd: 'compile EcomineAI_identity --alias=verified',          tag: 'ok',   label: 'OK'     },
    { cmd: 'ready --user="June Vic Abello" --status=open_to_work', tag: 'ok',   label: 'READY'  },
  ];

  const loader  = document.getElementById('loader');
  const logEl   = document.getElementById('loaderLog');
  const barEl   = document.getElementById('loaderBar');
  const pctEl   = document.getElementById('loaderPct');
  const skipBtn = document.getElementById('loaderSkip');

  let lineIdx = 0;
  let done = false;

  function setProgress(p) {
    barEl.style.width = p + '%';
    pctEl.textContent = p + '%';
  }

  function addLine(line) {
    const row = document.createElement('div');
    row.className = 'loader-log-line';
    row.innerHTML =
      '<span class="ldr-prompt">$</span>' +
      '<span class="ldr-cmd">' + line.cmd + '</span>' +
      '<span class="ldr-' + line.tag + '">[' + line.label + ']</span>';
    logEl.appendChild(row);
    logEl.parentElement.scrollTop = logEl.parentElement.scrollHeight;
    beepOk();
  }

  function nextLine() {
    if (done) return;
    if (lineIdx >= bootLines.length) {
      setProgress(100);
      beepDone();
      skipBtn.textContent = 'continue';
      skipBtn.classList.add('ready');
      return;
    }
    const progress = Math.round(10 + (lineIdx / bootLines.length) * 90);
    setProgress(progress);
    addLine(bootLines[lineIdx++]);
    const delay = 180 + Math.random() * 200 + (lineIdx === 1 ? 200 : 0);
    setTimeout(nextLine, delay);
  }

    skipBtn.addEventListener('click', () => {
    if (!done) {
      done = true;
      setProgress(100);
      loader.classList.add('gone');
      document.body.classList.remove('loading');
    }
  });

  function startLoader() {
    setProgress(5);
    setTimeout(nextLine, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoader);
  } else {
    startLoader();
  }

})();

(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.opacity = Math.random() * 0.7 + 0.2;
      this.pulse = Math.random() * Math.PI * 2;
      const r = Math.random();
      this.color = r < 0.6 ? '0,229,255' : r < 0.85 ? '124,58,237' : '0,255,157';
    }
    update() {
      this.x += this.speedX; this.y += this.speedY; this.pulse += 0.02;
      if (this.y < -10) this.reset(false);
      return Math.max(0, Math.min(1, this.opacity + Math.sin(this.pulse) * 0.15));
    }
    draw(alpha) {
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${this.color},1)`;
      ctx.shadowBlur = this.size * 4; ctx.shadowColor = `rgba(${this.color},0.8)`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    }
  }

  function init() {
    resize(); particles = [];
    const count = Math.min(120, Math.floor(canvas.width * canvas.height / 12000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.save(); ctx.globalAlpha = (1 - d / 100) * 0.08;
          ctx.strokeStyle = 'rgba(0,229,255,1)'; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); ctx.restore();
        }
      }
    }
    particles.forEach(p => { const a = p.update(); p.draw(a); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('load', init);
})();

const typingStrings = ["2nd Year BSCS Student","AI & Web Developer","Local LLM Integrator","Prompt Engineer","EcomineAI","Building Real Projects"];
let si = 0, ci = 0, del = false;
const tEl = document.getElementById('typingText');
function type() {
  const cur = typingStrings[si];
  if (!del) { tEl.textContent = cur.slice(0, ci + 1); ci++; if (ci === cur.length) { del = true; setTimeout(type, 1800); return; } }
  else { tEl.textContent = cur.slice(0, ci - 1); ci--; if (ci === 0) { del = false; si = (si + 1) % typingStrings.length; } }
  setTimeout(type, del ? 40 : 70);
}
window.addEventListener('load', () => setTimeout(type, 2800));

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.getAttribute('id'); });
  navLinks.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === '#' + cur) l.classList.add('active'); });
});
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');
hamburger.addEventListener('click', () => { hamburger.classList.toggle('open'); navLinksContainer.classList.toggle('open'); });
navLinks.forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('open'); navLinksContainer.classList.remove('open'); }));
document.addEventListener('click', e => { if (!navbar.contains(e.target) && navLinksContainer.classList.contains('open')) { hamburger.classList.remove('open'); navLinksContainer.classList.remove('open'); } });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.skill-fill').forEach(bar => bar.style.width = bar.dataset.width + '%');
        entry.target.querySelectorAll('.skill-pct[data-target]').forEach(el => animateCounter(el, parseInt(el.dataset.target), '%'));
        entry.target.querySelectorAll('.stat-counter[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target);
          animateCounter(el, target, target >= 100 ? '+' : '');
        });
      }, parseInt(delay));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1200, step = 16;
  const inc = target / (duration / step);
  const timer = setInterval(() => {
    start += inc;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start) + suffix;
  }, step);
}

const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(b => b.style.width = b.dataset.width + '%');
      e.target.querySelectorAll('.skill-pct[data-target]').forEach(el => animateCounter(el, parseInt(el.dataset.target), '%'));
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-card').forEach(c => skillObs.observe(c));

document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.25}px,${y * 0.35}px) scale(1.04)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

const projectIcons = {
  1: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 3v4M8 7h8M7 11V9a5 5 0 0 1 10 0v2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(0,229,255,0.18),rgba(0,152,255,0.12))',
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.5)'
  },
  2: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20M5 20V8l7-4 7 4v12"/><rect x="9" y="14" width="6" height="6"/><path d="M9 11h6"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(124,58,237,0.22),rgba(167,139,250,0.12))',
    color: '#a78bfa',
    glow: 'rgba(124,58,237,0.55)'
  },
  3: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(0,255,157,0.15),rgba(0,229,255,0.08))',
    color: '#00ff9d',
    glow: 'rgba(0,255,157,0.5)'
  },
  4: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(0,255,157,0.15),rgba(0,229,255,0.08))',
    color: '#00ff9d',
    glow: 'rgba(0,255,157,0.45)'
  },
  5: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M19 3l1.5 1.5L22 3l-1.5 1.5L22 6l-1.5-1.5L19 6l1.5-1.5z"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(167,139,250,0.1))',
    color: '#a78bfa',
    glow: 'rgba(124,58,237,0.5)'
  },
  6: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polygon points="10 8 16 11 10 14 10 8" fill="currentColor" stroke="none"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(255,80,80,0.18),rgba(255,140,0,0.1))',
    color: '#ff5050',
    glow: 'rgba(255,80,80,0.5)'
  },
  7: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(124,58,237,0.1))',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)'
  },
  8: {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    bg: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(255,140,0,0.1))',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.5)'
  }
};

const projectBgColors = {
  coding:   'linear-gradient(135deg,#030d18 0%,#050f1e 100%)',
  prompt:   'linear-gradient(135deg,#030f0a 0%,#050e08 100%)',
  video:    'linear-gradient(135deg,#140505 0%,#0f0303 100%)',
  graphics: 'linear-gradient(135deg,#0a0514 0%,#080312 100%)',
  photo:    'linear-gradient(135deg,#120d02 0%,#0e0a02 100%)',
};

const catLabels = { coding:'CODING', video:'VIDEO', graphics:'GRAPHICS', photo:'PHOTO', prompt:'PROMPT ENG' };
const badgeClass = { coding:'badge-coding', video:'badge-video', graphics:'badge-graphics', photo:'badge-photo', prompt:'badge-prompt' };

const projects = [
  { id:1, category:'coding', title:'GC-Assist', description:'AI Conversational Information System for Gordon College. Connects a web-based chatbot to a locally running language model via LM Studio and Python backend — no cloud required.', tags:['Python','HTML','CSS','JavaScript','LM Studio'], github:'https://github.com/EcomineAI', demo:'#' },
  { id:2, category:'coding', title:'ECO-S-TWITCHCHAT-SIM', description:'LLM Twitch Chat Simulator — uses a language model to generate multiple simulated viewer messages in real time, recreating the chaotic chat environment of a live stream.', tags:['Python','LM Studio','Local LLM','AI Simulation'], github:'https://github.com/EcomineAI', demo:'#' },
  { id:3, category:'coding', title:'CAE-G-CAS', description:'An AI-integrated project from EcomineAI — a custom application leveraging local language model capabilities for automated conversational workflows.', tags:['Python','AI','Local LLM'], github:'https://github.com/EcomineAI', demo:'#' },
  { id:4, category:'prompt', title:'System Prompt Engineering', description:'Collection of engineered system prompts for local LLMs — persona design, chain-of-thought templates, RAG-style instruction sets, and jailbreak-resistant safety prompts.', tags:['Prompt Design','LLM','GGUF','LM Studio'], github:'https://github.com/EcomineAI', demo:'#' },
  { id:5, category:'prompt', title:'AI Persona Prompts', description:'Crafted multi-turn conversation prompts and personas for local AI models. Explores tone consistency, memory simulation, and character-based interaction patterns.', tags:['Prompt Engineering','Persona','AI','Gemma'], github:'https://github.com/EcomineAI', demo:'#' },
  { id:6, category:'video', title:'AI Demo Videos', description:'Screen-recorded demos and walkthroughs of AI projects — showing GC-Assist, the Twitch Chat Simulator, and local LLM experiments in action.', tags:['Demo','Screen Record','AI Projects'], github:'#', demo:'#' },
  { id:7, category:'graphics', title:'UI/UX Design Concepts', description:'Graphic design work including UI mockups, portfolio graphics, and visual assets created for personal and freelance projects.', tags:['UI Design','Graphics','Visual'], github:'#', demo:'#' },
  { id:8, category:'photo', title:'Photography Portfolio', description:'A personal collection of photography work — from candid street shots to tech setups and creative compositions.', tags:['Photography','Creative','Visual'], github:'#', demo:'#' },
];

function updateCounts() {
  document.getElementById('count-all').textContent = projects.length;
  ['coding','video','graphics','photo','prompt'].forEach(c => {
    document.getElementById('count-' + c).textContent = projects.filter(p => p.category === c).length;
  });
}

function renderProjects(filter) {
  const grid = document.getElementById('projectsGrid');
  const list = filter === 'all' ? projects : projects.filter(p => p.category === filter);
  grid.innerHTML = '';
  list.forEach((p, i) => {
    const ic = projectIcons[p.id] || projectIcons[1];
    const bgGrad = projectBgColors[p.category] || projectBgColors.coding;
    const card = document.createElement('div');
    card.className = 'project-card reveal';
    card.style.transitionDelay = `${i * 80}ms`;
    card.innerHTML = `
      <div class="project-image" style="background:${bgGrad};">
        <div class="project-img-grid"></div>
        <div class="project-icon-badge">
          <div class="project-icon-wrap" style="background:${ic.bg};box-shadow:0 0 24px ${ic.glow};border:1px solid ${ic.color}22;">
            <span style="color:${ic.color}">${ic.svg}</span>
          </div>
          <span class="project-icon-label">${p.title}</span>
        </div>
        <span class="project-category-badge ${badgeClass[p.category]}">${catLabels[p.category]}</span>
        <span class="project-number">0${i + 1}</span>
        <div class="project-image-overlay"></div>
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tags">${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
        <div class="project-links">
          ${p.github !== '#' ? `<a href="${p.github}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>GitHub</a>` : ''}
        </div>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  setTimeout(initTilt, 300);
}

document.getElementById('projectTabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(btn.dataset.filter);
});
updateCounts();
renderProjects('all');

function initTilt() {
  document.querySelectorAll('.project-card, .service-card, .skill-card').forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = '1';
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-5px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}
setTimeout(initTilt, 1500);

const btt = document.getElementById('backToTop');
window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 400));
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const moonSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunSVG  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
let isLight = localStorage.getItem('theme') === 'light';
function applyTheme() {
  document.body.classList.toggle('light-mode', isLight);
  themeIcon.innerHTML = isLight ? moonSVG : sunSVG;
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
themeToggle.addEventListener('click', () => { isLight = !isLight; applyTheme(); });
themeIcon.innerHTML = sunSVG;
if (isLight) applyTheme();

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

async function fetchGitHubStats() {
  try {
    const res = await fetch('https://api.github.com/users/EcomineAI');
    if (!res.ok) return;
    const data = await res.json();
    const reposEl = document.querySelector('.gh-stat-number[data-gh="repos"]');
    if (reposEl && data.public_repos !== undefined) animateCounter(reposEl, data.public_repos, '');
  } catch(e) { /* silent fallback */ }
}
fetchGitHubStats();

const tools = ['LM Studio + Gemma 3 4B','VS Code + Python','GitHub · EcomineAI','Ubuntu Terminal','Qwen 3.5 4B (Local)','Prompt Engineering','Building something new...'];
let toolIdx = 0;
const npTrack = document.getElementById('npTrack');
function rotateTool() {
  toolIdx = (toolIdx + 1) % tools.length;
  npTrack.style.opacity = '0';
  setTimeout(() => { npTrack.textContent = tools[toolIdx]; npTrack.style.opacity = '1'; }, 300);
}
npTrack.style.transition = 'opacity 0.3s ease';
setInterval(rotateTool, 4000);

function copyEmail(e) {
  e.preventDefault(); e.stopPropagation();
  const email = document.getElementById('emailDisplay').textContent.trim();
  navigator.clipboard.writeText(email).then(() => {
    const btn = document.getElementById('copyEmailBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
    btn.style.cssText = 'background:rgba(0,255,157,0.2);border-color:rgba(0,255,157,0.5);color:#00ff9d';
    setTimeout(() => { btn.innerHTML = orig; btn.style.cssText = ''; }, 2000);
  });
}

const kc = [38,38,40,40,37,39,37,39,66,65]; let ki = 0;
document.addEventListener('keydown', e => {
  if (e.keyCode === kc[ki]) { ki++; if (ki === kc.length) { ki = 0; document.body.style.transition = 'filter .5s'; document.body.style.filter = 'hue-rotate(180deg)'; setTimeout(() => document.body.style.filter = '', 2000); } }
  else ki = 0;
});

const chatbotToggle  = document.getElementById('chatbotToggle');
const chatbotPanel   = document.getElementById('chatbotPanel');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput   = document.getElementById('chatbotInput');
const chatbotSend    = document.getElementById('chatbotSend');
const chatbotClear   = document.getElementById('chatbotClear');
const quickChips     = document.querySelectorAll('.quick-chip');
let chatOpen = false;

chatbotToggle.addEventListener('click', () => {
  chatOpen = !chatOpen;
  chatbotToggle.classList.toggle('open', chatOpen);
  chatbotPanel.classList.toggle('open', chatOpen);
  if (chatOpen) setTimeout(() => chatbotInput.focus(), 350);
});

chatbotClear.addEventListener('click', () => {
  chatbotMessages.innerHTML = '';
  appendMsg('bot', 'Chat cleared! Ask me anything about June Vic\'s portfolio. 👾');
});

chatbotSend.addEventListener('click', () => handleSend());
chatbotInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });
quickChips.forEach(chip => chip.addEventListener('click', () => { handleSend(chip.dataset.msg); }));

function handleSend(overrideText) {
  const text = (overrideText || chatbotInput.value).trim();
  if (!text) return;
  chatbotInput.value = '';
  appendMsg('user', text);
    document.getElementById('chatbotQuick').style.display = 'none';
    const typingEl = appendMsg('bot typing', '· · ·');
  setTimeout(() => {
    typingEl.remove();
    const reply = getResponse(text);
    appendMsg('bot', reply);
  }, 700 + Math.random() * 500);
}

function appendMsg(type, content) {
  const row = document.createElement('div');
  row.className = `chatbot-msg ${type}`;
  if (type.includes('bot')) {
    row.innerHTML = `
      <div class="msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 3v4M8 7h8M7 11V9a5 5 0 0 1 10 0v2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/></svg>
      </div>
      <div class="msg-bubble">${content}</div>`;
  } else {
    row.innerHTML = `<div class="msg-bubble">${content}</div>`;
  }
  chatbotMessages.appendChild(row);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  return row;
}

const responses = {
  greet: [
    "Hey there! 👋 I'm the EcomineAI bot. Ask me about June Vic's projects, skills, or availability!",
    "Hi! What would you like to know about June Vic Abello? I can talk projects, stack, or hiring.",
    "Hello! Ready to chat. Ask me anything about this portfolio! 🤖"
  ],
  projects: `June Vic has built <strong>3 coding projects</strong> plus prompt engineering, video, and design work:<br><br>
    🤖 <strong>GC-Assist</strong> — AI chatbot for Gordon College (Python + LM Studio)<br>
    💬 <strong>ECO-S-TWITCHCHAT-SIM</strong> — LLM Twitch chat simulator<br>
    ⚙️ <strong>CAE-G-CAS</strong> — Context-aware conversational system<br>
    🧠 <strong>System Prompt Engineering</strong> — LLM prompt library<br><br>
    All projects run <strong>fully local</strong> — no cloud, no API keys. Check the Projects section above!`,
  ai: `June Vic's AI stack is all about <strong>offline-first local LLMs</strong>:<br><br>
    ⚡ <strong>LM Studio</strong> — primary inference runtime<br>
    🧠 <strong>GGUF models</strong> — Gemma 3 4B, Qwen 3.5 4B<br>
    🐍 <strong>Python backends</strong> — connects models to web interfaces<br>
    📝 <strong>Prompt Engineering</strong> — persona design & chain-of-thought<br><br>
    No OpenAI, no cloud. Everything runs on local hardware. 💻`,
  skills: `June Vic's core skills include:<br><br>
    🐍 <strong>Python</strong> (80%) · JS (70%) · HTML (90%) · CSS (85%)<br>
    🔧 Git, GitHub, Vercel, Linux environments<br>
    🤖 Local LLM inference, LM Studio, GGUF models<br>
    ✍️ Prompt Engineering & LLM app integration<br><br>
    Strong foundation for a 2nd-year CS student building real-world AI tools!`,
  hire: `Yes! June Vic is <strong>open to work</strong>. Here's what he offers:<br><br>
    💼 Freelance web development (landing pages, responsive sites)<br>
    🤖 Local AI chatbot builds (Python + LM Studio backend)<br>
    ✍️ Prompt engineering & LLM integration work<br>
    🎓 Part-time / internship opportunities<br><br>
    Find him on <strong>OnlineJobs.ph</strong> or use the <strong>Contact form</strong> below! 📬`,
  contact: `You can reach June Vic through:<br><br>
    💻 <strong>GitHub</strong> — github.com/EcomineAI<br>
    💼 <strong>OnlineJobs.ph</strong> — his freelance profile<br>
    📧 <strong>Email</strong> — junevicabello@email.com (scroll to Contact section)<br><br>
    Or just fill out the contact form right here on the page! ✉️`,
  about: `June Vic Abello (alias <strong>EcomineAI</strong>) is a 2nd-year BSCS student at <strong>Gordon College</strong>, Olongapo City.<br><br>
    He specializes in offline AI systems — building chatbots and LLM-integrated apps that run entirely on local hardware. No cloud dependency. Clean, fast, private. 🐧`,
  gordon: `Gordon College is June Vic's school — a college in <strong>Olongapo City, Philippines</strong>. He's currently in his <strong>2nd year of BSCS</strong> (Bachelor of Science in Computer Science).<br><br>
    One of his projects, GC-Assist, was actually built to help Gordon College students access school info through an AI chatbot! 🎓`,
  llm: `June Vic is all-in on <strong>local LLMs</strong> — language models that run directly on your hardware with no internet required.<br><br>
    He uses <strong>LM Studio</strong> to run GGUF-format models like <strong>Gemma 3 4B</strong> and <strong>Qwen 3.5 4B</strong>. These get connected to Python backends that serve web app front-ends.<br><br>
    The result: private, fast, cost-free AI applications. 🔒`,
  troubleshoot: `June Vic has solid <strong>troubleshooting skills</strong> across 4 areas:<br><br>
    🖥 <strong>Hardware</strong> — PC builds, RAM/storage diagnosis, peripheral issues, thermal &amp; power problems<br>
    💻 <strong>Software</strong> — OS errors, driver conflicts, app crashes, Windows &amp; Linux fixes<br>
    🤖 <strong>LLM / AI</strong> — Model load errors, VRAM/OOM fixes, LM Studio issues, GGUF compatibility<br>
    🌐 <strong>Network</strong> — WiFi/LAN drops, ping &amp; latency, DNS/IP config, local server setup<br><br>
    This comes from real hands-on experience building and running local AI systems on personal hardware. 🔧`,
  timeline: `June Vic's timeline so far:<br><br>
    📅 <strong>2024–Present</strong> — 2nd Year BSCS at Gordon College<br>
    🤖 <strong>2024–Present</strong> — Local LLM experimentation (EcomineAI)<br>
    💻 <strong>2024–Present</strong> — Building AI-integrated web projects<br>
    🌐 <strong>2024</strong> — Web development (personal + freelance)<br><br>
    Still early in the journey but already shipping real things! 🚀`,
  default: [
    "Hmm, I'm not sure about that one. Try asking about <strong>projects</strong>, <strong>skills</strong>, <strong>AI stack</strong>, or <strong>hiring</strong>! 🤔",
    "Good question! I might not have that info. Ask me about June Vic's <strong>projects</strong>, <strong>contact</strong>, or <strong>availability</strong>. 😊",
    "I'm a simple scripted bot, so I work best with keywords! Try: <em>projects</em>, <em>skills</em>, <em>AI</em>, <em>hire</em>, or <em>contact</em>. 🤖"
  ]
};

function getResponse(msg) {
  const m = msg.toLowerCase();
  if (m.match(/^(hi|hey|hello|yo|sup|greetings|what's up|wassup|howdy)/)) return pick(responses.greet);
  if (m.match(/project|built|made|work|ship|github|repo/)) return responses.projects;
  if (m.match(/ai|llm|model|ml|machine|local|lm.?studio|gguf|gemma|qwen/)) return responses.ai;
  if (m.match(/skill|tech|stack|language|tool|know|learn|experience|proficien/)) return responses.skills;
  if (m.match(/hire|freelance|available|work|job|intern|collab|opportunity|open/)) return responses.hire;
  if (m.match(/contact|email|reach|message|dm|ph|onlinejobs/)) return responses.contact;
  if (m.match(/about|who|june|abello|ecomine|person|yourself/)) return responses.about;
  if (m.match(/gordon|college|school|university|olongapo|bscs/)) return responses.gordon;
  if (m.match(/llm|local.?ai|offline|private|lm.?studio|gguf/)) return responses.llm;
  if (m.match(/timeline|experience|when|history|journey|year/)) return responses.timeline;
  if (m.match(/troubleshoot|debug|fix|hardware|pc build|ram|vram|driver|crash|oom|wifi|lan|ping|network|dns|windows|linux error|boot/)) return responses.troubleshoot;
  return pick(responses.default);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
