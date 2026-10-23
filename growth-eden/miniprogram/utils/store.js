/**
 * 进化乐园 · 状态中心
 * 本地优先（Storage 即真相），配置云环境后自动做云端同步。
 * 所有页面只通过这里读写数据，保证规则口径一致。
 */
const data = require('./data');
const cloud = require('./cloud');

const KEY = 'growth_eden_state_v1';
const listeners = [];
let cache = null;
let syncStatus = 'local'; // local | syncing | synced | error
let pushTimer = null;
let bootPromise = null;

/* ---------------- 时间工具 ---------------- */
function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return data.dayKey(d);
}

function weekStartKey() {
  const d = new Date();
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (day - 1));
  return data.dayKey(d);
}

function dayBefore(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return data.dayKey(d);
}

const WEEK_CHARS = ['日', '一', '二', '三', '四', '五', '六'];

function shortLabel(dateKey) {
  const parts = dateKey.split('-');
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return WEEK_CHARS[d.getDay()];
}

function prettyDate(dateKey) {
  const parts = dateKey.split('-');
  return parts[1] + '月' + parts[2] + '日';
}

/* ---------------- 默认示例数据 ---------------- */
function createDefaultState() {
  const today = data.dayKey();
  const ids = data.buildDailyTasks(today, 5);
  const todayTasks = ids.map((id, i) => ({ id: id, done: i < 2, at: i < 2 ? Date.now() : 0 }));
  const todayGrowth = todayTasks.reduce((sum, t) => sum + (t.done ? data.getTask(t.id).growth : 0), 0);

  const base = [32, 40, 18, 45, 36, 22];
  const history = [];
  for (let i = 6; i >= 1; i--) {
    history.push({ date: dayBefore(i), growth: base[6 - i] });
  }
  history.push({ date: today, growth: todayGrowth });

  const weekGrowth = history.reduce((s, h) => s + h.growth, 0);

  return {
    version: 1,
    nickname: '成长者',
    level: 3,
    weekGrowth: weekGrowth,
    weekStart: weekStartKey(),
    totalGrowth: 1880,
    streak: 5,
    bestStreak: 7,
    lastActiveDate: today,
    daysActive: 21,
    joinDate: dayBefore(21),
    completedCount: 34,
    perfectDays: 0,
    abilityDone: { learn: 9, focus: 6, health: 8, emotion: 3, action: 5, social: 2 },
    abilities: {
      learn: { level: 2, exp: 62 },
      focus: { level: 1, exp: 48 },
      health: { level: 2, exp: 80 },
      emotion: { level: 1, exp: 33 },
      action: { level: 1, exp: 55 },
      social: { level: 1, exp: 20 }
    },
    todayDate: today,
    todayTasks: todayTasks,
    history: history,
    badgeMap: {
      first_step: dayBefore(20),
      streak3: dayBefore(13),
      growth1000: dayBefore(4),
      early_bird: dayBefore(9)
    },
    settings: { remind: true, remindTime: '20:30' },
    flags: { earlyBird: true, nightOwl: false },
    updatedAt: Date.now()
  };
}

function normalize(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== 'object') return base;
  const s = Object.assign({}, base, raw);
  s.abilities = Object.assign({}, base.abilities, raw.abilities || {});
  data.ABILITIES.forEach((a) => {
    if (!s.abilities[a.key]) s.abilities[a.key] = { level: 1, exp: 0 };
  });
  s.abilityDone = Object.assign({}, base.abilityDone, raw.abilityDone || {});
  s.settings = Object.assign({}, base.settings, raw.settings || {});
  s.flags = Object.assign({}, base.flags, raw.flags || {});
  s.badgeMap = raw.badgeMap || {};
  if (!Array.isArray(s.todayTasks) || !s.todayTasks.length) s.todayTasks = base.todayTasks;
  if (!Array.isArray(s.history) || !s.history.length) s.history = base.history;
  return s;
}

/* ---------------- 跨天 / 跨周结算 ---------------- */
function rollover(s) {
  let changed = false;
  const today = data.dayKey();

  if (s.todayDate !== today) {
    const y = yesterdayKey();
    if (s.lastActiveDate !== y && s.lastActiveDate !== today) s.streak = 0;
    s.todayDate = today;
    s.todayTasks = data.buildDailyTasks(today, 5).map((id) => ({ id: id, done: false, at: 0 }));
    s.history = s.history.filter((h) => h.date !== today);
    s.history.push({ date: today, growth: 0 });
    s.history = s.history.slice(-30);
    changed = true;
  }

  const wk = weekStartKey();
  if (s.weekStart !== wk) {
    s.weekStart = wk;
    s.weekGrowth = 0;
    changed = true;
  }
  return changed;
}

/* ---------------- 读写 ---------------- */
function persistLocal() {
  try {
    wx.setStorageSync(KEY, cache);
  } catch (e) {
    /* ignore */
  }
}

