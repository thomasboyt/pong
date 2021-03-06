import { NetworkedPrefab, NetworkedPhysical } from 'pearl-networking';
import { BoxCollider, BoxRenderer } from 'pearl';
import Player from '../components/Player';
import { Tag } from '../types';

const player: NetworkedPrefab = {
  type: 'player',

  tags: [Tag.Player],

  createComponents: () => {
    return [
      new NetworkedPhysical(),
      new Player(),
      new BoxCollider({
        width: 10,
        height: 40,
      }),
      new BoxRenderer({
        fillStyle: 'white',
      }),
    ];
  },
};

export default player;
