import { defineType } from "sanity";

export const user = defineType({
    name: "user",
    title: "User",
    type: "document",
    fields: [
        {
            name: "name",
            title: "Name",
            type: "string",
        },
        {
            name: "email",
            title: "Email",
            type: "string",
        },
        {
            name: "image",
            title: "Profile Image",
            type: "url",
        },
        {
            name: "provider",
            title: "Provider",
            type: "string",
            options: {
                list: ["google", "credentials"],
            },
        },
        {
            name: "passwordHash",
            title: "Password Hash",
            type: "string",
        },
        {
            name: "createdAt",
            title: "Created At",
            type: "datetime",
        },
    ],
});