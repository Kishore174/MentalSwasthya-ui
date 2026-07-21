import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Simulate save
      const existing = JSON.parse(localStorage.getItem("mentalswasthya_contact_messages") || "[]");
      existing.push({ ...formData, date: Date.now() });
      localStorage.setItem("mentalswasthya_contact_messages", JSON.stringify(existing));

      toast.success("Thank you! Your message has been received.");
      setFormData({ name: "", email: "", subject: "general", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-[#22331b]">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Get In Touch
        </p>
        <h1 className="relative text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          We're here to listen
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          Have feedback, need support, or just want to share your mindfulness journey? Let us know and we'll reply as soon as possible.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-4">
          {[
            {
              title: "Email Us",
              value: "support@mentalswasthya.com",
              sub: "For general queries & account support",
              icon: FiMail,
              color: "text-[#7d9667] bg-[#eef6ea]"
            },
            {
              title: "Call Us",
              value: "+1 (800) 555-CALM",
              sub: "Mon - Fri, 9:00 AM - 5:00 PM EST",
              icon: FiPhone,
              color: "text-sky-600 bg-sky-50"
            },
            {
              title: "Visit Us",
              value: "Wellness Hub Office, NY",
              sub: "128 Meditation Row, Suite 400",
              icon: FiMapPin,
              color: "text-amber-600 bg-amber-50"
            }
          ].map(({ title, value, sub, icon: Icon, color }) => (
            <div key={title} className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.04)] flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-base font-black text-[#22331b] mt-1">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          {/* Quick Note Card */}
          <div className="rounded-3xl bg-[#eef6ea]/50 border border-[#e2eadc] p-6 shadow-sm">
            <h4 className="text-sm font-black text-[#22331b] flex items-center gap-2">
              <FiCheckCircle className="text-[#7d9667]" />
              Response Time Guarantee
            </h4>
            <p className="text-xs text-[#66785c] mt-2 leading-relaxed">
              We value your presence on our platform. Our dedicated care specialists review messages daily and aim to reply within 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-[#e8efe3] p-6 md:p-8 shadow-[0_10px_30px_rgba(80,105,67,0.04)] space-y-5">
            <h3 className="text-xl font-black text-[#22331b]">Send a Message</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#66785c]">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-bold outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b] appearance-none"
              >
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="feedback">Product Feedback</option>
                <option value="billing">Billing & Subscriptions</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#66785c]">Your Message</label>
              <textarea
                rows="5"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] hover:bg-[#6f865c] text-white py-3.5 text-sm font-bold shadow-lg shadow-[#7d9667]/15 transition-all disabled:opacity-50"
            >
              <FiSend />
              {submitting ? "Sending..." : "Submit Message"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactScreen;
