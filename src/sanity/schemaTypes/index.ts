import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { order } from './order'
import { gallery } from './gallery'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, order, gallery],
}
