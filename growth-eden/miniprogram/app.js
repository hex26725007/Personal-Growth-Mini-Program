const store = require('./utils/store');
const cloud = require('./utils/cloud');

App({
  globalData: {
    ready: null
  },

  onLaunch() {
    cloud.init();
    this.globalData.ready = store.bootstrap();
  },

  onShow() {
    // 回到前台时做一次跨天结算
    store.get();
  }
});
