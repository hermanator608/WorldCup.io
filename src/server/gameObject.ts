import { IGameObjectUpdate } from '../shared/constants';

export default class GameObject {
  private _id: string;
  private _x: number;
  private _y: number;
  private _direction: number;
  private _speed: number;

  constructor (id: string, x: number, y: number, direction: number, speed: number) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._direction = direction;
    this._speed = speed;
  }

  public get id (): string {
    return this._id;
  }

  public get x (): number {
    return this.x;
  }

  public set x (x: number) {
    this._x = x;
  }

  public get y (): number {
    return this.y;
  }

  public set y (y: number) {
    this.y = y;
  }

  public get direction (): number {
    return this._direction;
  }

  public set direction (direction: number) {
    this._direction = direction;
  }

  public get speed (): number {
    return this._speed;
  }

  public readonly update: (dt: number) => void = dt => {
    this._x += dt * this._speed * Math.sin(this._direction);
    this._y -= dt * this._speed * Math.cos(this._direction);
  }

  public readonly distanceTo: (otherObject: GameObject) => number = otherObject => {
    const dx = this._x - otherObject._x;
    const dy = this._y - otherObject._y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  public readonly serializeForUpdate: () => IGameObjectUpdate = () => ({
    id: this._id,
    x: this._x,
    y: this._y,
    direction: this._direction
  })
}
