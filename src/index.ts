import { createPearl } from 'pearl';
import Game from './components/Game';
import {NetworkingHost, NetworkingClient} from 'pearl-networking'
import networkedPrefabs from './networkedPrefabs';

interface Opts {
  isHost: boolean;
  roomCode?: string;
}

async function createGame(opts: Opts) {
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
  createGame({ isHost: false, roomCode });
} else {
  createGame({ isHost: true });
}
