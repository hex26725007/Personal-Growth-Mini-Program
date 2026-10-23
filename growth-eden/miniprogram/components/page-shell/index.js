Component({
  options: {
    virtualHost: true
  },

  properties: {
    title: {
      type: String,
      value: ''
    }
  },

  data: {
    pad: 48,
    titleRight: 96
  },

  lifetimes: {
    attached() {
      const sys = wx.getSystemInfoSync();
      const status = sys.statusBarHeight || 20;
      let pad = status + 6;
      let titleRight = 96;
      try {
        const menu = wx.getMenuButtonBoundingClientRect();
        if (menu && menu.top) {
          pad = menu.top;
          titleRight = Math.max(88, sys.windowWidth - menu.left + 8);
        }
      } catch (e) {
        /* 开发者工具偶发取不到胶囊位置，用状态栏高度兜底 */
      }
      this.setData({ pad: pad, titleRight: titleRight });
    }
  }
});
