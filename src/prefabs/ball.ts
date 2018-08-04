import { NetworkedPrefab } from '../networking/components/Networking';
import NetworkedPhysical from '../networking/components/NetworkedPhysical';
import { CircleCollider, CircleRenderer } from 'pearl';

const ball: NetworkedPrefab = {
  type: 'ball',

  createComponents: () => {
    return [
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
