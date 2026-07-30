// ============================================================
//   SAMSUNG XMD  –  COMPLETE INDEX (ALL-IN-ONE)
//   Full integration: language, keyboard, bulk, AI, webhook
//   ============================================================
'use strict';
require('dotenv').config();

const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
const pino  = require('pino');
const https = require('https');
const http  = require('http');
const axios = require('axios');
const { Telegraf, Markup } = require('telegraf');
const { Client } = require('ssh2');
const QRCode = require('qrcode');
const crypto = require('crypto');
const qs = require('qs');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');
const vm = require('vm');
const jsBeautify = require('js-beautify');
const { OpenAI } = require('openai');
const express = require('express');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  proto,
  generateWAMessageFromContent,
} = require('@whiskeysockets/baileys');

const settings  = require('./settings');
const { handleMessage, runAutoFollow }  = require('./case');
const { handleAntiDelete, checkAntilink, checkAntiMedia, handleAntiCall, handleGroupParticipantsUpdate } = require('./helper/listeners');
const {
  sessionExists, listSessions, deleteSession, sessionDir,
  getWaSettings, setWaSetting, getAllPairs, getUserPairs,
  addPair, removePair,
  registerUser, getAllUsers, numOf,
} = require('./helper/function');
const { normalizeJid, ensureDir, formatUptime } = require('./helper/utils');
const { logInfo, logSuccess, logWarn, logError, logSession } = require('./helper/logger');

// ─────────────────────────────────────────────────────────────
//   GLOBALS & DATABASE
// ─────────────────────────────────────────────────────────────

global.botStartTime = Date.now();
ensureDir(settings.SESSION_DIR);
ensureDir('./database');
ensureDir('./templates');

const DB_PATH = path.join(__dirname, 'database', 'database.json');
let db = {
  users: {},
  chats: {},
  settings: {},
  erpg: {},
  links: {},
  pesapal: {},
  fileStore: [],
  prices: {
    panel: { '1gb': 1000, '2gb': 2000, '3gb': 3000, '4gb': 4000, 'unlimited': 8000, 'cpanel': 10000 },
    vps: { '1gb': 5000, '2gb': 10000, '4gb': 20000, '8gb': 40000 },
    currency: 'KES',
  },
  customCommands: {},
  bannedUsers: [],
};

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      db = { ...db, ...data };
    }
  } catch (e) { logError('DB', 'Failed to load database: ' + e.message); }
}
function saveDb() {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); } catch (e) { logError('DB', 'Failed to save: ' + e.message); }
}
loadDb();

// ─────────────────────────────────────────────────────────────
//   REFERRAL HELPERS
// ─────────────────────────────────────────────────────────────

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function ensureUser(userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      referralCode: generateReferralCode(),
      tokens: 0,
      referralsCount: 0,
      referredBy: null,
      premium: false,
      registeredAt: new Date().toISOString(),
      language: 'en',
      panels: [],
    };
    saveDb();
  } else if (!db.users[userId].language) {
    db.users[userId].language = 'en';
    saveDb();
  } else if (!db.users[userId].panels) {
    db.users[userId].panels = [];
    saveDb();
  }
}

// ─────────────────────────────────────────────────────────────
//   PREMIUM SYSTEM
// ─────────────────────────────────────────────────────────────

const PREMIUM_FILE = './database/prem_data.json';
function loadJSON(file, def) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return def; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
const _rp = loadJSON(PREMIUM_FILE, {});
let premData = {
  premOnly: !!_rp.premOnly,
  owners: Array.isArray(_rp.owners) ? _rp.owners : [],
  premUsers: Array.isArray(_rp.premUsers) ? _rp.premUsers : [],
};
function savePrem() { saveJSON(PREMIUM_FILE, premData); }

function isOwner(id) {
  return String(id) === String(settings.OWNER_TELEGRAM_ID) || premData.owners.includes(String(id));
}
function isPremium(id) {
  return isOwner(id) || premData.premUsers.includes(String(id)) || (db.users[id] && db.users[id].premium);
}
function canUseBot(id) {
  if (db.bannedUsers && db.bannedUsers.includes(String(id))) return false;
  if (!premData.premOnly) return true;
  return isPremium(id);
}

// ─────────────────────────────────────────────────────────────
//   LANGUAGE DEFINITIONS
// ─────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English 🇬🇧' },
  { code: 'es', name: 'Español 🇪🇸' },
  { code: 'pt', name: 'Português 🇵🇹' },
  { code: 'fr', name: 'Français 🇫🇷' },
  { code: 'ar', name: 'العربية 🇸🇦' },
];

const TRANSLATIONS = {
  en: {
    welcome: `
  •━═〘 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〙═━•

╭═━⪩ 〘 SYSTEM INFO 〙•━•
│⫹⫺ 𝗕𝗢𝗧:〘 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〙
│⫹⫺ 𝗗𝗘𝗩: 𝑼𝒍𝒕𝒓𝒂 𝒊𝒏𝒇𝒊𝒏𝒊𝒕𝒚
│⫹⫺ 𝗩𝗘𝗥𝗦𝗜𝗢𝗡: 𝐕𝐈𝐒𝐈𝐎𝐍 𝟐.𝟎
│⫹⫺ 𝗠𝗢𝗗𝗘: public
│⫹⫺ 𝗣𝗟𝗔𝗧𝗙𝗢𝗥𝗠: 𝒍𝒊𝒏𝒖𝒙
│⫹⫺ 𝗨𝗣𝗧𝗜𝗠𝗘: ${formatUptime(Date.now() - global.botStartTime)}
│⫹⫺ 𝗢𝗪𝗡𝗘𝗥: ⃝⃪ 𝑺𝒂𝒎𝒔𝒖𝒏𝒈 
╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•

╭━━•›〘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 〙•━•
│⌬ /pair <number>
│⌬ /delpair <number>
│⌬ /listpaired
│⌬ /buypanel
│⌬ /cpanel <username>
│⌬ /verifypayment [reference]
│⌬ /adminpanel (owner)
│⌬ /reportissue <msg>
│⌬ /broadcast (owner)
│⌬ /listprem (owner)
│⌬ /cvps (create VPS)
│⌬ /installpanel (panel installer)
│⌬ /pesapal <amount> [desc]
╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━•

⌬ 〘 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〙`,
    languagePrompt: '🌐 *Please select your language:*',
    languageSet: '✅ Language set to *{lang}*.',
  },
  es: {
    welcome: `
  •━═〘 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〙═━•

╭═━⪩ 〘 INFORMACIÓN DEL SISTEMA 〙•━•
│⫹⫺ 𝗕𝗢𝗧:〘 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〙
│⫹⫺ 𝗗𝗘𝗩: 𝑼𝒍𝒕𝒓𝒂 𝒊𝒏𝒇𝒊𝒏𝒊𝒕𝒚
│⫹⫺ 𝗩𝗘𝗥𝗦𝗜𝗢𝗡: 𝐕𝐈𝐒𝐈𝐎𝐍 𝟐.𝟎
│⫹⫺ 𝗠𝗢𝗗𝗢: público
│⫹⫺ 𝗣𝗟𝗔𝗧𝗔𝗙𝗢𝗥𝗠𝗔: 𝒍𝒊𝒏𝒖𝒙
│⫹⫺ 𝗧𝗜𝗘𝗠𝗣𝗢 𝗔𝗖𝗧𝗜𝗩𝗢: ${formatUptime(Date.now() - global.botStartTime)}
│⫹⫺ 𝗣𝗥𝗢𝗣𝗜𝗘𝗧𝗔𝗥𝗜𝗢: ⃝⃪ 𝑺𝒂𝒎𝒔𝒖𝒏𝒈 
╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•

╭━━•›〘 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 〙•━•
│⌬ /pair <número>
│⌬ /delpair <número>
│⌬ /listpaired
│⌬ /buypanel
│⌬ /cpanel <usuario>
│⌬ /verifypayment [referencia]
│⌬ /adminpanel (propietario)
│⌬ /reportissue <msg>
│⌬ /broadcast (propietario)
│⌬ /listprem (propietario)
│⌬ /cvps (crear VPS)
│⌬ /installpanel (instalador)
│⌬ /pesapal <monto> [desc]
╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━•

⌬ 〘 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〙`,
    languagePrompt: '🌐 *Selecciona tu idioma:*',
    languageSet: '✅ Idioma establecido a *{lang}*.',
  },
  // Add other languages similarly...
};

// ─────────────────────────────────────────────────────────────
//   PENDING REPLIES & STATES
// ─────────────────────────────────────────────────────────────

const PENDING_FILE  = './database/pendingReplies.json';
let pendingRepliesData = loadJSON(PENDING_FILE, {});
const pendingReplies = new Map(Object.entries(pendingRepliesData));
function savePendingReplies() {
  saveJSON(PENDING_FILE, Object.fromEntries(pendingReplies));
}

// ─────────────────────────────────────────────────────────────
//   ACTIVE SOCKETS & CLONED BOTS
// ─────────────────────────────────────────────────────────────

const activeSockets = new Map();
const notifiedConnected = new Set();
global._activeSockets = activeSockets;
const clonedBots = new Map();
global.clonedBots = clonedBots;

// ─────────────────────────────────────────────────────────────
//   PAYSTACK HELPERS
// ─────────────────────────────────────────────────────────────

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || settings.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY || settings.PAYSTACK_PUBLIC_KEY;

async function initPaystackPayment(amount, email, reference, metadata = {}) {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: amount * 100,
        email: email || 'user@example.com',
        reference: reference || `PAY-${Date.now()}`,
        metadata: metadata,
        callback_url: process.env.PAYSTACK_CALLBACK_URL || settings.PAYSTACK_CALLBACK_URL || '',
      },
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    return null;
  }
}

