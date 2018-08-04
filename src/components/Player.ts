import { Component, Physical, Keys } from 'pearl';
import NetworkedObject from '../networking/components/NetworkedObject';
import NetworkingHost from '../networking/components/NetworkingHost';

export default class Player extends Component<void> {
  id?: number;
  speed = 0.15;

  update(dt: number) {
    if (!this.getComponent(NetworkedObject).isHost) {
      return;
    }

    const host = this.getComponent(NetworkedObject)
      .networking as NetworkingHost;
    const inputter = host.players.get(this.id!)!.inputter;

    let y = 0;
    if (inputter.isKeyDown(Keys.upArrow)) {
      y -= 1;
    }
    if (inputter.isKeyDown(Keys.downArrow)) {
      y += 1;
    }

    this.getComponent(Physical).translate({ x: 0, y: y * dt * this.speed });
  }
}
