const chalk = require('chalk');

function banner() {
  const teks = [
    '  █████╗ ███╗   ███╗    ██████╗ ██████╗ ███████╗███╗   ███╗',
    ' ██╔══██╗████╗ ████║    ██╔══██╗██╔══██╗██╔════╝████╗ ████║',
    ' ███████║██╔████╔██║    ██████╔╝██████╔╝█████╗  ██╔████╔██║',
    ' ██╔══██║██║╚██╔╝██║    ██╔═══╝ ██╔══██╗██╔══╝  ██║╚██╔╝██║',
    ' ██║  ██║██║ ╚═╝ ██║    ██║     ██║  ██║███████╗██║ ╚═╝ ██║',
    ' ╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝'
  ];
  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  teks.forEach((l, i) => console.log(chalk[colors[i]](l)));
  console.log(chalk.gray('         ✦ PREMIUM ACTIVATOR ✦'));
  console.log(chalk.gray('              by Radit\n'));
}

function menu() {
  console.log(chalk.cyan('╔═════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.white.bold('       MENU UTAMA                        ') + chalk.cyan('║'));
  console.log(chalk.cyan('╠═════════════════════════════════════════╣'));
  console.log(chalk.cyan('║') + chalk.green('  [1] ') + chalk.white('Aktivasi Premium Alight Motion ') + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.red('  [2] ') + chalk.white('Keluar                         ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚═════════════════════════════════════════╝'));
}

function title(text) {
  console.log('\n' + chalk.cyan('═══ ') + chalk.white.bold(text) + chalk.cyan(' ═══'));
}

function divider() {
  console.log(chalk.gray('─'.repeat(50)));
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

module.exports = { banner, menu, title, divider, formatDuration };