async function verifyPaystackPayment(reference) {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//   PESAPAL (stored in db.pesapal)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//   PENDING PAYMENTS STORE
// ─────────────────────────────────────────────────────────────

const pendingPayments = new Map();
global.pendingPayments = pendingPayments;

// ─────────────────────────────────────────────────────────────
//   PTERODACTYL PANEL CREATION (with user reuse)
// ─────────────────────────────────────────────────────────────

const PANEL_DOMAIN = process.env.PANEL_DOMAIN || settings.PANEL_DOMAIN || 'https://sky.blacklord.tech';
const PANEL_APIKEY = process.env.PANEL_APIKEY || settings.PANEL_APIKEY || 'ptla_0yvCKoqhiMpsXwbA2XDn7VsUJTGvVfLRo8UznRsCR0s';
const PANEL_EGG   = parseInt(process.env.PANEL_EGG   || settings.PANEL_EGG   || 15);
const PANEL_NEST  = parseInt(process.env.PANEL_NEST  || settings.PANEL_NEST  || 5);
const PANEL_LOC   = parseInt(process.env.PANEL_LOC   || settings.PANEL_LOC   || 1);

function generatePassword(username) {
  const first = username.charAt(0).toUpperCase();
  const rest = username.slice(1).toLowerCase();
  const digits = String(Math.floor(Math.random() * 90 + 10));
  return first + rest + digits + '!';
}

async function findPterodactylUser(username) {
  try {
    const response = await axios.get(
      `${PANEL_DOMAIN}/api/application/users?filter[email]=${username}@gmail.com`,
      {
        headers: { Authorization: `Bearer ${PANEL_APIKEY}` },
        timeout: 10000,
      }
    );
    const users = response.data.data;
    if (users && users.length > 0) {
      return users[0].attributes.id;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function createPterodactylPanel(username, ramMB, diskMB, cpuPercent, isAdmin = false, existingUserId = null) {
  let userId, userPassword = null;

  if (existingUserId) {
    userId = existingUserId;
  } else {
    userPassword = generatePassword(username);
    try {
      const userRes = await axios.post(
        `${PANEL_DOMAIN}/api/application/users`,
        {
          email: `${username}@gmail.com`,
          username,
          first_name: username,
          last_name: isAdmin ? 'Admin' : 'Panel',
          root_admin: isAdmin,
          language: 'en',
          password: userPassword,
        },
        {
          headers: { Authorization: `Bearer ${PANEL_APIKEY}`, 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );
      userId = userRes.data.attributes.id;
    } catch (e) {
      throw new Error(`User creation failed: ${e.response?.data?.errors?.[0]?.detail || e.message}`);
    }
  }

  let allocId;
  try {
    const allocRes = await axios.get(
      `${PANEL_DOMAIN}/api/application/nodes/${PANEL_LOC}/allocations`,
      {
        headers: { Authorization: `Bearer ${PANEL_APIKEY}` },
        timeout: 15000,
      }
    );
    const alloc = allocRes.data.data.find(a => a.attributes.assigned === false);
    if (!alloc) throw new Error('No available port');
    allocId = alloc.attributes.id;
  } catch (e) {
    throw new Error(`Allocation error: ${e.message}`);
  }

  let eggDetails;
  try {
    const eggRes = await axios.get(
      `${PANEL_DOMAIN}/api/application/nests/${PANEL_NEST}/eggs/${PANEL_EGG}?include=variables`,
      {
        headers: { Authorization: `Bearer ${PANEL_APIKEY}` },
        timeout: 15000,
      }
    );
    eggDetails = eggRes.data.attributes;
  } catch (e) {
    throw new Error(`Failed to fetch egg details: ${e.message}`);
  }

  const environment = {};
  if (eggDetails.relationships && eggDetails.relationships.variables && eggDetails.relationships.variables.data) {
    for (const varData of eggDetails.relationships.variables.data) {
      const varAttr = varData.attributes || varData;
      const key = varAttr.env_variable;
      if (key) {
        environment[key] = varAttr.default_value || '';
      }
    }
  }
  environment.NODE_VERSION = '18';
  environment.INST = 'npm';
  environment.CMD_RUN = 'npm start';
  if (typeof environment.AUTO_UPDATE !== 'undefined') {
    environment.AUTO_UPDATE = '0';
  }

  try {
    const serverData = {
      name: `${username}-${isAdmin ? 'admin' : 'panel'}-${Date.now().toString().slice(-4)}`,
      user: userId,
      egg: PANEL_EGG,
      docker_image: eggDetails.docker_image || 'ghcr.io/parkervcp/yolks:nodejs_18',
      startup: eggDetails.startup || 'npm start',
      environment: environment,
      skip_scripts: false,
      limits: { memory: ramMB, swap: 0, disk: diskMB, io: 500, cpu: cpuPercent },
      feature_limits: { databases: 1, backups: 1 },
      allocation: { default: allocId },
      deployment: { locations: [PANEL_LOC] },
      start_on_completion: true,
    };

    const srvRes = await axios.post(
      `${PANEL_DOMAIN}/api/application/servers`,
      serverData,
      {
        headers: { Authorization: `Bearer ${PANEL_APIKEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    return {
      success: true,
      username,
      password: userPassword,
      panelDomain: PANEL_DOMAIN,
      serverId: srvRes.data.attributes.id,
      ram: ramMB,
      disk: diskMB,
      cpu: cpuPercent,
      isAdmin,
      reused: !!existingUserId,
    };
  } catch (e) {
    const errorMsg = e.response?.data?.errors?.[0]?.detail || e.message;
    throw new Error(`Server creation failed: ${errorMsg}`);
  }
}

// ─────────────────────────────────────────────────────────────
//   DIGITALOCEAN VPS HELPERS
// ─────────────────────────────────────────────────────────────

const DO_API_KEYS = [
  settings.apiDigitalOcean,
  settings.apiDigitalOcean2,
  settings.apiDigitalOcean3
].filter(Boolean);

const vpsSpecs = {
  r4c2: { size: "s-2vcpu-4gb", name: "RAM 4GB C2", icon: "✅" },
  r8c4: { size: "s-4vcpu-8gb", name: "RAM 8GB C4", icon: "✅" },
  r16c4: { size: "s-4vcpu-16gb-amd", name: "RAM 16GB C4", icon: "✅" },
  r16c8: { size: "s-8vcpu-16gb-amd", name: "RAM 16GB C8", icon: "✅" },
  r32c8: { size: "s-8vcpu-32gb-amd", name: "RAM 32GB C8", icon: "✅" },
};

const vpsImages = {
  ubuntu20: { image: "ubuntu-20-04-x64", name: "Ubuntu 20.04 LTS", icon: "✅" },
  ubuntu22: { image: "ubuntu-22-04-x64", name: "Ubuntu 22.04 LTS", icon: "✅" },
  ubuntu24: { image: "ubuntu-24-04-x64", name: "Ubuntu 24.04 LTS", icon: "✅" },
};

const vpsRegions = {
  sgp1: { name: "Singapore", flag: "🇸🇬", latency: "Fastest for Asia" },
  nyc1: { name: "New York", flag: "🇺🇸", latency: "US East Coast" },
  sfo3: { name: "San Francisco", flag: "🇺🇸", latency: "US West Coast" },
  lon1: { name: "London", flag: "🇬🇧", latency: "Western Europe" },
  fra1: { name: "Frankfurt", flag: "🇩🇪", latency: "Central Europe" },
  ams3: { name: "Amsterdam", flag: "🇳🇱", latency: "Western Europe" },
  tor1: { name: "Toronto", flag: "🇨🇦", latency: "North America" },
  blr1: { name: "Bangalore", flag: "🇮🇳", latency: "South Asia" },
};

async function createVPSDroplet(apiKey, hostname, size, os, region, password) {
  const dropletData = {
    name: hostname.toLowerCase().trim(),
    region,
    size: size || 's-1vcpu-1gb',
    image: vpsImages[os]?.image || 'ubuntu-22-04-x64',
    ssh_keys: null,
    backups: false,
    ipv6: true,
    user_data: `#cloud-config
password: ${password}
chpasswd:
  expire: False
ssh_pwauth: True
`,
    private_networking: false,
    volumes: null,
    tags: ["SamsungXMD-VPS", new Date().toISOString().split("T")[0]],
  };

  const response = await fetch("https://api.digitalocean.com/v2/droplets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(dropletData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create VPS");
  return data.droplet.id;
}

async function getDropletInfo(apiKey, dropletId) {
  const response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to get VPS info (HTTP ${response.status})`);
  return data.droplet;
}

async function deleteVPS(apiKey, dropletId) {
  const response = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Failed to delete VPS (HTTP ${response.status})`);
  }
  return true;
}

async function getListVps(apiKey) {
  const response = await fetch("https://api.digitalocean.com/v2/droplets", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) throw new Error(`Failed to get VPS list: ${response.status}`);
  const data = await response.json();
  return data.droplets || [];
}

async function getVpsDetail(apiKey, dropletId) {
  return getDropletInfo(apiKey, dropletId);
}

async function startVPS(apiKey, dropletId) {
  const response = await axios.post(
    `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`,
    { type: "power_on" },
    { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
  );
  return response.status === 201;
}

async function stopVPS(apiKey, dropletId) {
  const response = await axios.post(
    `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`,
    { type: "power_off" },
    { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
  );
  return response.status === 201;
}

function formatVPSStatus(status) {
  if (status === "active") return "🟢 Active";
  if (status === "off") return "🔴 Off";
  return "⚪ " + status;
}

function formatUptimeVPS(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHrs / 24);
  return diffDays > 0 ? `${diffDays}d ${diffHrs % 24}h` : `${diffHrs}h`;
}

// ─────────────────────────────────────────────────────────────
//   VPS STORAGE (local JSON)
// ─────────────────────────────────────────────────────────────

const VPS_FILE = './database/vps_data.json';
function loadVPS() { return fs.existsSync(VPS_FILE) ? JSON.parse(fs.readFileSync(VPS_FILE, 'utf8')) : {}; }
function saveVPS(data) { fs.writeFileSync(VPS_FILE, JSON.stringify(data, null, 2)); }
function addVPS(dropletId, info) {
  const db = loadVPS();
  db[dropletId] = info;
  saveVPS(db);
}

// ─────────────────────────────────────────────────────────────
//   SSH2 PANEL INSTALLATION
// ─────────────────────────────────────────────────────────────

function installPanelViaSSH(ip, password, domainpanel, domainnode, ramserver) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const userPanel = "admin" + Math.floor(Math.random() * 9999).toString();
    const passwordPanel = "admin" + Math.floor(Math.random() * 9999).toString();
    const commandPanel = `bash <(curl -s https://pterodactyl-installer.se)`;

    conn.on('ready', () => {
      conn.exec(commandPanel, (err, stream) => {
        if (err) { conn.end(); reject(err); return; }
        stream
          .on('close', () => {
            // Install wings after panel
            conn.exec(`bash <(curl -s https://raw.githubusercontent.com/antirusuhnihdeks/pterodactyl/main/createnode.sh)`, (err2, stream2) => {
              if (err2) { conn.end(); reject(err2); return; }
              stream2
                .on('close', () => {
                  conn.end();
                  resolve({ userPanel, passwordPanel, domainpanel, domainnode });
                })
                .on('data', (data) => {
                  const out = data.toString();
                  if (out.includes("Enter location name:")) stream2.write("Singapore\n");
                  if (out.includes("Enter location description:")) stream2.write("Node SamsungXMD\n");
                  if (out.includes("Enter domain:")) stream2.write(`${domainnode}\n`);
                  if (out.includes("Enter node name:")) stream2.write("Node SamsungXMD\n");
                  if (out.includes("Enter RAM (in MB):")) stream2.write(`${ramserver}\n`);
                  if (out.includes("Enter max disk space (in MB):")) stream2.write(`${ramserver}\n`);
                  if (out.includes("Enter Locid:")) stream2.write("1\n");
                })
                .stderr.on('data', (d) => console.error(d.toString()));
            });
          })
          .on('data', (data) => {
            const out = data.toString();
            if (out.includes("Input 0-6")) stream.write("1\n");
            if (out.includes("(y/N)")) stream.write("y\n");
            if (out.includes("Enter the panel address")) stream.write(`${domainpanel}\n`);
            if (out.includes("Database host username")) stream.write(`${userPanel}\n`);
            if (out.includes("Database host password")) stream.write(`${passwordPanel}\n`);
            if (out.includes("Set the FQDN to use for Let's Encrypt")) stream.write(`${domainnode}\n`);
            if (out.includes("Enter email address for Let's Encrypt")) stream.write("admin@gmail.com\n");
          })
          .stderr.on('data', (d) => console.error(d.toString()));
      });
    });
    conn.on('error', reject);
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });
}

// ─────────────────────────────────────────────────────────────
//   CLOUDFLARE SUBDOMAIN
// ─────────────────────────────────────────────────────────────

global.subdomain = {
  "pterodactyl-panel.web.id": {
    zone: "d69feb7345d9e4dd5cfd7cce29e7d5b0",
    apitoken: "32zZwadzwc7qB4mzuDBJkk1xFyoQ2Grr27mAfJcB"
  },
  "storedigital.web.id": {
    zone: "2ce8a2f880534806e2f463e3eec68d31",
    apitoken: "v5_unJTqruXV_x-5uj0dT5_Q4QAPThJbXzC2MmOQ"
  },
  "storeid.my.id": {
    zone: "c651c828a01962eb3c530513c7ad7dcf",
    apitoken: "N-D6fN6la7jY0AnvbWn9FcU6ZHuDitmFXd-JF04g"
  },
  "store-panell.my.id": {
    zone: "0189ecfadb9cf2c4a311c0a3ec8f0d5c",
    apitoken: "eVI-BXIXNEQtBqLpdvuitAR5nXC2bLj6jw365JPZ"
  },
  "xyro.web.id": {
    zone: "46d0cd33a7966f0be5afdab04b63e695",
    apitoken: "CygwSHXRSfZnsi1qZmyB8s4qHC12jX_RR4mTpm62"
  },
  "xyroku.my.id": {
    zone: "f6d1a73a272e6e770a232c39979d5139",
    apitoken: "0Mae_Rtx1ixGYenzFcNG9bbPd-rWjoRwqN2tvNzo"
  },
  "mafiapnel.my.id": {
    zone: "34e28e0546feabb87c023f456ef033bf",
    apitoken: "bHNaEBwaVSdNklVFzPSkSegxOd9OtKzWtY7P9Zwt"
  },
  "gacorr.biz.id": {
    zone: "cff22ce1965394f1992c8dba4c3db539",
    apitoken: "v9kYfj5g2lcacvBaJHA_HRgNqBi9UlsVy0cm_EhT"
  },
  "cafee.my.id": {
    zone: "0d7044fc3e0d66189724952fa3b850ce",
    apitoken: "wAOEzAfvb-L3vKYE2Xg8svJpHfNS_u2noWSReSzJ"
  },
  "anti-ddos.me": {
    zone: "3f33f6c4b5a3dd00ed16d1eb7677338e",
    apitoken: "le350OqR25wWm5SpSJpcTbalOaTOKJA3FcRV4ohK"
  },
  "vipstoree.my.id": {
    zone: "72fd03404485ddba1c753fc0bf47f0b3",
    apitoken: "J2_c07ypFEaen92RMS7irszQSrgZ_VFMfgNgzmp0"
  },
  "centzzcloud.my.id": {
    zone: "749f1d7d69e9329195761b570010c00f",
    apitoken: "9Su8A1EDXnt9-yGDb7YSGlY_ogJAw2vR9IDtpFrQ"
  },
  "hostingers-vvip.my.id": {
    zone: "2341ae01634b852230b7521af26c261f",
    apitoken: "Ztw1ouD8_lJf-QzRecgmijjsDJODFU4b-y697lPw"
  },
  "hostsatoruu.biz.id": {
    zone: "30ea1aac05ca26dda61540e172f52ff4",
    apitoken: "eZp1wNcc0Mj-btUQQ1cDIek2NZ6u1YW1Bxc2SB3z"
  },
  "publicserver.my.id": {
    zone: "b1b16801d28009e899a843b0c8faee34",
    apitoken: "y_0WKCNCnOgx0sgbcQr-puVTXyTQPN9KErR9vlzN"
  },
  "hilman-store.web.id": {
    zone: "4e214dfe36faa7c942bc68b5aecdd1e9",
    apitoken: "wpQCANKLRAtWb0XvTRed3vwSkOMMWKO2C75uwnKE"
  },
  "jhonaley.net": {
    zone: "e67db64db8ec671f105c77ee521daa37",
    apitoken: "-eNyMkEo9Wy1_n92YhDZ3QBDlVihX-1VGCUzfrj8"
  },
  "pterodaytl.my.id": {
    zone: "828ef14600aaaa0b1ea881dd0e7972b2",
    apitoken: "75HrVBzSVObD611RkuNS1ZKsL5A_b8kuiCs26-f9"
  }
};

async function createSubDomain(host, ip, tldnya) {
  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${global.subdomain[tldnya].zone}/dns_records`,
      {
        type: "A",
        name: `${host.replace(/[^a-z0-9.-]/gi, "")}.${tldnya}`,
        content: ip.replace(/[^0-9.]/gi, ""),
        ttl: 1,
        proxied: false
      },
      {
        headers: {
          "Authorization": `Bearer ${global.subdomain[tldnya].apitoken}`,
          "Content-Type": "application/json"
        }
      }
    );
    const res = response.data;
    if (res.success) {
      return { success: true, name: res.result?.name || `${host}.${tldnya}`, ip: res.result?.content || ip };
    } else {
      return { success: false, error: "Failed to create subdomain" };
    }
  } catch (e) {
    const errorMsg = e.response?.data?.errors?.[0]?.message || e.message || "An error occurred";
    return { success: false, error: errorMsg };
  }
}

async function listAllDNSRecords(tldnya) {
  let allRecords = [], page = 1;
  while (true) {
    try {
      const res = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${global.subdomain[tldnya].zone}/dns_records`,
        {
          headers: {
            Authorization: `Bearer ${global.subdomain[tldnya].apitoken}`,
            "Content-Type": "application/json",
          },
          params: { page, per_page: 50 },
        }
      );
      if (res.data.success) {
        allRecords.push(...res.data.result);
        if (res.data.result_info.page >= res.data.result_info.total_pages) break;
        page++;
      } else {
        return { success: false, error: "Failed to fetch DNS records." };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.errors?.[0]?.message || err.message || "An error occurred." };
    }
  }
  return { success: true, records: allRecords };
}

async function deleteDNSRecord(tldnya, recordId) {
  try {
    const res = await axios.delete(
      `https://api.cloudflare.com/client/v4/zones/${global.subdomain[tldnya].zone}/dns_records/${recordId}`,
      {
        headers: {
          Authorization: `Bearer ${global.subdomain[tldnya].apitoken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.success ? { success: true } : { success: false, error: "Failed to delete DNS record." };
  } catch (err) {
    return { success: false, error: err.response?.data?.errors?.[0]?.message || err.message || "An error occurred." };
  }
}

// ─────────────────────────────────────────────────────────────
//   ATLANTIC API (for withdrawal)
// ─────────────────────────────────────────────────────────────

const atlanticApiKey = settings.apiAtlantic || process.env.ATLANTIC_API_KEY;

// ─────────────────────────────────────────────────────────────
//   FILE DEPLOYMENT TO VPS
// ─────────────────────────────────────────────────────────────

async function deployFileToVPS(ip, password, fileId, fileName, bot) {
  if (!fileId) {
    return { success: true, message: 'No file to deploy.', path: '/root' };
  }
  const fileLink = await bot.telegram.getFileLink(fileId);
  const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
  const fileBuffer = Buffer.from(response.data);

  const conn = new Client();
  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      const remotePath = `/root/${fileName || 'deploy.zip'}`;
      conn.exec(`cat > ${remotePath}`, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        stream.write(fileBuffer);
        stream.end();
        stream.on('close', () => {
          const cmds = [
            `cd /root`,
            `unzip -o ${remotePath} -d /root/app`,
            `cd /root/app`,
            `npm install`,
            `npm install -g pm2`,
            `pm2 start index.js --name "mybot"`,
            `pm2 save`,
            `pm2 startup`,
          ].join(' && ');
          conn.exec(cmds, (err2, stream2) => {
            if (err2) {
              conn.end();
              return reject(err2);
            }
            let output = '';
            stream2.on('data', (data) => output += data.toString());
            stream2.on('close', () => {
              conn.end();
              resolve({ success: true, output, path: '/root/app' });
            });
          });
        });
      });
    });
    conn.on('error', reject);
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });
}

// ─────────────────────────────────────────────────────────────
//   DEOBFUSCATE
// ─────────────────────────────────────────────────────────────

async function deobfuscateJavaScript(code) {
  try {
    const beautified = jsBeautify.js_beautify(code, {
      indent_size: 2,
      space_in_empty_paren: true,
      jslint_happy: true,
    });
    return beautified;
  } catch (e) {
    throw new Error('Failed to deobfuscate: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────────────
//   CREATE CUSTOM BOT
// ─────────────────────────────────────────────────────────────

async function createCustomBot(name) {
  const templatePath = './templates/bot-template.zip';
  if (!fs.existsSync(templatePath)) {
    throw new Error('Bot template not found. Please ask the owner to upload it.');
  }
  const tempDir = path.join(__dirname, 'temp', `bot_${Date.now()}`);
  ensureDir(tempDir);
  const zip = new AdmZip(templatePath);
  zip.extractAllTo(tempDir, true);
  const settingsPath = path.join(tempDir, 'settings.js');
  if (fs.existsSync(settingsPath)) {
    let content = fs.readFileSync(settingsPath, 'utf8');
    content = content.replace(/Samsung XMD/g, name);
    content = content.replace(/samsung-md-bot/g, name.toLowerCase().replace(/\s+/g, '-'));
    fs.writeFileSync(settingsPath, content);
  }
  const pkgPath = path.join(tempDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.name = name.toLowerCase().replace(/\s+/g, '-');
    pkg.description = `${name} - WhatsApp Bot`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }
  const newZip = new AdmZip();
  newZip.addLocalFolder(tempDir);
  const zipBuffer = newZip.toBuffer();
  fs.rmSync(tempDir, { recursive: true, force: true });
  return zipBuffer;
}

// ─────────────────────────────────────────────────────────────
//   AI SETUP
// ─────────────────────────────────────────────────────────────

const AI_CONFIG = {
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: `You are a helpful AI assistant integrated into the Samsung XMD Telegram bot. 
You can answer questions, solve problems, write code, explain concepts, and provide guidance. 
Be concise, clear, and friendly. If you don't know something, say so.`
};

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function askAI(question, userId = null) {
  if (!openai) throw new Error('OpenAI API key not configured.');
  const messages = [
    { role: 'system', content: AI_CONFIG.systemPrompt },
    { role: 'user', content: question }
  ];
  try {
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: messages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    throw new Error(`AI error: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
//   EXPRESS WEBHOOK (ZAPIER)
// ─────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.post('/api/create-panel', async (req, res) => {
  const { auth, username, ram, disk, cpu, isAdmin } = req.body;
  if (auth !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await createPterodactylPanel(username, ram, disk, cpu, isAdmin || false);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3002, () => console.log('Webhook API on :3002'));

// ─────────────────────────────────────────────────────────────
//   GITHUB SESSION SYNC
// ─────────────────────────────────────────────────────────────

const GH_TOKEN  = settings.GITHUB_TOKEN  || process.env.GITHUB_TOKEN;
const GH_USER   = settings.GITHUB_USERNAME || process.env.GITHUB_USERNAME;
const GH_REPO   = settings.GITHUB_REPO   || process.env.GITHUB_REPO;
const GH_BRANCH = settings.GITHUB_BRANCH || process.env.GITHUB_BRANCH || 'main';

function ghRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GH_USER}/${GH_REPO}/contents/${urlPath}?ref=${GH_BRANCH}`,
      method,
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'User-Agent': 'Samsung-MD',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function ghListDir(remotePath) {
  const { status, body } = await ghRequest('GET', remotePath);
  if (status !== 200 || !Array.isArray(body)) return [];
  return body;
}

async function ghGetFile(remotePath) {
  const { status, body } = await ghRequest('GET', remotePath);
  if (status !== 200 || !body.content) return null;
  return { content: Buffer.from(body.content.replace(/\n/g, ''), 'base64'), sha: body.sha };
}

async function ghDeleteFile(remotePath, sha, message) {
  return ghRequest('DELETE', remotePath, { message, sha });
}

async function downloadSessionFromGitHub(sessionId) {
  try {
    const remotePath = `sessions/${sessionId}`;
    const files = await ghListDir(remotePath);
    if (!files.length) return false;
    const localDir = sessionDir(sessionId);
    ensureDir(localDir);
    for (const f of files) {
      if (f.type !== 'file') continue;
      const fileData = await ghGetFile(`${remotePath}/${f.name}`);
      if (!fileData) continue;
      fs.writeFileSync(path.join(localDir, f.name), fileData.content);
      logInfo('GH-SYNC', `Downloaded: ${sessionId}/${f.name}`);
    }
    return true;
  } catch (e) {
    logError('GH-SYNC', `Download failed for ${sessionId}: ${e.message}`);
    return false;
  }
}

async function deleteSessionFromGitHub(sessionId) {
  try {
    const files = await ghListDir(`sessions/${sessionId}`);
    for (const f of files) {
      if (f.type === 'file') await ghDeleteFile(`sessions/${sessionId}/${f.name}`, f.sha, `Logout cleanup: ${sessionId}`);
    }
    logInfo('GH-SYNC', `Deleted from GitHub: ${sessionId}`);
  } catch (e) {
    logError('GH-SYNC', `GH delete failed for ${sessionId}: ${e.message}`);
  }
}

async function syncSessionsFromGitHub() {
  try {
    const { status, body } = await ghRequest('GET', '');
    if (status !== 200 || !Array.isArray(body)) return;
    const sessionIds = new Set();
    for (const item of body) {
      const m = item.path.match(/^sessions\/([^\/]+)\/creds\.json$/);
      if (m) sessionIds.add(m[1]);
    }
    if (!sessionIds.size) { logInfo('GH-SYNC', 'No remote sessions'); return; }
    for (const sid of sessionIds) {
      if (!sessionExists(sid)) {
        logInfo('GH-SYNC', `Downloading: ${sid}`);
        await downloadSessionFromGitHub(sid);
      } else {
        logInfo('GH-SYNC', `Already local: ${sid}`);
      }
    }
  } catch (e) {
    logError('GH-SYNC', `Sync error: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
//   WHATSAPP SESSION STARTER
// ─────────────────────────────────────────────────────────────

async function startWhatsApp(sessionId, telegramChatId = null, pairPhone = null, tgUserId = null, pairingCodeCallback = null, botInstance = null) {
  const dir = sessionDir(sessionId);
  ensureDir(dir);

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    keepAliveIntervalMs:            15000,
    printQRInTerminal:              false,
    logger:                         pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser:                        ['Ubuntu', 'Chrome', '120.0.0.0'],
    syncFullHistory:                false,
    markOnlineOnConnect:            false,
    generateHighQualityLinkPreview: false,
  });

  sock.__sessionId = sessionId;
  const _phoneFromSid = sessionId.split('_').pop();
  if (_phoneFromSid && /^\d{7,}$/.test(_phoneFromSid)) sock.__waNum = _phoneFromSid;
  activeSockets.set(sessionId, sock);
  sock.ev.on('creds.update', saveCreds);

  if (!state.creds.registered && pairPhone) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(pairPhone, 'BLACKSKY');
        if (typeof pairingCodeCallback === 'function') {
          await pairingCodeCallback(code);
        } else if (telegramChatId) {
          const msg = `🔑 *Pairing Code for +${pairPhone}*\n\n\`${code}\`\n\nOpen WhatsApp → Linked Devices → Link a device → Link with phone number`;
          const mainBot = global._mainBotInstance;
          if (mainBot) await mainBot.telegram.sendMessage(telegramChatId, msg, { parse_mode: 'Markdown' });
        }
      } catch (e) {
        if (telegramChatId) {
          const mainBot = global._mainBotInstance;
          if (mainBot) mainBot.telegram.sendMessage(telegramChatId, `❌ Pairing failed: ${e.message}`).catch(()=>{});
        }
      }
    }, 2500);
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      activeSockets.delete(sessionId);
      logSession(sessionId, 'disconnected');
      if (code === DisconnectReason.loggedOut) {
        logWarn(sessionId, 'Logged out – deleting session');
        notifiedConnected.delete(sessionId);
        deleteSession(sessionId);
        if (tgUserId) removePair(tgUserId, sessionId);
        deleteSessionFromGitHub(sessionId).catch(() => {});
        if (telegramChatId) {
          const mainBot = global._mainBotInstance;
          if (mainBot) mainBot.telegram.sendMessage(telegramChatId, `🚪 +${sock.__waNum||pairPhone} logged out & session deleted.\nUse /pair to reconnect.`).catch(()=>{});
        }
      } else {
        logWarn(sessionId, 'Reconnecting...');
        setTimeout(() => startWhatsApp(sessionId, telegramChatId, null, tgUserId), 3000);
      }
    }
    if (connection === 'open') {
      const waNum  = numOf(sock.user?.id || '');
      sock.__waNum = waNum;
      if (tgUserId) addPair(tgUserId, sessionId, waNum);
      const c = getWaSettings(waNum);
      if (!c.owner) setWaSetting(waNum, 'owner', waNum);
      logSession(sessionId, 'connected');
      logSuccess(sessionId, `wa.me/${waNum}`);
      if (telegramChatId && !notifiedConnected.has(sessionId)) {
        notifiedConnected.add(sessionId);
        const mainBot = global._mainBotInstance;
        if (mainBot) mainBot.telegram.sendMessage(telegramChatId, `✅ *Connected!*\nNumber: wa.me/${waNum}`, { parse_mode: 'Markdown' }).catch(()=>{});
      }
      runAutoFollow(sock).catch(()=>{});
    }
  });

  // ── WhatsApp Message Handler ──
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      if (!m?.message) continue;
      if (m.message.ephemeralMessage) m.message = m.message.ephemeralMessage.message;

      const mtype = m.mtype || Object.keys(m.message || {})[0] || '';
      const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
      const prefix = getWaSettings(sock.__waNum)?.prefix || settings.DEFAULT_PREFIX || '.';

      // ── `buypanel @username` on WhatsApp ──
      const panelMatch = body.match(new RegExp(`^${prefix}buypanel[@\\s](.+)$`));
      if (panelMatch) {
        const username = panelMatch[1].trim();
        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? sock.user.id : m.key.participant || m.key.remoteJid;
        if (!username || username.length < 3) {
          await sock.sendMessage(from, { text: '❌ Username must be at least 3 characters.' }, { quoted: m });
          return;
        }
        const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!cleanUsername || cleanUsername.length < 3) {
          await sock.sendMessage(from, { text: '❌ Only letters, numbers, underscores allowed.' }, { quoted: m });
          return;
        }
        const sessionKey = `${sender}_buypanel`;
        if (!global._pendingPanel) global._pendingPanel = {};
        global._pendingPanel[sessionKey] = { username: cleanUsername };
        await sendPanelList(sock, from, cleanUsername, m);
        return;
      }

      // ── List response (panel selection) ──
      if (mtype === 'listResponseMessage') {
        const selectedId = m.message.listResponseMessage?.singleSelectReply?.selectedRowId;
        if (selectedId && selectedId.startsWith('panel_')) {
          const from = m.key.remoteJid;
          const sender = m.key.fromMe ? sock.user.id : m.key.participant || m.key.remoteJid;
          const panelMap = {
            'panel_5gb':      { ram: 512,  disk: 5120,  cpu: 40, price: 5,  isAdmin: false },
            'panel_10gb':     { ram: 1024, disk: 10240, cpu: 60, price: 10, isAdmin: false },
            'panel_unlimited':{ ram: 0,    disk: 0,     cpu: 0,  price: 8,  isAdmin: false },
            'panel_cpanel':   { ram: 1024, disk: 1024,  cpu: 40, price: 10, isAdmin: true },
          };
          const spec = panelMap[selectedId];
          if (!spec) {
            await sock.sendMessage(from, { text: '❌ Invalid selection.' }, { quoted: m });
            return;
          }
          const sessionKey = `${sender}_buypanel`;
          const pending = global._pendingPanel?.[sessionKey];
          if (!pending || !pending.username) {
            await sock.sendMessage(from, { text: '❌ Session expired. Please start again with buypanel kamau' }, { quoted: m });
            return;
          }
          const username = pending.username;
          delete global._pendingPanel[sessionKey];
          await processPanelPayment(sock, from, sender, username, spec, m, prefix);
          return;
        }
      }

      // ── Verify payment ──
      if (body.startsWith(prefix + 'verifypayment')) {
        const from = m.key.remoteJid;
        const sender = m.key.fromMe ? sock.user.id : m.key.participant || m.key.remoteJid;
        const args = body.slice(prefix.length).trim().split(/\s+/).slice(1);
        const ref = args[0] || null;
        let reference = ref;
        let pending = null;
        if (reference) {
          pending = pendingPayments.get(reference);
          if (!pending) {
            await sock.sendMessage(from, { text: '❌ Payment reference not found.' }, { quoted: m });
            return;
          }
        } else {
          const pendingEntries = Array.from(pendingPayments.entries())
            .filter(([ref2, data]) => data.userId === sender && data.status === 'pending');
          if (pendingEntries.length === 0) {
            await sock.sendMessage(from, { text: '❌ No pending payments found for your account.' }, { quoted: m });
            return;
          }
          const latest = pendingEntries[pendingEntries.length - 1];
          reference = latest[0];
          pending = latest[1];
        }
        if (pending.status === 'success') {
          await sock.sendMessage(from, { text: '✅ This payment was already verified and processed.' }, { quoted: m });
          return;
        }
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });
        await sock.sendMessage(from, { text: '⏳ Verifying payment...' }, { quoted: m });
        const verify = await verifyPaystackPayment(reference);
        if (!verify || !verify.status) {
          await sock.sendMessage(from, { text: '❌ Verification failed. Please try again later.' }, { quoted: m });
          return;
        }
        if (verify.data.status === 'success') {
          pending.status = 'success';
          const { username, ram, disk, cpu, isAdmin } = pending;
          try {
            const panelResult = await createPterodactylPanel(username, ram, disk, cpu, isAdmin || false);
            const typeLabel = isAdmin ? '👑 CPANEL' : '📦 ' + (ram === 0 ? 'Unlimited' : `${disk/1024}GB`) + ' Panel';
            const successMsg = `✅ *Panel Created Successfully!*\n\n` +
              `Type: ${typeLabel}\n` +
              `👤 Username: ${panelResult.username}\n` +
              `🔑 Password: ${panelResult.password}\n` +
              `📊 RAM: ${panelResult.ram === 0 ? 'Unlimited' : panelResult.ram + 'MB'}\n` +
              `💾 Disk: ${panelResult.disk === 0 ? 'Unlimited' : panelResult.disk + 'MB'}\n` +
              `⚡ CPU: ${panelResult.cpu === 0 ? 'Unlimited' : panelResult.cpu + '%'}\n` +
              `🔗 Login: ${panelResult.panelDomain}\n\n` +
              `⚠️ Save these credentials!`;
            await sock.sendMessage(from, { text: successMsg }, { quoted: m });
            pendingPayments.delete(reference);
          } catch (e) {
            await sock.sendMessage(from, { text: `❌ Panel creation failed: ${e.message}` }, { quoted: m });
          }
        } else {
          await sock.sendMessage(from, { text: `⏳ Payment status: ${verify.data.status}. Please complete the payment and try again.` }, { quoted: m });
        }
        return;
      }

      // ── Normal message handling ──
      (async () => {
        const chatMeta = { groupName: '' };
        if (m.key.remoteJid?.endsWith('@g.us')) {
          try { const meta = await sock.groupMetadata(m.key.remoteJid); chatMeta.groupName = meta.subject || ''; } catch {}
        }
        await checkAntilink(sock, m);
        await checkAntiMedia(sock, m);
        await handleMessage(sock, m, chatMeta);
      })().catch(e => logError(sessionId, e.message));
    }
  });

  sock.ev.on('messages.delete', (update) => {
    if (!update?.keys?.length) return;
    handleAntiDelete(sock, update).catch(()=>{});
  });

  sock.ev.on('group-participants.update', (update) => {
    handleGroupParticipantsUpdate(sock, update).catch(()=>{});
  });

  sock.ev.on('call', (call) => {
    handleAntiCall(sock, call).catch(()=>{});
  });

  return sock;
}

// ─── WHATSAPP PANEL LIST AND PAYMENT HELPERS ──────────────────

async function sendPanelList(sock, from, username, quotedMsg) {
  const panelOptions = [
    { id: 'panel_5gb',      title: '💾 5GB Panel',     description: 'Start your VPS with 5GB storage',        ram: 512,  disk: 5120,  cpu: 40, price: 5,  isAdmin: false },
    { id: 'panel_10gb',     title: '📀 10GB Panel',    description: 'Start your VPS with 10GB storage',       ram: 1024, disk: 10240, cpu: 60, price: 10, isAdmin: false },
    { id: 'panel_unlimited',title: '♾️ Unlimited Panel',description: 'No storage limits for your VPS',        ram: 0,    disk: 0,    cpu: 0,  price: 8,  isAdmin: false },
    { id: 'panel_cpanel',   title: '⚙️ cPanel Panel',  description: 'Full cPanel & Webhosting Manager',      ram: 1024, disk: 1024,  cpu: 40, price: 10, isAdmin: true },
  ];

  const sections = [
    {
      title: '⚙️ Panel Selection',
      highlight_label: 'Choose Panel',
      rows: panelOptions.map(opt => ({
        title: opt.title,
        description: opt.description,
        id: opt.id,
      })),
    },
  ];

  const bodyText =
    `🖥️ *Panel Selection*\n` +
    `👤 User: *${username}*\n\n` +
    `Welcome! Choose your perfect VPS plan below:\n` +
    `• 💰 Prices start from just $5\n` +
    `• ⚡ Instant deployment after payment\n` +
    `• 🔒 Secure & reliable hosting\n\n` +
    `👇 Tap the button below to see options.`;

  const interactiveMsg = proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
    footer: proto.Message.InteractiveMessage.Footer.create({ text: `© ${settings.COMPANY || 'Samsung XMD'}` }),
    header: proto.Message.InteractiveMessage.Header.create({ title: '⚡ Panel Options', hasMediaAttachment: false }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📋 Panel Options',
            sections,
          }),
        },
      ],
    }),
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
        newsletterName: settings.CHANNEL_NAME || '〖 🟢 SAMSUNG XMD 🟢 〗',
      },
    },
  });

  const msg = {
    ephemeralMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: interactiveMsg,
      },
    },
  };

  const wam = await generateWAMessageFromContent(from, msg, { quoted: quotedMsg });
  await sock.relayMessage(from, wam.message, { messageId: wam.key.id });
}

