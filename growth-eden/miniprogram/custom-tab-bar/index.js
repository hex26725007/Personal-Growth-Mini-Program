Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/home/home',
        text: '首页',
        icon: '/assets/tab/tab-home.png',
        activeIcon: '/assets/tab/tab-home-on.png'
      },
      {
        pagePath: '/pages/tasks/tasks',
        text: '成长任务',
        icon: '/assets/tab/tab-tasks.png',
        activeIcon: '/assets/tab/tab-tasks-on.png'
      },
      {
        pagePath: '/pages/ability/ability',
        text: '能力树',
        icon: '/assets/tab/tab-ability.png',
        activeIcon: '/assets/tab/tab-ability-on.png'
      },
      {
        pagePath: '/pages/achievements/achievements',
        text: '成就徽章',
        icon: '/assets/tab/tab-medal.png',
        activeIcon: '/assets/tab/tab-medal-on.png'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: '/assets/tab/tab-person.png',
        activeIcon: '/assets/tab/tab-person-on.png'
      }
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
