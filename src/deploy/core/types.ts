/** What a repository got wrong against the deployment contract. */
export type DeployProblemKind =
  | 'missing-compose'
  | 'invalid-compose'
  | 'unpinned-image'
  | 'missing-build'
  | 'wrong-image-name'
  | 'required-env-file'
  | 'floating-sidecar'
  | 'missing-healthcheck'
  | 'missing-env-example'
  | 'missing-deploy-ignore';

/** One way a repository would fail, or silently mis-deploy, on the server. */
export interface DeployProblem {
  /** The file it was found in, named as the caller named it. */
  file: string;
  /** Which line, counting from 1; 0 when the problem is the file's absence. */
  line: number;
  /** What kind of mistake it is. */
  kind: DeployProblemKind;
  /** What is wrong, in one line. */
  message: string;
  /** What to write instead, in one line. */
  hint: string;
}

/** One file of the repository, with the path a report names it by. */
export interface DeployFile {
  /** The path, relative to the repository root. */
  path: string;
  /** Its content. */
  text: string;
}

/** What the contract is checked against. */
export interface CheckDeployOptions {
  /**
   * The package this repository's own workflow publishes, without a tag —
   * `ghcr.io/<owner>/<repo>`, the repository name verbatim. When given, every
   * compose file must default `IMAGE_NAME` to exactly this.
   * @default undefined
   */
  imageName?: string;
  /**
   * Images built elsewhere, matched as a prefix before the tag. They are exempt
   * from the `IMAGE_NAME`/`IMAGE_TAG` rule but must still carry a pinned tag.
   * @default []
   */
  foreignImages?: readonly string[];
  /**
   * Compose files the repository is expected to ship. A site behind fewer
   * exposures names fewer.
   * @default DEPLOY_COMPOSE_FILES
   */
  composeFiles?: readonly string[];
  /**
   * Whether every service must declare a `healthcheck`. The deploy script keeps
   * a new container only once Docker reports it healthy.
   * @default true
   */
  requireHealthcheck?: boolean;
  /**
   * A comment carrying this marker inside a service waives the healthcheck for
   * it, for a worker with no HTTP surface to probe. The reason is written next
   * to the marker, where the next reader of the compose file will find it.
   * @default 'healthcheck-ok'
   */
  healthcheckMarker?: string;
  /**
   * A comment carrying this marker on, or just above, an `image:` line waives
   * the tag rules for it — for an image somebody else builds and this site
   * deliberately tracks. The reason is written next to the marker.
   * @default 'pin-ok'
   */
  pinMarker?: string;
}

/**
 * The compose files every deployed site ships, one per exposure: a published
 * port, a Traefik reverse proxy, a Cloudflare Tunnel.
 */
export const DEPLOY_COMPOSE_FILES: readonly string[] = [
  'compose.yaml',
  'compose.traefik.yaml',
  'compose.cloudflared.yaml',
];
