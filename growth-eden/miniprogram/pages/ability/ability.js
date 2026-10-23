const store = require('../../utils/store');

Page({
  data: {
    vm: {}
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
      this.getTabBar().setData({ selected: 2 });
    }
  },

  refresh() {
    this.setData({ vm: store.viewModel() });
  },

  onNode(e) {
    const key = e.currentTarget.dataset.key;
    wx.pageScrollTo({
      selector: '#ab-' + key,
      duration: 320,
      offsetTop: -20
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' });
  }
});
