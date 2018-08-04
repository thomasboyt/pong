import { Component } from 'pearl';
import { Tag, ZIndex } from '../types';
import NetworkingClient from '../networking/components/NetworkingClient';
import NetworkingHost from '../networking/components/NetworkingHost';
import NetworkedPhysical from '../networking/components/NetworkedPhysical';

interface Opts {
  isHost: boolean;
  roomCode?: string;
}

const groovejetUrl = 'localhost:3000';

export default class Game extends Component<Opts> {
  init(opts: Opts) {
    if (opts.isHost) {
      this.runCoroutine(this.initializeHost());
    } else {
      this.runCoroutine(this.initializeClient(opts.roomCode!));
    }
  }

  *initializeHost() {
    const roomCode = yield this.getComponent(NetworkingHost).connect(
      groovejetUrl
    );

    this.handleRoomCode(roomCode);

    const ball = this.getComponent(NetworkingHost).createNetworkedPrefab(
      'ball'
    );
    ball.getComponent(NetworkedPhysical).center = { x: 125, y: 125 };
  }

  *initializeClient(roomCode: string) {
    yield this.getComponent(NetworkingClient).connect({
      groovejetUrl,
      roomCode,
    });
    this.handleRoomCode(roomCode);
  }

  handleRoomCode(roomCode: string) {
    console.log('roomCode:', roomCode);
  }
}
