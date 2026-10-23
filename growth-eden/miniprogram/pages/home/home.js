const store = require('../../utils/store');

Page({
  data: {
    vm: {},
    todoPreview: [],
    remaining: 0,
    streakHint: ''
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
      this.getTabBar().setData({ selected: 0 });
    }
  },

  refresh() {
    const vm = store.viewModel();
    const undone = vm.todayList.filter((t) => !t.done).slice(0, 3);
    const todoPreview = undone.length ? undone : vm.todayList.slice(0, 3);
    const streakHint =
      vm.streak >= 7 ? '已经连续 7 天，节奏保持得不错' : '再坚持 ' + (7 - vm.streak) + ' 天解锁「七日成诗」';

    this.setData({
      vm: vm,
      todoPreview: todoPreview,
      remaining: vm.totalCount - vm.doneCount,
      streakHint: streakHint
    });
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id;
    const res = store.completeTask(id);
    if (!res) return;

    store.haptic();
    const popup = this.selectComponent('#reward');
    if (popup) popup.show(res);
  },

  goTasks() {
    wx.switchTab({ url: '/pages/tasks/tasks' });
  },

  goAbility() {
    wx.switchTab({ url: '/pages/ability/ability' });
  },

  goAchievements() {
    wx.switchTab({ url: '/pages/achievements/achievements' });
  }
});
