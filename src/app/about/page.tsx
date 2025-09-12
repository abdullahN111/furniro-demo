import Image from "next/image";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import OurMission from "@/app/public/assets/images/featured/our-mission.webp";
import OurTeam from "@/app/public/assets/images/featured/our-team.png";

const About = () => {
  return (
    <section className="bg-[#FFFFFF] max-w-[1440px] mx-auto mb-12 shadow-md">
      <SecondaryHeader routeName="About" />
      <div className="max-w-6xl mx-auto p-8 space-y-16">
        <div className="bg-gradient-to-r from-[#FFE0B2] to-[#FFC1C1] p-10 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            At Furniro, we craft more than just furniture; we create spaces that
            tell stories. Born out of a passion for design, our journey began
            with a mission to transform homes into inspiring sanctuaries. Today,
            we’re proud to be a trusted name in the world of interiors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="bg-gradient-to-r from-[#CDE7FE] to-[#A5D6FF] p-10 rounded-lg shadow-lg">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Our Mission
            </h2>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              To create beautiful, functional furniture that resonates with your
              lifestyle. We combine timeless aesthetics with sustainable
              practices to bring you products that make life better—one piece at
              a time.
            </p>
          </div>
          <div className="relative w-full h-64 lg:h-full">
            <Image
              src={OurMission}
              alt="Our Mission"
              fill
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#FDE2E4] to-[#FAD1D1] p-10 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Core Values</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <li className="text-[16px] text-gray-700 bg-white p-4 rounded-md shadow-md">
              <strong>Quality:</strong> Delivering the finest craftsmanship.
            </li>
            <li className="text-[16px] text-gray-700 bg-white p-4 rounded-md shadow-md">
              <strong>Sustainability:</strong> Caring for the planet with
              eco-conscious designs.
            </li>
            <li className="text-[16px] text-gray-700 bg-white p-4 rounded-md shadow-md">
              <strong>Customer Focus:</strong> Putting your needs first every
              step of the way.
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative w-full h-64 lg:h-full">
            <Image
              src={OurTeam}
              alt="Our Team"
              fill
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="bg-gradient-to-r from-[#FFF1D0] to-[#FFD59E] p-10 rounded-lg shadow-lg">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Meet Our Team
            </h2>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              Behind Furniro is a passionate team of designers, artisans, and
              innovators. Together, we work to push the boundaries of creativity
              and bring you furniture that is both functional and beautiful. We
              believe in collaboration, and our success is driven by our people.
            </p>
          </div>
        </div>
      </div>

      <ServiceBar />
    </section>
  );
};

export default About;
