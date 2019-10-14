import shortid from 'shortid';

import Constants from '../shared/constants';

import GameObject from './gameObject';

export default class Bullet extends GameObject {
  private _parentId: string;
  constructor (parentID: string, x: number, y: number, direction: number) {
    super(shortid(), x, y, direction, Constants.BULLET_SPEED);
    this._parentId = parentID;
  }

  public get parentId (): string {
      return this._parentId;
  }

  // Returns true if the bullet should be destroyed
  public update: (dt: number) => boolean = dt => {
    super.update(dt);

    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
}
