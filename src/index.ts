import { createPearl } from 'pearl';
import Game from './components/Game';
import NetworkingHost from './networking/components/NetworkingHost';
import NetworkingClient from './networking/components/NetworkingClient';
import networkedPrefabs from './networkedPrefabs';

interface Opts {
  isHost: boolean;
  roomCode?: string;
}

async function main(opts: Opts) {
  const { isHost, roomCode } = opts;

  let networkingComponent;

  if (isHost) {
    networkingComponent = new NetworkingHost({
      prefabs: networkedPrefabs,
    });
  } else {
    networkingComponent = new NetworkingClient({
      prefabs: networkedPrefabs,
    });
  }

  const pearl = await createPearl({
    rootComponents: [new Game({ isHost, roomCode }), networkingComponent],
    width: 320,
    height: 240,
    backgroundColor: 'black',
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
  });

  pearl.renderer.scale(2);
}

const params = new URLSearchParams(document.location.search.slice(1));
const roomCode = params.get('roomCode');
if (roomCode !== null) {
  main({ isHost: false, roomCode });
} else {
  main({ isHost: true });
}
