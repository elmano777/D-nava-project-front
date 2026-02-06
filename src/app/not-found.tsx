import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-amber-50 to-white">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-amber-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
            Volver a la página principal
          </Button>
        </Link>
      </div>
    </div>
  );
}
