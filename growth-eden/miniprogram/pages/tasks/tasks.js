const store = require('../../utils/store');

Page({
  data: {
    vm: {},
    filters: [],
    filter: 'all',
    visibleTasks: []
  },

  onLoad() {
    const vm = store.viewModel();
    const filters = [{ key: 'all', name: '全部' }].concat(
      vm.abilityList.map((a) => ({ key: a.key, name: a.name }))
    );
    this.setData({ filters: filters });
    this.unsub = store.subscribe(() => this.refresh());
  },

  onUnload() {
    if (this.unsub) this.unsub();
  },

  onShow() {
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  refresh() {
    const vm = store.viewModel();
    const filter = this.data.filter;
    const visibleTasks =
      filter === 'all' ? vm.todayList : vm.todayList.filter((t) => t.ability === filter);

    this.setData({ vm: vm, visibleTasks: visibleTasks });
  },

  onFilter(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ filter: key }, () => this.refresh());
  },

  onComplete(e) {
    const id = e.currentTarget.dataset.id;
    const res = store.completeTask(id);
    if (!res) {
      wx.showToast({ title: '这个任务今天已经完成啦', icon: 'none' });
      return;
    }

    store.haptic();
    const popup = this.selectComponent('#reward');
    if (popup) popup.show(res);
  },

  onShuffle() {
    const vm = store.viewModel();
    if (vm.allDone) {
      store.toast('今天的任务已全部完成，明天见 👋');
      return;
    }
    store.regenerateTasks();
    store.toast('已为你换一批任务');
  }
});
