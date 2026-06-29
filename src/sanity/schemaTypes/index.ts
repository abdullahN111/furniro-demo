import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { order } from './order'
import { gallery } from './gallery'
import { user } from './user'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, order, gallery, user],
}
