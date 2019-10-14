import Constants from '../shared/constants';

import Player from './player';
import Bullet from './bullet';

// Returns an array of bullets to be destroyed.
export const applyCollisions: (players: Player[], bullets: Bullet[]) => Bullet[] = (players, bullets) => {
  const destroyedBullets: Bullet[] = [];
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < bullets.length; i++) {
    // Look for a player (who didn't create the bullet) to collide each bullet with.
    // As soon as we find one, break out of the loop to prevent double counting a bullet.
    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < players.length; j++) {
      const bullet = bullets[i];
      const player = players[j];
      if (bullet.parentId !== player.id && player.distanceTo(bullet) <= Constants.PLAYER_RADIUS + Constants.BULLET_RADIUS) {
        destroyedBullets.push(bullet);
        player.takeBulletDamage();
        break;
      }
    }
  }

  return destroyedBullets;
};
