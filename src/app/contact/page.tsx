import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import ContactInfo from "@/app/components/sections/ContactInfo";
import ContactForm from "@/app/components/sections/ContactForm";

const ContactPage = () => {
  return (
    <section className="max-w-[1440px] mx-auto bg-white">
      <SecondaryHeader routeName="Contact" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        {/* Heading */}
        <div className="flex flex-col gap-3 items-center justify-center text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#B88E2F] bg-[#F9F1E7] px-4 py-1.5 rounded-full">
            Client Concierge
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Get In Touch With Us
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
            Have a question about dimensions, custom upholstery, or an existing
            order? Send us a message below and our specialists will respond
            within one business day.
          </p>
        </div>

        {/* Contact Info + Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <ContactInfo />
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>

      <ServiceBar />
    </section>
  );
};

export default ContactPage;
