"use client";

import Image from "next/image";
import { FiShare2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import { placeholderImages } from "@/app/Data/gallery";

const CollectionSetup = () => {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [images, setImages] = useState<any[]>([]);
  const [hasGallery, setHasGallery] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      if (!session?.user?.email) return;

      const res = await fetch(`/api/gallery?email=${session.user.email}`);
      const data = await res.json();

      if (data.gallery?.products?.length >= 4) {
        setImages(data.gallery.products);
        setHasGallery(true);
      }
    }

    fetchGallery();
  }, [session]);

  const displayImages = hasGallery
    ? images
    : placeholderImages.map((img) => ({ image: img }));

  const downloadPDF = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const pdf = new jsPDF();

      let y = 10;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);

      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.text("My Furniture Gallery", pageWidth / 2, y, { align: "center" });

      y += 15;

      for (let i = 0; i < displayImages.length; i++) {
        const img = displayImages[i].image;

        try {
          const res = await fetch(img);
          const blob = await res.blob();

          const reader = new FileReader();

          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          const imgProps = pdf.getImageProperties(base64);

          const maxWidth = 180;
          const maxHeight = 120;

          let pdfWidth = maxWidth;
          let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          if (pdfHeight > maxHeight) {
            pdfHeight = maxHeight;
            pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
          }

          const x = (pdf.internal.pageSize.getWidth() - pdfWidth) / 2;

          const pageHeight = pdf.internal.pageSize.getHeight();
          if (y + pdfHeight > pageHeight - 10) {
            pdf.addPage();
            y = 10;
          }

          pdf.addImage(base64, "JPEG", x, y, pdfWidth, pdfHeight);

          y += pdfHeight + 10;
        } catch (err) {
          console.error("Image failed:", err);
        }
      }

      pdf.save("furniro_gallery.pdf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h5 className="text-lg font-medium text-gray-600 mb-2">
          Share your setup with
        </h5>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FiShare2 className="text-[#B88E2F]" />
          #FuniroFurniture
        </h2>

        {!hasGallery && (
          <p className="text-gray-500 mt-2">
            Order your first furniture and create your gallery
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
        {displayImages.slice(0, 8).map((item, index) => (
          <div key={index} className="relative w-full aspect-square">
            <Image
              src={item.image}
              alt={`Setup ${index}`}
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={downloadPDF}
          disabled={loading}
          className="bg-[#B88E2F] text-white px-6 py-3 rounded flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Downloading...
            </>
          ) : (
            "Download Gallery"
          )}
        </button>
      </div>
    </section>
  );
};

export default CollectionSetup;
