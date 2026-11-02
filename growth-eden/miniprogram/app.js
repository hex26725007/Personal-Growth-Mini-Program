const store = require('./utils/store');
const cloud = require('./utils/cloud');

App({
  globalData: {
    ready: null
  },

  onLaunch() {
    if (cloud.available()) cloud.init();
    this.globalData.ready = store.bootstrap();
  }
});
