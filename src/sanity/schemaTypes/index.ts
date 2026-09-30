import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { order } from './order'
import { gallery } from './gallery'
import { user } from './user'
import { review } from './review'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, order, gallery, user, review],
}
