"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function LibroDeReclamacionesPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    domicilio: "",
    telefono: "",
    email: "",
    nombreTutor: "",
    tipoContratacion: "producto",
    montoReclamado: "",
    descripcion: "",
    tipoReclamacion: "reclamo",
    detalle: "",
    pedido: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/libro-reclamaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          nombre: "",
          dni: "",
          domicilio: "",
          telefono: "",
          email: "",
          nombreTutor: "",
          tipoContratacion: "producto",
          montoReclamado: "",
          descripcion: "",
          tipoReclamacion: "reclamo",
          detalle: "",
          pedido: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 max-w-4xl py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Libro de Reclamaciones</h1>
          <div className="bg-muted/30 rounded-lg p-6 space-y-2">
            <p className="text-sm">
              <strong>PROVEEDOR:</strong> NAVARRO JANCACHAGUA JHONN ROBERT
            </p>
            <p className="text-sm">
              <strong>RUC:</strong> 10212741740
            </p>
            <p className="text-sm">
              <strong>DOMICILIO:</strong> Av. Jorge Díaz Velásquez S/N, Mz. G Lt. 2A, Piso 1, Dpto. 1, AA.HH. UPIS San José – Lurín, Lima
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Identificación del Consumidor */}
          <section className="bg-muted/20 rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold">
              1. Identificación del Consumidor Reclamante
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI / CE *</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domicilio">Domicilio *</Label>
                <Input
                  id="domicilio"
                  name="domicilio"
                  value={formData.domicilio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nombreTutor">
                  Si es menor de edad, nombre del padre, madre o apoderado
                </Label>
                <Input
                  id="nombreTutor"
                  name="nombreTutor"
                  value={formData.nombreTutor}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Sección 2: Identificación del Bien Contratado */}
          <section className="bg-muted/20 rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold">
              2. Identificación del Bien Contratado
            </h2>

            <div className="space-y-4">
              <RadioGroup
                name="tipoContratacion"
                value={formData.tipoContratacion}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tipoContratacion: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="producto" id="producto" />
                  <Label htmlFor="producto">Producto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="servicio" id="servicio" />
                  <Label htmlFor="servicio">Servicio</Label>
                </div>
              </RadioGroup>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="montoReclamado">Monto Reclamado (S/) *</Label>
                  <Input
                    id="montoReclamado"
                    name="montoReclamado"
                    type="number"
                    step="0.01"
                    value={formData.montoReclamado}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Torta de chocolate 1kg"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección 3: Detalle de la Reclamación */}
          <section className="bg-muted/20 rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold">
              3. Detalle de la Reclamación y Pedido del Consumidor
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Tipo *</Label>
                <RadioGroup
                  name="tipoReclamacion"
                  value={formData.tipoReclamacion}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, tipoReclamacion: value }))
                  }
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="reclamo" id="reclamo" className="mt-1" />
                    <div>
                      <Label htmlFor="reclamo" className="font-semibold">
                        Reclamo
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Disconformidad relacionada a los productos o servicios.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="queja" id="queja" className="mt-1" />
                    <div>
                      <Label htmlFor="queja" className="font-semibold">
                        Queja
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Disconformidad no relacionada a los productos o servicios; o malestar
                        o descontento respecto a la atención al público.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detalle">Detalle *</Label>
                <Textarea
                  id="detalle"
                  name="detalle"
                  value={formData.detalle}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describa detalladamente su reclamo o queja..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pedido">Pedido del Consumidor *</Label>
                <Textarea
                  id="pedido"
                  name="pedido"
                  value={formData.pedido}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Indique qué solución espera obtener..."
                  required
                />
              </div>
            </div>
          </section>

          {/* Información Legal */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 space-y-2 text-sm">
            <p className="font-semibold">Información importante:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                La formulación del reclamo no impide acudir a otras vías de solución de
                controversias ni es requisito previo para interponer una denuncia ante el
                INDECOPI.
              </li>
              <li>
                El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a
                quince (15) días hábiles, el cual es improrrogable.
              </li>
            </ul>
          </div>

          {/* Estado del envío */}
          {submitStatus === "success" && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                Su reclamo ha sido enviado exitosamente. Recibirá una respuesta en un plazo
                máximo de 15 días hábiles al correo electrónico proporcionado.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Hubo un error al enviar su reclamo. Por favor, intente nuevamente o
                contáctenos directamente al +51 940 241 024.
              </p>
            </div>
          )}

          {/* Botón de envío */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full md:w-auto px-12"
            >
              {isSubmitting ? "Enviando..." : "Enviar Reclamo"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
