Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '首页', emoji: '🏠' },
      { pagePath: '/pages/tasks/tasks', text: '成长任务', emoji: '📋' },
      { pagePath: '/pages/ability/ability', text: '能力树', emoji: '🌳' },
      { pagePath: '/pages/achievements/achievements', text: '成就徽章', emoji: '🏅' },
      { pagePath: '/pages/profile/profile', text: '我的', emoji: '👤' }
    ]
  },

  methods: {
    switchTab(e) {
      const index = Number(e.currentTarget.dataset.index);
      const item = this.data.list[index];
      if (!item) return;
      wx.switchTab({ url: item.pagePath });
      this.setData({ selected: index });
    }
  }
});
