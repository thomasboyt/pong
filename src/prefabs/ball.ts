import { NetworkedPrefab, NetworkedPhysical } from 'pearl-networking';
import { CircleCollider, CircleRenderer, KinematicBody } from 'pearl';
import Ball from '../components/Ball';

const ball: NetworkedPrefab = {
  type: 'ball',

  createComponents: () => {
    return [
      new Ball(),
      new KinematicBody(),
      new NetworkedPhysical(),
      new CircleCollider({
        radius: 5,
      }),
      new CircleRenderer({
        fillStyle: 'pink',
      }),
    ];
  },
};

export default ball;
