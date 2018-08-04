import { Component, GameObject, PearlInstance } from 'pearl';
import NetworkedEntity from './NetworkedEntity';

export interface SnapshotObject {
  id: string;
  type: string;
  state: any;
}

export interface Snapshot {
  objects: SnapshotObject[];
  clock: number;
}

export interface NetworkedPrefab {
  type: string;
  tags?: string[];
  zIndex?: number;
  createComponents: (pearl: PearlInstance) => Component<any>[];
}

interface Opts {
  prefabs: { [_: string]: NetworkedPrefab };
}

export default abstract class Networking extends Component<Opts> {
  prefabs!: { [_: string]: NetworkedPrefab };
  networkedEntities = new Map<string, GameObject>();
  localPlayerId?: number;
  abstract isHost: boolean;

  create(opts: Opts) {
    this.prefabs = opts.prefabs;
  }

  protected getPrefab(prefabName: string): NetworkedPrefab {
    const prefab = this.prefabs[prefabName];

    if (!prefab) {
      throw new Error(`no registered networked prefab with name ${prefabName}`);
    }

    return prefab;
  }

  protected instantiatePrefab(
    prefab: NetworkedPrefab,
    id?: string
  ): GameObject {
    const components = prefab.createComponents(this.pearl);

    const obj = new GameObject({
      name: prefab.type,
      tags: [prefab.type, ...(prefab.tags || [])],
      zIndex: prefab.zIndex || 0,
      components: [
        ...components,
        new NetworkedEntity({
          networking: this,
          type: prefab.type,
          id,
        }),
      ],
    });

    this.pearl.entities.add(obj);

    const networked = obj.getComponent(NetworkedEntity);
    this.networkedEntities.set(networked.id, obj);

    return obj;
  }

  deregisterNetworkedEntity(obj: GameObject) {
    const networked = obj.getComponent(NetworkedEntity);
    this.networkedEntities.delete(networked.id);
  }

  protected setIdentity(id: number) {
    this.localPlayerId = id;
  }
}
