const ContactSection = ({ email, phone, address }: { email: string; phone: string; address?: string }) => {
  return (
    <div id="contact" className="bg-gradient-to-r from-[#FFE0B2] to-[#FFC1C1] p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
      <div className="bg-white p-4 rounded-md shadow-md">
        <p className="text-gray-700 mb-2"><strong>Email:</strong> {email}</p>
        <p className="text-gray-700 mb-2"><strong>Phone:</strong> {phone}</p>
        {address && <p className="text-gray-700"><strong>Address:</strong> {address}</p>}
      </div>
    </div>
  );
};

export default ContactSection;
