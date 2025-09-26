import { StaticImageData } from "next/image";
import { client } from "@/sanity/lib/client";

export interface ProductCardData {
  _id: string;
  image: StaticImageData;
  sideImages?: StaticImageData[];
  dicountPercentage?: {
    text: string;
    color: string;
  };
  title: string;
  tags: string;
  price: string;
  oldPrice?: string;
  featured: string;
  stars: string[];
  reviews: string;
  description: string;
  isNew: boolean;
  inventoryInStock: number;
  slug: { current: string };
}

interface FetchedProduct {
  _id: string;
  title: string;
  description: string;
  productImage: StaticImageData;
  price: string;
  tags: string[];
  featured: string;
  dicountPercentage?: string;
  isNew: boolean;
  inventoryInStock: number;
  slug: { current: string };
}

export async function fetchProducts(): Promise<ProductCardData[]> {
  const query = `*[_type == "product"]{
    _id,
    title,
    description,
    "productImage": productImage.asset->url,
    price,
    tags,
    featured,
    dicountPercentage,
    isNew,
    inventoryInStock,
    slug
  }`;

  const products: FetchedProduct[] = await client.fetch(query);

  return products.map((product: FetchedProduct) => {
    // console.log("Fetched Product:", product);
    return {
      _id: product._id,
      image: product.productImage,
      sideImages: [
        product.productImage,
        product.productImage,
        product.productImage,
        product.productImage,
      ],
      dicountPercentage: product.dicountPercentage
        ? { text: `-${product.dicountPercentage}%`, color: "#E97171" }
        : undefined,
      title: product.title,
      tags: product.tags.join(", "),
      price: product.price.toString(),
      oldPrice: product.dicountPercentage
        ? (
            parseFloat(product.price) *
            (1 + parseFloat(product.dicountPercentage) / 100)
          ).toFixed(2)
        : undefined,
      stars: ["★", "★", "★", "★"],
      reviews: "0 Customer Review",
      description: product.description,
      featured: product.featured,
      isNew: product.isNew,
      inventoryInStock: product.inventoryInStock,
      slug: product.slug,
    };
  });
}

export const staticRoutes = [
  { title: "Home", path: "/" },
  { title: "Shop", path: "/shop" },
  { title: "Contact", path: "/contact" },
  { title: "About", path: "/about" },
  { title: "Orders", path: "/orders" },
];

export const privacyPolicySections = [
  { id: "introduction", title: "Introduction" },
  { id: "information-collection", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "data-security", title: "Data Security" },
  { id: "your-rights", title: "Your Rights" },
  { id: "changes", title: "Policy Changes" },
  { id: "contact", title: "Contact Us" },
];

export const returnPolicySections = [
  { id: "introduction", title: "Introduction" },
  { id: "return-window", title: "Return Window" },
  { id: "eligibility", title: "Eligibility" },
  { id: "process", title: "Return Process" },
  { id: "refunds", title: "Refunds" },
  { id: "exchanges", title: "Exchanges" },
  { id: "contact", title: "Contact" },
];

export const returnProcess = [
  {
    step: "1",
    title: "Contact Support",
    description: "Email returns@furniro.com or call 1-800-FURNIRO",
  },
  {
    step: "2",
    title: "Get Return Label",
    description: "We'll email you a prepaid shipping label",
  },
  {
    step: "3",
    title: "Pack & Ship",
    description: "Use original packaging and attach the label",
  },
  {
    step: "4",
    title: "Receive Refund",
    description: "Refund processed within 5-7 business days",
  },
];

export const paymentOptionsSections = [
  { id: "cash-on-delivery", title: "Cash on Delivery" },
  { id: "credit-card", title: "Credit Card" },
  { id: "contact", title: "Contact" },
];
