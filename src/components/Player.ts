import { Component, Physical, Keys, BoxCollider } from 'pearl';
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

    const bounds = this.getComponent(BoxCollider).getBounds();
    const viewSize = this.pearl.renderer.getViewSize();
    if (bounds.yMin < 0) {
      this.getComponent(Physical).translate({ x: 0, y: -bounds.yMin });
    } else if (bounds.yMax > viewSize.y) {
      this.getComponent(Physical).translate({
        x: 0,
        y: viewSize.y - bounds.yMax,
      });
    }
  }
}
