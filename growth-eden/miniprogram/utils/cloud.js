const { CLOUD_ENV_ID, CLOUD_FUNCTION } = require('../config/env');

let inited = false;

function available() {
  return !!(CLOUD_ENV_ID && wx.cloud);
}

function init() {
  if (!available() || inited) return inited;
  try {
    wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true });
    inited = true;
  } catch (e) {
    inited = false;
  }
  return inited;
}

function call(action, payload, timeout) {
  return new Promise((resolve, reject) => {
    if (!init()) {
      reject(new Error('cloud-not-ready'));
      return;
    }
    wx.cloud.callFunction({
      name: CLOUD_FUNCTION,
      data: Object.assign({ action: action }, payload || {}),
      timeout: timeout || 8000
    })
      .then((res) => resolve(res.result))
      .catch(reject);
  });
}

module.exports = { available, init, call };
