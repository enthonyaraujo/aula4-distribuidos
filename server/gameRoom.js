// Lógica de sala e regras de negócio do Dominó (Backend / Sistemas Distribuídos)

function generateDeck() {
  const deck = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push([i, j]);
    }
  }
  return deck;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tileMatches(t1, t2) {
  return (t1[0] === t2[0] && t1[1] === t2[1]) || (t1[0] === t2[1] && t1[1] === t2[0]);
}

export class GameRoom {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.io = io;
    this.players = [null, null, null, null]; // 4 assentos: 0 (Sul), 1 (Oeste), 2 (Norte), 3 (Leste)
    this.hands = [[], [], [], []]; // Mãos privadas no servidor
    this.board = []; // Pedras na mesa
    this.leftEnd = null;
    this.rightEnd = null;
    this.currentTurn = 0;
    this.roundStarter = 0;
    this.status = 'waiting'; // waiting, playing, round_ended
    this.lastAction = 'Aguardando jogadores...';
    this.winner = null;
    this.winReason = null;
    this.consecutivePasses = 0;
    this.roundScores = [0, 0, 0, 0];
    this.roundNumber = 1;
    this.botTimeout = null;
  }

  addPlayer(socketId, name) {
    // Procura primeiro assento vago
    let seat = this.players.findIndex((p) => p === null || p.isBot);
    if (seat === -1) {
      // Sala cheia
      return { success: false, message: 'Sala cheia (máximo 4 jogadores)' };
    }

    const defaultNames = ['Jogador Sul', 'Jogador Oeste', 'Jogador Norte', 'Jogador Leste'];
    this.players[seat] = {
      id: socketId,
      seat,
      name: name || defaultNames[seat],
      isBot: false,
      score: this.roundScores[seat] || 0,
      tilesCount: this.hands[seat]?.length || 0,
    };

    this.lastAction = `${this.players[seat].name} entrou no assento ${seat + 1}.`;
    this.broadcastState();

    // Se a sala estiver completa (4 jogadores reais ou bots) e status waiting, pode iniciar
    const activeCount = this.players.filter((p) => p !== null).length;
    if (activeCount === 4 && this.status === 'waiting') {
      this.startRound();
    }

    return { success: true, seat };
  }

  fillWithBots() {
    const botNames = ['Bot Sul', 'Bot Oeste', 'Bot Norte', 'Bot Leste'];
    for (let i = 0; i < 4; i++) {
      if (!this.players[i]) {
        this.players[i] = {
          id: `bot-${i}-${Date.now()}`,
          seat: i,
          name: botNames[i],
          isBot: true,
          score: this.roundScores[i] || 0,
          tilesCount: 0,
        };
      }
    }
    this.lastAction = 'Vagas preenchidas com Bots. Iniciando partida!';
    this.startRound();
  }

  removePlayer(socketId) {
    const seat = this.players.findIndex((p) => p && p.id === socketId);
    if (seat !== -1) {
      const pName = this.players[seat].name;
      // Converte para bot para a partida não quebrar caso esteja em andamento
      if (this.status === 'playing') {
        this.players[seat] = {
          id: `bot-${seat}`,
          seat,
          name: `${pName} (Bot)`,
          isBot: true,
          score: this.roundScores[seat] || 0,
          tilesCount: this.hands[seat].length,
        };
        this.lastAction = `${pName} desconectou. Assento assumido por Bot.`;
        if (this.currentTurn === seat) {
          this.scheduleBotMove(seat);
        }
      } else {
        this.players[seat] = null;
        this.lastAction = `${pName} saiu da sala.`;
      }
      this.broadcastState();
    }
  }

  startRound() {
    clearTimeout(this.botTimeout);
    const deck = shuffle(generateDeck());
    
    // Distribui 7 pedras para cada um dos 4 jogadores (28 pedras no total)
    this.hands = [
      deck.slice(0, 7),
      deck.slice(7, 14),
      deck.slice(14, 21),
      deck.slice(21, 28),
    ];

    this.board = [];
    this.leftEnd = null;
    this.rightEnd = null;
    this.consecutivePasses = 0;
    this.winner = null;
    this.winReason = null;
    this.status = 'playing';

    for (let i = 0; i < 4; i++) {
      if (this.players[i]) {
        this.players[i].tilesCount = this.hands[i].length;
      }
    }

    // Determina quem começa:
    // Na 1ª rodada: quem tem o carroção de 6 (6-6), ou 5-5, 4-4, etc.
    let starter = 0;
    let foundHighest = false;
    for (let doubleVal = 6; doubleVal >= 0; doubleVal--) {
      for (let s = 0; s < 4; s++) {
        if (this.hands[s].some((t) => t[0] === doubleVal && t[1] === doubleVal)) {
          starter = s;
          foundHighest = true;
          break;
        }
      }
      if (foundHighest) break;
    }

    this.roundStarter = starter;
    this.currentTurn = starter;
    this.lastAction = `Rodada iniciada! ${this.players[starter]?.name || 'Jogador ' + (starter + 1)} começa com a maior bucha.`;

    this.broadcastState();

    if (this.players[this.currentTurn]?.isBot) {
      this.scheduleBotMove(this.currentTurn);
    }
  }

  canPlay(tile) {
    if (this.leftEnd === null || this.rightEnd === null) return true;
    const [a, b] = tile;
    return a === this.leftEnd || b === this.leftEnd || a === this.rightEnd || b === this.rightEnd;
  }

  playTile(seat, tile, side) {
    if (this.status !== 'playing' || this.currentTurn !== seat) {
      return { success: false, message: 'Não é sua vez!' };
    }

    const hand = this.hands[seat];
    const tileIndex = hand.findIndex((t) => tileMatches(t, tile));
    if (tileIndex === -1) {
      return { success: false, message: 'Você não tem essa pedra na mão!' };
    }

    const actualTile = hand[tileIndex];
    const [a, b] = actualTile;
    const isDbl = a === b;

    if (this.board.length === 0) {
      // Primeira jogada na mesa
      this.board.push({
        id: `tile-${Date.now()}-0`,
        tile: actualTile,
        isDouble: isDbl,
      });
      this.leftEnd = a;
      this.rightEnd = b;
    } else {
      let placedTile = actualTile;
      if (side === 'left') {
        if (a === this.leftEnd) {
          placedTile = [b, a]; // Orientado para fora
          this.leftEnd = b;
        } else if (b === this.leftEnd) {
          placedTile = [a, b];
          this.leftEnd = a;
        } else {
          return { success: false, message: 'A pedra não encaixa na ponta esquerda!' };
        }
        this.board.unshift({
          id: `tile-${Date.now()}-${this.board.length}`,
          tile: placedTile,
          isDouble: isDbl,
        });
      } else {
        // Ponta direita
        if (a === this.rightEnd) {
          placedTile = [a, b];
          this.rightEnd = b;
        } else if (b === this.rightEnd) {
          placedTile = [b, a];
          this.rightEnd = a;
        } else {
          return { success: false, message: 'A pedra não encaixa na ponta direita!' };
        }
        this.board.push({
          id: `tile-${Date.now()}-${this.board.length}`,
          tile: placedTile,
          isDouble: isDbl,
        });
      }
    }

    // Remove da mão
    this.hands[seat].splice(tileIndex, 1);
    this.players[seat].tilesCount = this.hands[seat].length;
    this.consecutivePasses = 0;
    this.lastAction = `${this.players[seat].name} jogou [${actualTile[0]}:${actualTile[1]}].`;

    // Verifica vitória simples (bater)
    if (this.hands[seat].length === 0) {
      this.handleWinner(seat, 'domino');
      return { success: true };
    }

    // Avança turno
    this.advanceTurn();
    return { success: true };
  }

  passTurn(seat) {
    if (this.status !== 'playing' || this.currentTurn !== seat) {
      return { success: false, message: 'Não é sua vez!' };
    }

    // Verifica se realmente não pode jogar nenhuma pedra
    const hasPlayable = this.hands[seat].some((t) => this.canPlay(t));
    if (hasPlayable) {
      return { success: false, message: 'Você tem pedra para jogar! Não pode passar.' };
    }

    this.consecutivePasses++;
    this.lastAction = `${this.players[seat].name} passou a vez.`;

    // Se 4 jogadores consecutivos passarem, o jogo trancou (fechou)
    if (this.consecutivePasses >= 4) {
      this.handleBlockedGame();
      return { success: true };
    }

    this.advanceTurn();
    return { success: true };
  }

  advanceTurn() {
    this.currentTurn = (this.currentTurn + 1) % 4;
    this.broadcastState();

    if (this.players[this.currentTurn]?.isBot) {
      this.scheduleBotMove(this.currentTurn);
    }
  }

  scheduleBotMove(seat) {
    clearTimeout(this.botTimeout);
    this.botTimeout = setTimeout(() => {
      if (this.status !== 'playing' || this.currentTurn !== seat) return;
      this.executeBotTurn(seat);
    }, 900);
  }

  executeBotTurn(seat) {
    const hand = this.hands[seat];
    if (!hand || hand.length === 0) return;

    if (this.board.length === 0) {
      // Primeira jogada da mesa
      const firstTile = hand[0];
      this.playTile(seat, firstTile, 'left');
      return;
    }

    // Procura pedras jogáveis
    const playableMoves = [];
    for (const tile of hand) {
      const [a, b] = tile;
      if (a === this.leftEnd || b === this.leftEnd) {
        playableMoves.push({ tile, side: 'left' });
      }
      if (a === this.rightEnd || b === this.rightEnd) {
        playableMoves.push({ tile, side: 'right' });
      }
    }

    if (playableMoves.length > 0) {
      // IA simples: prioriza jogar duplas ou pedras mais pesadas para desafogar a mão
      playableMoves.sort((m1, m2) => {
        const d1 = m1.tile[0] === m1.tile[1] ? 10 : 0;
        const d2 = m2.tile[0] === m2.tile[1] ? 10 : 0;
        const s1 = m1.tile[0] + m1.tile[1] + d1;
        const s2 = m2.tile[0] + m2.tile[1] + d2;
        return s2 - s1;
      });

      const bestMove = playableMoves[0];
      this.playTile(seat, bestMove.tile, bestMove.side);
    } else {
      this.passTurn(seat);
    }
  }

  handleWinner(seat, reason) {
    this.status = 'round_ended';
    this.winner = seat;
    this.winReason = reason;

    // Calcula pontos somando as pedras restantes de todos os outros jogadores
    let points = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== seat) {
        points += this.hands[i].reduce((sum, t) => sum + t[0] + t[1], 0);
      }
    }

    this.roundScores[seat] = (this.roundScores[seat] || 0) + points;
    if (this.players[seat]) {
      this.players[seat].score = this.roundScores[seat];
    }

    this.lastAction = `🎉 ${this.players[seat].name} bateu o jogo e ganhou ${points} pontos!`;
    this.broadcastState(true); // Revela todas as mãos no final da rodada
  }

  handleBlockedGame() {
    this.status = 'round_ended';
    this.winReason = 'blocked';

    // Soma os pontos de cada jogador
    const sums = this.hands.map((h) => h.reduce((sum, t) => sum + t[0] + t[1], 0));
    let minSum = Math.min(...sums);
    const winners = [];
    for (let i = 0; i < 4; i++) {
      if (sums[i] === minSum) winners.push(i);
    }

    if (winners.length === 1) {
      const winSeat = winners[0];
      this.winner = winSeat;
      // Ganha a soma dos pontos dos adversários
      const opponentPoints = sums.reduce((acc, val, idx) => (idx === winSeat ? acc : acc + val), 0);
      this.roundScores[winSeat] = (this.roundScores[winSeat] || 0) + opponentPoints;
      if (this.players[winSeat]) {
        this.players[winSeat].score = this.roundScores[winSeat];
      }
      this.lastAction = `🔒 Jogo trancado! ${this.players[winSeat].name} venceu por menor contagem (${minSum} pts)!`;
    } else {
      this.winner = -1; // Empate
      this.lastAction = '🔒 Jogo trancado em empate na contagem de pontos!';
    }

    this.broadcastState(true);
  }

  getStateForPlayer(seatIndex, revealAll = false) {
    return {
      roomId: this.roomId,
      status: this.status,
      board: this.board,
      leftEnd: this.leftEnd,
      rightEnd: this.rightEnd,
      currentTurn: this.currentTurn,
      roundStarter: this.roundStarter,
      lastAction: this.lastAction,
      winner: this.winner,
      winReason: this.winReason,
      roundScores: this.roundScores,
      roundNumber: this.roundNumber,
      players: this.players.map((p, idx) => {
        if (!p) return null;
        return {
          id: p.id,
          seat: p.seat,
          name: p.name,
          isBot: p.isBot,
          score: p.score,
          tilesCount: this.hands[idx]?.length || 0,
          // Segurança de rede em Sistemas Distribuídos:
          // Apenas o próprio jogador vê suas pedras, exceto ao fim da rodada
          tiles: (idx === seatIndex || revealAll) ? this.hands[idx] : undefined,
        };
      }),
    };
  }

  broadcastState(revealAll = false) {
    for (let seat = 0; seat < 4; seat++) {
      const p = this.players[seat];
      if (p && !p.isBot) {
        const state = this.getStateForPlayer(seat, revealAll);
        this.io.to(p.id).emit('game-state', state);
      }
    }
  }
}

