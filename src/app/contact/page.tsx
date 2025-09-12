import ContactInfo from "@/app/components/sections/ContactInfo";
import ContactForm from "@/app/components/sections/ContactForm";

const page = () => {
  return (
    <section className="max-w-[1440px] mx-auto">
      <div className="flex flex-col gap-20 mx-auto my-24">
        <div className="flex flex-col gap-[10px] items-center justify-center">
          <h2 className="text-4xl font-semibold text-center">
            Get In Touch With Us
          </h2>
          <p className="text-base text-[#9F9F9F] w-auto md:w-[644px] text-center">
            For More Information About Our Product & Services. Please Feel Free
            To Drop Us An Email. Our Staff Always Be There To Help You Out. Do
            Not Hesitate!
          </p>
        </div>
        <div className="flex gap-[72px] lg:gap-[86px] sm:px-0 flex-col-reverse items-center justify-center lg:flex-row">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default page;
