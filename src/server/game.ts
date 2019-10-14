import { Socket } from 'socket.io';

import Constants, { IGameUpdate, Leaderboard } from '../shared/constants';

import Player from './player';
import Bullet from './bullet';
import { applyCollisions } from './collisions';

class Game {
  private _sockets: { [key: string]: Socket } = {};
  private _players: { [key: string]: Player } = {};
  private _bullets: Bullet[] = [];
  private _lastUpdateTime = Date.now();
  private _shouldSendUpdate: boolean = false;

  constructor () {
    // tslint:disable-next-line:no-magic-numbers
    setInterval(this.update.bind(this), 1000 / 60);
  }

  public addPlayer (socket: Socket, username: string) {
    this._sockets[socket.id] = socket;

    // Generate a position to start this player at.
    // tslint:disable:binary-expression-operand-order
    // tslint:disable:no-magic-numbers
    // tslint:disable:insecure-random
    const x: number = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y: number = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this._players[socket.id] = new Player(socket.id, username, x, y);
    // tslint:enable
  }

  public removePlayer (socket: Socket) {
    // tslint:disable:no-dynamic-delete
    delete this._sockets[socket.id];
    delete this._players[socket.id];
    // tslint:enable
  }

  public handleInput (socket: Socket, dir: number) {
    if (this._players[socket.id]) {
      this._players[socket.id].direction = dir;
    }
  }

  public update () {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this._lastUpdateTime) / 1000;
    this._lastUpdateTime = now;

    // Update each bullet
    const bulletsToRemove: Bullet[] = [];
    this._bullets.forEach(bullet => {
      if (bullet.update(dt)) {
        // Destroy this bullet
        bulletsToRemove.push(bullet);
      }
    });
    this._bullets = this._bullets.filter(bullet => !bulletsToRemove.includes(bullet));

    // Update each player
    Object.keys(this._sockets)
      .forEach(playerID => {
        const player = this._players[playerID];
        const newBullet = player.update(dt);
        if (newBullet) {
          this._bullets.push(newBullet);
        }
      });

    // Apply collisions, give players score for hitting bullets
    const destroyedBullets = applyCollisions(Object.values(this._players), this._bullets);
    destroyedBullets.forEach(b => {
      if (this._players[b.parentId]) {
        this._players[b.parentId].onDealtDamage();
      }
    });
    this._bullets = this._bullets.filter(bullet => !destroyedBullets.includes(bullet));

    // Check if any players are dead
    Object.keys(this._sockets)
      .forEach(playerID => {
        const socket = this._sockets[playerID];
        const player = this._players[playerID];
        if (player.hp <= 0) {
          socket.emit(Constants.MSG_TYPES.GAME_OVER);
          this.removePlayer(socket);
        }
      });

    // Send a game update to each player every other time
    if (this._shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this._sockets)
        .forEach(playerID => {
          const socket = this._sockets[playerID];
          const player: Player = this._players[playerID];
          socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
        });
      this._shouldSendUpdate = false;
    } else {
      this._shouldSendUpdate = true;
    }
  }

  public createUpdate: (player: Player, leaderboard: Leaderboard) => IGameUpdate = (player, leaderboard) => {
    const nearbyPlayers: Player[] = Object.values(this._players)
      .filter(p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2);
    const nearbyBullets: Bullet[] = this._bullets.filter(b => b.distanceTo(player) <= Constants.MAP_SIZE / 2);

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      leaderboard,
    };
  }

  private readonly getLeaderboard: () => Leaderboard = () =>
    Object.values(this._players)
      .sort((p1, p2) => p2.score - p1.score)
      // tslint:disable-next-line:no-magic-numbers
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }))
}

export default Game;
