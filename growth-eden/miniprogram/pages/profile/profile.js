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
    avatarUrl: '',
    avatarChar: '成',
    manifesto: '',
    weekTotal: 0,
    syncText: '',
    syncClass: '',
    menus: [
      { id: 'archive', title: '成长档案', emoji: '📦', bg: '#FFF5E3' },
      { id: 'plan', title: '学习计划', emoji: '📋', bg: '#E6F8F1' },
      { id: 'stats', title: '数据统计', emoji: '📊', bg: '#EBF2FF' },
      { id: 'remind', title: '提醒设置', emoji: '🎯', bg: '#E6F6FB' },
      { id: 'privacy', title: '隐私与规则', emoji: '🛡', bg: '#F1ECFF' },
      { id: 'help', title: '帮助与反馈', emoji: '💬', bg: '#E6F8F1' }
    ]
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
    const manifesto =
      (vm.settings && vm.settings.manifesto) ||
      '我愿意用持续的小行动，成为更清醒、更稳定、更有行动力的自己。';

    this.setData({
      vm: vm,
      avatarUrl: vm.avatarUrl || '',
      avatarChar: (vm.nickname || '成长者').slice(0, 1),
      manifesto: manifesto,
      weekTotal: weekTotal,
      syncText: st[0],
      syncClass: st[1]
    });
  },

  onChooseAvatar(e) {
    const url = e.detail && e.detail.avatarUrl;
    if (!url) return;
    store.setAvatar(url);
    store.toast('头像已更新');
  },

  onNicknameBlur(e) {
    const name = (e.detail.value || '').trim();
    if (name && name !== this.data.vm.nickname) {
      store.setNickname(name);
    }
  },

  onSettings() {
    wx.showActionSheet({
      itemList: ['云端同步 · ' + this.data.syncText, '关于进化乐园', '重置为示例数据'],
      success: (res) => {
        if (res.tapIndex === 0) this.onSync();
        if (res.tapIndex === 1) this.onAbout();
        if (res.tapIndex === 2) this.onReset();
      }
    });
  },

  onMenu(e) {
    const id = e.currentTarget.dataset.id;
    const vm = this.data.vm;

    if (id === 'archive') {
      wx.showModal({
        title: '成长档案',
        content:
          '昵称：' +
          vm.nickname +
          '\n等级：Lv.' +
          vm.level +
          ' ' +
          vm.levelTitle +
          '\n累计成长值：' +
          vm.totalGrowth +
          '\n活跃 ' +
          vm.daysActive +
          ' 天 · 解锁徽章 ' +
          vm.unlockedCount +
          '/' +
          vm.badgeTotal +
          '\n加入日期：' +
          vm.joinDate,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#12A97F'
      });
      return;
    }

    if (id === 'plan') {
      wx.switchTab({ url: '/pages/tasks/tasks' });
      store.toast('今日任务就是你的学习计划');
      return;
    }

    if (id === 'stats') {
      wx.pageScrollTo({ selector: '#stats-chart', duration: 320, offsetTop: -12 });
      return;
    }

    if (id === 'remind') {
      this.onRemindPanel();
      return;
    }

    if (id === 'privacy') {
      wx.showModal({
        title: '隐私与规则',
        content:
          '1. 成长数据默认保存在你的手机本机。\n2. 头像与昵称仅在本地展示。\n3. 开启云同步后，数据会存入你本人的微信云开发环境。\n4. 本小程序用于个人成长记录，不构成医疗或心理咨询建议。',
        showCancel: false,
        confirmText: '我已了解',
        confirmColor: '#12A97F'
      });
      return;
    }

    if (id === 'help') {
      wx.showModal({
        title: '帮助与反馈',
        content: '如有建议或问题，请在此留言。',
        editable: true,
        placeholderText: '写下你的使用感受…',
        confirmText: '提交',
        confirmColor: '#12A97F',
        success(res) {
          if (res.confirm && res.content) store.toast('感谢反馈');
        }
      });
    }
  },

  onRemindPanel() {
    const vm = this.data.vm;
    const on = vm.settings.remind ? '已开启' : '已关闭';
    wx.showActionSheet({
      itemList: ['每日提醒：' + on + '（点击切换）', '提醒时间：' + vm.settings.remindTime],
      success: (res) => {
        if (res.tapIndex === 0) {
          store.updateSettings({ remind: !vm.settings.remind });
          store.toast(!vm.settings.remind ? '每日提醒已开启' : '每日提醒已关闭');
        }
        if (res.tapIndex === 1) {
          wx.showActionSheet({
            itemList: ['08:00', '12:30', '20:30', '21:00'],
            success(r) {
              const times = ['08:00', '12:30', '20:30', '21:00'];
              if (r.tapIndex >= 0 && times[r.tapIndex]) {
                store.updateSettings({ remindTime: times[r.tapIndex] });
                store.toast('提醒时间：' + times[r.tapIndex]);
              }
            }
          });
        }
      }
    });
  },

  onEditManifesto() {
    wx.showModal({
      title: '编辑进化宣言',
      editable: true,
      placeholderText: '写一句想对自己说的话',
      content: this.data.manifesto,
      confirmColor: '#12A97F',
      success(res) {
        if (res.confirm && res.content) {
          store.updateSettings({ manifesto: res.content.trim().slice(0, 120) });
          store.toast('宣言已更新');
        }
      }
    });
  },

  onSync() {
    const vm = this.data.vm;
    if (!vm.cloudEnabled) {
      wx.showModal({
        title: '云开发未配置',
        content: '当前数据完整保存在本机，不影响体验。',
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
      content: '个人成长进化乐园 · MVP 0.1\n用每日小任务推动六维能力进化。',
      showCancel: false,
      confirmText: '继续进化',
      confirmColor: '#12A97F'
    });
  },

  onReset() {
    wx.showModal({
      title: '重置为示例数据',
      content: '会把成长数据恢复成演示状态。',
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
