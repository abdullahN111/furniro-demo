import { defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    {
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    },
    {
      name: "orderId",
      title: "Order ID",
      type: "string",
      validation: (rule) => rule.required(),
    },
    {
      name: "userEmail",
      title: "User Email",
      type: "string",
      validation: (rule) => rule.required(),
    },
    {
      name: "userName",
      title: "User Name",
      type: "string",
    },
    {
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (rule) => rule.required().min(1).max(5),
    },
    {
      name: "comment",
      title: "Comment",
      type: "text",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    },
  ],
});