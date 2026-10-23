const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const COLL = 'growth_users';

async function ensureCollection() {
  try {
    await db.createCollection(COLL);
  } catch (e) {
    // 集合已存在时会抛错，忽略即可
  }
}

async function findDoc(openid) {
  const res = await db.collection(COLL).where({ openid: openid }).limit(1).get();
  return res.data[0] || null;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { ok: false, msg: 'no-openid' };

  const action = event.action;

  try {
    if (action === 'load') {
      const doc = await findDoc(OPENID);
      return {
        ok: true,
        data: doc ? { state: doc.state, updatedAt: doc.updatedAt } : null
      };
    }

    if (action === 'save') {
      const state = event.state;
      if (!state || typeof state !== 'object') {
        return { ok: false, msg: 'invalid-state' };
      }
      const now = Date.now();
      const payload = {
        state: state,
        updatedAt: now,
        nickname: state.nickname || '',
        level: state.level || 1
      };

      const doc = await findDoc(OPENID);
      if (doc) {
        await db.collection(COLL).doc(doc._id).update({ data: payload });
      } else {
        await db.collection(COLL).add({
          data: Object.assign({ openid: OPENID, createdAt: now }, payload)
        });
      }
      return { ok: true, updatedAt: now };
    }

    return { ok: false, msg: 'unknown-action' };
  } catch (e) {
    // 首次使用集合可能不存在，自动创建后重试一次
    if (e && (e.errCode === -502005 || String(e.message).indexOf('collection not exists') > -1)) {
      await ensureCollection();
      if (action === 'save') {
        await db.collection(COLL).add({
          data: { openid: OPENID, state: event.state, updatedAt: Date.now(), createdAt: Date.now() }
        });
        return { ok: true, retried: true };
      }
      return { ok: true, data: null };
    }
    return { ok: false, msg: e.message || 'server-error', code: e.errCode };
  }
};
