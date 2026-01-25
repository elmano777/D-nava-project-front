import { Sparkles, Heart, Award } from "lucide-react";

const values = [
  {
    number: "01",
    icon: Heart,
    title: "Pasión Artesanal",
    description:
      "Cada producto es elaborado con amor y dedicación, siguiendo recetas familiares que han sido perfeccionadas a través de generaciones.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Ingredientes Premium",
    description:
      "Seleccionamos los mejores ingredientes: harinas importadas, chocolate belga y frutas frescas de temporada para garantizar calidad excepcional.",
  },
  {
    number: "03",
    icon: Award,
    title: "Tradición y Calidad",
    description:
      "Más de 25 años de experiencia nos respaldan. Horneamos desde temprano cada día para ofrecerte productos frescos y deliciosos.",
  },
];

export function AboutSection() {
  return (
    <section className="py-24 bg-muted/30" id="nosotros">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Contenido de texto */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-balance leading-tight">
                Tradición familiar con{" "}
                <span className="font-semibold italic">sabor único</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
                D`Nava nació del amor por la repostería y el deseo de compartir
                momentos especiales a través de sabores auténticos. Somos una
                familia dedicada al arte de hornear.
              </p>
            </div>

            <div className="space-y-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.number} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-mono text-muted-foreground">
                          {value.number}
                        </span>
                        <h3 className="text-xl font-semibold">{value.title}</h3>
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/torta-de-chocolate-artesanal.jpg"
                  alt="Torta de chocolate artesanal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/pan-frances-crujiente.jpg"
                  alt="Pan francés artesanal"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/torta-tres-leches.jpg"
                  alt="Torta tres leches"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/artisan-baker-preparing-fresh-bread-in-bakery.jpg"
                  alt="Panadero artesanal"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
