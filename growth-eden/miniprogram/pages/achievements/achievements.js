const store = require('../../utils/store');

function rgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

Page({
  data: {
    vm: {},
    badgeList: [],
    milestones: [],
    collectPercent: 0,
    detail: null
  },

  onLoad() {
    this.unsub = store.subscribe(() => this.refresh());
  },

  onUnload() {
    if (this.unsub) this.unsub();
  },

  onShow() {
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  refresh() {
    const vm = store.viewModel();
    const badgeList = vm.badgeList.map((b) =>
      Object.assign({}, b, { tint: rgba(b.color, 0.16) })
    );

    const s = vm.state;
    const milestones = [
      { name: '成为 Lv.5 进化者', cur: vm.level, target: 5 },
      { name: '连续进化 7 天', cur: s.streak, target: 7 },
      { name: '累计完成 100 个任务', cur: s.completedCount, target: 100 },
      { name: '收集 8 枚徽章', cur: vm.unlockedCount, target: 8 },
      { name: '累计 5000 成长值', cur: s.totalGrowth, target: 5000 }
    ].map((m) =>
      Object.assign(m, {
        percent: Math.min(100, Math.round((m.cur / m.target) * 100)),
        done: m.cur >= m.target
      })
    );

    let detail = null;
    if (this.data.detail) {
      detail = badgeList.find((b) => b.id === this.data.detail.id) || null;
    }

    this.setData({
      vm: vm,
      badgeList: badgeList,
      milestones: milestones,
      collectPercent: Math.round((vm.unlockedCount / vm.badgeTotal) * 100),
      detail: detail
    });
  },

  onBadge(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.badgeList.find((b) => b.id === id);
    if (item) this.setData({ detail: item });
  },

  closeDetail() {
    this.setData({ detail: null });
  },

  onDetailAction() {
    const unlocked = this.data.detail && this.data.detail.unlocked;
    this.setData({ detail: null });
    if (!unlocked) {
      wx.switchTab({ url: '/pages/tasks/tasks' });
    }
  },

  noop() {}
});
