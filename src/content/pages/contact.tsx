import PageBanner from "@/components/sections/PageBanner";
import ContactSection from "@/components/sections/ContactSection";

/** /contact/ — the live page: banner, the contact rail (details + WhatsApp form) and the map card. */
export default function ContactPage() {
  return (
    <div className="page-wrapper lh p-contact">
      <PageBanner
        subTitle="Ready When You Are"
        titleSpan="Book Your Spa"
        title="Experience in Seminyak"
        buttonText="Contact Us"
        image="/images/banners/contact.webp"
        imagePosition="40% 50%"
      />
      <ContactSection
        formSubTitle="Get in Touch"
        formTitle="How Can We Help?"
        infoSubTitle="Questions or Bookings"
        infoTitle="Let’s Arrange Your Visit"
        infoText="Contact Spa Bali Moon to check availability, ask about treatments and packages, or arrange a massage and spa service at our Seminyak location or through selected home service options."
        contactItems={[
          {
            icon: "fa-phone-plus",
            title: "WhatsApp Message",
            href: "https://wa.me/6287863175144",
            text: "+62 878-6317-5144",
          },
          {
            icon: "fa-location-dot",
            title: "Visit anytime",
            text: "Jl. Pangkung Sari No. 30 Petitenget, Seminyak, Kerobokan Kuta Utara, Badung, Bali 80361",
          },
          { icon: "fa-clock", title: "Opening Times", text: "Open Daily: 9:00 - 22:00" },
        ]}
      />
    </div>
  );
}
