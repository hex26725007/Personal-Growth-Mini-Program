const store = require('../../utils/store');

const SYNC_TEXT = {
  local: ['仅本机保存', ''],
  syncing: ['同步中', 'warn'],
  synced: ['已同步', 'ok'],
  error: ['同步失败', 'err']
};

Page({
  data: {
    vm: {},
    avatarChar: '成',
    weekTotal: 0,
    syncText: '',
    syncClass: ''
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
      this.getTabBar().setData({ selected: 4 });
    }
  },

  refresh() {
    const vm = store.viewModel();
    const weekTotal = vm.weekBars.reduce((sum, b) => sum + b.growth, 0);
    const st = SYNC_TEXT[vm.syncStatus] || SYNC_TEXT.local;

    this.setData({
      vm: vm,
      avatarChar: (vm.nickname || '成长者').slice(0, 1),
      weekTotal: weekTotal,
      syncText: st[0],
      syncClass: st[1]
    });
  },

  onEditName() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '输入你的昵称',
      content: this.data.vm.nickname,
      confirmColor: '#12A97F',
      success(res) {
        if (res.confirm && res.content) {
          store.setNickname(res.content);
          store.toast('昵称已更新');
        }
      }
    });
  },

  onRemind(e) {
    store.updateSettings({ remind: e.detail.value });
    store.toast(e.detail.value ? '每日提醒已开启' : '每日提醒已关闭');
  },

  onTimeChange(e) {
    store.updateSettings({ remindTime: e.detail.value });
  },

  onSync() {
    const vm = this.data.vm;
    if (!vm.cloudEnabled) {
      wx.showModal({
        title: '云开发未配置',
        content:
          '在 miniprogram/config/env.js 填入云环境 ID 后，数据会自动同步到云端；当前数据完整保存在本机，不影响体验。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#12A97F'
      });
      return;
    }
    store.toast('正在同步…');
    store.syncNow().then((ok) => {
      store.toast(ok ? '已同步到云端' : '同步失败，请稍后重试');
    });
  },

  onAbout() {
    wx.showModal({
      title: '关于进化乐园',
      content:
        '个人成长进化乐园 · MVP 0.1\n用每日小任务推动六维能力进化，把成长变成看得见的进度。',
      showCancel: false,
      confirmText: '继续进化',
      confirmColor: '#12A97F'
    });
  },

  onReset() {
    wx.showModal({
      title: '重置为示例数据',
      content: '会把成长数据恢复成演示状态，方便让测试用户从头体验一遍。',
      confirmText: '重置',
      confirmColor: '#EF6C4D',
      success(res) {
        if (res.confirm) {
          store.resetDemo();
          store.toast('已重置为示例数据');
        }
      }
    });
  }
});
