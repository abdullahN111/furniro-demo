import { redirect } from "next/navigation";

export default function AddToCartLegacyRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/product/${params.id}`);
}
