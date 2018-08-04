import { NetworkedPrefab } from '../networking/components/Networking';
import NetworkedPhysical from '../networking/components/NetworkedPhysical';
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
