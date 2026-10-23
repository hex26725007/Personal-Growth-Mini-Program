/**
 * 进化乐园 · 内容与规则数据
 * 六维能力 / 任务库 / 进化箴言 / 成就徽章 / 等级规则
 */

const LEVEL_STEP = 500; // 每级所需成长值（本周成长值达到 500 即升级）

const ABILITIES = [
  {
    key: 'learn',
    name: '学习力',
    emoji: '📚',
    color: '#4C86F5',
    bg: '#EBF2FF',
    desc: '输入、理解并沉淀知识',
    advice: '每天固定 30 分钟阅读，读完写 1 张知识卡片。'
  },
  {
    key: 'focus',
    name: '专注力',
    emoji: '🎯',
    color: '#8B6BF2',
    bg: '#F1ECFF',
    desc: '在一件事上深度停留',
    advice: '用 25 分钟番茄钟开启，先关掉非必要通知。'
  },
  {
    key: 'health',
    name: '健康力',
    emoji: '🌿',
    color: '#16B98D',
    bg: '#E6F8F1',
    desc: '身体与精力的底盘',
    advice: '每天 20 分钟中低强度运动，23:30 前入睡。'
  },
  {
    key: 'emotion',
    name: '情绪力',
    emoji: '☀️',
    color: '#F0A02A',
    bg: '#FFF5E3',
    desc: '识别、接纳并调节情绪',
    advice: '睡前记录 3 件小确幸，给情绪一个出口。'
  },
  {
    key: 'action',
    name: '行动力',
    emoji: '⚡',
    color: '#F0724E',
    bg: '#FFEDE7',
    desc: '把想法变成真实结果',
    advice: '拖延的事先做 5 分钟，启动比完美更重要。'
  },
  {
    key: 'social',
    name: '社交力',
    emoji: '🤝',
    color: '#26A8C9',
    bg: '#E6F6FB',
    desc: '连接他人、被理解与支持',
    advice: '每周主动联系 1 位朋友，给出一次具体赞美。'
  }
];

const TASK_LIB = [
  { id: 'read30', title: '阅读 30 分钟', ability: 'learn', growth: 15, minutes: 30, diff: 2, emoji: '📖' },
  { id: 'card', title: '写一张知识卡片', ability: 'learn', growth: 10, minutes: 10, diff: 1, emoji: '🗂' },
  { id: 'diary', title: '完成今日复盘日记', ability: 'learn', growth: 10, minutes: 10, diff: 1, emoji: '✍️' },

  { id: 'pomodoro', title: '番茄钟专注 25 分钟', ability: 'focus', growth: 15, minutes: 25, diff: 2, emoji: '🍅' },
  { id: 'deep90', title: '深度工作 90 分钟', ability: 'focus', growth: 25, minutes: 90, diff: 3, emoji: '🎧' },
  { id: 'phone', title: '手机远离工作台 1 小时', ability: 'focus', growth: 12, minutes: 60, diff: 2, emoji: '📵' },

  { id: 'run20', title: '快走或慢跑 20 分钟', ability: 'health', growth: 15, minutes: 20, diff: 2, emoji: '🏃' },
  { id: 'stretch', title: '拉伸放松 10 分钟', ability: 'health', growth: 8, minutes: 10, diff: 1, emoji: '🧘' },
  { id: 'sleep', title: '23:30 前上床睡觉', ability: 'health', growth: 10, minutes: 5, diff: 1, emoji: '🌙' },

  { id: 'gratitude', title: '记录 3 件小确幸', ability: 'emotion', growth: 10, minutes: 5, diff: 1, emoji: '🌤' },
  { id: 'breathe', title: '3 分钟呼吸练习', ability: 'emotion', growth: 8, minutes: 3, diff: 1, emoji: '🫧' },
  { id: 'mood', title: '写一段情绪日记', ability: 'emotion', growth: 12, minutes: 8, diff: 2, emoji: '💭' },

  { id: 'first5', title: '做掉一件拖延的事', ability: 'action', growth: 20, minutes: 15, diff: 2, emoji: '⚡' },
  { id: 'three', title: '写下今日最重要的三件事', ability: 'action', growth: 8, minutes: 3, diff: 1, emoji: '📌' },
  { id: 'declutter', title: '断舍离一个角落', ability: 'action', growth: 12, minutes: 15, diff: 2, emoji: '🧹' },

  { id: 'reachout', title: '主动联系一位朋友', ability: 'social', growth: 10, minutes: 5, diff: 1, emoji: '💬' },
  { id: 'praise', title: '给一个人具体的赞美', ability: 'social', growth: 8, minutes: 2, diff: 1, emoji: '🌻' },
  { id: 'listen', title: '认真听完一次倾诉', ability: 'social', growth: 12, minutes: 10, diff: 2, emoji: '👂' }
];

