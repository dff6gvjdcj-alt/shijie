/**
 * 俯仰之间 —— 2D 展厅主应用
 * SPA 路由 + 页面渲染 + 交互效果
 */
const App = (function () {
  /* ---------- 状态 ---------- */
  const state = {
    currentPage: 'home',
    params: {},
    scrollY: 0
  };

  const mainEl = document.getElementById('main');
  const footerEl = document.getElementById('footer');

  /* ---------- 占位图生成 ---------- */
  function makePlaceholder(hue, id, label, image) {
    if (image) {
      return `<div class="placeholder-art" style="background:#0a0a0c;"><img src="${image}" style="width:100%;height:100%;object-fit:cover;" alt="${label || ''}"></div>`;
    }
    const h = hue || 210;
    return `
      <div class="placeholder-art" style="background:
        radial-gradient(ellipse at 30% 30%, hsla(${h}, 30%, 22%, 0.9) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 70%, hsla(${h + 20}, 25%, 15%, 0.8) 0%, transparent 50%),
        linear-gradient(135deg, #1a1a20 0%, #0e0e14 100%);
        border: 1px solid hsla(${h}, 30%, 40%, 0.15);">
        <span class="placeholder-art-id">${id || ''}</span>
      </div>
    `;
  }

  /* ---------- 导航 ---------- */
  function navigate(page, params = {}) {
    state.currentPage = page;
    state.params = params;
    window.scrollTo({ top: 0, behavior: 'instant' });
    render();
    updateNavActive(page);
  }

  function updateNavActive(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === page) link.classList.add('active');
    });
    if (page === 'home') {
      document.querySelector('.nav-link[data-page="home"]').classList.add('active');
    }
  }

  /* ---------- 渲染入口 ---------- */
  function render() {
    const { currentPage: page, params } = state;
    footerEl.style.display = page === 'work' ? 'none' : 'block';

    switch (page) {
      case 'home': renderHome(); break;
      case 'zone': renderZone(params.zoneId); break;
      case 'medium': renderMedium(params.zoneId, params.mediumId); break;
      case 'exhibition': renderExhibition(params.zoneId, params.mediumId, params.exhibitionId); break;
      case 'theme': renderTheme(params.zoneId, params.mediumId, params.exhibitionId, params.themeId); break;
      case 'allWorks': renderAllWorks(params.zoneId, params.mediumId, params.exhibitionId); break;
      case 'work': renderWork(params.zoneId, params.mediumId, params.exhibitionId, params.themeId, params.workId); break;
      default: renderHome();
    }
  }

  /* ============================================================
     首页
     ============================================================ */
  function renderHome() {
    const zones = EXHIBITION_DATA.zones;
    const totalWorks = zones.reduce((sum, z) => sum + DataUtil.countZoneWorks(z), 0);

    let zoneCards = '';
    zones.forEach(zone => {
      const count = DataUtil.countZoneWorks(zone);
      zoneCards += `
        <div class="zone-card" onclick="App.navigate('zone',{zoneId:'${zone.id}'})" style="--accent:${zone.accent};--accent-glow:${zone.glow}">
          <div class="zone-card-bg" style="background:${zone.bgGradient}"></div>
          <div class="zone-card-overlay"></div>
          <div class="zone-card-count">
            <div class="zone-card-count-num">${count}</div>
            <div class="zone-card-count-label">件作品</div>
          </div>
          <div class="zone-card-content">
            <div class="zone-card-name">${zone.name}</div>
            <div class="zone-card-subtitle">${zone.subtitle}</div>
            <div class="zone-card-medium">${zone.mediumLabel}</div>
          </div>
          <div class="zone-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      `;
    });

    // 粒子
    let particles = '';
    for (let i = 0; i < 30; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = 6 + Math.random() * 6;
      particles += `<div class="hero-particle" style="left:${left}%;bottom:0;animation-delay:${delay}s;animation-duration:${duration}s;"></div>`;
    }

    mainEl.innerHTML = `
      <div class="page active">
        <section class="hero">
          <div class="hero-bg"></div>
          <div class="hero-particles">${particles}</div>
          <div class="hero-content">
            <h1 class="hero-title">俯仰之间</h1>
            <p class="hero-subtitle">合肥一六八中学线上美育数字展厅</p>
            <div class="hero-year">二〇二六 · ${totalWorks} 件作品 · 四大分区</div>
          </div>
          <div class="hero-scroll-hint">
            <span>向下探索</span>
            <div class="hero-scroll-line"></div>
          </div>
        </section>

        <section class="zones-section">
          <div class="zones-header">
            <div class="zones-header-title">四 大 分 区</div>
            <div class="zones-header-line"></div>
          </div>
          <div class="zones-grid">${zoneCards}</div>
        </section>
      </div>
    `;
  }

  /* ============================================================
     分区页（媒介入口）
     ============================================================ */
  function renderZone(zoneId) {
    const zone = DataUtil.getZone(zoneId);
    if (!zone) { navigate('home'); return; }

    document.documentElement.style.setProperty('--accent', zone.accent);
    document.documentElement.style.setProperty('--accent-glow', zone.glow);

    let mediaCards = '';
    zone.media.forEach(medium => {
      const exCount = medium.exhibitions.length;
      const workCount = DataUtil.countMediumWorks(medium);
      mediaCards += `
        <div class="media-card" onclick="App.navigate('medium',{zoneId:'${zone.id}',mediumId:'${medium.id}'})">
          <div class="media-card-name">${medium.name}</div>
          <div class="media-card-desc">${medium.description}</div>
          <div class="media-card-stats">
            <div>
              <div class="media-card-stat-num">${exCount}</div>
              <div class="media-card-stat-label">个画展</div>
            </div>
            <div>
              <div class="media-card-stat-num">${workCount}</div>
              <div class="media-card-stat-label">件作品</div>
            </div>
          </div>
        </div>
      `;
    });

    mainEl.innerHTML = `
      <div class="page active" style="background:${zone.bgGradient};min-height:calc(100vh - 64px);">
        <div class="page-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" onclick="App.navigate('home')">首页</span>
            <span class="breadcrumb-sep">/</span>
            <span>${zone.name}</span>
          </div>
          <button class="back-btn" onclick="App.navigate('home')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回首页
          </button>
          <h1 class="section-title">${zone.name}</h1>
          <div class="section-subtitle">${zone.subtitle} · ${zone.mediumLabel}</div>
          <p class="section-desc">${zone.description}</p>
        </div>
        <div class="media-grid">${mediaCards}</div>
      </div>
    `;
  }

  /* ============================================================
     媒介页（画展列表）
     ============================================================ */
  function renderMedium(zoneId, mediumId) {
    const zone = DataUtil.getZone(zoneId);
    const medium = DataUtil.getMedium(zoneId, mediumId);
    if (!medium) { navigate('home'); return; }

    document.documentElement.style.setProperty('--accent', zone.accent);
    document.documentElement.style.setProperty('--accent-glow', zone.glow);

    let exCards = '';
    medium.exhibitions.forEach(ex => {
      const workCount = DataUtil.countExhibitionWorks(ex);
      exCards += `
        <div class="exhibition-card" onclick="App.navigate('exhibition',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}'})">
          <div class="exhibition-card-cover">
            <div class="exhibition-card-cover-inner">
              ${makePlaceholder(ex.coverHue, ex.name, '', ex.coverImage)}
            </div>
          </div>
          <div class="exhibition-card-body">
            <div class="exhibition-card-name">${ex.name}</div>
            <div class="exhibition-card-desc">${ex.description}</div>
            <div class="exhibition-card-meta">
              <span class="exhibition-card-count">${workCount} 件作品 · ${ex.themes.length} 个主题</span>
              <div class="exhibition-card-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    mainEl.innerHTML = `
      <div class="page active" style="background:${zone.bgGradient};min-height:calc(100vh - 64px);">
        <div class="page-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" onclick="App.navigate('home')">首页</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('zone',{zoneId:'${zone.id}'})">${zone.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span>${medium.name}</span>
          </div>
          <button class="back-btn" onclick="App.navigate('zone',{zoneId:'${zone.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回${zone.name}
          </button>
          <h1 class="section-title">${medium.name}</h1>
          <div class="section-subtitle">${medium.description}</div>
        </div>
        <div class="exhibition-grid">${exCards}</div>
      </div>
    `;
  }

  /* ============================================================
     画展页（大板块入口 + 全部作品）
     ============================================================ */
  function renderExhibition(zoneId, mediumId, exhibitionId) {
    const zone = DataUtil.getZone(zoneId);
    const medium = DataUtil.getMedium(zoneId, mediumId);
    const ex = DataUtil.getExhibition(zoneId, mediumId, exhibitionId);
    if (!ex) { navigate('home'); return; }

    document.documentElement.style.setProperty('--accent', zone.accent);
    document.documentElement.style.setProperty('--accent-glow', zone.glow);

    const totalWorks = DataUtil.countExhibitionWorks(ex);

    // 单主题直接显示作品网格
    if (ex.themes.length === 1) {
      renderTheme(zoneId, mediumId, exhibitionId, ex.themes[0].id);
      return;
    }

    let themeBlocks = '';
    ex.themes.forEach(theme => {
      // 预览小图（最多5张）
      let thumbs = '';
      const previewWorks = theme.works.slice(0, 5);
      previewWorks.forEach(w => {
        thumbs += `<div class="theme-thumb">${makePlaceholder(ex.coverHue, w.id, '', w.image)}</div>`;
      });
      if (theme.works.length > 5) {
        thumbs += `<div class="theme-thumb theme-thumb-more">+${theme.works.length - 5}</div>`;
      }

      themeBlocks += `
        <div class="theme-block" onclick="App.navigate('theme',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}',themeId:'${theme.id}'})">
          <div class="theme-block-left">
            <div class="theme-block-name">${theme.name}</div>
            <div class="theme-block-desc">${theme.description}</div>
            <div class="theme-block-count"><strong>${theme.works.length}</strong>件作品</div>
          </div>
          <div class="theme-block-right">${thumbs}</div>
        </div>
      `;
    });

    mainEl.innerHTML = `
      <div class="page active" style="background:${zone.bgGradient};min-height:calc(100vh - 64px);">
        <div class="exhibition-detail-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" onclick="App.navigate('home')">首页</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('zone',{zoneId:'${zone.id}'})">${zone.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('medium',{zoneId:'${zone.id}',mediumId:'${medium.id}'})">${medium.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span>${ex.name}</span>
          </div>
          <button class="back-btn" onclick="App.navigate('medium',{zoneId:'${zone.id}',mediumId:'${medium.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回媒介
          </button>
          <h1 class="exhibition-detail-title">${ex.name}</h1>
          <p class="exhibition-detail-desc">${ex.description}</p>
        </div>

        <div class="themes-section">
          <div class="themes-list">
            ${themeBlocks}
            <div class="all-works-block" onclick="App.navigate('allWorks',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}'})">
              <span class="all-works-text">全 部 作 品</span>
              <span class="all-works-count">共 ${totalWorks} 件 →</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     板块/主题作品列表页
     ============================================================ */
  function renderTheme(zoneId, mediumId, exhibitionId, themeId) {
    const zone = DataUtil.getZone(zoneId);
    const medium = DataUtil.getMedium(zoneId, mediumId);
    const ex = DataUtil.getExhibition(zoneId, mediumId, exhibitionId);
    const theme = DataUtil.getTheme(zoneId, mediumId, exhibitionId, themeId);
    if (!theme) { navigate('home'); return; }

    document.documentElement.style.setProperty('--accent', zone.accent);
    document.documentElement.style.setProperty('--accent-glow', zone.glow);

    let worksHtml = '';
    theme.works.forEach(w => {
      worksHtml += `
        <div class="work-card" onclick="App.navigate('work',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}',themeId:'${theme.id}',workId:'${w.id}'})">
          <div class="work-card-thumb">
            <div class="work-card-thumb-inner">
              ${makePlaceholder(ex.coverHue, w.id, '', w.image)}
            </div>
          </div>
          <div class="work-card-info">
            <div class="work-card-title">${w.title}</div>
            <div class="work-card-author">${w.author} · ${w.year}</div>
          </div>
        </div>
      `;
    });

    mainEl.innerHTML = `
      <div class="page active" style="background:${zone.bgGradient};min-height:calc(100vh - 64px);">
        <div class="page-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" onclick="App.navigate('home')">首页</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('zone',{zoneId:'${zone.id}'})">${zone.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('medium',{zoneId:'${zone.id}',mediumId:'${medium.id}'})">${medium.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('exhibition',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}'})">${ex.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span>${theme.name}</span>
          </div>
          <button class="back-btn" onclick="App.navigate('exhibition',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回画展
          </button>
          <h1 class="section-title" style="font-size:36px;">${theme.name}</h1>
          <div class="section-subtitle">${ex.name} · ${theme.works.length} 件作品</div>
          <p class="section-desc">${theme.description}</p>
        </div>
        <div class="works-grid-section">
          <div class="works-grid">${worksHtml}</div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     全部作品页
     ============================================================ */
  function renderAllWorks(zoneId, mediumId, exhibitionId) {
    const zone = DataUtil.getZone(zoneId);
    const medium = DataUtil.getMedium(zoneId, mediumId);
    const ex = DataUtil.getExhibition(zoneId, mediumId, exhibitionId);
    if (!ex) { navigate('home'); return; }

    document.documentElement.style.setProperty('--accent', zone.accent);
    document.documentElement.style.setProperty('--accent-glow', zone.glow);

    const allWorks = DataUtil.getAllExhibitionWorks(ex);

    let worksHtml = '';
    allWorks.forEach(w => {
      worksHtml += `
        <div class="work-card" onclick="App.navigate('work',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}',themeId:'${w.themeId}',workId:'${w.id}'})">
          <div class="work-card-thumb">
            <div class="work-card-thumb-inner">
              ${makePlaceholder(ex.coverHue, w.id, '', w.image)}
            </div>
          </div>
          <div class="work-card-info">
            <div class="work-card-title">${w.title}</div>
            <div class="work-card-author">${w.author} · ${w.themeName}</div>
          </div>
        </div>
      `;
    });

    mainEl.innerHTML = `
      <div class="page active" style="background:${zone.bgGradient};min-height:calc(100vh - 64px);">
        <div class="page-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" onclick="App.navigate('home')">首页</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('zone',{zoneId:'${zone.id}'})">${zone.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('medium',{zoneId:'${zone.id}',mediumId:'${medium.id}'})">${medium.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-item" onclick="App.navigate('exhibition',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}'})">${ex.name}</span>
            <span class="breadcrumb-sep">/</span>
            <span>全部作品</span>
          </div>
          <button class="back-btn" onclick="App.navigate('exhibition',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            返回画展
          </button>
          <h1 class="section-title" style="font-size:36px;">全部作品</h1>
          <div class="section-subtitle">${ex.name} · 共 ${allWorks.length} 件</div>
        </div>
        <div class="works-grid-section">
          <div class="works-grid">${worksHtml}</div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     单作品视图
     ============================================================ */
  function renderWork(zoneId, mediumId, exhibitionId, themeId, workId) {
    const zone = DataUtil.getZone(zoneId);
    const medium = DataUtil.getMedium(zoneId, mediumId);
    const ex = DataUtil.getExhibition(zoneId, mediumId, exhibitionId);
    const theme = DataUtil.getTheme(zoneId, mediumId, exhibitionId, themeId);
    const work = DataUtil.getWork(zoneId, mediumId, exhibitionId, themeId, workId);
    if (!work) { navigate('home'); return; }

    document.documentElement.style.setProperty('--accent', zone.accent);
    document.documentElement.style.setProperty('--accent-glow', zone.glow);

    // 上下件
    const works = theme.works;
    const idx = works.findIndex(w => w.id === workId);
    const prevWork = idx > 0 ? works[idx - 1] : null;
    const nextWork = idx < works.length - 1 ? works[idx + 1] : null;

    mainEl.innerHTML = `
      <div class="page active work-detail" style="background:${zone.bgGradient};">
        <div class="work-detail-main">
          <div class="work-canvas-wrap" id="workCanvasWrap">
            <div class="work-canvas ${work.image ? 'has-image' : ''}" id="workCanvas">
              <div class="work-canvas-inner">
                ${makePlaceholder(ex.coverHue, '', work.title, work.image)}
                ${work.image ? '' : `<span class="work-canvas-title">${work.title}</span>`}
              </div>
              <canvas class="work-glow-canvas" id="workGlowCanvas"></canvas>
            </div>
          </div>
          <div class="work-info-panel">
            <h1 class="work-info-title">${work.title}</h1>
            <div class="work-info-author">${work.author}</div>
            <div class="work-info-divider"></div>
            <div class="work-info-desc-label">创 作 说 明</div>
            <p class="work-info-desc">${work.desc}</p>
            <div class="work-info-meta">
              <div class="work-info-meta-row">
                <span class="work-info-meta-label">分区</span>
                <span class="work-info-meta-value">${zone.name} · ${zone.subtitle}</span>
              </div>
              <div class="work-info-meta-row">
                <span class="work-info-meta-label">媒介</span>
                <span class="work-info-meta-value">${medium.name}</span>
              </div>
              <div class="work-info-meta-row">
                <span class="work-info-meta-label">画展</span>
                <span class="work-info-meta-value">${ex.name}</span>
              </div>
              <div class="work-info-meta-row">
                <span class="work-info-meta-label">主题</span>
                <span class="work-info-meta-value">${theme.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="work-detail-footer">
          <button class="work-nav-btn" onclick="App.navigate('zone',{zoneId:'${zone.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>
            返回分区
          </button>
          <div class="work-nav-btns">
            <button class="work-nav-btn" ${prevWork ? '' : 'disabled'} onclick="${prevWork ? `App.navigate('work',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}',themeId:'${theme.id}',workId:'${prevWork.id}'})` : ''}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              上一件
            </button>
            <button class="work-nav-btn" ${nextWork ? '' : 'disabled'} onclick="${nextWork ? `App.navigate('work',{zoneId:'${zone.id}',mediumId:'${medium.id}',exhibitionId:'${ex.id}',themeId:'${theme.id}',workId:'${nextWork.id}'})` : ''}">
              下一件
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // 初始化交互效果
    initWorkInteraction();
  }

  /* ============================================================
     单作品交互：光晕粒子拖尾 + 微旋转
     ============================================================ */
  function initWorkInteraction() {
    const canvas = document.getElementById('workGlowCanvas');
    const wrap = document.getElementById('workCanvasWrap');
    const workCanvas = document.getElementById('workCanvas');
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;
    let isPressed = false;
    let mouseX = 0, mouseY = 0;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // 粒子类
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2 - 0.5;
        this.life = 1;
        this.decay = 0.015 + Math.random() * 0.02;
        this.size = 2 + Math.random() * 4;
        this.hue = 38 + Math.random() * 10; // 金色范围
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.02; // 轻微上浮
        this.life -= this.decay;
        this.size *= 0.98;
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 65%, ${this.life * 0.6})`;
        ctx.fill();
        // 光晕
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.life * 0.1})`;
        ctx.fill();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    // 鼠标移动产生粒子
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // 每帧产生2-3个粒子
      for (let i = 0; i < 2; i++) {
        particles.push(new Particle(
          mouseX + (Math.random() - 0.5) * 10,
          mouseY + (Math.random() - 0.5) * 10
        ));
      }
      // 限制粒子数量
      if (particles.length > 150) particles.splice(0, particles.length - 150);

      // 微旋转（悬停时轻微）
      if (!isPressed && workCanvas) {
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotY = ((mouseX - cx) / cx) * 3;
        const rotX = -((mouseY - cy) / cy) * 3;
        workCanvas.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      }
    });

    // 长按拖动微旋转
    wrap.addEventListener('mousedown', (e) => {
      isPressed = true;
      const rect = wrap.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      function onMove(ev) {
        if (!isPressed) return;
        const r = wrap.getBoundingClientRect();
        const dx = (ev.clientX - r.left - startX) * 0.15;
        const dy = (ev.clientY - r.top - startY) * 0.15;
        if (workCanvas) {
          workCanvas.style.transform = `perspective(1000px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
        }
      }
      function onUp() {
        isPressed = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    wrap.addEventListener('mouseleave', () => {
      if (workCanvas) {
        workCanvas.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      }
    });

    // 页面离开时清理
    const oldNavigate = navigate;
    // 用 MutationObserver 检测页面切换
    const observer = new MutationObserver(() => {
      if (!document.getElementById('workGlowCanvas')) {
        if (animId) cancelAnimationFrame(animId);
        observer.disconnect();
      }
    });
    observer.observe(mainEl, { childList: true });
  }

  /* ============================================================
     2D / 3D 切换
     ============================================================ */
  function enter3D() {
    if (window.__threeFailed) {
      document.getElementById('gallery3dError').classList.add('show');
      document.getElementById('gallery3d').classList.add('active');
      return;
    }
    if (!window.__threeLoaded) {
      // 等待加载
      const check = setInterval(() => {
        if (window.__threeLoaded) {
          clearInterval(check);
          doEnter3D();
        } else if (window.__threeFailed) {
          clearInterval(check);
          document.getElementById('gallery3dError').classList.add('show');
          document.getElementById('gallery3d').classList.add('active');
        }
      }, 100);
      setTimeout(() => { clearInterval(check); }, 10000);
      return;
    }
    doEnter3D();
  }

  function doEnter3D() {
    state.scrollY = window.scrollY;
    document.getElementById('gallery3d').classList.add('active');
    document.body.style.overflow = 'hidden';
    Gallery3D.init();
  }

  function exit3D() {
    Gallery3D.destroy();
    document.getElementById('gallery3d').classList.remove('active');
    document.body.style.overflow = '';
    window.scrollTo(0, state.scrollY);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderHome();
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    navigate,
    enter3D,
    exit3D,
    render
  };
})();
