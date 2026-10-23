/**
 * 云开发环境配置
 * 使用步骤：
 * 1. 微信开发者工具 → 云开发 → 开通并创建环境
 * 2. 把环境 ID 填到下面 CLOUD_ENV_ID
 * 3. 把 project.config.json 里的 appid 换成自己的小程序 AppID（测试号不支持云开发）
 * 未配置时，小程序会自动降级为「纯本地存储」，功能完整可用。
 */
module.exports = {
  CLOUD_ENV_ID: '',
  COLLECTION: 'growth_users',
  CLOUD_FUNCTION: 'growth'
};
