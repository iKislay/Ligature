import { docs } from '../../.source/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/widgets',
  source: docs.toFumadocsSource(),
});
