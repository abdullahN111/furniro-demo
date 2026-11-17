"use client";

import Image from "next/image";
import { FiShare2, FiDownload } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import { placeholderImages } from "@/app/Data/gallery";
import { useToast } from "@/app/context/ToastContext";

const SHOWROOM_FALLBACK_TITLES = [
  { title: "Nordic Living Lounge", category: "Living Room", tag: "Showroom" },
  { title: "Minimalist Studio Desk", category: "Workspace", tag: "Editorial" },
  { title: "Artisanal Dining Suite", category: "Dining Room", tag: "Bestseller" },
  { title: "Serene Bedroom Sanctuary", category: "Bedroom", tag: "Luxury" },
  { title: "Warm Oak Bistro Table", category: "Dining Space", tag: "Handcrafted" },
  { title: "Sculpted Accent Seating", category: "Lounge Corner", tag: "Modern" },
  { title: "Tactile Ceramic & Wood", category: "Decor Vignette", tag: "Curated" },
  { title: "Soft Linen Reading Nook", category: "Living Space", tag: "Signature" },
];

async function cropImageForPdf(
  imgSrc: string,
  targetW = 900,
  targetH = 420
): Promise<string | null> {
  try {
    const res = await fetch(imgSrc);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    return await new Promise<string | null>((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
            return;
          }

          // Fill warm cream fallback background
          ctx.fillStyle = "#F9F1E7";
          ctx.fillRect(0, 0, targetW, targetH);

          // Center-crop ("object-fit: cover") calculation
          const imgRatio = img.width / img.height;
          const targetRatio = targetW / targetH;
          let sx = 0;
          let sy = 0;
          let sw = img.width;
          let sh = img.height;

          if (imgRatio > targetRatio) {
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / targetRatio;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  } catch {
    return null;
  }
}

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
    : placeholderImages.map((img, idx) => ({
        image: img,
        title: SHOWROOM_FALLBACK_TITLES[idx]?.title || `Lookbook Piece #${idx + 1}`,
        subtitle: SHOWROOM_FALLBACK_TITLES[idx]?.category || "Signature Collection",
        badge: SHOWROOM_FALLBACK_TITLES[idx]?.tag || "Showroom",
      }));

  const downloadPDF = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = pdf.internal.pageSize.getWidth(); // 210mm
      const pageH = pdf.internal.pageSize.getHeight(); // 297mm

      // 1. Warm Cream Editorial Page Background (#FCF8F3)
      pdf.setFillColor(252, 248, 243);
      pdf.rect(0, 0, pageW, pageH, "F");

      // Outer Editorial Frame Border (#E5D5BE)
      pdf.setDrawColor(226, 209, 184);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(8, 8, pageW - 16, pageH - 16, 2, 2, "S");

      // 2. Top Luxury Header Banner (#FFF3E3 with #B88E2F Gold Top Bar)
      pdf.setFillColor(249, 241, 231);
      pdf.roundedRect(8, 8, pageW - 16, 35, 2, 2, "F");

      // Gold Top Accent Bar (#B88E2F)
      pdf.setFillColor(184, 142, 47);
      pdf.rect(8, 8, pageW - 16, 3, "F");

      // Bottom border of header banner
      pdf.setDrawColor(226, 209, 184);
      pdf.setLineWidth(0.3);
      pdf.line(8, 43, pageW - 8, 43);

      // Brand Kicker
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(184, 142, 47);
      pdf.text("FURNIRO   •   #FUNIROFURNITURE LOOKBOOK", 15, 18);

      // Main Editorial Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.setTextColor(31, 31, 31);
      pdf.text("CURATED INTERIOR LOOKBOOK", 15, 27);

      // Curator & Collection Subtitle
      const curatorName = session?.user?.name || "Furniro Guest";
      const collectionType = hasGallery
        ? `Personal Collection by ${curatorName}`
        : "Signature Showroom Inspiration";
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(105, 98, 89);
      pdf.text(collectionType, 15, 34.5);

      // Right Metadata Pill in Header
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const itemsToRender = displayImages.slice(0, 8);

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(222, 203, 176);
      pdf.roundedRect(pageW - 62, 16, 47, 20, 2, 2, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(184, 142, 47);
      pdf.text(`${itemsToRender.length} CURATED PIECES`, pageW - 38.5, 23.5, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(110, 102, 92);
      pdf.text(`Issued ${formattedDate}`, pageW - 38.5, 30, {
        align: "center",
      });

      // 3. Pre-load & Center-Crop All 8 Images in Parallel
      const croppedImages = await Promise.all(
        itemsToRender.map(async (item) => {
          const img = item.image;
          const imgSrc = typeof img === "string" ? img : img?.src;
          if (!imgSrc) return null;
          return cropImageForPdf(imgSrc, 880, 410);
        })
      );

      // 4. Render 2x4 Editorial Moodboard Grid
      const startX = 14;
      const startY = 48.5;
      const colGap = 6;
      const rowGap = 4;
      const cardW = (pageW - startX * 2 - colGap) / 2; // 88mm
      const cardH = 51.5; // 4 rows fit cleanly above footer
      const imgPad = 2.2;
      const imgW = cardW - imgPad * 2; // 83.6mm
      const imgH = 36.5;

      for (let i = 0; i < itemsToRender.length; i++) {
        const item = itemsToRender[i];
        const col = i % 2;
        const row = Math.floor(i / 2);

        const x = startX + col * (cardW + colGap);
        const y = startY + row * (cardH + rowGap);

        // Card Shadow Effect
        pdf.setFillColor(238, 228, 213);
        pdf.roundedRect(x + 0.6, y + 0.6, cardW, cardH, 2.2, 2.2, "F");

        // Card White Surface + Warm Border
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(224, 208, 184);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(x, y, cardW, cardH, 2.2, 2.2, "FD");

        // Image Area
        const dataUrl = croppedImages[i];
        if (dataUrl) {
          pdf.addImage(
            dataUrl,
            "JPEG",
            x + imgPad,
            y + imgPad,
            imgW,
            imgH,
            undefined,
            "FAST"
          );
        } else {
          pdf.setFillColor(249, 241, 231);
          pdf.rect(x + imgPad, y + imgPad, imgW, imgH, "F");
        }

        // Number Badge ("01" .. "08") on top-left of image
        pdf.setFillColor(184, 142, 47);
        pdf.roundedRect(x + imgPad + 2, y + imgPad + 2, 8.5, 5.2, 1, 1, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        pdf.text(
          String(i + 1).padStart(2, "0"),
          x + imgPad + 6.25,
          y + imgPad + 5.6,
          { align: "center" }
        );

        // Card Caption Footer
        const rawTitle =
          item.title ||
          SHOWROOM_FALLBACK_TITLES[i]?.title ||
          `Furniro Piece #${i + 1}`;
        const cleanTitle =
          String(rawTitle).length > 26
            ? `${String(rawTitle).slice(0, 24)}...`
            : String(rawTitle);

        const subLabel = item.price
          ? "Verified Purchased Piece"
          : item.subtitle || "Furniro Signature Series";

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.2);
        pdf.setTextColor(32, 32, 32);
        pdf.text(cleanTitle, x + 3.2, y + imgPad + imgH + 5.5);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.2);
        pdf.setTextColor(130, 120, 108);
        pdf.text(subLabel, x + 3.2, y + imgPad + imgH + 9.8);

        // Right Price or Tag Pill inside Card Footer
        const badgeText = item.price
          ? `$${Number(item.price).toLocaleString()}`
          : item.badge || "SHOWROOM";

        const pillW = Math.max(18, badgeText.length * 2.1 + 5);
        const pillX = x + cardW - pillW - 3;
        const pillY = y + imgPad + imgH + 2.8;

        pdf.setFillColor(252, 248, 243);
        pdf.setDrawColor(226, 206, 176);
        pdf.roundedRect(pillX, pillY, pillW, 6.8, 1.4, 1.4, "FD");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(184, 142, 47);
        pdf.text(badgeText, pillX + pillW / 2, pillY + 4.5, {
          align: "center",
        });
      }

      // 5. Editorial Bottom Footer
      const footerY = pageH - 18;
      pdf.setDrawColor(184, 142, 47);
      pdf.setLineWidth(0.4);
      pdf.line(14, footerY, pageW - 14, footerY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(40, 40, 40);
      pdf.text("FURNIRO.", 14, footerY + 5.5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(120, 112, 102);
      pdf.text(
        "Crafted for Modern Living  •  400 University Drive Suite 200, Coral Gables, FL",
        31,
        footerY + 5.5
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(184, 142, 47);
      pdf.text(
        "#FuniroFurniture Lookbook  •  01 / 01",
        pageW - 14,
        footerY + 5.5,
        { align: "right" }
      );

      pdf.save("furniro-curated-lookbook.pdf");
      showToast({
        message: "Curated Lookbook PDF downloaded!",
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
              <span>Generating Lookbook PDF...</span>
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
