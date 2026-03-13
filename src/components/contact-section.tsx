import { Phone, Mail, MapPin, Clock } from "lucide-react";

type ContactInfoItem = {
  icon: typeof Phone;
  label: string;
  value: string;
  link?: string;
};

type ScheduleItem = {
  day: string;
  hours: string;
};

const contactInfo: ContactInfoItem[] = [
  {
    icon: Phone,
    label: "Teléfono",
    value: "+51 940 241 024",
    link: "tel:+51940241024",
  },
  {
    icon: Mail,
    label: "Email",
    value: "dnavapasteleria@gmail.com",
    link: "mailto:dnavapasteleria@gmail.com",
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: "Retamas 479, Ate Salamanca",
  },
];

const schedule: ScheduleItem[] = [
  { day: "Lunes - Viernes", hours: "7:00 AM - 8:00 PM" },
  { day: "Sábados", hours: "8:00 AM - 9:00 PM" },
  { day: "Domingos", hours: "9:00 AM - 6:00 PM" },
];

export function ContactSection() {
  return (
    <section className="py-24 bg-background" id="contacto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Información de contacto */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                Hablemos de tu{" "}
                <span className="font-semibold italic">próximo pedido</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Estamos aquí para hacer realidad tus celebraciones más
                especiales con productos artesanales de la más alta calidad.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </p>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="text-lg font-medium hover:text-primary transition-colors block"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6" />
          </div>

          {/* Horario */}
          <div className="bg-muted/30 rounded-3xl p-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Horario de atención</h3>
            </div>

            <div className="space-y-5">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center pb-5 border-b border-border/50 last:border-0"
                >
                  <span className="text-base font-medium">{item.day}</span>
                  <span className="text-base text-muted-foreground font-mono">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Entregas disponibles todos los días. Pedidos especiales con 48
                horas de anticipación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
