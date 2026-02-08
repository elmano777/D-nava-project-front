import Script from "next/script";

export function StructuredData() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "D'Nava",
    description:
      "Panadería y pastelería artesanal. Productos de alta calidad elaborados con dedicación familiar.",
    image: "https://www.dnava-api.com/images/dnava-logo2.png",
    logo: "https://www.dnava-api.com/images/dnava-logo2.png",
    url: "https://www.dnava-api.com",
    telephone: "+51940241024",
    email: "dnavapasteleria@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Retamas 479",
      addressLocality: "Ate Salamanca",
      addressRegion: "Lima",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -12.082785749205195,
      longitude: -76.98209761534501,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$",
    servesCuisine: ["Bakery", "Pastry", "Desserts"],
    acceptsReservations: true,
    sameAs: ["https://www.instagram.com/dnava.pasteleria/"],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "D'Nava",
    url: "https://www.dnava-api.com",
    logo: "https://www.dnava-api.com/images/dnava-logo2.png",
    description: "Panadería y pastelería artesanal",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+51940241024",
      contactType: "customer service",
      email: "dnavapasteleria@gmail.com",
      availableLanguage: ["Spanish"],
    },
  };

  return (
    <>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </>
  );
}
