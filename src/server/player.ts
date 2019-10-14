import Constants, { IPlayerUpdate } from '../shared/constants';

import GameObject from './gameObject';
import Bullet from './bullet';

class Player extends GameObject {
  private _username: string;
  private _hp: number = Constants.PLAYER_MAX_HP;
  private _fireCooldown: number = 0;
  private _score: number = 0;

  constructor (id: string, username: string, x: number, y: number) {
    // tslint:disable-next-line:insecure-random
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED);
    this._username = username;
  }

  public get username (): string {
    return this._username;
  }

  public get score (): number {
    return this._score;
  }

  public get hp (): number {
    return this._hp;
  }

  // Returns a newly created bullet, or null.
  public readonly update: (dt: number) => Bullet | null = dt => {
    super.update(dt);

    // Update score
    this._score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    // Fire a bullet, if needed
    this._fireCooldown -= dt;
    if (this._fireCooldown <= 0) {
      this._fireCooldown += Constants.PLAYER_FIRE_COOLDOWN;

      return new Bullet(this.id, this.x, this.y, this.direction);
    }

    return null;
  }

  public readonly takeBulletDamage: (damage?: number) => void = damage => {
    this._hp -= damage || Constants.BULLET_DAMAGE;
  }

  public readonly onDealtDamage: () => void = () => {
    this._score += Constants.SCORE_BULLET_HIT;
  }

  public readonly serializeForUpdate: () => IPlayerUpdate = () => ({
    ...super.serializeForUpdate(),
    direction: this.direction,
    hp: this._hp,
  })
}

export default Player;
