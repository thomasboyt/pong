import {
  Component,
  Vector2,
  KinematicBody,
  VectorMaths as V,
  Physical,
  CircleCollider,
} from 'pearl';
import NetworkedObject from '../networking/components/NetworkedObject';
import { Tag } from '../types';

// TODO: Move into VectorMaths
/**
 * Reflect a given vector off a specified normal.
 *
 * Source: https://math.stackexchange.com/a/13263
 */
const reflect = (vec: Vector2, normal: Vector2): Vector2 => {
  normal = V.unit(normal);
  return V.subtract(vec, V.multiply(normal, 2 * V.dot(vec, normal)));
};

export default class Ball extends Component<void> {
  vel: Vector2 = { x: -1, y: 0 };
  speed = 0.2;

  update(dt: number) {
    if (!this.getComponent(NetworkedObject).isHost) {
      return;
    }

    const collisions = this.getComponent(KinematicBody).moveAndCollide(
      V.multiply(this.vel, this.speed * dt)
    );

    if (collisions.length) {
      const collision = collisions[0];
      if (collision.entity.hasTag(Tag.Player)) {
        // bounce off at angle relative to paddle center
        const paddleCenter = collision.entity.getComponent(Physical).center;
        const ballCenter = this.getComponent(Physical).center;
        const vec = V.subtract(ballCenter, paddleCenter);
        this.vel = V.unit(vec);
      } else {
        // reflect off contacted surface
        const overlap = collision.response.overlapVector;
        const normal = V.multiply(overlap, -1);
        this.vel = reflect(this.vel, normal);
      }
    }

    const bounds = this.getComponent(CircleCollider).getBounds();
    const screenSize = this.pearl.renderer.getViewSize();

    if (bounds.xMax < 0 || bounds.xMin > screenSize.x) {
      this.getComponent(Physical).center = {
        x: screenSize.x / 2,
        y: screenSize.y / 2,
      };
    }
  }
}