function get() {
  if (cache) return cache;
  const raw = wx.getStorageSync(KEY);
  cache = normalize(raw);
  if (rollover(cache) || !raw) persistLocal();
  return cache;
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(cache);
    } catch (e) {
      /* ignore */
    }
  });
}

function save() {
  cache.updatedAt = Date.now();
  persistLocal();
  notify();
  schedulePush();
}

function subscribe(fn) {
  if (listeners.indexOf(fn) === -1) listeners.push(fn);
  return function () {
    const i = listeners.indexOf(fn);
    if (i > -1) listeners.splice(i, 1);
  };
}

/* ---------------- 云端同步 ---------------- */
function schedulePush() {
  if (!cloud.available()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushToCloud();
  }, 900);
}

function pushToCloud() {
  if (!cloud.available()) return Promise.resolve(false);
  syncStatus = 'syncing';
  notify();
  return cloud
    .call('save', { state: cache })
    .then(() => {
      syncStatus = 'synced';
      notify();
      return true;
    })
    .catch(() => {
      syncStatus = 'error';
      notify();
      return false;
    });
}

function bootstrap() {
  if (bootPromise) return bootPromise;
  const raw = wx.getStorageSync(KEY);
  cache = normalize(raw);

  if (!cloud.available()) {
    syncStatus = 'local';
    if (rollover(cache) || !raw) persistLocal();
    bootPromise = Promise.resolve(cache);
    return bootPromise;
  }

  syncStatus = 'syncing';
  bootPromise = cloud
    .call('load')
    .then((res) => {
      const remote = res && res.data && res.data.state;
      if (!raw && remote) {
        cache = normalize(remote);
        syncStatus = 'synced';
        persistLocal();
      } else if (remote && remote.updatedAt > cache.updatedAt) {
        cache = normalize(remote);
        syncStatus = 'synced';
        persistLocal();
      } else {
        syncStatus = 'synced';
        pushToCloud();
      }
      if (rollover(cache)) persistLocal();
      notify();
      return cache;
    })
    .catch(() => {
      syncStatus = 'error';
      if (rollover(cache) || !raw) persistLocal();
      notify();
      return cache;
    });
  return bootPromise;
}

function syncNow() {
  return cloud.available() ? pushToCloud() : Promise.resolve(false);
}

/* ---------------- 徽章结算 ---------------- */
function badgeById(id) {
  return data.BADGES.find((b) => b.id === id);
}

function syncBadges(s) {
  const ids = [];
  data.BADGES.forEach((b) => {
    if (b.id !== 'collector' && b.check(s)) ids.push(b.id);
  });
  if (ids.length >= 5) ids.push('collector');

  const added = [];
  ids.forEach((id) => {
    if (!s.badgeMap[id]) {
      s.badgeMap[id] = data.dayKey();
      added.push(id);
    }
  });
  return added.map(badgeById).filter(Boolean);
}

/* ---------------- 业务动作 ---------------- */
function completeTask(taskId) {
  const s = get();
  const task = data.getTask(taskId);
  const item = s.todayTasks.find((t) => t.id === taskId);

  if (!task || !item || item.done) return null;

  item.done = true;
  item.at = Date.now();

  s.completedCount += 1;
  s.totalGrowth += task.growth;
  s.weekGrowth += task.growth;
  s.abilityDone[task.ability] = (s.abilityDone[task.ability] || 0) + 1;

  const abilityMeta = data.getAbility(task.ability);
  const ab = s.abilities[task.ability];
  const abilityFromLevel = ab.level;
  ab.exp += task.growth;
  let abilityLevelUp = false;
  while (ab.exp >= 100 && ab.level < 10) {
    ab.exp -= 100;
    ab.level += 1;
    abilityLevelUp = true;
  }

  const today = data.dayKey();
  let hist = s.history.find((h) => h.date === today);
  if (!hist) {
    hist = { date: today, growth: 0 };
    s.history.push(hist);
  }
  hist.growth += task.growth;
  s.history = s.history.slice(-30);

  const hour = new Date().getHours();
  if (hour < 8) s.flags.earlyBird = true;
  if (hour >= 23) s.flags.nightOwl = true;

  if (s.todayTasks.every((t) => t.done)) s.perfectDays += 1;

  if (s.lastActiveDate !== today) {
    s.streak = s.lastActiveDate === yesterdayKey() ? s.streak + 1 : 1;
    s.lastActiveDate = today;
    s.daysActive += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
  }

  let levelUp = false;
  while (s.weekGrowth >= data.LEVEL_STEP) {
    s.weekGrowth -= data.LEVEL_STEP;
    s.level += 1;
    levelUp = true;
  }

  const newBadges = syncBadges(s);
  save();

  return {
    task: decorateTask(item),
    growth: task.growth,
    abilityName: abilityMeta.name,
    abilityEmoji: abilityMeta.emoji,
    abilityColor: abilityMeta.color,
    abilityBg: abilityMeta.bg,
    abilityAdvice: abilityMeta.advice,
    abilityLevelUp: abilityLevelUp,
    abilityFromLevel: abilityFromLevel,
    abilityLevel: ab.level,
    abilityExp: ab.exp,
    levelUp: levelUp,
    level: s.level,
    newBadges: newBadges,
    allDone: s.todayTasks.every((t) => t.done)
  };
}