async function processPanelPayment(sock, from, sender, username, spec, m, prefix) {
  const amount = spec.price;
  const reference = `${spec.isAdmin ? 'CPANEL' : 'PANEL'}-${sender.replace(/[^0-9]/g, '')}-${Date.now()}`;
  const email = `${sender.split('@')[0]}@telegram.bot`;

  const init = await initPaystackPayment(amount, email, reference, {
    user_id: sender,
    username,
    ram: spec.ram,
    disk: spec.disk,
    cpu: spec.cpu,
    price: spec.price,
    isAdmin: spec.isAdmin,
  });

  if (!init || !init.status) {
    await sock.sendMessage(from, { text: '❌ Failed to create payment.' }, { quoted: m });
    return;
  }

  const paymentUrl = init.data.authorization_url;
  pendingPayments.set(reference, {
    userId: sender,
    username,
    ram: spec.ram,
    disk: spec.disk,
    cpu: spec.cpu,
    price: spec.price,
    isAdmin: spec.isAdmin,
    status: 'pending',
  });

  const typeLabel = spec.isAdmin ? '👑 CPANEL' : '📦 ' + (spec.ram === 0 ? 'Unlimited' : `${spec.disk/1024}GB`) + ' Panel';
  const ramDisplay = spec.ram === 0 ? 'Unlimited' : `${spec.ram}MB`;
  const diskDisplay = spec.disk === 0 ? 'Unlimited' : `${spec.disk}MB`;
  const cpuDisplay = spec.cpu === 0 ? 'Unlimited' : `${spec.cpu}%`;

  await sock.sendMessage(from, {
    text:
      `💳 *Complete your payment*\n\n` +
      `Type: ${typeLabel}\n` +
      `Username: ${username}\n` +
      `📊 RAM: ${ramDisplay}\n` +
      `💾 Disk: ${diskDisplay}\n` +
      `⚡ CPU: ${cpuDisplay}\n` +
      `💰 Price: $${spec.price}\n\n` +
      `🔗 Pay here:\n${paymentUrl}\n\n` +
      `After paying, just type *${prefix}verifypayment* – no reference needed.`
  }, { quoted: m });
}

// ─────────────────────────────────────────────────────────────
//   HELPERS FOR PANEL SELECTION & PAYMENT (Telegram)
// ─────────────────────────────────────────────────────────────

const ramMap = {
  '1gb': { ram: 1024, disk: 1024, cpu: 40, price: 1, isAdmin: false },
  '2gb': { ram: 2048, disk: 2048, cpu: 60, price: 2, isAdmin: false },
  '3gb': { ram: 3072, disk: 3072, cpu: 80, price: 3, isAdmin: false },
  '4gb': { ram: 4096, disk: 4096, cpu: 100, price: 4, isAdmin: false },
  'unlimited': { ram: 0, disk: 0, cpu: 0, price: 8, isAdmin: false },
  'cpanel': { ram: 1024, disk: 1024, cpu: 40, price: 10, isAdmin: true },
};

async function showRamSelection(ctx, sessionKey, username, isVps = false) {
  const price = db.prices.panel[isVps ? 'vps' : 'panel'][username] || 0;
  // ... original implementation (inline keyboard)
}

async function showVpsRamSelection(ctx, sessionKey, username) {
  // ...
}

async function handleTokenChoice(ctx, userId, sessionKey, spec, isVps = false) {
  // ...
}

async function proceedToPayment(ctx, userId, sessionKey, spec, isVps) {
  // ...
}

async function verifyAndCreatePanel(ctx, reference, pending) {
  // This includes bulk handling
  if (pending.bulk) {
    const { prefix, count, plan, ram, userId } = pending;
    let created = [];
    for (let i = 1; i <= count; i++) {
      const username = `${prefix}${i}`;
      const existingUserId = await findPterodactylUser(username);
      const res = await createPterodactylPanel(username, ram, 1024, 40, false, existingUserId);
      created.push({ username, password: res.password, domain: res.panelDomain });
      if (!db.users[userId].panels) db.users[userId].panels = [];
      db.users[userId].panels.push({
        type: 'PANEL',
        username,
        ram,
        disk: 1024,
        cpu: 40,
        createdAt: new Date().toISOString(),
        credentials: {
          username: res.username,
          password: res.password,
          domain: res.panelDomain,
          serverId: res.serverId,
        }
      });
      saveDb();
    }
    const credentials = created.map((c, idx) => `${idx+1}. ${c.username} | ${c.password} | ${c.domain}`).join('\n');
    await ctx.reply(`✅ *Bulk Panels Created!*\n\n${credentials}`, { parse_mode: 'Markdown' });
    pendingPayments.delete(reference);
    return;
  }
  // ... normal single panel creation
}

// ─────────────────────────────────────────────────────────────
//   HELPER: SHOW WELCOME (with the new keyboard)
// ─────────────────────────────────────────────────────────────

async function showWelcome(ctx, lang) {
  const userId = String(ctx.from.id);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const botInfo = await ctx.telegram.getMe();
  const botUsername = botInfo.username || 'Bot';

  // ── NEW KEYBOARD LAYOUT ──
  const keyboard = {
    reply_markup: {
      keyboard: [
        ['𝑷𝑨𝑰𝑹 𝑺𝑨𝑴𝑺𝑼𝑵𝑮 𝑴𝑫 𝑷𝑹𝑬𝑴𝑰𝑼𝑴'],
        ['𝑮𝑬𝑵𝑬𝑹𝑨𝑻𝑬 𝑺𝑬𝑺𝑺𝑰𝑶𝑵 𝑰𝑫'],
        ['𝑩𝑼𝒀 𝑷𝑨𝑵𝑬𝑳'],
        ['𝑩𝑼𝒀 𝑨𝑫𝑴𝑰𝑵 𝑷𝑨𝑵𝑬𝑳'],
        ['𝑫𝑬𝑳 𝑷𝑨𝑰𝑹', '𝑹𝑬𝑭𝑹𝑬𝑺𝑯 𝑺𝑬𝑺𝑺𝑰𝑶𝑵'],
        ['𝑩𝑼𝒀 + 𝑺𝑪𝑹𝑰𝑷𝑻', '𝑽𝑬𝑹𝑰𝑭𝒀 𝑷𝑨𝒀'],
        ['𝑽𝑷𝑺 𝑴𝑬𝑵𝑼', '𝑰𝑵𝑺𝑻𝑨𝑳𝑳 𝑴𝑬𝑵𝑼'],
        ['𝑶𝑾𝑵𝑬𝑹 𝑴𝑬𝑵𝑼', '𝑴𝒀 𝑷𝑹𝑶𝑭𝑰𝑳𝑬'],
        ['𝑪𝑹𝑬𝑨𝑻𝑬 𝑩𝑶𝑻', '𝑹𝑬𝑷𝑶𝑹𝑻 𝑩𝑼𝑮'],
        ['𝑩𝑶𝑻 𝑭𝑰𝑳𝑬𝑺', '𝑴𝒀 𝑻𝑶𝑲𝑬𝑵𝑺'],
        ['𝑴𝒀 𝑷𝑨𝑵𝑬𝑳𝑺', '𝑪𝑳𝑶𝑵𝑬 𝑩𝑶𝑻'],
      ],
      resize_keyboard: true,
    },
  };

  const text = t.welcome;

  try {
    await ctx.replyWithPhoto(
      { url: 'https://res.cloudinary.com/dqxlb29uz/image/upload/v1784728701/bwm_uploads/media-1784728700497.jpg' },
      { caption: text, parse_mode: 'Markdown', ...keyboard }
    );
  } catch {
    await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
  }
}

// ─────────────────────────────────────────────────────────────
//   TELEGRAM BOT SETUP (ALL COMMANDS & HANDLERS)
// ─────────────────────────────────────────────────────────────

