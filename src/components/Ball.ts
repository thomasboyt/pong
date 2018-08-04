import {
  Component,
  Vector2,
  KinematicBody,
  VectorMaths as V,
  Physical,
  CircleCollider,
} from 'pearl';
import NetworkedEntity from '../networking/components/NetworkedEntity';
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
  initialSpeed = 0.1;
  maxSpeed = 0.3;
  speed = this.initialSpeed;

  init() {
    const screenSize = this.pearl.renderer.getViewSize();
    this.getComponent(Physical).center = {
      x: screenSize.x / 2,
      y: screenSize.y / 2,
    };
  }

  serve() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const screenSize = this.pearl.renderer.getViewSize();
    this.getComponent(Physical).center = {
      x: screenSize.x / 2 - direction * 100,
      y: screenSize.y / 2,
    };
    this.speed = this.initialSpeed;
    this.vel = { x: direction, y: 0 };
  }

  update(dt: number) {
    if (!this.getComponent(NetworkedEntity).isHost) {
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
        this.speed += 0.01;
        if (this.speed > this.maxSpeed) {
          this.speed = this.maxSpeed;
        }
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
      this.serve();
    }
  }
}
