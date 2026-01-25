import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-balance leading-[1.1]">
                Sabor artesanal <br />
                <span className="font-semibold">en cada bocado</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-xl text-pretty leading-relaxed">
                Pasteles, panes y postres elaborados con dedicación familiar
                desde 1995
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base px-8 py-6 h-auto">
                <Link href="/productos">Explorar Productos</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-base px-8 py-6 h-auto"
              >
                <Link href="/#nosotros">Nuestra Historia</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/hermosos-pasteles-artesanales-en-vitrina-de-panade.jpg"
                alt="Productos artesanales D'Nava"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
