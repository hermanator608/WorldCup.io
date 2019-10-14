export default Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,

  BULLET_RADIUS: 3,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 10,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    GAME_OVER: 'dead',
  },
});

export interface IScore {
  username: string;
  score: number;
}

export type Leaderboard = IScore[];

export interface IGameObjectUpdate {
  id: string;
  x: number;
  y: number;
  direction: number;
}

export interface IPlayerUpdate extends IGameObjectUpdate {
  hp: number;
}

export interface IGameUpdate {
  t: number;
  me: IPlayerUpdate;
  others: IPlayerUpdate[];
  bullets: IGameObjectUpdate[];
  leaderboard: Leaderboard;
}