function regenerateTasks() {
  const s = get();
  const done = s.todayTasks.filter((t) => t.done);
  const pool = data
    .seededShuffle(
      data.TASK_LIB.filter((t) => !done.some((d) => d.id === t.id)),
      Math.floor(Math.random() * 100000) + 7
    )
    .slice(0, 5 - done.length);
  s.todayTasks = done.concat(pool.map((t) => ({ id: t.id, done: false, at: 0 })));
  save();
  return s;
}

function updateSettings(patch) {
  const s = get();
  s.settings = Object.assign({}, s.settings, patch);
  save();
}

function setNickname(name) {
  const s = get();
  const v = (name || '').trim();
  if (!v) return;
  s.nickname = v.slice(0, 12);
  save();
}

function resetDemo() {
  cache = createDefaultState();
  persistLocal();
  notify();
  if (cloud.available()) pushToCloud();
}

/* ---------------- 视图模型 ---------------- */
function decorateTask(item) {
  const task = data.getTask(item.id) || data.TASK_LIB[0];
  const ab = data.getAbility(task.ability);
  return {
    id: task.id,
    title: task.title,
    growth: task.growth,
    minutes: task.minutes,
    diffText: data.DIFF_TEXT[task.diff],
    emoji: task.emoji,
    ability: task.ability,
    abilityName: ab.name,
    color: ab.color,
    bg: ab.bg,
    done: !!item.done,
    at: item.at || 0
  };
}

function viewModel() {
  const s = get();
  const total = s.todayTasks.length;
  const doneCount = s.todayTasks.filter((t) => t.done).length;
  const todayGrowth = s.todayTasks.reduce((sum, t) => sum + (t.done ? data.getTask(t.id).growth : 0), 0);
  const percent = Math.min(100, Math.round((s.weekGrowth / data.LEVEL_STEP) * 100));

  const todayList = s.todayTasks.map(decorateTask);

  const abilityList = data.ABILITIES.map((a) => {
    const ab = s.abilities[a.key] || { level: 1, exp: 0 };
    return Object.assign({}, a, {
      level: ab.level,
      exp: ab.exp,
      percent: Math.round((ab.exp / 100) * 100),
      doneCount: s.abilityDone[a.key] || 0
    });
  });

  const badgeList = data.BADGES.map((b) => ({
    id: b.id,
    name: b.name,
    emoji: b.emoji,
    color: b.color,
    desc: b.desc,
    unlocked: !!s.badgeMap[b.id],
    date: s.badgeMap[b.id] || ''
  }));
  const unlockedCount = badgeList.filter((b) => b.unlocked).length;

  const week = s.history.slice(-7);
  const maxGrowth = Math.max.apply(null, week.map((h) => h.growth).concat([40]));
  const weekBars = week.map((h) => ({
    date: h.date,
    label: shortLabel(h.date),
    growth: h.growth,
    height: Math.max(6, Math.round((h.growth / maxGrowth) * 100)),
    today: h.date === s.todayDate
  }));

  return {
    state: s,
    nickname: s.nickname,
    level: s.level,
    levelTitle: data.levelTitle(s.level),
    weekGrowth: s.weekGrowth,
    levelStep: data.LEVEL_STEP,
    percent: percent,
    remain: Math.max(0, data.LEVEL_STEP - s.weekGrowth),
    quote: data.QUOTES[new Date().getDate() % data.QUOTES.length],
    todayText: prettyDate(s.todayDate),
    todayList: todayList,
    doneCount: doneCount,
    totalCount: total,
    todayGrowth: todayGrowth,
    todayPercent: total ? Math.round((doneCount / total) * 100) : 0,
    allDone: total > 0 && doneCount === total,
    abilityList: abilityList,
    badgeList: badgeList,
    unlockedCount: unlockedCount,
    badgeTotal: data.BADGES.length,
    weekBars: weekBars,
    syncStatus: syncStatus,
    streak: s.streak,
    totalGrowth: s.totalGrowth,
    completedCount: s.completedCount,
    daysActive: s.daysActive,
    perfectDays: s.perfectDays,
    joinDate: s.joinDate,
    settings: s.settings,
    cloudEnabled: cloud.available()
  };
}

function toast(title, icon) {
  wx.showToast({ title: title, icon: icon || 'none', duration: 1600 });
}

function haptic() {
  if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
}

module.exports = {
  get,
  viewModel,
  completeTask,
  regenerateTasks,
  updateSettings,
  setNickname,
  resetDemo,
  bootstrap,
  syncNow,
  subscribe,
  toast,
  haptic,
  prettyDate,
  shortLabel
};
