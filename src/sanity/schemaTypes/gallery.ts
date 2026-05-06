import { defineType } from "sanity";

export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    {
      name: "userEmail",
      type: "string",
    },
    {
      name: "products",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
      validation: (rule) => rule.max(8),
    },
    {
      name: "createdAt",
      type: "datetime",
    },
  ],
});