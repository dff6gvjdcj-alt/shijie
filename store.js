/**
 * 俯仰之间 —— 数据存储层
 * localStorage 模拟数据库，前后台共用
 * 提供 CRUD 操作 + 数据变更事件
 */
const Store = (function () {
  const STORAGE_KEY = 'fuyang_exhibition_v2';
  const SESSION_KEY = 'fuyang_admin_session';
  const listeners = [];

  /* ---------- 管理员账号 ---------- */
  const ADMINS = [
    { username: 'admin', password: 'admin123' },
    { username: 'editor', password: 'editor123' }
  ];

  /* ---------- 初始化 ---------- */
  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      resetToDefault();
    }
  }

  function resetToDefault() {
    if (typeof window.EXHIBITION_DATA === 'undefined') {
      console.error('Store: 默认数据未加载，请先引入 data.js');
      return;
    }
    const data = JSON.parse(JSON.stringify(window.EXHIBITION_DATA));
    // 给所有作品添加时间字段
    const now = Date.now();
    let dayOffset = 0;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          ex.themes.forEach(theme => {
            theme.works.forEach(work => {
              work.createdAt = now - dayOffset * 86400000 - Math.random() * 3600000;
              work.updatedAt = work.createdAt;
              dayOffset = (dayOffset + 1) % 30;
            });
          });
        });
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notify();
  }

  /* ---------- 基础读写 ---------- */
  function getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      console.error('Store: 数据解析失败', e);
      return null;
    }
  }

  function setData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notify();
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }

  function notify() {
    const data = getData();
    listeners.forEach(fn => {
      try { fn(data); } catch (e) { console.error(e); }
    });
  }

  /* ---------- 登录 ---------- */
  function login(username, password) {
    const admin = ADMINS.find(a => a.username === username && a.password === password);
    if (admin) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        username: admin.username,
        loginAt: Date.now()
      }));
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return !!sessionStorage.getItem(SESSION_KEY);
  }

  function getCurrentUser() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  /* ---------- ID 生成 ---------- */
  function genId(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  }

  /* ============================================================
     作品 CRUD
     ============================================================ */
  function addWork(zoneId, mediumId, exhibitionId, themeId, workData) {
    const data = getData();
    const zone = data.zones.find(z => z.id === zoneId);
    const medium = zone.media.find(m => m.id === mediumId);
    const ex = medium.exhibitions.find(e => e.id === exhibitionId);
    const theme = ex.themes.find(t => t.id === themeId);

    const work = {
      id: workData.id || genId('W'),
      title: workData.title,
      author: workData.author,
      year: workData.year || new Date().getFullYear().toString(),
      desc: workData.desc || '',
      image: workData.image || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    theme.works.push(work);
    setData(data);
    return work;
  }

  function updateWork(workId, updates) {
    const data = getData();
    let found = null;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          ex.themes.forEach(theme => {
            const idx = theme.works.findIndex(w => w.id === workId);
            if (idx > -1) {
              found = { zone, medium, ex, theme, work: theme.works[idx], idx };
            }
          });
        });
      });
    });
    if (!found) return null;

    // 如果分区/媒介/画展/主题变了，需要移动作品
    if (updates.zoneId && updates.zoneId !== found.zone.id ||
        updates.mediumId && updates.mediumId !== found.medium.id ||
        updates.exhibitionId && updates.exhibitionId !== found.ex.id ||
        updates.themeId && updates.themeId !== found.theme.id) {
      // 从原位置删除
      found.theme.works.splice(found.idx, 1);
      // 找到新位置
      const newZone = data.zones.find(z => z.id === (updates.zoneId || found.zone.id));
      const newMedium = newZone.media.find(m => m.id === (updates.mediumId || found.medium.id));
      const newEx = newMedium.exhibitions.find(e => e.id === (updates.exhibitionId || found.ex.id));
      const newTheme = newEx.themes.find(t => t.id === (updates.themeId || found.theme.id));
      const updatedWork = {
        ...found.work,
        title: updates.title !== undefined ? updates.title : found.work.title,
        author: updates.author !== undefined ? updates.author : found.work.author,
        year: updates.year !== undefined ? updates.year : found.work.year,
        desc: updates.desc !== undefined ? updates.desc : found.work.desc,
        image: updates.image !== undefined ? updates.image : found.work.image,
        updatedAt: Date.now()
      };
      newTheme.works.push(updatedWork);
      setData(data);
      return updatedWork;
    }

    // 原地更新
    Object.assign(found.work, {
      title: updates.title !== undefined ? updates.title : found.work.title,
      author: updates.author !== undefined ? updates.author : found.work.author,
      year: updates.year !== undefined ? updates.year : found.work.year,
      desc: updates.desc !== undefined ? updates.desc : found.work.desc,
      image: updates.image !== undefined ? updates.image : found.work.image,
      updatedAt: Date.now()
    });
    setData(data);
    return found.work;
  }

  function deleteWork(workId) {
    const data = getData();
    let deleted = false;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          ex.themes.forEach(theme => {
            const idx = theme.works.findIndex(w => w.id === workId);
            if (idx > -1) {
              theme.works.splice(idx, 1);
              deleted = true;
            }
          });
        });
      });
    });
    if (deleted) setData(data);
    return deleted;
  }

  function deleteWorks(workIds) {
    const data = getData();
    let count = 0;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          ex.themes.forEach(theme => {
            const before = theme.works.length;
            theme.works = theme.works.filter(w => !workIds.includes(w.id));
            count += before - theme.works.length;
          });
        });
      });
    });
    if (count > 0) setData(data);
    return count;
  }

  function findWork(workId) {
    const data = getData();
    for (const zone of data.zones) {
      for (const medium of zone.media) {
        for (const ex of medium.exhibitions) {
          for (const theme of ex.themes) {
            const work = theme.works.find(w => w.id === workId);
            if (work) {
              return { zone, medium, exhibition: ex, theme, work };
            }
          }
        }
      }
    }
    return null;
  }

  function getAllWorks() {
    const data = getData();
    const works = [];
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          ex.themes.forEach(theme => {
            theme.works.forEach(work => {
              works.push({
                ...work,
                zoneId: zone.id,
                zoneName: zone.name,
                mediumId: medium.id,
                mediumName: medium.name,
                exhibitionId: ex.id,
                exhibitionName: ex.name,
                themeId: theme.id,
                themeName: theme.name
              });
            });
          });
        });
      });
    });
    return works;
  }

  /* ============================================================
     画展 CRUD
     ============================================================ */
  function addExhibition(zoneId, mediumId, exData) {
    const data = getData();
    const zone = data.zones.find(z => z.id === zoneId);
    const medium = zone.media.find(m => m.id === mediumId);
    const ex = {
      id: exData.id || genId('EX'),
      name: exData.name,
      coverHue: exData.coverHue || 210,
      description: exData.description || '',
      coverImage: exData.coverImage || null,
      themes: exData.themes || []
    };
    medium.exhibitions.push(ex);
    setData(data);
    return ex;
  }

  function updateExhibition(exhibitionId, updates) {
    const data = getData();
    let found = null;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        const idx = medium.exhibitions.findIndex(e => e.id === exhibitionId);
        if (idx > -1) {
          found = { zone, medium, ex: medium.exhibitions[idx], idx };
        }
      });
    });
    if (!found) return null;

    // 如果分区/媒介变了，移动画展
    if (updates.zoneId && updates.zoneId !== found.zone.id ||
        updates.mediumId && updates.mediumId !== found.medium.id) {
      found.medium.exhibitions.splice(found.idx, 1);
      const newZone = data.zones.find(z => z.id === (updates.zoneId || found.zone.id));
      const newMedium = newZone.media.find(m => m.id === (updates.mediumId || found.medium.id));
      const updated = {
        ...found.ex,
        name: updates.name !== undefined ? updates.name : found.ex.name,
        description: updates.description !== undefined ? updates.description : found.ex.description,
        coverImage: updates.coverImage !== undefined ? updates.coverImage : found.ex.coverImage,
        coverHue: updates.coverHue !== undefined ? updates.coverHue : found.ex.coverHue
      };
      newMedium.exhibitions.push(updated);
      setData(data);
      return updated;
    }

    Object.assign(found.ex, {
      name: updates.name !== undefined ? updates.name : found.ex.name,
      description: updates.description !== undefined ? updates.description : found.ex.description,
      coverImage: updates.coverImage !== undefined ? updates.coverImage : found.ex.coverImage,
      coverHue: updates.coverHue !== undefined ? updates.coverHue : found.ex.coverHue
    });
    setData(data);
    return found.ex;
  }

  function deleteExhibition(exhibitionId, moveTo = null) {
    const data = getData();
    let found = null;
    let allWorks = [];
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        const idx = medium.exhibitions.findIndex(e => e.id === exhibitionId);
        if (idx > -1) {
          found = { zone, medium, ex: medium.exhibitions[idx], idx };
        }
      });
    });
    if (!found) return { success: false, count: 0 };

    // 收集该画展下所有作品
    found.ex.themes.forEach(theme => {
      theme.works.forEach(w => allWorks.push(w));
    });

    // 删除画展
    found.medium.exhibitions.splice(found.idx, 1);

    // 处理作品：移动到指定画展或变为未分类
    if (moveTo && allWorks.length > 0) {
      let target = null;
      data.zones.forEach(zone => {
        zone.media.forEach(medium => {
          medium.exhibitions.forEach(ex => {
            if (ex.id === moveTo) target = ex;
          });
        });
      });
      if (target) {
        // 找到或创建"未分类"主题
        let uncategorized = target.themes.find(t => t.id === 'uncategorized');
        if (!uncategorized) {
          uncategorized = {
            id: 'uncategorized',
            name: '未分类',
            description: '从其他画展移动过来的作品',
            works: []
          };
          target.themes.push(uncategorized);
        }
        uncategorized.works.push(...allWorks);
      }
    }

    setData(data);
    return { success: true, count: allWorks.length };
  }

  function getExhibition(exhibitionId) {
    const data = getData();
    for (const zone of data.zones) {
      for (const medium of zone.media) {
        const ex = medium.exhibitions.find(e => e.id === exhibitionId);
        if (ex) return { zone, medium, exhibition: ex };
      }
    }
    return null;
  }

  /* ============================================================
     主题 CRUD
     ============================================================ */
  function addTheme(zoneId, mediumId, exhibitionId, themeData) {
    const data = getData();
    const zone = data.zones.find(z => z.id === zoneId);
    const medium = zone.media.find(m => m.id === mediumId);
    const ex = medium.exhibitions.find(e => e.id === exhibitionId);
    const theme = {
      id: themeData.id || genId('TH'),
      name: themeData.name,
      description: themeData.description || '',
      works: []
    };
    ex.themes.push(theme);
    setData(data);
    return theme;
  }

  function updateTheme(themeId, updates) {
    const data = getData();
    let found = null;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          const idx = ex.themes.findIndex(t => t.id === themeId);
          if (idx > -1) {
            found = { zone, medium, ex, theme: ex.themes[idx], idx };
          }
        });
      });
    });
    if (!found) return null;

    Object.assign(found.theme, {
      name: updates.name !== undefined ? updates.name : found.theme.name,
      description: updates.description !== undefined ? updates.description : found.theme.description
    });
    setData(data);
    return found.theme;
  }

  function deleteTheme(themeId) {
    const data = getData();
    let found = null;
    data.zones.forEach(zone => {
      zone.media.forEach(medium => {
        medium.exhibitions.forEach(ex => {
          const idx = ex.themes.findIndex(t => t.id === themeId);
          if (idx > -1) {
            found = { ex, idx, workCount: ex.themes[idx].works.length };
          }
        });
      });
    });
    if (!found) return { success: false, count: 0 };
    if (found.workCount > 0) {
      return { success: false, count: found.workCount, message: '该主题下还有作品，请先移动或删除作品' };
    }
    found.ex.themes.splice(found.idx, 1);
    setData(data);
    return { success: true, count: 0 };
  }

  /* ============================================================
     统计
     ============================================================ */
  function getStats() {
    const data = getData();
    const stats = {
      total: 0,
      byZone: {},
      byMedium: {},
      byExhibition: {},
      last7Days: 0,
      recent: []
    };
    const sevenDaysAgo = Date.now() - 7 * 86400000;

    data.zones.forEach(zone => {
      stats.byZone[zone.id] = { name: zone.name, count: 0 };
      zone.media.forEach(medium => {
        stats.byMedium[medium.id] = { name: medium.name, zoneName: zone.name, count: 0 };
        medium.exhibitions.forEach(ex => {
          stats.byExhibition[ex.id] = { name: ex.name, count: 0 };
          ex.themes.forEach(theme => {
            theme.works.forEach(work => {
              stats.total++;
              stats.byZone[zone.id].count++;
              stats.byMedium[medium.id].count++;
              stats.byExhibition[ex.id].count++;
              if (work.createdAt && work.createdAt >= sevenDaysAgo) {
                stats.last7Days++;
              }
              stats.recent.push({
                ...work,
                zoneName: zone.name,
                mediumName: medium.name,
                exhibitionName: ex.name,
                themeName: theme.name
              });
            });
          });
        });
      });
    });

    stats.recent.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    stats.recent = stats.recent.slice(0, 10);

    return stats;
  }

  /* ============================================================
     图片压缩工具
     ============================================================ */
  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const originalSize = file.size;
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round(h * maxDim / w);
            w = maxDim;
          } else {
            w = Math.round(w * maxDim / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // 先尝试质量0.75
        let quality = 0.75;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let compressedSize = Math.round(dataUrl.length * 0.75); // base64 约 0.75 倍

        // 若超500KB，降至0.6
        if (compressedSize > 500 * 1024) {
          quality = 0.6;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          compressedSize = Math.round(dataUrl.length * 0.75);
        }

        callback({
          dataUrl,
          originalSize,
          compressedSize,
          width: w,
          height: h,
          quality
        });
      };
      img.onerror = function () {
        callback({ error: '图片加载失败' });
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      callback({ error: '文件读取失败' });
    };
    reader.readAsDataURL(file);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  /* ---------- 跨标签页数据同步 ---------- */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      notify();
    }
  });

  return {
    init,
    resetToDefault,
    getData,
    setData,
    subscribe,
    login,
    logout,
    isLoggedIn,
    getCurrentUser,
    genId,
    // 作品
    addWork,
    updateWork,
    deleteWork,
    deleteWorks,
    findWork,
    getAllWorks,
    // 画展
    addExhibition,
    updateExhibition,
    deleteExhibition,
    getExhibition,
    // 主题
    addTheme,
    updateTheme,
    deleteTheme,
    // 统计
    getStats,
    // 工具
    compressImage,
    formatSize,
    STORAGE_KEY
  };
})();
