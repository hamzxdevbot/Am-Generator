const ora = require('ora');
const chalk = require('chalk');

const SPINNERS = {
  dots: ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'],
  line: ['-','\\','|','/'],
  arc: ['◜','◠','◝','◞','◡','◟'],
  bounce: ['⠁','⠂','⠄','⡀','⢀','⠠','⠐','⠈'],
  circle: ['◐','◓','◑','◒'],
  clock: ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛']
};

function spinner(text, color = 'cyan', style = 'dots') {
  return ora({
    text: chalk[color](text),
    spinner: {
      frames: SPINNERS[style] || SPINNERS.dots,
      interval: 80
    }
  }).start();
}

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
  teks.forEach((line, i) => console.log(chalk[colors[i]](line)));
  console.log(chalk.gray('         ✦ PREMIUM ACTIVATOR ✦'));
  console.log(chalk.gray('              by Radit\n'));
}

function menu() {
  console.log(chalk.cyan('╔═════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.white.bold('        PILIH METODE EMAIL               ') + chalk.cyan('║'));
  console.log(chalk.cyan('╠═════════════════════════════════════════╣'));
  console.log(chalk.cyan('║') + chalk.green('  [1] ') + chalk.white('Pakai Email Sendiri            ') + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.yellow('  [2] ') + chalk.white('Pakai Email Temp (bulk 1-10)   ') + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.red('  [3] ') + chalk.white('Keluar                         ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚═════════════════════════════════════════╝'));
}

function line(text, color = 'gray') {
  console.log(chalk[color](text));
}

function title(text) {
  console.log('\n' + chalk.cyan('═══ ') + chalk.white.bold(text) + chalk.cyan(' ═══') + '\n');
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

module.exports = { spinner, banner, menu, line, title, divider, formatDuration };
