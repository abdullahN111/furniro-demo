"use client";

import Image from "next/image";
import { FiShare2, FiDownload } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import { placeholderImages } from "@/app/Data/gallery";
import { useToast } from "@/app/context/ToastContext";

const CollectionSetup = () => {
  const { data: session } = useSession();
  const { showToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [images, setImages] = useState<any[]>([]);
  const [hasGallery, setHasGallery] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(`/api/gallery?email=${session.user.email}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.gallery?.products?.length >= 4) {
          setImages(data.gallery.products);
          setHasGallery(true);
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
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
        const imgSrc = typeof img === "string" ? img : img?.src;
        if (!imgSrc) continue;

        try {
          const res = await fetch(imgSrc);
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
          if (y + pdfHeight > pageHeight - 15) {
            pdf.addPage();
            y = 10;
          }

          pdf.addImage(base64, "JPEG", x, y, pdfWidth, pdfHeight);

          y += pdfHeight + 12;
        } catch (err) {
          console.error("Image failed:", err);
        }
      }

      pdf.save("furniro_gallery.pdf");
      showToast({
        message: "Gallery PDF downloaded successfully!",
        type: "success",
      });
    } catch {
      showToast({
        message: "Failed to generate Gallery PDF",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <p className="text-sm sm:text-base font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Share your setup with
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2.5">
          <FiShare2 className="text-[#B88E2F]" />
          <span>#FuniroFurniture</span>
        </h2>

        {!hasGallery && (
          <p className="text-sm text-gray-500 mt-2">
            Order your favorite pieces to unlock your personalized lookbook
            gallery
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {displayImages.slice(0, 8).map((item, index) => (
          <div
            key={index}
            className="group relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-xs hover:shadow-md transition-all duration-300"
          >
            <Image
              src={item.image}
              alt={`Furniro setup inspiration ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      <div className="text-center flex justify-center">
        <button
          type="button"
          onClick={downloadPDF}
          disabled={loading}
          className="bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold px-7 py-3 rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-70"
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
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <FiDownload className="text-lg" />
              <span>Download Gallery PDF</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default CollectionSetup;
