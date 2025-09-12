const ContactForm = () => {
  return (
    <form className=" flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <label className="text-base font-semibold">Your Name</label>
        <input
          type="text"
          placeholder="M Abdullah"
          className="text-base text-[#9F9F9F] border border-[#9F9F9F] py-5 px-[22px] rounded-md w-auto sm:w-[330px] md:w-[400px]"
        />
      </div>
      <div className="flex flex-col gap-4">
        <label className="text-base font-semibold">Email Address</label>
        <input
          type="email"
          placeholder="abd@gmail.com"
          className="text-base text-[#9F9F9F] border border-[#9F9F9F] py-5 px-[22px] rounded-md w-auto sm:w-[330px] md:w-[400px]"
        />
      </div>
      <div className="flex flex-col gap-4">
        <label className="text-base font-semibold">Subject</label>
        <input
          type="text"
          placeholder="Optional"
          className="text-base text-[#9F9F9F] border border-[#9F9F9F] py-5 px-[22px] rounded-md w-auto sm:w-[330px] md:w-[400px]"
        />
      </div>
      <div className="flex flex-col gap-4">
        <label className="text-base font-semibold">Message</label>
        <textarea
          className="text-base text-[#9F9F9F] border border-[#9F9F9F] py-5 px-[22px] rounded-md w-auto sm:w-[330px] md:w-[400px]"
          placeholder="Hi! i’d like to ask about"
        />
      </div>
      <button className="text-white text-base bg-[#B88E2F] hover:bg-[#b88f2ff8] rounded-md w-[130px] sm:w-[150px] md:w-[170px] py-2 px-4">
        Submit
      </button>
    </form>
  );
};

export default ContactForm;
