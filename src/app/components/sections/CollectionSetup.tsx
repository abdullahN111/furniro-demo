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

        const boxWidth = 180;
const boxHeight = 100;

const imgProps = pdf.getImageProperties(base64);

const imgRatio = imgProps.width / imgProps.height;
const boxRatio = boxWidth / boxHeight;

let drawWidth, drawHeight, offsetX = 0, offsetY = 0;


if (imgRatio > boxRatio) {
  drawHeight = boxHeight;
  drawWidth = boxHeight * imgRatio;
  offsetX = -(drawWidth - boxWidth) / 2;
} else {
  drawWidth = boxWidth;
  drawHeight = boxWidth / imgRatio;
  offsetY = -(drawHeight - boxHeight) / 2;
}


const pageHeight = pdf.internal.pageSize.getHeight();
if (y + boxHeight > pageHeight - 10) {
  pdf.addPage();
  y = 10;
}

pdf.saveGraphicsState();

pdf.rect(10, y, boxWidth, boxHeight);
pdf.clip();

pdf.addImage(
  base64,
  "JPEG",
  10 + offsetX,
  y + offsetY,
  drawWidth,
  drawHeight
);

pdf.restoreGraphicsState();

y += boxHeight + 10;
      } catch (err) {
        console.error("Image failed:", err);
      }
    }

    pdf.save("furniro_gallery.pdf");
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
          className="bg-[#B88E2F] text-white px-6 py-3 rounded"
        >
          Download Gallery
        </button>
      </div>
    </section>
  );
};

export default CollectionSetup;
