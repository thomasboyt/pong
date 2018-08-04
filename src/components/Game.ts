import { Component, Physical, BoxCollider, Entity } from 'pearl';
import { Tag, ZIndex } from '../types';
import NetworkingClient from '../networking/components/NetworkingClient';
import NetworkingHost from '../networking/components/NetworkingHost';
import NetworkedPhysical from '../networking/components/NetworkedPhysical';
import Player from './Player';
import Ball from './Ball';

interface Opts {
  isHost: boolean;
  roomCode?: string;
}

function showRoomCode(roomCode: string) {
  console.log('roomCode:', roomCode);
  const url =
    document.location.origin +
    document.location.pathname +
    `?roomCode=${roomCode}`;
  console.log('link', url);

  const roomLink = document.querySelector('a.room-link');
  if (roomLink instanceof HTMLAnchorElement) {
    roomLink.href = url;
    roomLink.innerText = url;
  }
}

const groovejetUrl = process.env.LOBBY_SERVER || 'localhost:3000';

export default class Game extends Component<Opts> {
  isHost!: boolean;

  init(opts: Opts) {
    this.isHost = opts.isHost;

    if (opts.isHost) {
      this.runCoroutine(this.initializeHost());
    } else {
      this.runCoroutine(this.initializeClient(opts.roomCode!));
    }
  }

  *initializeHost() {
    const host = this.getComponent(NetworkingHost);
    const roomCode = yield host.connect(groovejetUrl);

    showRoomCode(roomCode);

    host.onPlayerAdded.add(({ networkingPlayer }) => {
      const players = this.pearl.entities.all(Tag.Player);
      const firstPlayer = !players.length;

      const viewSize = this.pearl.renderer.getViewSize();
      const playerX = firstPlayer ? 20 : viewSize.x - 20;

      const id = networkingPlayer.id;
      const player = host.createNetworkedPrefab('player');
      player.getComponent(Player).id = id;
      player.getComponent(Physical).center = {
        x: playerX,
        y: viewSize.y / 2,
      };

      if (!firstPlayer) {
        const ball = host.createNetworkedPrefab('ball');
        ball.getComponent(Ball).serve();
      }
    });

    host.onPlayerRemoved.add(({ networkingPlayer }) => {
      const id = networkingPlayer.id;
      const players = this.pearl.entities.all(Tag.Player);
      for (let player of players) {
        if (player.getComponent(Player).id === id) {
          this.pearl.entities.destroy(player);
        }
      }
    });

    this.createWalls();
    host.addLocalPlayer();
  }

  *initializeClient(roomCode: string) {
    yield this.getComponent(NetworkingClient).connect({
      groovejetUrl,
      roomCode,
    });
    showRoomCode(roomCode);
  }

  createWalls() {
    // add walls top to top and bottom of gamew orld
    const worldSize = this.pearl.renderer.getViewSize();

    const makeWall = (y: number) => {
      this.pearl.entities.add(
        new Entity({
          name: 'wall',
          components: [
            new Physical({
              center: {
                x: worldSize.x / 2,
                y,
              },
            }),
            new BoxCollider({
              width: worldSize.x,
              height: 20,
            }),
          ],
        })
      );
    };

    makeWall(0);
    makeWall(worldSize.y);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    const size = this.pearl.renderer.getViewSize();
    const center = this.pearl.renderer.getViewCenter();
    ctx.fillRect(center.x - size.x / 2, center.y - size.y / 2, size.x, size.y);

    ctx.font = '12px monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    if (this.isHost) {
      const host = this.getComponent(NetworkingHost);
      if (host.connectionState === 'connecting') {
        ctx.fillText('connecting to lobby...', size.x / 2, size.y / 2);
      }
    } else {
      const client = this.getComponent(NetworkingClient);

      if (client.connectionState === 'connecting') {
        ctx.fillText('connecting', size.x / 2, size.y / 2);
      } else if (client.connectionState === 'error') {
        ctx.fillText('connection error:', size.x / 2, size.y / 2);
        ctx.fillText(client.errorReason!, size.x / 2, size.y / 2 + 20);
      } else if (client.connectionState === 'closed') {
        ctx.fillText('connection closed', size.x / 2, size.y / 2);
      }
    }
  }
}
