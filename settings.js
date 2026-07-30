'use strict';
require('dotenv').config();

module.exports = {

  // ──────────────────────────────────────────────────────────
  //   AI API KEYS
  // ──────────────────────────────────────────────────────────
  GEMINI_API_KEY:      process.env.GEMINI_API_KEY      || 'AQ.Ab8RN6Lofidx4TIeeuyVFttnUdViJoXYSLjkv79Idaaynm6_Pg',
  OPENROUTER_API_KEY:  process.env.OPENROUTER_API_KEY  || '',

  // ──────────────────────────────────────────────────────────
  //   TELEGRAM BOT CONFIG
  // ──────────────────────────────────────────────────────────
  TELEGRAM_TOKEN:      process.env.TELEGRAM_TOKEN      || '8901099267:AAEoXZy8L3m1GguXybuuOeDCldcpCNcY7nI',
  OWNER_TELEGRAM_ID:   process.env.OWNER_TELEGRAM_ID   || '8227524972',
  OWNER_NAME:          process.env.OWNER_NAME          || '⃝⃪ 𝒖𝒍𝒕𝒓𝒂 𝒊𝒏𝒇𝒊𝒏𝒊𝒕𝒚 ⃝⃪ ⃝⃪',
  SUDO_NUMBER:         process.env.SUDO_NUMBER         || '7325407507',

  // ──────────────────────────────────────────────────────────
  //   GITHUB (for session sync & file upload)
  // ──────────────────────────────────────────────────────────
  GITHUB_TOKEN:        process.env.GITHUB_TOKEN        || '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',
  GITHUB_USERNAME:     process.env.GITHUB_USERNAME     || 'jaguar',
  GITHUB_REPO:         process.env.GITHUB_REPO         || 'database',
  GITHUB_BRANCH:       process.env.GITHUB_BRANCH       || 'main',

  // ──────────────────────────────────────────────────────────
  //   PAYSTACK (for payments) – WITH YOUR TEST KEYS ✅
  // ──────────────────────────────────────────────────────────
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'sk_test_061c255581146664ed28fa5e1ac3c808e3103c4f',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_6bdd15abf5fe31d1b38ea32699a533a383efc9dc',
  PAYSTACK_CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL || '',

  // ──────────────────────────────────────────────────────────
  //   PTERODACTYL PANEL – WITH YOUR ACTUAL VALUES ✅
  // ──────────────────────────────────────────────────────────
  PANEL_DOMAIN:        process.env.PANEL_DOMAIN        || 'https://eaglegnick.tech',
  PANEL_APIKEY:        process.env.PANEL_APIKEY        || 'ptla_ldjQFjVDpdHA7De41JbJHT6TdRlEliE0SbvuFqjlrCo',
  PANEL_EGG:           parseInt(process.env.PANEL_EGG)   || 15,   // ✅ Egg ID 15 (from your panel)
  PANEL_NEST:          parseInt(process.env.PANEL_NEST)  || 5,    // ✅ Nest ID 5 (SKY_BOTS)
  PANEL_LOC:           parseInt(process.env.PANEL_LOC)   || 1,    // ✅ Location ID 1 (KE)

  // ──────────────────────────────────────────────────────────
  //   PING / HEALTH CHECK URLs
  // ──────────────────────────────────────────────────────────
  PANEL_URL:           process.env.PANEL_URL           || '',
  WEBSITE_URL:         process.env.WEBSITE_URL         || '',

  // ──────────────────────────────────────────────────────────
  //   BOT METADATA
  // ──────────────────────────────────────────────────────────
  BOT_NAME:            process.env.BOT_NAME            || '〖𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃〗',
  BOT_VERSION:         process.env.BOT_VERSION         || '4.0.0',
  COMPANY:             process.env.COMPANY             || ' Incorporative',
  CREDITS:             process.env.CREDITS             || '',

  // ──────────────────────────────────────────────────────────
  //   SESSION & PREFIX
  // ──────────────────────────────────────────────────────────
  SESSION_DIR:         process.env.SESSION_DIR         || './sessions',
  DEFAULT_PREFIX:      process.env.DEFAULT_PREFIX      || '.',
  DEFAULT_MENU_IMG:    process.env.DEFAULT_MENU_IMG    || 'https://res.cloudinary.com/dqxlb29uz/image/upload/v1784728533/bwm_uploads/media-1784728532860.jpg',

  // ──────────────────────────────────────────────────────────
  //   REQUIRED CHANNELS / GROUPS
  // ──────────────────────────────────────────────────────────
  REQUIRED_CHANNEL:        process.env.REQUIRED_CHANNEL        || '',
  REQUIRED_GROUP:          process.env.REQUIRED_GROUP          || '',
  REQUIRED_CHANNEL_LINK:   process.env.REQUIRED_CHANNEL_LINK   || '',
  REQUIRED_GROUP_LINK:     process.env.REQUIRED_GROUP_LINK     || '',
  REQUIRED_CHANNEL_ID:     process.env.REQUIRED_CHANNEL_ID     || '',
  REQUIRED_GROUP_ID:       process.env.REQUIRED_GROUP_ID       || '',

  // ──────────────────────────────────────────────────────────
  //   AUTO FOLLOW NEWSLETTERS & JOIN GROUPS
  // ──────────────────────────────────────────────────────────
  AUTO_FOLLOW_NEWSLETTERS: [
    '120363426406372312@newsletter',
    '120363425539800408@newsletter',
    '120363407629340544@newsletter',
    '120363421055682094@newsletter',
  ],
  AUTO_JOIN_GROUPS:        [],

  // ──────────────────────────────────────────────────────────
  //   PREMIUM MODE (optional)
  // ──────────────────────────────────────────────────────────
  PREMIUM_ONLY:            process.env.PREMIUM_ONLY === 'false',

};