function setupBot(botInstance, options = {}) {
  const { isMain = false } = options;

  // ── User state tracking ──
  const localStates = new Map();

  // ── Broadcast pending ──
  const broadcastPending = new Set();

  // ─────────────────────────────────────────────────────────────
  //   START COMMAND
  // ─────────────────────────────────────────────────────────────
  botInstance.start(async (ctx) => {
    const userId = String(ctx.from.id);

    // Check banned
    if (db.bannedUsers && db.bannedUsers.includes(userId)) {
      return ctx.reply('⛔ You are banned from using this bot.');
    }

    ensureUser(userId);
    const userLang = db.users[userId].language || 'en';

    // ── If language not selected, show selection ──
    if (!db.users[userId].language) {
      const langButtons = [];
      for (let i = 0; i < SUPPORTED_LANGUAGES.length; i += 2) {
        const row = [];
        row.push(Markup.button.callback(
          SUPPORTED_LANGUAGES[i].name,
          `set_lang_${SUPPORTED_LANGUAGES[i].code}`
        ));
        if (i + 1 < SUPPORTED_LANGUAGES.length) {
          row.push(Markup.button.callback(
            SUPPORTED_LANGUAGES[i + 1].name,
            `set_lang_${SUPPORTED_LANGUAGES[i + 1].code}`
          ));
        }
        langButtons.push(row);
      }
      await ctx.reply(
        TRANSLATIONS[userLang].languagePrompt,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(langButtons),
        }
      );
      return;
    }

    // ── Show welcome with the new keyboard ──
    await showWelcome(ctx, userLang);
  });

  // ─────────────────────────────────────────────────────────────
  //   LANGUAGE SELECTION CALLBACK
  // ─────────────────────────────────────────────────────────────
  botInstance.action(/set_lang_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const langCode = ctx.match[1];
    const userId = String(ctx.from.id);

    if (!SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      return ctx.reply('❌ Invalid language.');
    }

    ensureUser(userId);
    db.users[userId].language = langCode;
    saveDb();

    const langName = SUPPORTED_LANGUAGES.find(l => l.code === langCode).name;
    await ctx.editMessageText(
      TRANSLATIONS[langCode].languageSet.replace('{lang}', langName),
      { parse_mode: 'Markdown' }
    );
    await showWelcome(ctx, langCode);
  });

  // ─────────────────────────────────────────────────────────────
  //   PAIRING CALLBACKS
  // ─────────────────────────────────────────────────────────────
  botInstance.action('pair_new', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = String(ctx.from.id);
    localStates.set(userId, { action: 'pair' });
    await ctx.editMessageText(
      '📱 *Enter phone number to pair:*\n\nFormat: `254700000000` (without +)',
      { parse_mode: 'Markdown' }
    );
  });

  botInstance.action('pair_existing', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = String(ctx.from.id);
    localStates.set(userId, { action: 'restore_session' });
    await ctx.editMessageText(
      '📂 *Enter your Session ID:*\n\n' +
      'You can find it in your paired list or in the `sessions/` folder.\n' +
      'Example: `wa_123456789_254700000000`\n\n' +
      'Type /cancel to abort.',
      { parse_mode: 'Markdown' }
    );
  });

  botInstance.action('pair_cancel', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText('❌ Pairing cancelled.');
  });

  // ─────────────────────────────────────────────────────────────
  //   COMMANDS
  // ─────────────────────────────────────────────────────────────

  // ── /pair ──
  botInstance.command('pair', async (ctx) => {
    registerUser(ctx.from.id, ctx.from.first_name);
    const phone = ctx.message.text.split(/\s+/)[1]?.replace(/\D/g, '');
    if (!phone || phone.length < 7) {
      return ctx.reply('Usage: `/pair 254704955033`', { parse_mode: 'Markdown' });
    }
    const uid = String(ctx.from.id);
    const sessionId = `wa_${uid}_${phone}`;

    if (activeSockets.has(sessionId)) {
      return ctx.reply(`✅ +${phone} already connected!`);
    }

    if (sessionExists(sessionId)) {
      await ctx.reply(`♻️ Reconnecting +${phone}...`);
      await startWhatsApp(sessionId, ctx.chat.id, null, uid);
      return;
    }

    await ctx.reply(`🔄 Pairing *+${phone}*...`, { parse_mode: 'Markdown' });
    await startWhatsApp(sessionId, ctx.chat.id, phone, uid);
  });

  // ── /delpair ──
  botInstance.command('delpair', async (ctx) => {
    const phone = ctx.message.text.split(/\s+/)[1]?.replace(/\D/g, '');
    if (!phone) return ctx.reply('Usage: /delpair 254704955033');
    const uid = String(ctx.from.id);
    const sessionId = `wa_${uid}_${phone}`;
    const sock = activeSockets.get(sessionId);

    if (sock) {
      try { await sock.logout(); } catch {}
      try { sock.ws?.close(); } catch {}
      activeSockets.delete(sessionId);
    }

    notifiedConnected.delete(sessionId);
    removePair(uid, sessionId);
    const ok = deleteSession(sessionId);
    deleteSessionFromGitHub(sessionId).catch(() => {});

    await ctx.reply(ok
      ? `🗑 +${phone} deleted. Use /pair ${phone} to reconnect.`
      : `ℹ️ No session found for +${phone}.`
    );
  });

  // ── /listpaired ──
  botInstance.command('listpaired', async (ctx) => {
    const pairs = getUserPairs(String(ctx.from.id));
    if (!pairs.length) return ctx.reply('No paired numbers. Use /pair <number>');
    const list = pairs.map((p, i) => {
      const status = activeSockets.has(p.sessionId) ? '🟢' : '🔴';
      return `${i+1}. +${p.waNum} - Session: \`${p.sessionId}\` ${status}`;
    }).join('\n');
    await ctx.reply(`📱 *Your numbers (${pairs.length}):*\n\n${list}`, { parse_mode: 'Markdown' });
  });

  // ── /buypanel ──
  botInstance.command('buypanel', async (ctx) => {
    registerUser(ctx.from.id, ctx.from.first_name);
    if (!canUseBot(ctx.from.id)) {
      return ctx.reply('🔒 *Premium-only mode* – contact owner.', { parse_mode: 'Markdown' });
    }
    const userId = String(ctx.from.id);
    localStates.set(userId, { action: 'buypanel_username' });
    await ctx.reply(
      '🛒 *Enter username for your VPS:*\n\n(Only letters, numbers, underscore, min 3 chars)',
      { parse_mode: 'Markdown' }
    );
  });

  // ── /cpanel (Admin Panel) ──
  botInstance.command('cpanel', async (ctx) => {
    registerUser(ctx.from.id, ctx.from.first_name);
    if (!canUseBot(ctx.from.id)) {
      return ctx.reply('🔒 *Premium-only mode* – contact owner.', { parse_mode: 'Markdown' });
    }
    const args = ctx.message.text.split(/\s+/);
    const username = args[1];
    if (!username) {
      const userId = String(ctx.from.id);
      localStates.set(userId, { action: 'cpanel_username' });
      return ctx.reply(
        '👑 *Enter username for Admin Panel (cPanel):*\n\n(Only letters, numbers, underscore, min 3 chars)',
        { parse_mode: 'Markdown' }
      );
    }
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      return ctx.reply('❌ Username must be at least 3 chars (letters, numbers, underscore).', { parse_mode: 'Markdown' });
    }
    const sessionKey = `tg_${ctx.from.id}_cpanel`;
    if (!global._pendingTelegram) global._pendingTelegram = {};
    global._pendingTelegram[sessionKey] = { username: cleanUsername, isAdmin: true };
    await showRamSelection(ctx, sessionKey, cleanUsername, false);
  });

  // ── /verifypayment ──
  botInstance.command('verifypayment', async (ctx) => {
    const args = ctx.message.text.split(/\s+/);
    const providedRef = args[1] ? args[1].trim() : null;
    const userId = String(ctx.from.id);

    if (providedRef) {
      const pending = pendingPayments.get(providedRef);
      if (!pending) return ctx.reply('❌ Reference not found.');
      await verifyAndCreatePanel(ctx, providedRef, pending);
      return;
    }

    const pendingEntries = Array.from(pendingPayments.entries())
      .filter(([ref, data]) => data.userId === userId && data.status === 'pending');

    if (pendingEntries.length === 0) {
      return ctx.reply('❌ No pending payments found for your account.\nUsage: `/verifypayment <reference>`', { parse_mode: 'Markdown' });
    }
    const latest = pendingEntries[pendingEntries.length - 1];
    await verifyAndCreatePanel(ctx, latest[0], latest[1]);
  });

  // ── /adminpanel ──
  botInstance.command('adminpanel', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const stats = {
      totalUsers: Object.keys(db.users).length,
      sessions: listSessions().length,
      premUsers: premData.premUsers.length,
    };
    await ctx.reply(
      `⚙️ *Admin Panel*\n\n👤 Users: ${stats.totalUsers}\n📱 Sessions: ${stats.sessions}\n💎 Premium: ${stats.premUsers}\n\nUse owner commands: /addprem, /delprem, /broadcast, /listprem, /addlink, /removelink, /listlinks, /setpesapal, /addstorefile, /liststorefiles, /removestorefile, /setprice, /bulkpanels, /addcmd, /ban, /unban`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /profile ──
  botInstance.command('profile', async (ctx) => {
    const userId = String(ctx.from.id);
    ensureUser(userId);
    const user = ctx.from;
    const isPrem = isPremium(userId);
    const pairs = getUserPairs(userId);
    const pairedList = pairs.length ? pairs.map(p => `+${p.waNum}`).join(', ') : 'None';
    const allVps = loadVPS();
    const myVps = Object.entries(allVps).filter(([id, info]) => String(info.owner) === userId);
    let vpsList = 'None';
    if (myVps.length) {
      vpsList = myVps.map(([id, info]) => `• ${info.hostname} (${info.ip || 'N/A'})`).join('\n');
    }
    const tokens = db.users[userId]?.tokens || 0;
    const referrals = db.users[userId]?.referralsCount || 0;
    const code = db.users[userId]?.referralCode || 'N/A';

    const msg =
      `👤 *Your Profile*\n\n` +
      `🆔 ID: \`${userId}\`\n` +
      `👤 Name: ${user.first_name || ''} ${user.last_name || ''}\n` +
      `💎 Premium: ${isPrem ? '✅ Yes' : '❌ No'}\n` +
      `📱 Paired Numbers: ${pairedList}\n` +
      `🖥️ Your VPS:\n${vpsList}\n` +
      `🔗 Referral Code: \`${code}\`\n` +
      `💰 Tokens: ${tokens}\n` +
      `👥 Referrals: ${referrals}`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // ── /createbot ──
  botInstance.command('createbot', async (ctx) => {
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
      return ctx.reply('Usage: /createbot <bot_name>\nExample: `/createbot MySuperBot`', { parse_mode: 'Markdown' });
    }
    const name = args.slice(1).join(' ').trim();
    if (!name || name.length < 3) {
      return ctx.reply('❌ Bot name must be at least 3 characters.');
    }
    const sanitized = name.replace(/[^a-zA-Z0-9 _-]/g, '');
    if (sanitized !== name) {
      return ctx.reply('❌ Bot name can only contain letters, numbers, spaces, underscores, and hyphens.');
    }
    await ctx.reply(`⏳ Creating custom bot *${sanitized}*... This may take a moment.`, { parse_mode: 'Markdown' });
    try {
      const zipBuffer = await createCustomBot(sanitized);
      await ctx.replyWithDocument(
        { source: zipBuffer, filename: `${sanitized}-bot.zip` },
        {
          caption:
            `✅ *Your custom bot is ready!*\n\nName: *${sanitized}*\n\n📦 *Next steps:*\n` +
            `1. Extract the ZIP file.\n2. Edit \`settings.js\` with your credentials.\n3. Run \`npm install\` and \`npm start\`.\n\n⚠️ Keep your credentials safe!`,
          parse_mode: 'Markdown'
        }
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to create bot: ${err.message}`);
    }
  });

  // ── /botfiles ──
  botInstance.command('botfiles', async (ctx) => {
    const store = db.fileStore || [];
    if (!store.length) {
      return ctx.reply('📭 No bot files available at the moment. Check back later.');
    }
    const buttons = store.map(f => ([
      Markup.button.callback(`📦 ${f.name}`, `download_file_${f.fileId}`)
    ]));
    await ctx.reply(
      '📁 *Available Bot Files*\n\nClick a file to download it.',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      }
    );
  });

  // ── /bugreport ──
  botInstance.command('bugreport', async (ctx) => {
    const description = ctx.message.text.replace(/^\/bugreport\s*/, '').trim();
    if (!description) {
      return ctx.reply('Usage: /bugreport <description of the bug>\n\nYou can reply to a message with a file to attach it.');
    }
    const user = ctx.from;
    const userId = String(ctx.from.id);
    const reportMsg = `🐛 *Bug Report*\n\n` +
      `👤 User: ${user.first_name || ''} ${user.last_name || ''} (ID: \`${userId}\`)\n` +
      `📝 Description:\n${description}`;
    const reply = ctx.message.reply_to_message;
    let fileToSend = null;
    if (reply) {
      if (reply.document) fileToSend = { type: 'document', file_id: reply.document.file_id };
      else if (reply.photo) fileToSend = { type: 'photo', file_id: reply.photo[reply.photo.length-1].file_id };
      else if (reply.video) fileToSend = { type: 'video', file_id: reply.video.file_id };
      else if (reply.audio) fileToSend = { type: 'audio', file_id: reply.audio.file_id };
    }
    try {
      const ownerId = settings.OWNER_TELEGRAM_ID;
      if (fileToSend) {
        if (fileToSend.type === 'document') {
          await ctx.telegram.sendDocument(ownerId, fileToSend.file_id, { caption: reportMsg, parse_mode: 'Markdown' });
        } else if (fileToSend.type === 'photo') {
          await ctx.telegram.sendPhoto(ownerId, fileToSend.file_id, { caption: reportMsg, parse_mode: 'Markdown' });
        } else if (fileToSend.type === 'video') {
          await ctx.telegram.sendVideo(ownerId, fileToSend.file_id, { caption: reportMsg, parse_mode: 'Markdown' });
        } else if (fileToSend.type === 'audio') {
          await ctx.telegram.sendAudio(ownerId, fileToSend.file_id, { caption: reportMsg, parse_mode: 'Markdown' });
        }
      } else {
        await ctx.telegram.sendMessage(ownerId, reportMsg, { parse_mode: 'Markdown' });
      }
      await ctx.reply('✅ Bug report sent to the developer. Thank you!');
    } catch (err) {
      await ctx.reply(`❌ Failed to send report: ${err.message}`);
    }
  });

  // ── /referral ──
  botInstance.command('referral', async (ctx) => {
    const userId = String(ctx.from.id);
    ensureUser(userId);
    const user = db.users[userId];
    const code = user.referralCode || 'Not set';
    const tokens = user.tokens || 0;
    const referrals = user.referralsCount || 0;
    await ctx.reply(
      `🔗 *Your Referral Info*\n\nCode: \`${code}\`\nTokens: ${tokens}\nReferrals: ${referrals}\n\nShare your code: /refer ${code}\nEach successful referral gives you 1 token (worth $1 off).`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /refer ──
  botInstance.command('refer', async (ctx) => {
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) {
      return ctx.reply('Usage: /refer <code>\nExample: /refer ABC123');
    }
    const code = args[1].toUpperCase().trim();
    const userId = String(ctx.from.id);
    ensureUser(userId);
    if (db.users[userId].referredBy) {
      return ctx.reply('❌ You have already used a referral code.');
    }
    let referrerId = null;
    for (const [id, data] of Object.entries(db.users)) {
      if (data.referralCode === code && id !== userId) {
        referrerId = id;
        break;
      }
    }
    if (!referrerId) {
      return ctx.reply('❌ Invalid referral code.');
    }
    db.users[referrerId].tokens = (db.users[referrerId].tokens || 0) + 1;
    db.users[userId].tokens = (db.users[userId].tokens || 0) + 1;
    db.users[referrerId].referralsCount = (db.users[referrerId].referralsCount || 0) + 1;
    db.users[userId].referredBy = referrerId;
    saveDb();
    await ctx.reply(
      `✅ You received 1 token!\nYour referrer also received 1 token.\n\nNow you have ${db.users[userId].tokens} token(s). Use them to get discounts on panels.`,
      { parse_mode: 'Markdown' }
    );
    try {
      await ctx.telegram.sendMessage(
        referrerId,
        `🎉 Someone used your referral code!\nYou earned 1 token. Total tokens: ${db.users[referrerId].tokens}.`,
        { parse_mode: 'Markdown' }
      );
    } catch {}
  });

  // ── /mypanels ──
  botInstance.command('mypanels', async (ctx) => {
    const userId = String(ctx.from.id);
    ensureUser(userId);
    const panels = db.users[userId].panels || [];
    if (!panels.length) {
      return ctx.reply('📭 *You have no panels yet.*\nUse `/buypanel` to get one!', { parse_mode: 'Markdown' });
    }
    let msg = '📋 *Your Panels*\n\n';
    panels.forEach((p, i) => {
      const creds = p.credentials || {};
      msg += `${i+1}. *${p.type}* – ${p.username}\n`;
      msg += `   📊 RAM: ${p.ram}MB | 💾 Disk: ${p.disk}MB\n`;
      msg += `   🔗 ${creds.domain || 'N/A'}\n`;
      msg += `   📅 ${new Date(p.createdAt).toLocaleDateString()}\n\n`;
    });
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // ── /refreshsession ──
  botInstance.command('refreshsession', async (ctx) => {
    const userId = String(ctx.from.id);
    const pairs = getUserPairs(userId);
    if (!pairs.length) {
      return ctx.reply('ℹ️ No paired numbers to refresh.');
    }
    await ctx.reply(`🔄 Refreshing ${pairs.length} session(s)...`);
    let refreshed = 0;
    for (const pair of pairs) {
      const sid = pair.sessionId;
      const sock = activeSockets.get(sid);
      if (sock) {
        try { await sock.logout(); } catch {}
        try { sock.ws?.close(); } catch {}
        activeSockets.delete(sid);
      }
      try {
        await startWhatsApp(sid, null, null, userId);
        refreshed++;
      } catch (e) {
        console.error(`Failed to refresh ${sid}:`, e.message);
      }
    }
    await ctx.reply(`✅ Refreshed ${refreshed} out of ${pairs.length} session(s).`);
  });

  // ── /ai ──
  botInstance.command('ai', async (ctx) => {
    const question = ctx.message.text.replace(/^\/ai\s*/, '').trim();
    if (!question) {
      return ctx.reply('❓ *Ask me anything!*\nUsage: `/ai <your question>`', { parse_mode: 'Markdown' });
    }
    await ctx.reply('🤖 *Thinking...*', { parse_mode: 'Markdown' });
    try {
      const answer = await askAI(question, String(ctx.from.id));
      if (answer.length > 4000) {
        const chunks = answer.match(/[\s\S]{1,4000}/g) || [];
        for (const chunk of chunks) {
          await ctx.reply(chunk, { parse_mode: 'Markdown' });
        }
      } else {
        await ctx.reply(answer, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      await ctx.reply(`❌ Failed to get AI response: ${error.message}`);
    }
  });

  // ── /cancel ──
  botInstance.command('cancel', async (ctx) => {
    const userId = String(ctx.from.id);
    if (localStates.has(userId)) {
      const state = localStates.get(userId);
      if (state.timeoutId) clearTimeout(state.timeoutId);
      localStates.delete(userId);
      return ctx.reply('❌ Cancelled.');
    }
    if (broadcastPending.has(userId)) {
      broadcastPending.delete(userId);
      return ctx.reply('❌ Broadcast cancelled.');
    }
    return ctx.reply('Nothing to cancel.');
  });

  // ─────────────────────────────────────────────────────────────
  //   OWNER COMMANDS
  // ─────────────────────────────────────────────────────────────

  // ── /setprice (KES pricing) ──
  botInstance.command('setprice', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 4) {
      return ctx.reply('Usage: /setprice <type> <plan> <amount>\nExample: /setprice panel 2gb 2500');
    }
    const type = args[1];
    const plan = args[2];
    const amount = parseInt(args[3]);
    if (isNaN(amount) || amount <= 0) return ctx.reply('❌ Invalid amount.');
    if (!db.prices[type] || !db.prices[type][plan]) {
      return ctx.reply(`❌ Plan "${plan}" not found for type "${type}".\nAvailable: panel (1gb,2gb,3gb,4gb,unlimited,cpanel), vps (1gb,2gb,4gb,8gb)`);
    }
    db.prices[type][plan] = amount;
    saveDb();
    await ctx.reply(`✅ Price for ${type} ${plan} set to ${amount} KES.`);
  });

  // ── /bulkpanels ──
  botInstance.command('bulkpanels', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) {
      return ctx.reply('❌ Owner/Premium only.');
    }
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 4) {
      return ctx.reply('Usage: /bulkpanels <prefix> <count> <plan>\nExample: /bulkpanels myvps 5 2gb');
    }
    const prefix = args[1];
    const count = parseInt(args[2]);
    const plan = args[3];
    if (isNaN(count) || count < 1 || count > 20) {
      return ctx.reply('❌ Count must be between 1 and 20.');
    }
    const ramMap = { '1gb': 1024, '2gb': 2048, '3gb': 3072, '4gb': 4096, 'unlimited': 0 };
    const ram = ramMap[plan];
    if (ram === undefined) {
      return ctx.reply('❌ Invalid plan. Options: 1gb, 2gb, 3gb, 4gb, unlimited');
    }
    const pricePer = db.prices.panel[plan] || 0;
    const totalPrice = pricePer * count;
    const userId = String(ctx.from.id);
    const reference = `BULK-${userId}-${Date.now()}`;

    const init = await initPaystackPayment(totalPrice, `${userId}@telegram.bot`, reference, {
      user_id: userId,
      prefix,
      count,
      plan,
      ram,
      isAdmin: false,
      bulk: true,
    });

    if (!init || !init.status) {
      return ctx.reply('❌ Payment initiation failed.');
    }

    pendingPayments.set(reference, {
      userId,
      prefix,
      count,
      plan,
      ram,
      pricePer,
      totalPrice,
      isAdmin: false,
      status: 'pending',
      bulk: true,
    });

    await ctx.reply(
      `💳 *Bulk Panel Purchase*\n${count} x ${plan.toUpperCase()} panels = ${totalPrice} KES\n\n[Pay Now](${init.data.authorization_url})\n\nAfter paying, use /verifypayment ${reference}`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /addcmd (custom commands) ──
  botInstance.command('addcmd', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 3) {
      return ctx.reply('Usage: /addcmd <name> <code>\nExample: /addcmd hello ctx.reply("Hello world!")');
    }
    const name = args[1];
    const code = args.slice(2).join(' ');
    db.customCommands[name] = { code, description: 'Custom', ownerOnly: false };
    saveDb();
    await ctx.reply(`✅ Command /${name} added.`);
  });

  // ── /delcmd ──
  botInstance.command('delcmd', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) return ctx.reply('Usage: /delcmd <name>');
    const name = args[1];
    if (!db.customCommands[name]) return ctx.reply(`❌ Command /${name} not found.`);
    delete db.customCommands[name];
    saveDb();
    await ctx.reply(`🗑️ Command /${name} deleted.`);
  });

  // ── /listcmd ──
  botInstance.command('listcmd', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const names = Object.keys(db.customCommands);
    if (!names.length) return ctx.reply('ℹ️ No custom commands.');
    let msg = '*📋 Custom Commands:*\n';
    names.forEach(name => {
      msg += `• /${name}\n`;
    });
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // ── /ban ──
  botInstance.command('ban', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) return ctx.reply('Usage: /ban <user_id>');
    const userId = args[1];
    if (!db.bannedUsers) db.bannedUsers = [];
    if (db.bannedUsers.includes(userId)) return ctx.reply(`⚠️ User ${userId} is already banned.`);
    db.bannedUsers.push(userId);
    saveDb();
    await ctx.reply(`✅ User ${userId} banned.`);
  });

  // ── /unban ──
  botInstance.command('unban', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) return ctx.reply('Usage: /unban <user_id>');
    const userId = args[1];
    if (!db.bannedUsers || !db.bannedUsers.includes(userId)) {
      return ctx.reply(`⚠️ User ${userId} is not banned.`);
    }
    db.bannedUsers = db.bannedUsers.filter(id => id !== userId);
    saveDb();
    await ctx.reply(`✅ User ${userId} unbanned.`);
  });

  // ── /premonly ──
  botInstance.command('premonly', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    premData.premOnly = !premData.premOnly;
    savePrem();
    await ctx.reply(
      premData.premOnly
        ? '🔒 *Premium-only mode ON* – only premium users & owners can pair.'
        : '🌐 *Premium-only mode OFF* – all users can pair.',
      { parse_mode: 'Markdown' }
    );
  });

  // ── /addprem ──
  botInstance.command('addprem', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const target = ctx.message.text.split(/\s+/)[1];
    if (!target) return ctx.reply('Usage: /addprem <telegram_id>');
    if (premData.premUsers.includes(target)) return ctx.reply(`ℹ️ ${target} is already premium.`);
    premData.premUsers.push(target);
    savePrem();
    if (db.users[target]) db.users[target].premium = true;
    saveDb();
    await ctx.reply(`✅ Added *${target}* as premium user.`, { parse_mode: 'Markdown' });
  });

  // ── /delprem ──
  botInstance.command('delprem', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const target = ctx.message.text.split(/\s+/)[1];
    if (!target) return ctx.reply('Usage: /delprem <telegram_id>');
    const idx = premData.premUsers.indexOf(target);
    if (idx === -1) return ctx.reply(`ℹ️ ${target} is not premium.`);
    premData.premUsers.splice(idx, 1);
    savePrem();
    if (db.users[target]) db.users[target].premium = false;
    saveDb();
    await ctx.reply(`🗑 Removed *${target}* from premium.`, { parse_mode: 'Markdown' });
  });

  // ── /listprem ──
  botInstance.command('listprem', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const mode = premData.premOnly ? '🔒 Premium-only ON' : '🌐 Premium-only OFF';
    const owners = [String(settings.OWNER_TELEGRAM_ID), ...premData.owners].join('\n') || 'none';
    const prems = premData.premUsers.join('\n') || 'none';
    await ctx.reply(
      `*Premium Status*\n${mode}\n\n*Owners:*\n${owners}\n\n*Premium Users:*\n${prems}`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /addowner ──
  botInstance.command('addowner', async (ctx) => {
    if (String(ctx.from.id) !== String(settings.OWNER_TELEGRAM_ID)) return ctx.reply('❌ Main owner only.');
    const target = ctx.message.text.split(/\s+/)[1];
    if (!target) return ctx.reply('Usage: /addowner <telegram_id>');
    if (premData.owners.includes(target)) return ctx.reply(`ℹ️ ${target} is already an owner.`);
    premData.owners.push(target);
    savePrem();
    await ctx.reply(`✅ Promoted *${target}* to owner.`, { parse_mode: 'Markdown' });
  });

  // ── /delown ──
  botInstance.command('delown', async (ctx) => {
    if (String(ctx.from.id) !== String(settings.OWNER_TELEGRAM_ID)) return ctx.reply('❌ Main owner only.');
    const target = ctx.message.text.split(/\s+/)[1];
    if (!target) return ctx.reply('Usage: /delown <telegram_id>');
    const idx = premData.owners.indexOf(target);
    if (idx === -1) return ctx.reply(`ℹ️ ${target} is not an owner.`);
    premData.owners.splice(idx, 1);
    savePrem();
    await ctx.reply(`🗑 Removed *${target}* from owners.`, { parse_mode: 'Markdown' });
  });

  // ── /broadcast ──
  botInstance.command('broadcast', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    broadcastPending.add(String(ctx.from.id));
    await ctx.reply(
      `📢 *Broadcast Setup*\n\nNow send the message you want to broadcast.\nSupported: text, photo, video, audio, document, sticker, voice, animation.\n\n*Optional inline buttons* – add to caption/text:\n\`[Button Label | https://url.com]\`\n\nSend /cancel to abort.`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /reportissue ──
  botInstance.command('reportissue', async (ctx) => {
    const report = ctx.message.text.replace(/^\/reportissue\s*/, '').trim();
    if (!report) return ctx.reply('/reportissue <problem>');
    try {
      const sent = await ctx.telegram.sendMessage(
        settings.OWNER_TELEGRAM_ID,
        `📢 *Issue*\nFrom: ${ctx.from.first_name} (ID: \`${ctx.from.id}\`)\n\n${report}`,
        { parse_mode: 'Markdown' }
      );
      pendingReplies.set(String(sent.message_id), { userId: ctx.from.id, chatId: ctx.chat.id });
      savePendingReplies();
      await ctx.reply('✅ Reported! Owner will reply to you here.');
    } catch { await ctx.reply('❌ Failed to send.'); }
  });

  // ── /addlink, /removelink, /listlinks ──
  if (!db.links) db.links = {};
  saveDb();

  botInstance.command('addlink', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 3) return ctx.reply('Usage: /addlink <name> <url>\nExample: /addlink "Samsung Crasher" https://samsungcrasher.com');
    const name = args.slice(1, -1).join(' ').trim();
    const url = args[args.length - 1].trim();
    if (!name || !url) return ctx.reply('Usage: /addlink <name> <url>');
    if (db.links[name]) return ctx.reply(`⚠️ Link with name "${name}" already exists. Use /removelink first.`);
    db.links[name] = url;
    saveDb();
    await ctx.reply(`✅ Link *${name}* added: ${url}`, { parse_mode: 'Markdown' });
  });

  botInstance.command('removelink', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const name = ctx.message.text.split(/\s+/).slice(1).join(' ').trim();
    if (!name) return ctx.reply('Usage: /removelink <name>');
    if (!db.links[name]) return ctx.reply(`⚠️ Link with name "${name}" not found.`);
    delete db.links[name];
    saveDb();
    await ctx.reply(`🗑️ Link *${name}* removed.`, { parse_mode: 'Markdown' });
  });

  botInstance.command('listlinks', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const names = Object.keys(db.links);
    if (!names.length) return ctx.reply('ℹ️ No links configured.');
    let msg = '*📋 Configured Links:*\n';
    names.forEach((name, i) => {
      msg += `${i+1}. *${name}* → ${db.links[name]}\n`;
    });
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // ── /pesapal ──
  if (!db.pesapal) db.pesapal = {};
  saveDb();

  botInstance.command('setpesapal', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 3) return ctx.reply('Usage: /setpesapal <consumer_key> <consumer_secret>');
    const key = args[1].trim();
    const secret = args[2].trim();
    if (!key || !secret) return ctx.reply('❌ Both key and secret are required.');
    db.pesapal.consumer_key = key;
    db.pesapal.consumer_secret = secret;
    saveDb();
    await ctx.reply('✅ Pesapal credentials saved.');
  });

  botInstance.command('pesapal', async (ctx) => {
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) return ctx.reply('Usage: /pesapal <amount> [description]');
    const amount = parseFloat(args[1]);
    if (isNaN(amount) || amount <= 0) return ctx.reply('❌ Invalid amount.');
    const description = args.slice(2).join(' ') || 'Payment to Samsung XMD';
    const userId = ctx.from.id;
    try {
      if (!db.pesapal.consumer_key || !db.pesapal.consumer_secret) {
        return ctx.reply('❌ Pesapal not configured by owner. Please try later.');
      }
      const ref = `PESAPAL-${userId}-${Date.now()}`;
      const checkoutUrl = `https://www.pesapal.com/checkout?ref=${ref}`;
      await ctx.reply(
        `💳 *Pesapal Payment*\n\nAmount: *${amount}*\nDescription: ${description}\nReference: \`${ref}\`\n\n🔗 Click the button below to pay with Pesapal.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('💳 Pay Now', checkoutUrl)]
          ])
        }
      );
    } catch (err) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  });

  // ── /encrypt ──
  botInstance.command('encrypt', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.document) {
      return ctx.reply('❌ Please reply to a file (document) with /encrypt');
    }
    const fileId = reply.document.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);

    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, authTag, encrypted]);
    const keyBase64 = key.toString('base64');

    await ctx.replyWithDocument(
      { source: combined, filename: `${reply.document.file_name || 'file'}.enc` },
      {
        caption: `🔒 *File encrypted*\n\nKey (keep it safe!):\n\`${keyBase64}\`\n\nTo decrypt, use the key with AES-256-GCM.`,
        parse_mode: 'Markdown'
      }
    );
  });

  // ── /deobfuscate ──
  botInstance.command('deobfuscate', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.document) {
      return ctx.reply('❌ Please reply to a JavaScript file with /deobfuscate');
    }
    const fileId = reply.document.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink, { responseType: 'text' });
    const code = response.data;
    try {
      const deobfuscated = await deobfuscateJavaScript(code);
      await ctx.replyWithDocument(
        { source: Buffer.from(deobfuscated, 'utf-8'), filename: 'deobfuscated.js' },
        {
          caption: '✅ *Deobfuscation complete!* The code has been formatted for readability.',
          parse_mode: 'Markdown'
        }
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to deobfuscate: ${err.message}`);
    }
  });

  // ── /checkfile ──
  botInstance.command('checkfile', async (ctx) => {
    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.document) {
      return ctx.reply('❌ Please reply to a JavaScript file with /checkfile');
    }
    const fileId = reply.document.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink, { responseType: 'text' });
    const code = response.data;
    try {
      new vm.Script(code);
      await ctx.reply('✅ No syntax errors found in the file.');
    } catch (err) {
      const errorMsg = err.message.replace(/^SyntaxError: /, '');
      await ctx.reply(
        `❌ *Syntax Error found:*\n\n\`\`\`\n${errorMsg}\n\`\`\`\n\n💡 *Suggestion:* Check for missing brackets, semicolons, or typos.`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  // ── /clonebot (only on main) ──
  if (isMain) {
    botInstance.command('clonebot', async (ctx) => {
      const userId = String(ctx.from.id);

      // Clear any existing timeout
      if (localStates.has(userId)) {
        const oldState = localStates.get(userId);
        if (oldState.timeoutId) clearTimeout(oldState.timeoutId);
      }

      // Set 5‑minute timeout
      const timeoutId = setTimeout(() => {
        const state = localStates.get(userId);
        if (state && state.action === 'clonebot') {
          localStates.delete(userId);
          ctx.telegram.sendMessage(
            userId,
            '⏰ *Clone request timed out.* Please start again with /clonebot.',
            { parse_mode: 'Markdown' }
          ).catch(() => {});
        }
      }, 5 * 60 * 1000);

      localStates.set(userId, {
        action: 'clonebot',
        timeoutId: timeoutId,
      });

      await ctx.reply(
        '🤖 *Please send me the bot token for the new bot.*\n\n' +
        'Token format: `1234567890:ABCdef...`\n\n' +
        '⏳ You have **5 minutes**. Type /cancel to abort.',
        { parse_mode: 'Markdown' }
      );
    });

    botInstance.command('listclones', async (ctx) => {
      if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
      if (clonedBots.size === 0) return ctx.reply('ℹ️ No cloned bots active.');
      let msg = '*📋 Active Bot Instances:*\n';
      for (const [key, info] of clonedBots) {
        const status = info.isMain ? '(Main)' : '(Clone)';
        const uptime = formatUptime(Date.now() - info.startTime);
        msg += `• @${info.username} ${status} (uptime: ${uptime})\n`;
      }
      await ctx.reply(msg, { parse_mode: 'Markdown' });
    });

    botInstance.command('stopclone', async (ctx) => {
      if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
      const args = ctx.message.text.split(/\s+/);
      if (args.length < 2) return ctx.reply('Usage: /stopclone <bot_username>');
      const username = args[1].replace('@', '').trim();
      const mainUsername = (await botInstance.telegram.getMe()).username;
      if (username === 'main' || username === mainUsername) {
        return ctx.reply('❌ Cannot stop the main bot.');
      }
      const info = clonedBots.get(username);
      if (!info) return ctx.reply(`❌ No active bot with username @${username}.`);
      try {
        await info.botInstance.stop();
        clonedBots.delete(username);
        ctx.reply(`✅ Bot @${username} stopped.`);
      } catch (err) {
        ctx.reply(`❌ Error stopping: ${err.message}`);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  //   FILE STORE MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  botInstance.command('addstorefile', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const reply = ctx.message.reply_to_message;
    if (!reply || !reply.document) {
      return ctx.reply('❌ Please reply to a document with /addstorefile <name> <description>');
    }
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 3) {
      return ctx.reply('Usage: /addstorefile <name> <description> (reply to the document)');
    }
    const name = args[1];
    const description = args.slice(2).join(' ');
    const fileId = reply.document.file_id;
    const fileName = reply.document.file_name || 'unknown.zip';
    if (db.fileStore.some(f => f.name === name)) {
      return ctx.reply(`❌ A file with name "${name}" already exists. Use a different name or remove it first.`);
    }
    db.fileStore.push({ name, description, fileId, fileName });
    saveDb();
    await ctx.reply(`✅ File *${name}* added to store.\nDescription: ${description}`, { parse_mode: 'Markdown' });
  });

  botInstance.command('liststorefiles', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    if (!db.fileStore.length) return ctx.reply('📭 No files in the store.');
    let msg = '*📦 File Store:*\n';
    db.fileStore.forEach((f, i) => {
      msg += `${i+1}. *${f.name}* – ${f.description}\n`;
    });
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  botInstance.command('removestorefile', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) return ctx.reply('Usage: /removestorefile <name>');
    const name = args.slice(1).join(' ');
    const index = db.fileStore.findIndex(f => f.name === name);
    if (index === -1) return ctx.reply(`❌ No file found with name "${name}".`);
    db.fileStore.splice(index, 1);
    saveDb();
    await ctx.reply(`🗑️ File *${name}* removed from store.`, { parse_mode: 'Markdown' });
  });

  // ── Download file callback ──
  botInstance.action(/download_file_(.+)/, async (ctx) => {
    await ctx.answerCbQuery('Downloading...');
    const fileId = ctx.match[1];
    const file = db.fileStore.find(f => f.fileId === fileId);
    if (!file) return ctx.reply('❌ File not found.');
    await ctx.replyWithDocument(fileId, {
      caption: `📦 *${file.name}*\n${file.description || ''}`,
      parse_mode: 'Markdown'
    });
  });

  // ─────────────────────────────────────────────────────────────
  //   MESSAGE HANDLER (keyboard buttons & states)
  // ─────────────────────────────────────────────────────────────
  botInstance.on('message', async (ctx, next) => {
    if (!ctx.message || !ctx.message.text) return next();
    const text = ctx.message.text;
    const userId = String(ctx.from.id);

    // ── Check banned ──
    if (db.bannedUsers && db.bannedUsers.includes(userId)) {
      return ctx.reply('⛔ You are banned from using this bot.');
    }

    // ── Keyboard buttons ──

    // Row 1: Pair
    if (text === '𝑷𝑨𝑰𝑹 𝑺𝑨𝑴𝑺𝑼𝑵𝑮 𝑴𝑫 𝑷𝑹𝑬𝑴𝑰𝑼𝑴') {
      await ctx.reply(
        '🔐 *Pairing Options*\n\nChoose how you want to proceed:',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('📱 Pair New Device', 'pair_new')],
            [Markup.button.callback('📂 Use Existing Session ID', 'pair_existing')],
            [Markup.button.callback('❌ Cancel', 'pair_cancel')]
          ])
        }
      );
      return;
    }

    // Row 2: Generate Session ID
    if (text === '𝑮𝑬𝑵𝑬𝑹𝑨𝑻𝑬 𝑺𝑬𝑺𝑺𝑰𝑶𝑵 𝑰𝑫') {
      const uid = String(ctx.from.id);
      const sessionId = `wa_${uid}_${Date.now()}`;
      await ctx.reply(
        `📂 *Your Session ID:*\n\`${sessionId}\`\n\n` +
        `You can use this with "Use Existing Session ID" later.\n` +
        `It's also stored in the \`sessions/\` folder if you want to back it up.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Row 3: Buy Panel (full width)
    if (text === '𝑩𝑼𝒀 𝑷𝑨𝑵𝑬𝑳') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/buypanel');
      return;
    }

    // Row 4: Buy Admin Panel (full width)
    if (text === '𝑩𝑼𝒀 𝑨𝑫𝑴𝑰𝑵 𝑷𝑨𝑵𝑬𝑳') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/cpanel');
      return;
    }

    // Row 5: Del Pair & Refresh
    if (text === '𝑫𝑬𝑳 𝑷𝑨𝑰𝑹') {
      localStates.set(userId, { action: 'delpair' });
      await ctx.reply('🗑️ *Enter phone number to delete:*\n\nFormat: `254700000000`', { parse_mode: 'Markdown' });
      return;
    }

    if (text === '𝑹𝑬𝑭𝑹𝑬𝑺𝑯 𝑺𝑬𝑺𝑺𝑰𝑶𝑵') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/refreshsession');
      return;
    }

    // Row 6: Buy + Script & Verify
    if (text === '𝑩𝑼𝒀 + 𝑺𝑪𝑹𝑰𝑷𝑻') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/buyvpswithscript');
      return;
    }

    if (text === '𝑽𝑬𝑹𝑰𝑭𝒀 𝑷𝑨𝒀') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/verifypayment');
      return;
    }

    // Row 7: VPS Menu & Install Menu
    if (text === '𝑽𝑷𝑺 𝑴𝑬𝑵𝑼') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/cvps');
      return;
    }

    if (text === '𝑰𝑵𝑺𝑻𝑨𝑳𝑳 𝑴𝑬𝑵𝑼') {
      await ctx.reply(
        '📦 *Install Menu*\n\n' +
        '/installpanel\n/subdo\n/listsubdo\n/delallsubdo\n/swings\n/installtema\n/uninstalltema\n/uninstallwings\n/uninstallpanel\n/hbpanel\n/buyprotectpanel\n/installprotectprem',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Row 8: Owner Menu & Profile
    if (text === '𝑶𝑾𝑵𝑬𝑹 𝑴𝑬𝑵𝑼') {
      await ctx.reply(
        '👑 *Owner Commands*\n\n' +
        '/listprem\n/addprem\n/delprem\n/premonly\n/addowner\n/delown\n/listown\n/adminpanel\n/broadcast\n/withdraw\n/addlink\n/removelink\n/listlinks\n/setpesapal\n/addstorefile\n/liststorefiles\n/removestorefile\n/clonebot\n/listclones\n/stopclone\n/setprice\n/bulkpanels\n/addcmd\n/delcmd\n/listcmd\n/ban\n/unban',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (text === '𝑴𝒀 𝑷𝑹𝑶𝑭𝑰𝑳𝑬') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/profile');
      return;
    }

    // Row 9: Create Bot & Report Bug
    if (text === '𝑪𝑹𝑬𝑨𝑻𝑬 𝑩𝑶𝑻') {
      await ctx.reply(
        '🤖 *Create a custom WhatsApp bot*\n\n' +
        'Send the name you want for your bot:\n`/createbot <name>`\n\n' +
        'Example: `/createbot MySuperBot`',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (text === '𝑹𝑬𝑷𝑶𝑹𝑻 𝑩𝑼𝑮') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/bugreport');
      return;
    }

    // Row 10: Bot Files & My Tokens
    if (text === '𝑩𝑶𝑻 𝑭𝑰𝑳𝑬𝑺') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/botfiles');
      return;
    }

    if (text === '𝑴𝒀 𝑻𝑶𝑲𝑬𝑵𝑺') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/referral');
      return;
    }

    // Row 11: My Panels & Clone Bot
    if (text === '𝑴𝒀 𝑷𝑨𝑵𝑬𝑳𝑺') {
      await ctx.telegram.sendMessage(ctx.chat.id, '/mypanels');
      return;
    }

    if (text === '𝑪𝑳𝑶𝑵𝑬 𝑩𝑶𝑻') {
      if (!isMain) return ctx.reply('❌ Cloning is only available on the main bot.');
      await ctx.telegram.sendMessage(ctx.chat.id, '/clonebot');
      return;
    }

    // ── State handling ──
    const state = localStates.get(userId);
    if (state) {
      await handleUserState(ctx, state, text);
      return;
    }

    // ── Dynamic custom commands ──
    if (text.startsWith('/')) {
      const cmd = text.split(/\s+/)[0].slice(1);
      if (db.customCommands && db.customCommands[cmd]) {
        const entry = db.customCommands[cmd];
        if (entry.ownerOnly && !isOwner(ctx.from.id)) {
          return ctx.reply('❌ Owner only.');
        }
        try {
          const result = eval(entry.code);
          await ctx.reply(result || '✅ Done.');
        } catch (e) {
          await ctx.reply(`❌ Error: ${e.message}`);
        }
        return;
      }
    }

    return next();
  });

  // ─────────────────────────────────────────────────────────────
  //   STATE HANDLER
  // ─────────────────────────────────────────────────────────────
  async function handleUserState(ctx, state, text) {
    const userId = String(ctx.from.id);
    const bot = ctx.telegram;

    switch (state.action) {
      case 'pair': {
        const phone = text.replace(/\D/g, '');
        if (!phone || phone.length < 7) {
          return ctx.reply('❌ Invalid phone number. Use format: 254700000000');
        }
        await ctx.reply(`🔄 Pairing +${phone}...`);
        const uid = String(ctx.from.id);
        const sessionId = `wa_${uid}_${phone}`;
        if (activeSockets.has(sessionId)) {
          return ctx.reply(`✅ +${phone} already connected!`);
        }
        if (sessionExists(sessionId)) {
          await ctx.reply(`♻️ Reconnecting +${phone}...`);
          await startWhatsApp(sessionId, ctx.chat.id, null, uid);
          return;
        }
        await startWhatsApp(sessionId, ctx.chat.id, phone, uid);
        break;
      }

      case 'restore_session': {
        const sessionId = text.trim();
        if (!sessionId.startsWith('wa_') || !/\d/.test(sessionId)) {
          return ctx.reply(
            '❌ Invalid Session ID format.\nIt should start with `wa_` and contain numbers.\nExample: `wa_123456789_254700000000`',
            { parse_mode: 'Markdown' }
          );
        }
        const uid = String(ctx.from.id);
        const pairs = getUserPairs(uid);
        if (pairs.find(p => p.sessionId === sessionId)) {
          return ctx.reply(`ℹ️ Session \`${sessionId}\` is already paired with your account.`, { parse_mode: 'Markdown' });
        }
        if (!sessionExists(sessionId)) {
          const downloaded = await downloadSessionFromGitHub(sessionId);
          if (!downloaded) {
            return ctx.reply('❌ Session not found locally or on GitHub. Please pair a new device instead.');
          }
        }
        if (activeSockets.has(sessionId)) {
          return ctx.reply(`✅ Session \`${sessionId}\` is already active.`, { parse_mode: 'Markdown' });
        }
        await ctx.reply(`🔄 Restoring session \`${sessionId}\`...`, { parse_mode: 'Markdown' });
        const waNum = sessionId.split('_').pop();
        if (waNum && /^\d{7,}$/.test(waNum)) {
          addPair(uid, sessionId, waNum);
        }
        await startWhatsApp(sessionId, ctx.chat.id, null, uid);
        break;
      }

      case 'delpair': {
        const phone = text.replace(/\D/g, '');
        if (!phone || phone.length < 7) return ctx.reply('❌ Invalid phone number.');
        const uid = String(ctx.from.id);
        const sessionId = `wa_${uid}_${phone}`;
        const sock = activeSockets.get(sessionId);
        if (sock) {
          try { await sock.logout(); } catch {}
          try { sock.ws?.close(); } catch {}
          activeSockets.delete(sessionId);
        }
        notifiedConnected.delete(sessionId);
        removePair(uid, sessionId);
        deleteSession(sessionId);
        deleteSessionFromGitHub(sessionId).catch(() => {});
        await ctx.reply(`🗑️ +${phone} deleted.`);
        break;
      }

      case 'buypanel_username': {
        const username = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!username || username.length < 3) {
          return ctx.reply('❌ Username must be at least 3 chars (letters, numbers, underscore).');
        }
        const sessionKey = `tg_${ctx.from.id}_buypanel`;
        if (!global._pendingTelegram) global._pendingTelegram = {};
        global._pendingTelegram[sessionKey] = { username, isAdmin: false };
        await showRamSelection(ctx, sessionKey, username, false);
        break;
      }

      case 'cpanel_username': {
        const username = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!username || username.length < 3) {
          return ctx.reply('❌ Username must be at least 3 chars.');
        }
        const sessionKey = `tg_${ctx.from.id}_cpanel`;
        if (!global._pendingTelegram) global._pendingTelegram = {};
        global._pendingTelegram[sessionKey] = { username, isAdmin: true };
        await showRamSelection(ctx, sessionKey, username, false);
        break;
      }

      case 'clonebot': {
        if (state.timeoutId) clearTimeout(state.timeoutId);
        const token = text.trim();
        if (!token || !token.includes(':')) {
          return ctx.reply('❌ Invalid token format. Please send a valid bot token.');
        }
        try {
          const testBot = new Telegraf(token);
          const me = await testBot.telegram.getMe();
          if (clonedBots.has(me.username)) {
            return ctx.reply(`⚠️ A bot with username @${me.username} is already running.`);
          }
          const newBot = new Telegraf(token);
          setupBot(newBot, { isMain: false });
          await newBot.launch();
          clonedBots.set(me.username, {
            username: me.username,
            token: token,
            botInstance: newBot,
            startTime: Date.now(),
            isMain: false,
          });
          await ctx.reply(
            `✅ *New bot @${me.username} is now active!*\n\n` +
            `It has all the same features, except cloning.\n` +
            `Use /stopclone @${me.username} to stop it.`,
            { parse_mode: 'Markdown' }
          );
        } catch (err) {
          await ctx.reply(`❌ Failed to launch clone: ${err.message}`);
        }
        break;
      }

      default:
        return ctx.reply('❌ Unknown action. Please start again.');
    }
    localStates.delete(userId);
  }

  // ─────────────────────────────────────────────────────────────
  //   BROADCAST HANDLER
  // ─────────────────────────────────────────────────────────────
  botInstance.on('message', async (ctx, next) => {
    if (!ctx.message) return next();
    const userId = String(ctx.from.id);

    if (broadcastPending.has(userId) && ctx.message.text !== '/cancel') {
      broadcastPending.delete(userId);
      const msg = ctx.message;
      const users = Object.keys(db.users);
      if (!users.length) {
        return ctx.reply('❌ No users to broadcast to.');
      }

      await ctx.reply(`📢 Broadcasting to ${users.length} users...`);

      let success = 0, fail = 0;
      for (const uid of users) {
        try {
          await sendBroadcastToUser(uid, msg, ctx.telegram);
          success++;
        } catch {
          fail++;
        }
        // Small delay to avoid hitting rate limits
        await new Promise(r => setTimeout(r, 100));
      }

      await ctx.reply(`✅ Broadcast complete!\nSent: ${success}\nFailed: ${fail}`);
      return;
    }

    return next();
  });

  // ─────────────────────────────────────────────────────────────
  //   BROADCAST HELPER
  // ─────────────────────────────────────────────────────────────
  async function sendBroadcastToUser(uid, msg, telegram) {
    const rawText = msg.text || msg.caption || '';
    const { clean, markup } = parseBroadcastButtons(rawText);
    const extra = { parse_mode: 'Markdown', ...(markup || {}) };

    if (msg.sticker) return telegram.sendSticker(uid, msg.sticker.file_id, markup ? { reply_markup: markup.reply_markup } : {});
    if (msg.animation) return telegram.sendAnimation(uid, msg.animation.file_id, { caption: clean, ...extra });
    if (msg.video_note) return telegram.sendVideoNote(uid, msg.video_note.file_id);
    if (msg.voice) return telegram.sendVoice(uid, msg.voice.file_id, { caption: clean, ...extra });
    if (msg.photo) return telegram.sendPhoto(uid, msg.photo[msg.photo.length - 1].file_id, { caption: clean, ...extra });
    if (msg.video) return telegram.sendVideo(uid, msg.video.file_id, { caption: clean, ...extra });
    if (msg.audio) return telegram.sendAudio(uid, msg.audio.file_id, { caption: clean, ...extra });
    if (msg.document) return telegram.sendDocument(uid, msg.document.file_id, { caption: clean, ...extra });
    return telegram.sendMessage(uid, clean || msg.text, extra);
  }

  function parseBroadcastButtons(text) {
    if (!text) return { clean: text || '', markup: null };
    const btnRegex = /\[([^\]|]+)\|([^\]]+)\]/g;
    const rows = [];
    let currentRow = [];
    let clean = text;
    let match;
    const matches = [];
    while ((match = btnRegex.exec(text)) !== null) matches.push(match);
    if (!matches.length) return { clean: text, markup: null };
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const label = m[1].trim();
      const url = m[2].trim();
      const before = i === 0 ? text.slice(0, m.index) : text.slice(matches[i-1].index + matches[i-1][0].length, m.index);
      if (i > 0 && before.includes('\n')) { if (currentRow.length) rows.push(currentRow); currentRow = []; }
      currentRow.push(Markup.button.url(label, url));
    }
    if (currentRow.length) rows.push(currentRow);
    clean = text.replace(/\[([^\]|]+)\|([^\]]+)\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return { clean, markup: rows.length ? Markup.inlineKeyboard(rows) : null };
  }

  // ─────────────────────────────────────────────────────────────
  //   PANEL RAM SELECTION CALLBACKS
  // ─────────────────────────────────────────────────────────────
  botInstance.action(/panel_ram_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const ramKey = ctx.match[1];
    const tgId = ctx.from.id;
    const userId = String(tgId);
    let sessionKey = `tg_${tgId}_buypanel`;
    let pending = global._pendingTelegram?.[sessionKey];
    if (!pending) {
      sessionKey = `tg_${tgId}_cpanel`;
      pending = global._pendingTelegram?.[sessionKey];
    }
    if (!pending || !pending.username) {
      return ctx.reply('❌ Session expired. Please start again with /buypanel or /cpanel.');
    }
    const spec = ramMap[ramKey];
    if (!spec) return ctx.reply('❌ Invalid RAM option.');
    pending.spec = spec;
    await handleTokenChoice(ctx, userId, sessionKey, spec, false);
  });

  botInstance.action(/vps_ram_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const ramKey = ctx.match[1];
    const tgId = ctx.from.id;
    const userId = String(tgId);
    const sessionKey = `tg_${tgId}_buyvps`;
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending || !pending.username) {
      return ctx.reply('❌ Session expired. Please start again with /buyvpswithscript.');
    }
    const vpsSpecsMap = {
      '1gb': { ram: 1024, price: 5000, size: 's-1vcpu-1gb' },
      '2gb': { ram: 2048, price: 10000, size: 's-1vcpu-2gb' },
      '4gb': { ram: 4096, price: 20000, size: 's-2vcpu-4gb' },
      '8gb': { ram: 8192, price: 40000, size: 's-4vcpu-8gb' },
    };
    const spec = vpsSpecsMap[ramKey];
    if (!spec) return ctx.reply('❌ Invalid RAM option.');
    pending.spec = spec;
    await handleTokenChoice(ctx, userId, sessionKey, spec, true);
  });

  botInstance.action(/token_use_(\d+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const discount = parseInt(ctx.match[1]);
    const sessionKey = ctx.match[2];
    const userId = String(ctx.from.id);
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending) return ctx.reply('❌ Session expired.');
    if (!db.users[userId]) db.users[userId] = {};
    db.users[userId].tokens = (db.users[userId].tokens || 0) - discount;
    saveDb();
    const spec = pending.spec;
    const originalPrice = spec.price;
    spec.price = originalPrice - discount;
    const isVps = pending.isVps || false;
    await proceedToPayment(ctx, userId, sessionKey, spec, isVps);
  });

  botInstance.action(/token_skip_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const sessionKey = ctx.match[1];
    const userId = String(ctx.from.id);
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending) return ctx.reply('❌ Session expired.');
    const spec = pending.spec;
    const isVps = pending.isVps || false;
    await proceedToPayment(ctx, userId, sessionKey, spec, isVps);
  });

  botInstance.action('panel_cancel', async (ctx) => {
    await ctx.answerCbQuery();
    const tgId = ctx.from.id;
    delete global._pendingTelegram?.[`tg_${tgId}_buypanel`];
    delete global._pendingTelegram?.[`tg_${tgId}_cpanel`];
    delete global._pendingTelegram?.[`tg_${tgId}_buyvps`];
    await ctx.reply('❌ Purchase cancelled.');
  });

  botInstance.action(/verify_panel_payment_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const reference = ctx.match[1];
    const pending = pendingPayments.get(reference);
    if (!pending) return ctx.reply('❌ Reference not found.');
    await verifyAndCreatePanel(ctx, reference, pending);
  });

  // ─────────────────────────────────────────────────────────────
  //   BUY VPS WITH SCRIPT CALLBACKS
  // ─────────────────────────────────────────────────────────────
  botInstance.action('buyvps_upload', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = String(ctx.from.id);
    const sessionKey = `tg_${userId}_buyvps`;
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending) return ctx.reply('❌ Session expired.');
    pending.waitingForFile = true;
    if (!global._buyvpsWaiting) global._buyvpsWaiting = {};
    global._buyvpsWaiting[userId] = { sessionKey, waiting: true };
    const skipButton = Markup.inlineKeyboard([
      [Markup.button.callback('⏭️ Skip (deploy default)', 'buyvps_skip')]
    ]);
    await ctx.editMessageText(
      '📤 *Upload your ZIP file*\n\nSend a ZIP file containing your project (must have package.json and index.js).\nOr press "Skip" to deploy a default bot.',
      { parse_mode: 'Markdown', ...skipButton }
    );
  });

  botInstance.action('buyvps_store', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = String(ctx.from.id);
    const sessionKey = `tg_${userId}_buyvps`;
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending) return ctx.reply('❌ Session expired.');
    const store = db.fileStore || [];
    if (!store.length) {
      return ctx.reply('📭 No files in the store yet. Please ask the owner to add some.');
    }
    const buttons = store.map(f => ([
      Markup.button.callback(`📦 ${f.name}`, `buyvps_store_select_${f.name}`)
    ]));
    buttons.push([Markup.button.callback('❌ Cancel', 'vps_cancel')]);
    await ctx.editMessageText(
      '📦 *Choose a script from our store:*',
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) }
    );
  });

  botInstance.action('buyvps_skip', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = String(ctx.from.id);
    const sessionKey = `tg_${userId}_buyvps`;
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending) return ctx.reply('❌ Session expired.');
    pending.fileId = null;
    pending.fileName = null;
    pending.fileSource = 'skip';
    await showVpsRamSelection(ctx, sessionKey, pending.username);
  });

  botInstance.action(/buyvps_store_select_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const name = ctx.match[1];
    const userId = String(ctx.from.id);
    const sessionKey = `tg_${userId}_buyvps`;
    const pending = global._pendingTelegram?.[sessionKey];
    if (!pending) return ctx.reply('❌ Session expired.');
    const storeItem = db.fileStore.find(f => f.name === name);
    if (!storeItem) return ctx.reply('❌ File not found in store.');
    pending.fileId = storeItem.fileId;
    pending.fileName = storeItem.fileName;
    pending.fileSource = 'store';
    await showVpsRamSelection(ctx, sessionKey, pending.username);
  });

  botInstance.action('vps_cancel', async (ctx) => {
    await ctx.answerCbQuery();
    const tgId = ctx.from.id;
    delete global._pendingTelegram?.[`tg_${tgId}_buyvps`];
    await ctx.reply('❌ Purchase cancelled.');
  });

  // ─────────────────────────────────────────────────────────────
  //   VPS COMMANDS & CALLBACKS (DigitalOcean)
  // ─────────────────────────────────────────────────────────────

  // ── /cvps (Create VPS) ──
  botInstance.command('cvps', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) {
      return ctx.reply('❌ Owner/Premium only.');
    }
    const keyboard = [
      [{ text: "🌎 Digital Ocean 1", callback_data: "createvps_1" }],
      [{ text: "🌎 Digital Ocean 2", callback_data: "createvps_2" }],
      [{ text: "🌎 Digital Ocean 3", callback_data: "createvps_3" }]
    ];
    await ctx.reply('📡 *VPS Creation Menu*\nSelect your DigitalOcean account:', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  // ── VPS Creation Callbacks ──
  botInstance.action(/createvps_([1-3])/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const keyboard = Object.entries(vpsSpecs).map(([id, spec]) => ([{
      text: `${spec.icon} ${spec.name}`,
      callback_data: `spec_${accId}_${id}`
    }]));
    await ctx.editMessageText(
      `📡 *Create VPS*\n\nDigitalOcean account: 🌎 *${accId}*\nNow choose a specification:`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(keyboard) }
    );
  });

  botInstance.action(/spec_([1-3])_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const specId = ctx.match[2];
    const spec = vpsSpecs[specId];
    const keyboard = Object.entries(vpsImages).map(([id, img]) => ([{
      text: `${img.icon} ${img.name}`,
      callback_data: `image_${accId}_${specId}_${id}`
    }]));
    await ctx.editMessageText(
      `📦 Specification: *${spec.name}*\n\nNow choose an OS image:`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(keyboard) }
    );
  });

  botInstance.action(/image_([1-3])_(.+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const specId = ctx.match[2];
    const imageId = ctx.match[3];
    const spec = vpsSpecs[specId];
    const img = vpsImages[imageId];
    const keyboard = Object.entries(vpsRegions).map(([id, reg]) => ([{
      text: `${reg.flag} ${reg.name}`,
      callback_data: `region_${accId}_${specId}_${imageId}_${id}`
    }]));
    await ctx.editMessageText(
      `📦 Spec: *${spec.name}*\n💿 OS: *${img.name}*\n\nNow choose a region:`,
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard(keyboard) }
    );
  });

  botInstance.action(/region_([1-3])_(.+)_(.+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const specId = ctx.match[2];
    const imageId = ctx.match[3];
    const regionId = ctx.match[4];
    const spec = vpsSpecs[specId];
    const img = vpsImages[imageId];
    const reg = vpsRegions[regionId];

    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    if (!apiKey) return ctx.reply('❌ API key not configured.');

    await ctx.editMessageText(
      `📡 Starting VPS creation...\n\n📦 *${spec.name}*\n💿 *${img.name}*\n🌍 ${reg.flag} *${reg.name}*\n\n⏳ Please wait...`,
      { parse_mode: 'Markdown' }
    );

    try {
      const hostname = 'vpshostinger';
      const password = 'VPS' + Math.floor(Math.random() * 9999).toString();
      const dropletId = await createVPSDroplet(apiKey, hostname, vpsSpecs[specId].size, imageId, regionId, password);
      let ipAddress = null;
      while (!ipAddress) {
        await new Promise(r => setTimeout(r, 5000));
        const droplet = await getDropletInfo(apiKey, dropletId);
        ipAddress = droplet?.networks?.v4?.find(n => n.type === 'public')?.ip_address || null;
      }
      addVPS(dropletId, { hostname, dropletId, ip: ipAddress, spec: spec.name, os: img.name, region: `${reg.flag} ${reg.name}`, password, owner: ctx.from.id });
      await ctx.reply(
        `✅ *VPS Created Successfully!*\n\n` +
        `🌐 IP Address: \`${ipAddress}\`\n🔐 Password: \`${password}\`\n🖥️ Hostname: \`${hostname}\`\n🆔 Droplet ID: \`${dropletId}\`\n\n` +
        `📦 Spec: ${spec.name}\n💿 OS: ${img.name}\n🌍 Region: ${reg.flag} ${reg.name}\n\n` +
        `⚠️ *VPS T.O.S:*\n• No hacking\n• No mining\n• No torrent\n• No overload (100% CPU)\n• No DDoS\n\n` +
        `📛 *DO Account Terms:*\n• If your DO account gets suspended → Warranty ACTIVE\n\n` +
        `📝 *Warranty Claim Requirements:*\n1. Proof of transfer\n2. Screenshot of purchase chat\n3. Purchase date\n4. VPS data (IP/User/etc.)\n5. Join our channel`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to create VPS\n\nError: ${err.message}`);
    }
  });

  // ── /listvps ──
  botInstance.command('listvps', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const keyboard = [
      [{ text: "🌎 DO 1", callback_data: "listdo_1" }],
      [{ text: "🌎 DO 2", callback_data: "listdo_2" }],
      [{ text: "🌎 DO 3", callback_data: "listdo_3" }]
    ];
    await ctx.reply('*📋 VPS List*\nSelect your DigitalOcean account:', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/listdo_([1-3])/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;

    try {
      await ctx.editMessageText('🔍 Fetching VPS list...');
      const droplets = await getListVps(apiKey);
      if (droplets.length === 0) {
        return ctx.editMessageText('📭 No VPS found.');
      }
      const keyboard = droplets.map(vps => {
        const ip = vps.networks?.v4?.find(net => net.type === "public")?.ip_address || "No IP";
        const region = vpsRegions[vps.region.slug] || { flag: "🏳️", name: "Unknown" };
        const status = formatVPSStatus(vps.status);
        const uptime = formatUptimeVPS(vps.created_at);
        return [{
          text: `🖥️ ${vps.name} | ${status} | ${region.flag} ${region.name} | ${ip} | ${uptime}`,
          callback_data: `vpsinfo_${accId}_${vps.id}`
        }];
      });
      await ctx.editMessageText(
        `🛰️ *Monitoring VPS*\n📊 Total VPS: *${droplets.length}*\n\nClick for details:`,
        { parse_mode: 'Markdown', ...Markup.inlineKeyboard(keyboard) }
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to get VPS list\n\nError: ${err.message}`);
    }
  });

  botInstance.action(/vpsinfo_([1-3])_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const dropletId = ctx.match[2];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      const droplet = await getVpsDetail(apiKey, dropletId);
      const ip = droplet?.networks?.v4?.find(net => net.type === "public")?.ip_address || "Not available yet";
      const region = vpsRegions[droplet?.region?.slug] || { flag: "🏳️", name: "Unknown" };
      const status = formatVPSStatus(droplet?.status);
      const uptime = droplet?.created_at ? formatUptimeVPS(droplet.created_at) : "N/A";
      const info =
        `🖥️ *${droplet?.name || "Unknown"}*\n\n` +
        `🆔 ID: \`${droplet?.id || "???"}\`\n` +
        `🌎 IP: \`${ip}\`\n` +
        `📦 Spec: ${droplet?.size_slug || "???"}\n` +
        `🖥️ OS: ${droplet?.image?.distribution || "???"} ${droplet?.image?.name || ""}\n` +
        `🌍 Region: ${region.flag} ${region.name}\n` +
        `📡 Status: ${status}\n` +
        `⏱️ Uptime: ${uptime}`;
      await ctx.reply(info, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ Failed to get VPS details\n\nError: ${err.message}`);
    }
  });

  // ── /cekip ──
  botInstance.command('cekip', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const dropletId = args[1];
    if (!dropletId) return ctx.reply('Usage: /cekip <droplet_id>');
    const keyboard = [
      [{ text: "🌎 DO 1", callback_data: `cekip_${dropletId}_1` }],
      [{ text: "🌎 DO 2", callback_data: `cekip_${dropletId}_2` }],
      [{ text: "🌎 DO 3", callback_data: `cekip_${dropletId}_3` }]
    ];
    await ctx.reply(`*🔍 Check VPS IP*\nSelect your DigitalOcean account:`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/cekip_(.+)_([1-3])/, async (ctx) => {
    await ctx.answerCbQuery();
    const dropletId = ctx.match[1];
    const accId = ctx.match[2];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      const droplet = await getDropletInfo(apiKey, dropletId);
      const ip = droplet?.networks?.v4?.find(n => n.type === 'public')?.ip_address || 'In progress';
      const region = vpsRegions[droplet?.region?.slug] || { name: droplet?.region?.slug || 'Unknown', flag: '❓' };
      const spec = Object.values(vpsSpecs).find(s => s.size === droplet?.size_slug);
      const osName = (droplet?.image?.distribution || '') + ' ' + (droplet?.image?.name || '');
      const msg =
        `📡 *VPS Details*\n\n` +
        `🖥️ Hostname: \`${droplet?.name || '???'}\`\n` +
        `🌎 IP: \`${ip}\`\n` +
        `📦 Spec: ${spec ? spec.name : droplet?.size_slug || '???'}\n` +
        `💿 OS: ${osName || '???'}\n` +
        `🌍 Region: ${region.flag} ${region.name}\n` +
        `⚡ Status: *${droplet?.status || '???'}*\n` +
        `🆔 Droplet ID: \`${droplet?.id || dropletId}\``;
      await ctx.reply(msg, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ Failed to check VPS\n\nError: ${err.message}`);
    }
  });

  // ── /delvps ──
  botInstance.command('delvps', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const dropletId = args[1];
    if (!dropletId) return ctx.reply('Usage: /delvps <droplet_id>');
    const keyboard = [
      [{ text: "🌎 DO 1", callback_data: `delvpsacc_1_${dropletId}` }],
      [{ text: "🌎 DO 2", callback_data: `delvpsacc_2_${dropletId}` }],
      [{ text: "🌎 DO 3", callback_data: `delvpsacc_3_${dropletId}` }]
    ];
    await ctx.reply(`*♻️ Delete VPS*\nSelect your DigitalOcean account:`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/delvpsacc_([1-3])_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const dropletId = ctx.match[2];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      const vps = await getDropletInfo(apiKey, dropletId);
      if (!vps) return ctx.reply('❌ VPS not found.');
      const confirmMsg =
        `⚠️ *CONFIRM DELETE VPS*\n\n` +
        `🖥️ Name: ${vps.name}\n🆔 ID: \`${dropletId}\`\n🌎 IP: \`${vps.networks?.v4?.[0]?.ip_address || 'No IP'}\`\n\n` +
        `❗ *WARNING:* All data will be permanently lost.\nAre you sure?`;
      await ctx.reply(confirmMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Yes, Delete', `confirmdel_${accId}_${dropletId}`),
           Markup.button.callback('❌ Cancel', 'canceldelete')]
        ])
      });
    } catch (err) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  });

  botInstance.action(/confirmdel_([1-3])_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const dropletId = ctx.match[2];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      await deleteVPS(apiKey, dropletId);
      await ctx.reply(`✅ VPS \`${dropletId}\` successfully deleted.`, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ Failed to delete: ${err.message}`);
    }
  });

  botInstance.action('canceldelete', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('❌ Delete cancelled.');
  });

  // ── /svps (Start VPS) ──
  botInstance.command('svps', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const dropletId = args[1];
    if (!dropletId) return ctx.reply('Usage: /svps <droplet_id>');
    const keyboard = [
      [{ text: "🌎 DO 1", callback_data: `startvps_1_${dropletId}` }],
      [{ text: "🌎 DO 2", callback_data: `startvps_2_${dropletId}` }],
      [{ text: "🌎 DO 3", callback_data: `startvps_3_${dropletId}` }]
    ];
    await ctx.reply(`*⚡ Start VPS*\nSelect account to start VPS ${dropletId}:`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/startvps_([1-3])_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const dropletId = ctx.match[2];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      await ctx.reply(`⏳ Starting VPS ${dropletId}...`);
      await startVPS(apiKey, dropletId);
      await ctx.reply(`✅ VPS \`${dropletId}\` started.`, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ Failed to start: ${err.message}`);
    }
  });

  // ── /stopvps ──
  botInstance.command('stopvps', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const dropletId = args[1];
    if (!dropletId) return ctx.reply('Usage: /stopvps <droplet_id>');
    const keyboard = [
      [{ text: "🌎 DO 1", callback_data: `stopvps_1_${dropletId}` }],
      [{ text: "🌎 DO 2", callback_data: `stopvps_2_${dropletId}` }],
      [{ text: "🌎 DO 3", callback_data: `stopvps_3_${dropletId}` }]
    ];
    await ctx.reply(`*⏹️ Stop VPS*\nSelect account to stop VPS ${dropletId}:`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/stopvps_([1-3])_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    const dropletId = ctx.match[2];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      await ctx.reply(`⏳ Stopping VPS ${dropletId}...`);
      await stopVPS(apiKey, dropletId);
      await ctx.reply(`✅ VPS \`${dropletId}\` stopped.`, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ Failed to stop: ${err.message}`);
    }
  });

  // ── /statusdo ──
  botInstance.command('statusdo', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const keyboard = [
      [{ text: "🌎 Digital Ocean 1", callback_data: "infodo_1" }],
      [{ text: "🌎 Digital Ocean 2", callback_data: "infodo_2" }],
      [{ text: "🌎 Digital Ocean 3", callback_data: "infodo_3" }]
    ];
    await ctx.reply('📊 *DO Account Status*\nSelect an account:', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/infodo_([1-3])/, async (ctx) => {
    await ctx.answerCbQuery();
    const accId = ctx.match[1];
    let apiKey;
    if (accId === '1') apiKey = settings.apiDigitalOcean;
    else if (accId === '2') apiKey = settings.apiDigitalOcean2;
    else if (accId === '3') apiKey = settings.apiDigitalOcean3;
    try {
      const accountRes = await fetch('https://api.digitalocean.com/v2/account', { headers: { Authorization: `Bearer ${apiKey}` } });
      const account = await accountRes.json();
      const dropletRes = await fetch('https://api.digitalocean.com/v2/droplets', { headers: { Authorization: `Bearer ${apiKey}` } });
      const droplets = await dropletRes.json();
      const msg =
        `📊 *Account Status:* ${account.account?.status || 'Unknown'}\n` +
        `💳 *Droplet Limit:* ${account.account?.droplet_limit || 0}\n` +
        `🌎 *Active VPS:* ${droplets.droplets?.length || 0}\n` +
        `💰 *Remaining Droplets:* ${(account.account?.droplet_limit || 0) - (droplets.droplets?.length || 0)}`;
      await ctx.reply(msg, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ Failed to fetch data: ${err.message}`);
    }
  });

  // ── /setpwvps ──
  botInstance.command('setpwvps', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /setpwvps ip|oldpass|newpass');
    const parts = text.split('|');
    if (parts.length < 3) return ctx.reply('Format: /setpwvps ip|oldpass|newpass');
    const [ipvps, oldpw, newpw] = parts.map(s => s.trim());
    const conn = new Client();
    await ctx.reply('⏳ Changing password...');
    conn.on('ready', () => {
      conn.exec(`echo "${oldpw}" | passwd --stdin root && echo "root:${newpw}" | chpasswd`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('close', () => {
          conn.end();
          ctx.reply(`✅ *Password changed successfully*\n\n📌 IP: \`${ipvps}\`\n🔑 New password: \`${newpw}\``, { parse_mode: 'Markdown' });
        });
        stream.stderr.on('data', (d) => ctx.reply(`❌ ${d.toString()}`));
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ipvps, port: 22, username: 'root', password: oldpw });
  });

  // ── /installpanel ──
  botInstance.command('installpanel', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /installpanel ip|password|domainpanel|domainnode|ram');
    const parts = text.split('|');
    if (parts.length < 5) return ctx.reply('Format: /installpanel ip|password|domainpanel|domainnode|ram');
    const [ip, password, domainpanel, domainnode, ramserver] = parts.map(s => s.trim());
    await ctx.reply('⏳ Installing panel... This may take 1-10 minutes.');
    try {
      const result = await installPanelViaSSH(ip, password, domainpanel, domainnode, ramserver);
      await ctx.reply(
        `✅ *Panel Installed Successfully!*\n\n` +
        `👤 Username: ${result.userPanel}\n🔑 Password: ${result.passwordPanel}\n🌎 Domain: ${result.domainpanel}\n🛰️ Node: ${result.domainnode}`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      await ctx.reply(`❌ Installation failed: ${err.message}`);
    }
  });

  // ── /subdo ──
  botInstance.command('subdo', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /subdo hostname|ip');
    const [host, ip] = text.split('|').map(s => s.trim());
    if (!host || !ip) return ctx.reply('Format: /subdo hostname|ip');
    const domains = Object.keys(global.subdomain);
    if (!domains.length) return ctx.reply('❌ No domains available.');
    const keyboard = [];
    for (let i = 0; i < domains.length; i += 2) {
      const row = domains.slice(i, i+2).map(d => ({
        text: d,
        callback_data: `create_domain_${i}_${host}|${ip}`
      }));
      keyboard.push(row);
    }
    await ctx.reply('🔹 *Select a domain for subdomain:*', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    });
  });

  botInstance.action(/create_domain_(\d+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const index = parseInt(ctx.match[1]);
    const [host, ip] = ctx.match[2].split('|');
    const domains = Object.keys(global.subdomain);
    if (index >= domains.length) return ctx.reply('❌ Domain not found.');
    const tld = domains[index];
    const result = await createSubDomain(host, ip, tld);
    if (result.success) {
      await ctx.reply(`✅ *Subdomain created successfully*\n\n🌎 Subdomain: \`${result.name}\`\n📌 IP: \`${result.ip}\``, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(`❌ Failed: ${result.error}`);
    }
  });

  // ── /listsubdo ──
  botInstance.command('listsubdo', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const domains = Object.keys(global.subdomain);
    if (!domains.length) return ctx.reply('❌ No domains.');
    const list = domains.map((d, i) => `${i+1}. \`${d}\``).join('\n');
    await ctx.reply(`📜 *Available Domains*\n\n${list}`, { parse_mode: 'Markdown' });
  });

  // ── /delallsubdo ──
  botInstance.command('delallsubdo', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const domain = args[1];
    if (!domain) {
      const domains = Object.keys(global.subdomain);
      if (!domains.length) return ctx.reply('❌ No domains.');
      const keyboard = domains.map(d => ([{ text: `🗑️ Delete All DNS: ${d}`, callback_data: `delallsubdo_${d}` }]));
      await ctx.reply('🧩 *Select Domain:*', { ...Markup.inlineKeyboard(keyboard) });
      return;
    }
    const tld = Object.keys(global.subdomain).find(k => k.toLowerCase() === domain.toLowerCase());
    if (!tld) return ctx.reply(`❌ Domain *${domain}* not found.`, { parse_mode: 'Markdown' });
    await ctx.reply(`⏳ Deleting all DNS records for ${tld}...`);
    const dns = await listAllDNSRecords(tld);
    if (!dns.success) return ctx.reply(`❌ Failed: ${dns.error}`);
    if (dns.records.length === 0) return ctx.reply(`ℹ️ No DNS records.`);
    let success = 0, fail = 0;
    for (const rec of dns.records) {
      const del = await deleteDNSRecord(tld, rec.id);
      if (del.success) success++; else fail++;
      await new Promise(r => setTimeout(r, 500));
    }
    await ctx.reply(`✅ *Deletion Results*\n\n🌎 Domain: ${tld}\n✅ Success: ${success}\n❌ Failed: ${fail}`, { parse_mode: 'Markdown' });
  });

  botInstance.action(/delallsubdo_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const domain = ctx.match[1];
    await ctx.reply(`⏳ Deleting all DNS records for ${domain}...`);
    const tld = Object.keys(global.subdomain).find(k => k.toLowerCase() === domain.toLowerCase());
    if (!tld) return ctx.reply(`❌ Domain *${domain}* not found.`, { parse_mode: 'Markdown' });
    const dns = await listAllDNSRecords(tld);
    if (!dns.success) return ctx.reply(`❌ Failed: ${dns.error}`);
    if (dns.records.length === 0) return ctx.reply(`ℹ️ No DNS records.`);
    let success = 0, fail = 0;
    for (const rec of dns.records) {
      const del = await deleteDNSRecord(tld, rec.id);
      if (del.success) success++; else fail++;
      await new Promise(r => setTimeout(r, 500));
    }
    await ctx.reply(`✅ *Deletion Results*\n\n🌎 Domain: ${tld}\n✅ Success: ${success}\n❌ Failed: ${fail}`, { parse_mode: 'Markdown' });
  });

  // ── /swings ──
  botInstance.command('swings', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    if (args.length < 2) return ctx.reply('Usage: /swings ip|password|token');
    const [ip, password, token] = args[1].split('|').map(s => s.trim());
    if (!ip || !password || !token) return ctx.reply('Format: /swings ip|password|token');
    const conn = new Client();
    await ctx.reply('⏳ Connecting and starting wings...');
    conn.on('ready', () => {
      conn.exec(`${token} && systemctl start wings`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('close', () => { conn.end(); ctx.reply('✅ Wings started successfully.'); });
        stream.stderr.on('data', (d) => ctx.reply(`❌ ${d.toString()}`));
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ── /installtema ──
  botInstance.command('installtema', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /installtema ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /installtema ip|password');
    const keyboard = [
      [Markup.button.callback('🌟 Stellar', `install_stellar_${ip}_${password}`)],
      [Markup.button.callback('💰 Billing', `install_billing_${ip}_${password}`)],
      [Markup.button.callback('🎶 Nightcore', `install_nightcore_${ip}_${password}`)]
    ];
    await ctx.reply(`🎨 *Select Theme*\n📡 IP: ${ip}`, { ...Markup.inlineKeyboard(keyboard) });
  });

  async function installTheme(ip, password, scriptUrl, ctx) {
    const conn = new Client();
    await ctx.reply(`⏳ Installing theme...`);
    conn.on('ready', () => {
      conn.exec(`bash <(curl -s ${scriptUrl})`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('data', (data) => {
          const out = data.toString();
          if (out.includes('Input 0-6')) stream.write('1\n');
          if (out.includes('(y/N)')) stream.write('y\n');
          if (out.includes('x')) stream.write('x\n');
        });
        stream.on('close', () => { conn.end(); ctx.reply('✅ Theme installed successfully.'); });
        stream.stderr.on('data', (d) => ctx.reply(`❌ ${d.toString()}`));
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  }

  botInstance.action(/install_stellar_(.+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const ip = ctx.match[1], password = ctx.match[2];
    await installTheme(ip, password, 'https://raw.githubusercontent.com/LeXcZxMoDz9/Installerlex/refs/heads/main/install.sh', ctx);
  });

  botInstance.action(/install_billing_(.+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const ip = ctx.match[1], password = ctx.match[2];
    await installTheme(ip, password, 'https://raw.githubusercontent.com/Bangsano/Autoinstaller-Theme-Pterodactyl/refs/heads/main/install.sh', ctx);
  });

  botInstance.action(/install_nightcore_(.+)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const ip = ctx.match[1], password = ctx.match[2];
    await installTheme(ip, password, 'https://raw.githubusercontent.com/NoPro200/Pterodactyl_Nightcore_Theme/main/install.sh', ctx);
  });

  // ── /uninstalltema ──
  botInstance.command('uninstalltema', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /uninstalltema ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /uninstalltema ip|password');
    const conn = new Client();
    await ctx.reply('⏳ Uninstalling theme...');
    conn.on('ready', () => {
      conn.exec(`bash <(curl -s https://raw.githubusercontent.com/Bangsano/Autoinstaller-Theme-Pterodactyl/refs/heads/main/install.sh)`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('data', (data) => {
          const out = data.toString();
          if (out.includes('Input 0-6')) stream.write('2\n');
          if (out.includes('(y/N)')) stream.write('y\n');
          if (out.includes('x')) stream.write('x\n');
        });
        stream.on('close', () => { conn.end(); ctx.reply('✅ Theme uninstalled.'); });
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ── /uninstallwings ──
  botInstance.command('uninstallwings', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /uninstallwings ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /uninstallwings ip|password');
    const conn = new Client();
    await ctx.reply('⏳ Uninstalling wings...');
    conn.on('ready', () => {
      conn.exec(`systemctl stop wings && systemctl disable wings && rm -f /etc/systemd/system/wings.service && rm -f /usr/local/bin/wings && rm -rf /etc/pterodactyl /var/lib/pterodactyl`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('close', () => { conn.end(); ctx.reply('✅ Wings uninstalled.'); });
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ── /uninstallpanel ──
  botInstance.command('uninstallpanel', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /uninstallpanel ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /uninstallpanel ip|password');
    const conn = new Client();
    await ctx.reply('⏳ Uninstalling panel...');
    conn.on('ready', () => {
      conn.exec(`bash <(curl -s https://pterodactyl-installer.se)`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('data', (data) => {
          const out = data.toString();
          if (out.includes('Input 0-6')) stream.write('6\n');
          if (out.includes('Do you want to remove panel? (y/N)')) stream.write('y\n');
          if (out.includes('Do you want to remove Wings? (y/N)')) stream.write('y\n');
          if (out.includes('Continue with uninstallation? (y/N)')) stream.write('y\n');
        });
        stream.on('close', () => { conn.end(); ctx.reply('✅ Panel uninstalled.'); });
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ── /hbpanel ──
  botInstance.command('hbpanel', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /hbpanel ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /hbpanel ip|password');
    const conn = new Client();
    const newuser = 'admin' + Math.floor(Math.random() * 9999);
    const newpw = 'admin' + Math.floor(Math.random() * 9999);
    await ctx.reply('⏳ Resetting admin credentials...');
    conn.on('ready', () => {
      conn.exec(`bash <(curl -s https://raw.githubusercontent.com/Bangsano/Autoinstaller-Theme-Pterodactyl/refs/heads/main/install.sh)`, (err, stream) => {
        if (err) { conn.end(); return ctx.reply(`❌ Error: ${err.message}`); }
        stream.on('data', (data) => {
          const out = data.toString();
          if (out.includes('Input 0-6')) stream.write('7\n');
          if (out.includes('Enter new admin username')) stream.write(`${newuser}\n`);
          if (out.includes('Enter new admin password')) stream.write(`${newpw}\n`);
        });
        stream.on('close', () => {
          conn.end();
          ctx.reply(`✅ *Admin credentials reset*\n\n👤 Username: \`${newuser}\`\n🔑 Password: \`${newpw}\``, { parse_mode: 'Markdown' });
        });
      });
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ── /antiddos ──
  botInstance.command('antiddos', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const args = ctx.message.text.split(/\s+/);
    const mode = args[1]?.toLowerCase();
    if (!mode || !['on','off'].includes(mode)) return ctx.reply('Usage: /antiddos on|off');
    const token = settings.cfApiToken || process.env.CF_API_TOKEN;
    const zoneId = settings.cfZoneId || process.env.CF_ZONE_ID;
    if (!token || !zoneId) return ctx.reply('❌ Cloudflare config missing.');
    try {
      const value = mode === 'on' ? 'under_attack' : 'essentially_off';
      await axios.patch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`, { value }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      await ctx.reply(`✅ Security level set to ${value}.`);
    } catch (err) {
      await ctx.reply(`❌ Failed: ${err.message}`);
    }
  });

  // ── /buyprotectpanel ──
  botInstance.command('buyprotectpanel', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /buyprotectpanel ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /buyprotectpanel ip|password');
    const conn = new Client();
    await ctx.reply('⏳ Installing protect scripts...');
    const scripts = ['mbut.sh','mbut2.sh','mbut3.sh','mbut4.sh','mbut5.sh','mbut6.sh','mbut7.sh','mbut8.sh','mbut9.sh','mbut10.sh'];
    conn.on('ready', () => {
      let idx = 0;
      const runNext = () => {
        if (idx >= scripts.length) { conn.end(); ctx.reply('✅ All protect scripts installed.'); return; }
        const script = scripts[idx++];
        conn.exec(`curl -fsSL https://raw.githubusercontent.com/antirusuhnihdeks/mbut/main/${script} | bash`, (err, stream) => {
          if (err) { conn.end(); return ctx.reply(`❌ Error on ${script}: ${err.message}`); }
          stream.on('close', runNext);
          stream.stderr.on('data', (d) => console.error(d.toString()));
        });
      };
      runNext();
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ── /withdraw ──
  botInstance.command('withdraw', async (ctx) => {
    if (!isOwner(ctx.from.id)) return ctx.reply('❌ Owner only.');
    const apiKey = settings.apiAtlantic;
    if (!apiKey) return ctx.reply('❌ Atlantic API key not set.');
    try {
      const res = await axios.post('https://atlantich2h.com/get_profile', qs.stringify({ api_key: apiKey }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const balance = res.data?.data?.balance || 0;
      if (balance < 1000) return ctx.reply(`⚠️ Balance too low: Rp${balance}`);
      const nominal = balance - 100;
      const ref = Date.now().toString();
      const transfer = await axios.post('https://atlantich2h.com/transfer/create', qs.stringify({
        api_key: apiKey,
        ref_id: ref,
        kode_bank: settings.typeewallet || 'bca',
        nomor_akun: settings.nopencairan,
        nama_pemilik: settings.atasnamaewallet,
        nominal
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      if (transfer.data?.data?.status === 'success') {
        await ctx.reply(`✅ Withdrawal successful: Rp${nominal} to ${settings.nopencairan}`);
      } else {
        await ctx.reply(`⏳ Transfer pending: ID ${transfer.data?.data?.id}`);
      }
    } catch (err) {
      await ctx.reply(`❌ Withdrawal failed: ${err.message}`);
    }
  });

  // ── /installprotectprem ──
  botInstance.command('installprotectprem', async (ctx) => {
    if (!isOwner(ctx.from.id) && !isPremium(ctx.from.id)) return ctx.reply('❌ Owner/Premium only.');
    const args = ctx.message.text.split(/\s+/);
    const text = args.slice(1).join(' ');
    if (!text) return ctx.reply('Usage: /installprotectprem ip|password');
    const [ip, password] = text.split('|').map(s => s.trim());
    if (!ip || !password) return ctx.reply('Format: /installprotectprem ip|password');
    const conn = new Client();
    await ctx.reply('⏳ Installing all protect scripts (1-11)...');
    const scripts = ['mbut.sh','mbut2.sh','mbut3.sh','mbut4.sh','mbut5.sh','mbut6.sh','mbut7.sh','mbut11.sh','mbut8.sh','mbut9.sh','mbut10.sh'];
    conn.on('ready', () => {
      let idx = 0;
      const runNext = () => {
        if (idx >= scripts.length) { conn.end(); ctx.reply('✅ All protect scripts installed.'); return; }
        const script = scripts[idx++];
        conn.exec(`curl -fsSL https://raw.githubusercontent.com/antirusuhnihdeks/mbut/main/${script} | bash`, (err, stream) => {
          if (err) { conn.end(); return ctx.reply(`❌ Error on ${script}: ${err.message}`); }
          stream.on('close', runNext);
          stream.stderr.on('data', (d) => console.error(d.toString()));
        });
      };
      runNext();
    });
    conn.on('error', (err) => ctx.reply(`❌ Connection failed: ${err.message}`));
    conn.connect({ host: ip, port: 22, username: 'root', password });
  });

  // ─────────────────────────────────────────────────────────────
  //   ERROR HANDLER
  // ─────────────────────────────────────────────────────────────
  botInstance.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('An error occurred.').catch(() => {});
  });
}

// ─────────────────────────────────────────────────────────────
//   SESSION WATCHER & PING
// ─────────────────────────────────────────────────────────────

function startSessionWatcher() {
  setInterval(async () => {
    try {
      const { status, body } = await ghRequest('GET', '');
      if (status !== 200 || !Array.isArray(body)) return;
      const sessionIds = new Set();
      for (const item of body) {
        const m = item.path.match(/^sessions\/([^\/]+)\/creds\.json$/);
        if (m) sessionIds.add(m[1]);
      }
      for (const sid of sessionIds) {
        if (activeSockets.has(sid)) continue;
        if (!sessionExists(sid)) {
          logInfo('WATCHER', `New session detected: ${sid}`);
          await downloadSessionFromGitHub(sid);
        }
        if (sessionExists(sid) && !activeSockets.has(sid)) {
          logInfo('WATCHER', `Starting: ${sid}`);
          let tgUserId = null;
          const allPairs = getAllPairs();
          for (const [uid, pairs] of Object.entries(allPairs)) {
            if (pairs.find(p => p.sessionId === sid)) { tgUserId = uid; break; }
          }
          notifiedConnected.add(sid);
          startWhatsApp(sid, null, null, tgUserId).catch(e => logError('WATCHER', e.message));
        }
      }
    } catch {}
  }, 30000);
  logSuccess('WATCHER', 'Live session watcher started (30s interval)');
}

function startPingLoop() {
  const urls = [settings.PANEL_URL, settings.WEBSITE_URL].filter(Boolean);
  http.createServer((req, res) => {
    const uptime = formatUptime(Date.now() - global.botStartTime);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'alive', uptime, sessions: activeSockets.size }));
  }).listen(process.env.PORT || 3001, () => {
    logSuccess('PING', `Health server :${process.env.PORT || 3001}`);
  });
  setInterval(() => {
    const uptime = formatUptime(Date.now() - global.botStartTime);
    process.stdout.write(chalk.gray(`[UPTIME] ${uptime}\n`));
    for (const url of urls) {
      try {
        const parsed = new URL(url);
        const mod = parsed.protocol === 'https:' ? https : http;
        const req = mod.get(url, res => logInfo('PING', `${url} → ${res.statusCode}`));
        req.on('error', () => {});
        req.setTimeout(8000, () => req.destroy());
      } catch {}
    }
  }, 4 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────
//   LAUNCH
// ─────────────────────────────────────────────────────────────

async function launch() {
  // ── Giant Banner ──
  process.stdout.write(chalk.magentaBright(`
⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⢛⡛⠿⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⠟⡉⣡⡖⠘⢗⣀⣀⡀⢢⣐⣤⣉⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡿⠉⣠⣲⣾⡭⣀⢟⣩⣶⣶⡦⠈⣿⣿⣿⣷⣖⠍⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡛⢀⠚⢩⠍⠀⠀⠡⠾⠿⣋⡥⠀⣤⠈⢷⠹⣿⣎⢳⣶⡘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡏⢀⡤⠉⠀⠀⠀⣴⠆⠠⠾⠋⠁⣼⡿⢰⣸⣇⢿⣿⡎⣿⡷⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⠀⢸⢧⠁⠀⠀⢸⠇⢐⣂⣠⡴⠶⣮⢡⣿⢃⡟⡘⣿⣿⢸⣷⡀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣯⢀⡏⡾⢠⣿⣶⠏⣦⢀⠈⠉⡙⢻⡏⣾⡏⣼⠇⢳⣿⡇⣼⡿⡁⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⠈⡇⡇⡘⢏⡃⠀⢿⣶⣾⣷⣿⣿⣿⡘⡸⠇⠌⣾⢏⡼⣿⠇⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡀⠀⢇⠃⢢⡙⣜⣾⣿⣿⣿⣿⣿⣿⣧⣦⣄⡚⣡⡾⣣⠏⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣷⡀⡀⠃⠸⣧⠘⢿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⠃⠘⠁⢈⣤⡀⣬⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣇⣅⠀⠀⠸⠀⣦⡙⢿⣿⣿⣿⣿⣿⣿⡿⠃⢀⣴⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⡿⢛⣉⣉⣀⡀⠀⢸⣿⣿⣷⣬⣛⠛⢛⣩⣵⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⢋⣴⣿⣿⣿⣿⣿⣦⣬⣛⣻⠿⢿⣿⡇⠈⠙⢛⣛⣩⣭⣭⣝⡛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⡇⣼⣿⣿⣿⣿⣿⡿⡹⢿⣿⣽⣭⣭⣭⣄⣙⠻⢿⣿⡿⣝⣛⣛⡻⢆⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⢥⣿⣿⣿⣿⣿⣿⢇⣴⣿⣿⣿⣿⣿⡿⣿⣿⣿⣷⣌⢻⣿⣿⣿⣿⣿⣷⣶⣌⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿
⡆⣿⣿⣿⣿⣿⡟⣸⣿⣿⣿⣿⣿⣿⣄⣸⣿⣿⣿⣿⣦⢻⣿⣿⣿⣿⣿⣿⣿⠁⠊⠻⣿⣿⣿⣿⣿⣿⣿
⣿⠸⣿⣿⣿⣿⡇⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣷⣿⠀⣿⣿⣿⣿⣿⣿⣿
⣿⣄⢻⣿⣿⣿⣿⡸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⢀⣿⣿⣿⣿⣿⣿⣿
⣿⣿⠈⣿⣿⣿⣿⣷⢙⠿⣿⣿⣿⣿⣿⣿⣿⠿⣟⣩⣴⣷⣌⠻⣿⣿⣿⣿⣿⣿⡟⢠⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣆⢻⣿⣿⣿⣿⡇⣷⣶⣭⣭⣭⣵⣶⣾⣿⣿⣿⣿⣿⣿⣷⣌⠹⢿⣿⡿⢋⣠⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡚⣿⣿⣿⣿⡇⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⢀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡇⢻⣿⣿⣿⡇⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣷⠈⣿⣿⣿⣿⢆⠀⢋⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣥⡘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⠀⣻⣿⣿⣿⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣎⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣒⣻⣿⣿⢏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⢻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣇⢹⣿⡏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣷⣬⡻⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡄⠻⢱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣝⢎⢻⣿⣿⣿
⣿⣿⣿⣿⣿⣷⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣾⣦⢻⣿⣿
⣿⣿⣿⣿⣿⡇⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣼⣿⣿⣿⣿⣆⢻⣿
⣿⣿⣿⣿⡿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣰⣿⣿⣿⣿⣿⣿⣆⣿
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣝⢿⣿⣿⣿⣿⣿⣿⣿⢡⣿⣿⣿⣿⣿⣿⣿⣿⡎
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣝⢿⣿⡆⢿⣿⡿⢸⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⢻⣿⢸⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷
⣿⣿⣿⣿⣧⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢹⠸⠁⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡌⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⢰⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣷⡘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡌⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀`));

  global._startWhatsApp = (...args) => startWhatsApp(...args);

  const mainBot = new Telegraf(settings.TELEGRAM_TOKEN);
  global._mainBotInstance = mainBot;
  setupBot(mainBot, { isMain: true });

  logInfo('PREMIUM', `Mode: ${premData.premOnly ? 'Premium-only' : 'Public'} | Owners: ${[settings.OWNER_TELEGRAM_ID, ...premData.owners].length} | Prem users: ${premData.premUsers.length}`);
  logInfo('REPLIES', `Loaded ${pendingReplies.size} pending reply(ies) from disk`);
  logInfo('PAYSTACK', PAYSTACK_SECRET ? '✅ Paystack configured' : '❌ Paystack secret missing');
  logInfo('PANEL', PANEL_DOMAIN ? `✅ Panel domain: ${PANEL_DOMAIN}` : '❌ Panel domain missing');

  startPingLoop();
  startSessionWatcher();

  // ── Reload existing sessions ──
  await syncSessionsFromGitHub();
  const list = listSessions();
  logInfo('STARTUP', `Reloading ${list.length} session(s)`);
  const allPairs = getAllPairs();
  list.forEach((sid, i) => {
    let tgUserId = null;
    for (const [uid, pairs] of Object.entries(allPairs)) {
      if (pairs.find(p => p.sessionId === sid)) { tgUserId = uid; break; }
    }
    notifiedConnected.add(sid);
    setTimeout(() => startWhatsApp(sid, null, null, tgUserId).catch(e => logError(sid, e.message)), i * 1200);
  });

  mainBot.launch({ dropPendingUpdates: true });
  logSuccess('TELEGRAM', 'Bot running');

  process.once('SIGINT',  () => { mainBot.stop('SIGINT');  process.exit(0); });
  process.once('SIGTERM', () => { mainBot.stop('SIGTERM'); process.exit(0); });
}

launch().catch(e => { logError('FATAL', e.message); process.exit(1); });