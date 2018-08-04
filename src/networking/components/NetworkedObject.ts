import { Component, GameObject, Entity } from 'pearl';
import Networking from './Networking';
import * as uuidv4 from 'uuid/v4';

interface Opts<T> {
  type: string;
  networking: Networking;
  id?: string;
}

type Snapshot = { [key: string]: any };

interface NetworkedComponent extends Component<any> {
  serialize: () => any;
  deserialize: (snapshot: Snapshot, entitiesById: Map<String, Entity>) => void;
}

export default class NetworkedObject<T> extends Component<Opts<T>> {
  networking!: Networking;

  id = uuidv4();
  type!: string;

  create(opts: Opts<T>) {
    this.networking = opts.networking;
    this.type = opts.type;

    if (opts.id !== undefined) {
      this.id = opts.id;
    }
  }

  hostSerialize(): Snapshot {
    const entitySnapshot: Snapshot = {};

    for (let component of this.entity.components) {
      const networkedComponent = component as NetworkedComponent;

      if (typeof networkedComponent.serialize === 'function') {
        const componentSnapshot = networkedComponent.serialize();
        const name = component.constructor.name;
        entitySnapshot[name] = componentSnapshot;
      }
    }

    return entitySnapshot;
  }

  clientDeserialize(snapshot: Snapshot, entitiesById: Map<string, Entity>) {
    for (let component of this.entity.components) {
      const networkedComponent = component as NetworkedComponent;

      if (typeof networkedComponent.deserialize === 'function') {
        const name = component.constructor.name;
        networkedComponent.deserialize(snapshot[name], entitiesById);
      }
    }
  }

  onDestroy() {
    if (this.networking) {
      this.networking.deregisterNetworkedObject(this.gameObject);
    }
  }
}
