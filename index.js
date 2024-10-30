const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

let tttGames = {};

const startTicTacToe = (message) => {
  const gameId = message.channel.id;
  if (tttGames[gameId]) {
    return message.reply('A game is already in progress in this channel.');
  }

  tttGames[gameId] = {
    board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']],
    currentPlayer: 'X',
  };

  message.reply('Tic Tac Toe game started! Type `!move <row> <col>` to make a move (0, 1, or 2).');
  displayBoard(message);
};

const makeMove = (message, row, col) => {
  const gameId = message.channel.id;
  const game = tttGames[gameId];

  if (!game) {
    return message.reply('No game is currently in progress. Start a new game with `!ttt`.');
  }

  if (game.board[row][col] !== ' ') {
    return message.reply('That space is already taken. Choose another one.');
  }

  game.board[row][col] = game.currentPlayer;
  if (checkWin(game.board, game.currentPlayer)) {
    displayBoard(message);
    message.channel.send(`${game.currentPlayer} wins!`);
    delete tttGames[gameId];
    return;
  }

  game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  displayBoard(message);
};

const checkWin = (board, player) => {

  for (let i = 0; i < 3; i++) {
    if (board[i].every(cell => cell === player) || 
        board.map(row => row[i]).every(cell => cell === player)) {
      return true;
    }
  }
  return (board[0][0] === player && board[1][1] === player && board[2][2] === player) ||
         (board[0][2] === player && board[1][1] === player && board[2][0] === player);
};

const displayBoard = (message) => {
  const gameId = message.channel.id;
  const game = tttGames[gameId];
  const board = game.board.map(row => row.join('|')).join('\n');
  message.channel.send(`\`\`\`\n${board}\n\`\`\``);
};

const rpsChoices = ['rock', 'paper', 'scissors'];
const playRockPaperScissors = (message, choice) => {
  const userChoice = choice.toLowerCase();
  if (!rpsChoices.includes(userChoice)) {
    return message.reply('Please choose either rock, paper, or scissors.');
  }

  const botChoice = rpsChoices[Math.floor(Math.random() * rpsChoices.length)];
  let result = '';

  if (userChoice === botChoice) {
    result = "It's a tie!";
  } else if ((userChoice === 'rock' && botChoice === 'scissors') ||
             (userChoice === 'scissors' && botChoice === 'paper') ||
             (userChoice === 'paper' && botChoice === 'rock')) {
    result = 'You win!';
  } else {
    result = 'You lose!';
  }

  message.channel.send(`You chose ${userChoice}, I chose ${botChoice}. ${result}`);
};

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  if (message.content === '!ttt') {
    startTicTacToe(message);
  } else if (message.content.startsWith('!move')) {
    const args = message.content.split(' ').slice(1);
    if (args.length !== 2) return message.reply('Please provide row and column.');
    const row = parseInt(args[0]);
    const col = parseInt(args[1]);
    makeMove(message, row, col);
  } else if (message.content.startsWith('!rps')) {
    const args = message.content.split(' ').slice(1);
    if (args.length !== 1) return message.reply('Please choose rock, paper, or scissors.');
    playRockPaperScissors(message, args[0]);
  }
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login("your-token-here");
