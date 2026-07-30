// ============================================================
//   helper/logger.js  – stylish colored console output
// ============================================================
'use strict';

const chalk = require('chalk');
const moment = require('moment-timezone'); // for timezone formatting

const icons = {
  text:      '💬',
  image:     '🖼️',
  video:     '🎥',
  audio:     '🎵',
  sticker:   '🌀',
  document:  '📄',
  location:  '📍',
  contact:   '👤',
  reaction:  '❤️',
  poll:      '📊',
  viewOnce:  '👁️',
  unknown:   '❓',
};

function getMsgType(msg) {
  if (!msg) return 'unknown';
  if (msg.conversation || msg.extendedTextMessage)    return 'text';
  if (msg.imageMessage)     return 'image';
  if (msg.videoMessage)     return 'video';
  if (msg.audioMessage)     return 'audio';
  if (msg.stickerMessage)   return 'sticker';
  if (msg.documentMessage)  return 'document';
  if (msg.locationMessage)  return 'location';
  if (msg.contactMessage)   return 'contact';
  if (msg.reactionMessage)  return 'reaction';
  if (msg.pollCreationMessage) return 'poll';
  if (msg.viewOnceMessage || msg.viewOnceMessageV2) return 'viewOnce';
  return 'unknown';
}

function getMsgText(msg) {
  if (!msg) return '';
  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    msg.reactionMessage?.text ||
    msg.pollCreationMessage?.name ||
    msg.locationMessage ? `[${msg.locationMessage?.degreesLatitude?.toFixed(4)}, ${msg.locationMessage?.degreesLongitude?.toFixed(4)}]` :
    msg.contactMessage?.displayName ||
    ''
  );
}

// ── Styled boxed message logger ──────────────────────────────
function logMessage(m, chatMeta = {}) {
  try {
    const msg     = m.message;
    let realMsg   = msg;
    const wrappers = ['ephemeralMessage','viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension'];
    for (const w of wrappers) { if (realMsg?.[w]?.message) realMsg = realMsg[w].message; }

    const type     = getMsgType(realMsg);
    const icon     = icons[type] || icons.unknown;
    const text     = getMsgText(realMsg).slice(0, 150);
    const sender   = (m.key.participant || m.key.remoteJid || '').split('@')[0].split(':')[0].replace(/\D/g,'');
    const name     = m.pushName || sender;
    const jid      = m.key.remoteJid || '';
    const isGroup  = jid.endsWith('@g.us');
    const isChannel = jid.endsWith('@newsletter');
    const isDM     = !isGroup && !isChannel;

    // ── Time with timezone ──
    const now = moment().tz('Africa/Nairobi').format('dddd, HH:mm:ss z');

    // ── Speed calculation (global) ──
    if (!global._lastMsgTime) global._lastMsgTime = Date.now();
    const speed = (Date.now() - global._lastMsgTime) / 1000;
    global._lastMsgTime = Date.now();
    const speedText = speed < 0.8 ? 'FAST' : speed < 2 ? 'MODERATE' : 'SLOW';
    const speedColor = speed < 0.8 ? chalk.green.bold : speed < 2 ? chalk.yellow.bold : chalk.red.bold;

    // ── Determine title ──
    let title = 'PRIVATE MESSAGE';
    if (isGroup && chatMeta.groupName) {
      title = chatMeta.groupName;
    } else if (isChannel && chatMeta.groupName) {
      title = chatMeta.groupName;
    }
    if (title.length > 30) title = title.slice(0, 30) + '…';

    // ── Colors ──
    const labelColor = chalk.hex('#00d4ff');
    const valueColor = chalk.white;
    const iconColor  = chalk.hex('#ff6b6b');
    const borderColor = chalk.hex('#555555');
    const titleColor = chalk.hex('#ffa500').bold;
    const timeColor  = chalk.gray;

    // ── Build box ──
    console.log(borderColor('╭━━•›〘 @ ') + titleColor(title) + borderColor(' 〙━•⩵꙰ཱི࿐'));
    console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Message Type')} : ${valueColor(icon + ' ' + type)}`);
    console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Message Time')} : ${timeColor(now)}`);
    console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Speed')}        : ${speedColor(speed.toFixed(2) + 's [ ' + speedText + ' ]')}`);
    console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Sender')}       : ${valueColor(sender)}`);
    console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Name')}         : ${valueColor(name)}`);
    console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Chat ID')}      : ${valueColor(jid || 'N/A')}`);
    if (isGroup && chatMeta.groupName) {
      console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Group')}       : ${valueColor(chatMeta.groupName)}`);
    }
    if (text) {
      console.log(`  ${borderColor('│')} ${iconColor('»')} ${labelColor('Message')}      : ${valueColor(text)}`);
    }
    console.log(borderColor('╰━ ━ ━ ━ ━ ━ ━•⩵꙰ཱི࿐') + '\n');

  } catch (e) {
    // Fallback simple log in case of error
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.yellow('⚠️  Logger error:'), e.message);
    console.log(chalk.gray('─'.repeat(60)));
  }
}

// ── Other log helpers (unchanged) ──────────────────────────

function logInfo(label, msg) {
  console.log(chalk.cyanBright(`  [INFO]  `) + chalk.white(label) + (msg ? chalk.gray(' – ' + msg) : ''));
}
function logSuccess(label, msg) {
  console.log(chalk.greenBright(`  [OK]    `) + chalk.white(label) + (msg ? chalk.gray(' – ' + msg) : ''));
}
function logWarn(label, msg) {
  console.log(chalk.yellowBright(`  [WARN]  `) + chalk.white(label) + (msg ? chalk.gray(' – ' + msg) : ''));
}
function logError(label, msg) {
  console.log(chalk.redBright(`  [ERR]   `) + chalk.white(label) + (msg ? chalk.gray(' – ' + msg) : ''));
}
function logSession(sessionId, status) {
  const icon = status === 'connected' ? '🟢' : status === 'reconnecting' ? '🟡' : '🔴';
  console.log(chalk.gray('  session : ') + chalk.bold(sessionId) + ' ' + icon + ' ' + chalk.gray(status));
}

module.exports = { logMessage, logInfo, logSuccess, logWarn, logError, logSession, getMsgType };