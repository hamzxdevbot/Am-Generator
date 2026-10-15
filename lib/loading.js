const ora = require('ora');
const chalk = require('chalk');

function spinner(text, color = 'cyan') {
  return ora({
    text: chalk[color](text),
    spinner: {
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
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
  console.log(chalk.cyan('┌─────────────────────────────────────┐'));
  console.log(chalk.cyan('│') + chalk.white('       PILIH METODE EMAIL            ') + chalk.cyan('│'));
  console.log(chalk.cyan('├─────────────────────────────────────┤'));
  console.log(chalk.cyan('│') + chalk.green('  [1] ') + chalk.white('Pakai Email Sendiri          ') + chalk.cyan('│'));
  console.log(chalk.cyan('│') + chalk.yellow('  [2] ') + chalk.white('Pakai Email Temp (bulk)      ') + chalk.cyan('│'));
  console.log(chalk.cyan('│') + chalk.red('  [0] ') + chalk.white('Keluar                       ') + chalk.cyan('│'));
  console.log(chalk.cyan('└─────────────────────────────────────┘'));
}

function progressBar(current, total, width = 30) {
  const pct = Math.min(1, current / total);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `[${bar}] ${chalk.cyan(current + '/' + total)}`;
}

module.exports = { spinner, banner, menu, progressBar };
