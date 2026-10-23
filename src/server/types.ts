import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';

/**
 * A Fastify instance whose routes are typed from their TypeBox schemas: the
 * `body`, `params`, `querystring` and response of a route registered on it are
 * inferred. A route module takes it as its parameter, and the server is built
 * with `fastify(options).withTypeProvider<TypeBoxTypeProvider>()`.
 *
 * Types only: `@fastify/type-provider-typebox` is an optional peer, installed by
 * the backends that type their routes this way.
 */
export type FastifyTyped = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;