const QUOTES = [
  '微小持续，就是进化的力量。',
  '你不必很快，只要一直在长。',
  '今天的一小步，是明天的能力基线。',
  '进化不是突变，而是每天多 1%。',
  '完成比完美更重要。',
  '专注一小时，胜过忙碌一整天。',
  '身体是所有能力的地基。',
  '情绪稳定，是一种高级的战斗力。'
];

const BADGES = [
  {
    id: 'first_step',
    name: '初次进化',
    emoji: '🌱',
    color: '#2ECFA6',
    desc: '完成第 1 个成长任务',
    check: (s) => s.completedCount >= 1
  },
  {
    id: 'streak3',
    name: '三日不辍',
    emoji: '🔥',
    color: '#F0724E',
    desc: '连续 3 天完成任务',
    check: (s) => s.streak >= 3
  },
  {
    id: 'streak7',
    name: '七日成诗',
    emoji: '🌟',
    color: '#F0A02A',
    desc: '连续 7 天完成任务',
    check: (s) => s.streak >= 7
  },
  {
    id: 'level5',
    name: '五级进化者',
    emoji: '👑',
    color: '#8B6BF2',
    desc: '成长等级达到 Lv.5',
    check: (s) => s.level >= 5
  },
  {
    id: 'growth1000',
    name: '千点里程碑',
    emoji: '🏅',
    color: '#16B98D',
    desc: '累计成长值达到 1000',
    check: (s) => s.totalGrowth >= 1000
  },
  {
    id: 'allround',
    name: '六维觉醒',
    emoji: '🧬',
    color: '#26A8C9',
    desc: '六项能力全部达到 Lv.2',
    check: (s) => ABILITIES.every((a) => (s.abilities[a.key] || {}).level >= 2)
  },
  {
    id: 'focus10',
    name: '专注达人',
    emoji: '🎯',
    color: '#4C86F5',
    desc: '完成 10 个专注力任务',
    check: (s) => (s.abilityDone.focus || 0) >= 10
  },
  {
    id: 'early_bird',
    name: '晨间进化',
    emoji: '☀️',
    color: '#F5B93F',
    desc: '在早上 8 点前完成一个任务',
    check: (s) => !!s.flags.earlyBird
  },
  {
    id: 'night_owl',
    name: '深夜思考者',
    emoji: '🌙',
    color: '#6C7BF0',
    desc: '在 23 点后完成一个任务',
    check: (s) => !!s.flags.nightOwl
  },
  {
    id: 'perfect_day',
    name: '完美一天',
    emoji: '💎',
    color: '#22B8CF',
    desc: '一天内完成全部今日任务',
    check: (s) => s.perfectDays >= 1
  },
  {
    id: 'collector',
    name: '徽章收藏家',
    emoji: '🧩',
    color: '#B07BF2',
    desc: '解锁 5 枚徽章',
    check: () => false // 由 computeBadges 单独处理
  },
  {
    id: 'hundred',
    name: '百日进化',
    emoji: '🚀',
    color: '#12A97F',
    desc: '累积活跃 100 天',
    check: (s) => s.daysActive >= 100
  }
];

const DIFF_TEXT = { 1: '轻松', 2: '适中', 3: '挑战' };

const LEVEL_TITLES = [
  { min: 1, title: '新手进化者' },
  { min: 3, title: '进化者' },
  { min: 5, title: '进阶进化者' },
  { min: 7, title: '高阶进化者' },
  { min: 10, title: '乐园守护者' }
];

function getAbility(key) {
  return ABILITIES.find((a) => a.key === key) || ABILITIES[0];
}

function getTask(id) {
  return TASK_LIB.find((t) => t.id === id);
}

function levelTitle(level) {
  let title = LEVEL_TITLES[0].title;
  LEVEL_TITLES.forEach((item) => {
    if (level >= item.min) title = item.title;
  });
  return title;
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function dayKey(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 按种子打乱后取指定数量，保证同一天生成同一套任务 */
function seededShuffle(list, seed) {
  const arr = list.slice();
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** 每日任务：六维各挑 1 项，取前 5 项，保证能力覆盖 */
function buildDailyTasks(dateKey, count) {
  const total = count || 5;
  const seed = hash('eden-' + dateKey);
  const abilityOrder = seededShuffle(ABILITIES, seed).map((a) => a.key);
  const picked = [];
  abilityOrder.forEach((key) => {
    if (picked.length >= total) return;
    const pool = seededShuffle(
      TASK_LIB.filter((t) => t.ability === key),
      seed + key.length
    );
    if (pool[0]) picked.push(pool[0].id);
  });
  return picked;
}

module.exports = {
  LEVEL_STEP,
  ABILITIES,
  TASK_LIB,
  QUOTES,
  BADGES,
  DIFF_TEXT,
  getAbility,
  getTask,
  levelTitle,
  dayKey,
  buildDailyTasks,
  seededShuffle
};
