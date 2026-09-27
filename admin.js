/**
 * 俯仰之间 —— 后台管理系统
 * 登录 / 作品管理 / 画展管理 / 主题标签 / 数据统计
 */
const Admin = (function () {
  /* ---------- 状态 ---------- */
  const state = {
    currentPage: 'dashboard',
    selectedWorks: new Set(),
    editingWorkId: null,
    editingExhibitionId: null,
    editingThemeId: null,
    uploadedImage: null,
    uploadedCover: null,
    confirmCallback: null
  };

  /* ============================================================
     初始化 & 路由守卫
     ============================================================ */
  function init() {
    if (!Store.isLoggedIn()) {
      showLogin();
      return;
    }
    showAdmin();
    navigate('dashboard');
  }

  function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
  }

  function showAdmin() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    const user = Store.getCurrentUser();
    if (user) {
      document.getElementById('userName').textContent = user.username;
      document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
  }

  /* ============================================================
     登录
     ============================================================ */
  function doLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!username || !password) {
      errorEl.textContent = '请输入账号和密码';
      return false;
    }

    if (Store.login(username, password)) {
      errorEl.textContent = '';
      showAdmin();
      navigate('dashboard');
      toast('登录成功');
    } else {
      errorEl.textContent = '账号或密码错误';
    }
    return false;
  }

  function logout() {
    Store.logout();
    showLogin();
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    toast('已退出登录');
  }

  /* ============================================================
     页面导航
     ============================================================ */
  function navigate(page) {
    if (!Store.isLoggedIn()) {
      showLogin();
      return;
    }
    state.currentPage = page;
    document.querySelectorAll('.admin-page').forEach(p => p.style.display = 'none');
    document.getElementById('page-' + page).style.display = 'block';
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    if (page === 'dashboard') renderDashboard();
    if (page === 'works') renderWorks();
    if (page === 'exhibitions') renderExhibitions();
    if (page === 'themes') renderThemes();
  }

  /* ============================================================
     数据统计
     ============================================================ */
  function renderDashboard() {
    const stats = Store.getStats();
    const data = Store.getData();

    // 统计卡片
    let cardsHtml = `
      <div class="admin-stat-card">
        <div class="admin-stat-num">${stats.total}</div>
        <div class="admin-stat-label">作品总数</div>
        <div class="admin-stat-sub">覆盖 ${data.zones.length} 个分区</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-num">${stats.last7Days}</div>
        <div class="admin-stat-label">近7天新增</div>
        <div class="admin-stat-sub">最近上传作品</div>
      </div>
    `;
    data.zones.forEach(zone => {
      const count = stats.byZone[zone.id] ? stats.byZone[zone.id].count : 0;
      cardsHtml += `
        <div class="admin-stat-card" style="--accent:${zone.accent}">
          <div class="admin-stat-num" style="color:${zone.accent}">${count}</div>
          <div class="admin-stat-label">${zone.name}</div>
          <div class="admin-stat-sub">${zone.subtitle}</div>
        </div>
      `;
    });
    document.getElementById('statsGrid').innerHTML = cardsHtml;

    // 最近作品
    let recentHtml = '';
    if (stats.recent.length === 0) {
      recentHtml = '<div class="admin-empty">暂无作品</div>';
    } else {
      stats.recent.forEach(w => {
        const time = w.createdAt ? formatDate(w.createdAt) : '-';
        const thumb = w.image
          ? `<img src="${w.image}" alt="${w.title}">`
          : `<span style="font-size:10px;color:var(--text-muted)">${w.id}</span>`;
        recentHtml += `
          <div class="admin-recent-item">
            <div class="admin-recent-thumb">${thumb}</div>
            <div class="admin-recent-info">
              <div class="admin-recent-title">${w.title}</div>
              <div class="admin-recent-meta">${w.author} · ${w.zoneName} / ${w.mediumName} / ${w.exhibitionName} / ${w.themeName}</div>
            </div>
            <div class="admin-recent-time">${time}</div>
          </div>
        `;
      });
    }
    document.getElementById('recentList').innerHTML = recentHtml;
  }

  /* ============================================================
     作品管理
     ============================================================ */
  function renderWorks() {
    populateFilterSelects();
    filterWorks();
  }

  function populateFilterSelects() {
    const data = Store.getData();
    const zoneSel = document.getElementById('filterZone');
    const curZone = zoneSel.value;
    zoneSel.innerHTML = '<option value="">全部分区</option>' +
      data.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
    zoneSel.value = curZone;
    updateFilterMedium();
    updateFilterExhibition();
    updateFilterTheme();
  }

  function updateFilterMedium() {
    const zoneId = document.getElementById('filterZone').value;
    const sel = document.getElementById('filterMedium');
    const cur = sel.value;
    if (!zoneId) {
      sel.innerHTML = '<option value="">全部媒介</option>';
      return;
    }
    const zone = DataUtil.getZone(zoneId);
    sel.innerHTML = '<option value="">全部媒介</option>' +
      zone.media.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    sel.value = cur;
  }

  function updateFilterExhibition() {
    const zoneId = document.getElementById('filterZone').value;
    const mediumId = document.getElementById('filterMedium').value;
    const sel = document.getElementById('filterExhibition');
    const cur = sel.value;
    if (!zoneId || !mediumId) {
      sel.innerHTML = '<option value="">全部画展</option>';
      return;
    }
    const medium = DataUtil.getMedium(zoneId, mediumId);
    sel.innerHTML = '<option value="">全部画展</option>' +
      medium.exhibitions.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    sel.value = cur;
  }

  function updateFilterTheme() {
    const zoneId = document.getElementById('filterZone').value;
    const mediumId = document.getElementById('filterMedium').value;
    const exId = document.getElementById('filterExhibition').value;
    const sel = document.getElementById('filterTheme');
    const cur = sel.value;
    if (!zoneId || !mediumId || !exId) {
      sel.innerHTML = '<option value="">全部主题</option>';
      return;
    }
    const ex = DataUtil.getExhibition(zoneId, mediumId, exId);
    sel.innerHTML = '<option value="">全部主题</option>' +
      ex.themes.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    sel.value = cur;
  }

  function filterWorks() {
    updateFilterMedium();
    updateFilterExhibition();
    updateFilterTheme();

    const zoneId = document.getElementById('filterZone').value;
    const mediumId = document.getElementById('filterMedium').value;
    const exId = document.getElementById('filterExhibition').value;
    const themeId = document.getElementById('filterTheme').value;
    const search = document.getElementById('searchInput').value.trim().toLowerCase();

    let works = Store.getAllWorks();
    if (zoneId) works = works.filter(w => w.zoneId === zoneId);
    if (mediumId) works = works.filter(w => w.mediumId === mediumId);
    if (exId) works = works.filter(w => w.exhibitionId === exId);
    if (themeId) works = works.filter(w => w.themeId === themeId);
    if (search) {
      works = works.filter(w =>
        w.title.toLowerCase().includes(search) ||
        w.author.toLowerCase().includes(search)
      );
    }

    renderWorksTable(works);
  }

  function renderWorksTable(works) {
    const tbody = document.getElementById('worksTableBody');
    state.selectedWorks.clear();
    updateBatchBar();

    if (works.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="admin-empty">没有找到符合条件的作品</td></tr>';
      return;
    }

    tbody.innerHTML = works.map(w => {
      const time = w.createdAt ? formatDate(w.createdAt) : '-';
      return `
        <tr>
          <td><input type="checkbox" class="work-checkbox" data-id="${w.id}" onchange="Admin.onWorkCheck(this)"></td>
          <td class="work-id">${w.id}</td>
          <td class="work-title-cell">${w.title}</td>
          <td>${w.author}</td>
          <td>${w.zoneName}</td>
          <td>${w.mediumName}</td>
          <td>${w.exhibitionName}</td>
          <td>${w.themeName}</td>
          <td>${time}</td>
          <td>
            <div class="admin-table-actions">
              <button class="admin-btn admin-btn-outline admin-btn-sm" onclick="Admin.editWork('${w.id}')">编辑</button>
              <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="Admin.deleteWork('${w.id}')">删除</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function onWorkCheck(checkbox) {
    if (checkbox.checked) {
      state.selectedWorks.add(checkbox.dataset.id);
    } else {
      state.selectedWorks.delete(checkbox.dataset.id);
    }
    updateBatchBar();
  }

  function toggleSelectAll(checkbox) {
    document.querySelectorAll('.work-checkbox').forEach(cb => {
      cb.checked = checkbox.checked;
      if (checkbox.checked) state.selectedWorks.add(cb.dataset.id);
      else state.selectedWorks.delete(cb.dataset.id);
    });
    updateBatchBar();
  }

  function updateBatchBar() {
    const count = state.selectedWorks.size;
    document.getElementById('selectedCount').textContent = `已选 ${count} 项`;
    document.getElementById('batchDeleteBtn').disabled = count === 0;
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      const total = document.querySelectorAll('.work-checkbox').length;
      selectAll.checked = total > 0 && count === total;
    }
  }

  function batchDelete() {
    const count = state.selectedWorks.size;
    if (count === 0) return;
    showConfirm(`确认删除选中的 ${count} 件作品？此操作不可恢复，前台2D和3D展厅将同步移除。`, () => {
      const ids = Array.from(state.selectedWorks);
      const deleted = Store.deleteWorks(ids);
      toast(`已删除 ${deleted} 件作品`);
      filterWorks();
    });
  }

  function deleteWork(workId) {
    const result = Store.findWork(workId);
    const title = result ? result.work.title : '该作品';
    showConfirm(`确认删除作品「${title}」？此操作不可恢复。`, () => {
      Store.deleteWork(workId);
      toast('作品已删除');
      filterWorks();
    });
  }

  /* ---------- 作品表单 ---------- */
  function showWorkForm() {
    state.editingWorkId = null;
    state.uploadedImage = null;
    document.getElementById('workFormTitle').textContent = '新增作品';
    document.getElementById('workForm').reset();
    document.getElementById('workId').value = '';
    resetUploadPreview();
    populateWorkFormSelects();
    openModal('workFormModal');
  }

  function editWork(workId) {
    const result = Store.findWork(workId);
    if (!result) return;
    const w = result.work;
    state.editingWorkId = workId;
    state.uploadedImage = w.image || null;

    document.getElementById('workFormTitle').textContent = '编辑作品';
    document.getElementById('workId').value = workId;
    document.getElementById('workTitle').value = w.title;
    document.getElementById('workAuthor').value = w.author;
    document.getElementById('workDesc').value = w.desc || '';
    updateDescCount();

    populateWorkFormSelects();
    document.getElementById('workZone').value = result.zone.id;
    onWorkZoneChange();
    document.getElementById('workMedium').value = result.medium.id;
    onWorkMediumChange();
    document.getElementById('workExhibition').value = result.exhibition.id;
    onWorkExhibitionChange();
    document.getElementById('workTheme').value = result.theme.id;

    if (w.image) {
      showUploadPreview(w.image, '保留原图');
    } else {
      resetUploadPreview();
    }
    openModal('workFormModal');
  }

  function populateWorkFormSelects() {
    const data = Store.getData();
    document.getElementById('workZone').innerHTML =
      '<option value="">请选择分区</option>' +
      data.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
  }

  function onWorkZoneChange() {
    const zoneId = document.getElementById('workZone').value;
    const sel = document.getElementById('workMedium');
    if (!zoneId) {
      sel.innerHTML = '<option value="">请先选择分区</option>';
      return;
    }
    const zone = DataUtil.getZone(zoneId);
    sel.innerHTML = '<option value="">请选择媒介</option>' +
      zone.media.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    document.getElementById('workExhibition').innerHTML = '<option value="">请先选择媒介</option>';
    document.getElementById('workTheme').innerHTML = '<option value="">请先选择画展</option>';
  }

  function onWorkMediumChange() {
    const zoneId = document.getElementById('workZone').value;
    const mediumId = document.getElementById('workMedium').value;
    const sel = document.getElementById('workExhibition');
    if (!zoneId || !mediumId) {
      sel.innerHTML = '<option value="">请先选择媒介</option>';
      return;
    }
    const medium = DataUtil.getMedium(zoneId, mediumId);
    sel.innerHTML = '<option value="">请选择画展</option>' +
      medium.exhibitions.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    document.getElementById('workTheme').innerHTML = '<option value="">请先选择画展</option>';
  }

  function onWorkExhibitionChange() {
    const zoneId = document.getElementById('workZone').value;
    const mediumId = document.getElementById('workMedium').value;
    const exId = document.getElementById('workExhibition').value;
    const sel = document.getElementById('workTheme');
    if (!zoneId || !mediumId || !exId) {
      sel.innerHTML = '<option value="">请先选择画展</option>';
      return;
    }
    const ex = DataUtil.getExhibition(zoneId, mediumId, exId);
    sel.innerHTML = '<option value="">请选择主题</option>' +
      ex.themes.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }

  function saveWork(e) {
    e.preventDefault();
    const zoneId = document.getElementById('workZone').value;
    const mediumId = document.getElementById('workMedium').value;
    const exId = document.getElementById('workExhibition').value;
    const themeId = document.getElementById('workTheme').value;
    const title = document.getElementById('workTitle').value.trim();
    const author = document.getElementById('workAuthor').value.trim();
    const desc = document.getElementById('workDesc').value.trim();

    if (!zoneId || !mediumId || !exId || !themeId) {
      toast('请选择完整的分类层级', 'error');
      return false;
    }
    if (!title) { toast('请输入作品名称', 'error'); return false; }
    if (!author) { toast('请输入作者姓名', 'error'); return false; }

    const workData = {
      title, author, desc,
      zoneId, mediumId, exhibitionId: exId, themeId,
      image: state.uploadedImage
    };

    if (state.editingWorkId) {
      Store.updateWork(state.editingWorkId, workData);
      toast('作品已更新');
    } else {
      Store.addWork(zoneId, mediumId, exId, themeId, workData);
      toast('作品已新增');
    }

    closeModal('workFormModal');
    filterWorks();
    return false;
  }

  /* ---------- 图片上传压缩 ---------- */
  function onImageSelect(e) {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
    e.target.value = '';
  }

  function onDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
  }

  function onDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
  }

  function onDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }

  function handleImageFile(file) {
    if (!/image\/(jpeg|png)/.test(file.type)) {
      toast('仅支持 JPG / PNG 格式', 'error');
      return;
    }
    Store.compressImage(file, function (result) {
      if (result.error) {
        toast(result.error, 'error');
        return;
      }
      state.uploadedImage = result.dataUrl;
      const info = `已压缩：${Store.formatSize(result.originalSize)} → ${Store.formatSize(result.compressedSize)}（${result.width}×${result.height}）`;
      showUploadPreview(result.dataUrl, info);
    });
  }

  function showUploadPreview(dataUrl, info) {
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'block';
    document.getElementById('previewImg').src = dataUrl;
    document.getElementById('uploadInfo').textContent = info;
  }

  function resetUploadPreview() {
    state.uploadedImage = null;
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
  }

  function removeImage() {
    state.uploadedImage = null;
    resetUploadPreview();
  }

  function updateDescCount() {
    const len = document.getElementById('workDesc').value.length;
    document.getElementById('descCount').textContent = len;
  }

  /* ============================================================
     画展管理
     ============================================================ */
  function renderExhibitions() {
    const data = Store.getData();
    let html = '';
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        if (medium.exhibitions.length === 0) return;
        const totalWorks = DataUtil.countMediumWorks(medium);
        html += `
          <div class="admin-group-section">
            <div class="admin-group-header">
              <span class="admin-group-zone">${zone.name}</span>
              <span class="admin-group-medium">${medium.name}</span>
              <span class="admin-group-count">${medium.exhibitions.length} 个画展 · ${totalWorks} 件作品</span>
            </div>
            <div class="admin-group-cards">
        `;
        medium.exhibitions.forEach(ex => {
          const exWorks = DataUtil.countExhibitionWorks(ex);
          const cover = ex.coverImage
            ? `<div class="admin-group-card-cover"><img src="${ex.coverImage}" alt="${ex.name}"></div>`
            : '';
          html += `
            <div class="admin-group-card">
              ${cover}
              <div class="admin-group-card-header">
                <div class="admin-group-card-title">${ex.name}</div>
              </div>
              <div class="admin-group-card-desc">${ex.description || '暂无说明'}</div>
              <div class="admin-group-card-meta">
                <span><strong>${ex.themes.length}</strong> 主题</span>
                <span><strong>${exWorks}</strong> 作品</span>
              </div>
              <div class="admin-group-card-actions">
                <button class="admin-btn admin-btn-outline admin-btn-sm" onclick="Admin.editExhibition('${ex.id}')">编辑</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="Admin.deleteExhibition('${ex.id}')">删除</button>
              </div>
            </div>
          `;
        });
        html += '</div></div>';
      });
    });
    if (!html) html = '<div class="admin-empty">暂无画展</div>';
    document.getElementById('exhibitionsList').innerHTML = html;
  }

  function showExhibitionForm() {
    state.editingExhibitionId = null;
    state.uploadedCover = null;
    document.getElementById('exhibitionFormTitle').textContent = '新增画展';
    document.getElementById('exhibitionForm').reset();
    document.getElementById('exhibitionId').value = '';
    resetExCoverPreview();
    const data = Store.getData();
    document.getElementById('exhibitionZone').innerHTML =
      '<option value="">请选择分区</option>' +
      data.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
    document.getElementById('exhibitionMedium').innerHTML = '<option value="">请先选择分区</option>';
    openModal('exhibitionFormModal');
  }

  function editExhibition(exId) {
    const result = Store.getExhibition(exId);
    if (!result) return;
    const ex = result.exhibition;
    state.editingExhibitionId = exId;
    state.uploadedCover = ex.coverImage || null;

    document.getElementById('exhibitionFormTitle').textContent = '编辑画展';
    document.getElementById('exhibitionId').value = exId;
    document.getElementById('exhibitionName').value = ex.name;
    document.getElementById('exhibitionDesc').value = ex.description || '';

    const data = Store.getData();
    document.getElementById('exhibitionZone').innerHTML =
      '<option value="">请选择分区</option>' +
      data.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
    document.getElementById('exhibitionZone').value = result.zone.id;
    onExhibitionZoneChange();
    document.getElementById('exhibitionMedium').value = result.medium.id;

    if (ex.coverImage) {
      document.getElementById('exCoverPlaceholder').style.display = 'none';
      document.getElementById('exCoverPreview').style.display = 'block';
      document.getElementById('exCoverImg').src = ex.coverImage;
    } else {
      resetExCoverPreview();
    }
    openModal('exhibitionFormModal');
  }

  function onExhibitionZoneChange() {
    const zoneId = document.getElementById('exhibitionZone').value;
    const sel = document.getElementById('exhibitionMedium');
    if (!zoneId) {
      sel.innerHTML = '<option value="">请先选择分区</option>';
      return;
    }
    const zone = DataUtil.getZone(zoneId);
    sel.innerHTML = '<option value="">请选择媒介</option>' +
      zone.media.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }

  function onExCoverSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!/image\/(jpeg|png)/.test(file.type)) {
      toast('仅支持 JPG / PNG 格式', 'error');
      return;
    }
    Store.compressImage(file, function (result) {
      if (result.error) { toast(result.error, 'error'); return; }
      state.uploadedCover = result.dataUrl;
      document.getElementById('exCoverPlaceholder').style.display = 'none';
      document.getElementById('exCoverPreview').style.display = 'block';
      document.getElementById('exCoverImg').src = result.dataUrl;
    });
    e.target.value = '';
  }

  function resetExCoverPreview() {
    state.uploadedCover = null;
    document.getElementById('exCoverPlaceholder').style.display = 'block';
    document.getElementById('exCoverPreview').style.display = 'none';
  }

  function saveExhibition(e) {
    e.preventDefault();
    const zoneId = document.getElementById('exhibitionZone').value;
    const mediumId = document.getElementById('exhibitionMedium').value;
    const name = document.getElementById('exhibitionName').value.trim();
    const desc = document.getElementById('exhibitionDesc').value.trim();

    if (!zoneId || !mediumId) { toast('请选择分区和媒介', 'error'); return false; }
    if (!name) { toast('请输入画展名称', 'error'); return false; }

    const exData = {
      name, description: desc,
      zoneId, mediumId,
      coverImage: state.uploadedCover
    };

    if (state.editingExhibitionId) {
      Store.updateExhibition(state.editingExhibitionId, exData);
      toast('画展已更新');
    } else {
      Store.addExhibition(zoneId, mediumId, exData);
      toast('画展已新增');
    }
    closeModal('exhibitionFormModal');
    renderExhibitions();
    return false;
  }

  function deleteExhibition(exId) {
    const result = Store.getExhibition(exId);
    if (!result) return;
    const ex = result.exhibition;
    const workCount = DataUtil.countExhibitionWorks(ex);

    if (workCount > 0) {
      // 列出其他画展供选择
      const data = Store.getData();
      const otherExhibitions = [];
      data.zones.forEach(z => z.media.forEach(m => m.exhibitions.forEach(e => {
        if (e.id !== exId) otherExhibitions.push({ id: e.id, name: `${z.name}/${m.name}/${e.name}` });
      })));

      let optionsHtml = otherExhibitions.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
      const msg = `画展「${ex.name}」下有 ${workCount} 件作品。删除后作品将移动到：
        <select id="moveToSelect" style="width:100%;margin-top:10px;padding:8px;background:var(--bg-base);border:1px solid var(--border-subtle);color:var(--text-moon);">
          <option value="">变为"未分类"</option>
          ${optionsHtml}
        </select>`;

      showConfirmHtml(msg, () => {
        const moveTo = document.getElementById('moveToSelect') ? document.getElementById('moveToSelect').value : '';
        Store.deleteExhibition(exId, moveTo || null);
        toast('画展已删除');
        renderExhibitions();
      });
    } else {
      showConfirm(`确认删除画展「${ex.name}」？`, () => {
        Store.deleteExhibition(exId);
        toast('画展已删除');
        renderExhibitions();
      });
    }
  }

  /* ============================================================
     主题标签管理
     ============================================================ */
  function renderThemes() {
    const data = Store.getData();
    let html = '';
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          if (ex.themes.length === 0) return;
          html += `
            <div class="admin-group-section">
              <div class="admin-group-header">
                <span class="admin-group-zone">${zone.name}</span>
                <span class="admin-group-medium">${medium.name} / ${ex.name}</span>
                <span class="admin-group-count">${ex.themes.length} 个主题</span>
              </div>
              <div class="admin-group-cards" style="grid-template-columns:1fr;">
                <div class="admin-group-card">
                  <div class="admin-theme-tags">
          `;
          ex.themes.forEach(theme => {
            html += `
              <div class="admin-theme-tag" onclick="Admin.editTheme('${theme.id}','${zone.id}','${medium.id}','${ex.id}')">
                ${theme.name} <span class="tag-count">${theme.works.length}</span>
              </div>
            `;
          });
          html += `
                    <button class="admin-add-theme-btn" onclick="Admin.showThemeForm('${zone.id}','${medium.id}','${ex.id}')">+ 新增主题</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      });
    });
    if (!html) html = '<div class="admin-empty">暂无主题标签</div>';
    document.getElementById('themesList').innerHTML = html;
  }

  function showThemeForm(zoneId, mediumId, exId) {
    state.editingThemeId = null;
    document.getElementById('themeFormTitle').textContent = '新增主题';
    document.getElementById('themeForm').reset();
    document.getElementById('themeId').value = '';
    document.getElementById('themeZoneId').value = zoneId;
    document.getElementById('themeMediumId').value = mediumId;
    document.getElementById('themeExhibitionId').value = exId;
    openModal('themeFormModal');
  }

  function editTheme(themeId, zoneId, mediumId, exId) {
    const theme = DataUtil.getTheme(zoneId, mediumId, exId, themeId);
    if (!theme) return;
    state.editingThemeId = themeId;
    document.getElementById('themeFormTitle').textContent = '编辑主题';
    document.getElementById('themeId').value = themeId;
    document.getElementById('themeZoneId').value = zoneId;
    document.getElementById('themeMediumId').value = mediumId;
    document.getElementById('themeExhibitionId').value = exId;
    document.getElementById('themeName').value = theme.name;
    document.getElementById('themeDesc').value = theme.description || '';
    openModal('themeFormModal');
  }

  function saveTheme(e) {
    e.preventDefault();
    const zoneId = document.getElementById('themeZoneId').value;
    const mediumId = document.getElementById('themeMediumId').value;
    const exId = document.getElementById('themeExhibitionId').value;
    const name = document.getElementById('themeName').value.trim();
    const desc = document.getElementById('themeDesc').value.trim();

    if (!name) { toast('请输入主题名称', 'error'); return false; }

    if (state.editingThemeId) {
      Store.updateTheme(state.editingThemeId, { name, description: desc });
      toast('主题已更新');
    } else {
      Store.addTheme(zoneId, mediumId, exId, { name, description: desc });
      toast('主题已新增');
    }
    closeModal('themeFormModal');
    renderThemes();
    return false;
  }

  /* ============================================================
     弹窗 & 确认 & Toast
     ============================================================ */
  function openModal(id) {
    document.getElementById(id).classList.add('show');
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('show');
  }

  function showConfirm(text, callback) {
    document.getElementById('confirmText').textContent = text;
    document.getElementById('confirmModal').classList.add('show');
    state.confirmCallback = callback;
    document.getElementById('confirmOkBtn').onclick = function () {
      closeConfirm();
      if (callback) callback();
    };
  }

  function showConfirmHtml(html, callback) {
    document.getElementById('confirmText').innerHTML = html;
    document.getElementById('confirmModal').classList.add('show');
    state.confirmCallback = callback;
    document.getElementById('confirmOkBtn').onclick = function () {
      closeConfirm();
      if (callback) callback();
    };
  }

  function closeConfirm() {
    document.getElementById('confirmModal').classList.remove('show');
    state.confirmCallback = null;
  }

  function toast(msg, type) {
    const el = document.getElementById('adminToast');
    el.textContent = msg;
    el.className = 'admin-toast show' + (type === 'error' ? ' error' : '');
    setTimeout(() => { el.classList.remove('show'); }, 2500);
  }

  /* ============================================================
     工具函数
     ============================================================ */
  function formatDate(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 点击弹窗外部关闭
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('admin-modal')) {
      e.target.classList.remove('show');
    }
    if (e.target.classList.contains('admin-confirm-modal')) {
      closeConfirm();
    }
  });

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    doLogin,
    logout,
    navigate,
    // 作品
    renderWorks,
    filterWorks,
    onWorkCheck,
    toggleSelectAll,
    batchDelete,
    deleteWork,
    showWorkForm,
    editWork,
    saveWork,
    onWorkZoneChange,
    onWorkMediumChange,
    onWorkExhibitionChange,
    onImageSelect,
    onDragOver,
    onDragLeave,
    onDrop,
    removeImage,
    updateDescCount,
    // 画展
    renderExhibitions,
    showExhibitionForm,
    editExhibition,
    saveExhibition,
    deleteExhibition,
    onExhibitionZoneChange,
    onExCoverSelect,
    // 主题
    renderThemes,
    showThemeForm,
    editTheme,
    saveTheme,
    // 通用
    openModal,
    closeModal,
    showConfirm,
    closeConfirm
  };
})();
