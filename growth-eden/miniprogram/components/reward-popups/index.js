Component({
  options: {
    virtualHost: true
  },

  data: {
    mode: '',
    task: null,
    ability: null
  },

  methods: {
    show(res) {
      if (!res || !res.task) return;
      const ability = res.abilityLevelUp
        ? {
            name: res.abilityName,
            emoji: res.abilityEmoji,
            color: res.abilityColor,
            bg: res.abilityBg,
            advice: res.abilityAdvice,
            fromLevel: res.abilityFromLevel,
            level: res.abilityLevel,
            exp: res.abilityExp
          }
        : null;

      this.setData({
        mode: 'task',
        ability: ability,
        task: {
          growth: res.growth,
          title: res.task.title,
          abilityName: res.abilityName,
          levelUp: !!res.levelUp,
          level: res.level,
          badges: res.newBadges || [],
          allDone: !!res.allDone
        }
      });
    },

    noop() {},

    onTaskClose() {
      if (this.data.ability) {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
        this.setData({ mode: 'ability' });
        return;
      }
      this.setData({ mode: '', task: null });
    },

    onAbilityClose() {
      this.setData({ mode: '', task: null, ability: null });
    }
  }
});
