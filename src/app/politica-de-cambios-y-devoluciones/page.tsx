import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PoliticaDeCambiosYDevolucionesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 max-w-4xl py-16">
        <h1 className="text-4xl font-bold mb-8">Política de Cambios y Devoluciones</h1>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-muted-foreground">
            En D'Nava nos esforzamos por ofrecer productos de la más alta calidad a nuestros clientes. Sin embargo, entendemos que en ocasiones pueden surgir situaciones que requieran cambios o devoluciones. A continuación, detallamos nuestra política al respecto.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Naturaleza de Nuestros Productos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los productos comercializados por D'Nava son productos de panadería y pastelería artesanal, elaborados de manera fresca y con ingredientes naturales. Debido a su naturaleza perecedera, estos productos requieren un tratamiento especial en cuanto a cambios y devoluciones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Política General de Cambios y Devoluciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Debido a la naturaleza perecedera de nuestros productos, <strong>D'Nava no acepta cambios ni devoluciones de productos una vez entregados</strong>, salvo en las excepciones especificadas en el punto 3 de esta política.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Esta política se aplica a todos los productos comercializados a través de www.dnava-api.com, incluyendo pero no limitándose a: panes, pasteles, tortas, galletas y demás productos de pastelería.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Excepciones: Cuándo SÍ Aceptamos Devoluciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava aceptará devoluciones únicamente en los siguientes casos:
            </p>

            <div className="mt-4 space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">a) Producto con Defectos de Fabricación</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Si el producto presenta defectos evidentes de fabricación, como quemaduras excesivas, mal cocimiento, contaminación visible, o cualquier otro defecto que afecte la calidad del producto de manera evidente.
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">b) Producto No Corresponde al Pedido</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Si el producto entregado no corresponde al pedido realizado (producto diferente, sabor equivocado, cantidad incorrecta, etc.).
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">c) Producto Entregado en Mal Estado</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Si el producto llega en mal estado debido a problemas durante el transporte o almacenamiento inadecuado por parte de D'Nava.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Plazo para Reportar Problemas</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para hacer válida una devolución por alguna de las excepciones mencionadas en el punto 3, el cliente deberá comunicarse con nuestro servicio de atención al cliente <strong>dentro de las 2 horas siguientes a la entrega del producto</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pasado este plazo, D'Nava no podrá garantizar la aceptación de reclamos por cambios o devoluciones, debido a la naturaleza perecedera de los productos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Procedimiento para Solicitar una Devolución</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si su caso cumple con alguna de las excepciones mencionadas, debe seguir el siguiente procedimiento:
            </p>

            <ol className="list-decimal pl-6 mt-4 space-y-3 text-muted-foreground">
              <li>
                <strong>Contactar a Servicio al Cliente:</strong> Comunicarse con nosotros dentro de las 2 horas siguientes a la entrega del producto a través de:
                <ul className="list-disc pl-6 mt-2">
                  <li>Teléfono: +51 940 241 024</li>
                  <li>Correo electrónico: dnavapasteleria@gmail.com</li>
                </ul>
              </li>
              <li>
                <strong>Proporcionar Evidencia:</strong> Enviar fotografías claras del producto que evidencien el problema reportado, junto con el número de pedido.
              </li>
              <li>
                <strong>Descripción del Problema:</strong> Explicar detalladamente el problema encontrado con el producto.
              </li>
              <li>
                <strong>Evaluación:</strong> Nuestro equipo evaluará el caso y se comunicará con usted en un plazo máximo de 24 horas hábiles para informarle sobre la resolución.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Resoluciones Posibles</h2>
            <p className="text-muted-foreground leading-relaxed">
              Una vez evaluado el reclamo y verificado que cumple con los criterios de devolución, D'Nava podrá ofrecer las siguientes soluciones:
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li><strong>Reemplazo del Producto:</strong> Envío de un nuevo producto idéntico sin costo adicional.</li>
              <li><strong>Crédito para Futuras Compras:</strong> Un crédito por el valor del producto para ser utilizado en una compra futura.</li>
              <li><strong>Devolución del Dinero:</strong> Reembolso del monto pagado por el producto defectuoso, bajo los plazos establecidos por su entidad financiera.</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mt-4">
              La solución específica será determinada por D'Nava según la naturaleza del problema y la disponibilidad de productos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cancelación de Pedidos</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava acepta la cancelación de pedidos siempre que se realice con la debida anticipación: <strong>Hasta 12 horas antes de la hora programada de entrega</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para solicitar la cancelación de un pedido, debe comunicarse con nosotros a través de:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Teléfono: +51 940 241 024</li>
              <li>Correo electrónico: dnavapasteleria@gmail.com</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En caso de haber realizado el pago mediante pago en línea, se dará inicio al proceso de devolución por el monto total de la compra al mismo medio de pago utilizado en la transacción, bajo los plazos establecidos por su entidad financiera.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Casos No Cubiertos por Esta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava NO aceptará cambios ni devoluciones en los siguientes casos:
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Cambio de opinión del cliente después de recibir el producto.</li>
              <li>Productos que no sean del gusto personal del cliente, pero que estén correctamente elaborados.</li>
              <li>Productos que hayan sido consumidos parcial o totalmente.</li>
              <li>Reclamos presentados después de las 2 horas siguientes a la entrega.</li>
              <li>Deterioro del producto causado por mal almacenamiento por parte del cliente.</li>
              <li>Productos personalizados o hechos a medida según especificaciones del cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Responsabilidad del Cliente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Es responsabilidad del cliente:
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Verificar el estado del producto al momento de la entrega.</li>
              <li>Confirmar que el producto recibido corresponde al pedido realizado.</li>
              <li>Almacenar adecuadamente el producto una vez recibido.</li>
              <li>Reportar cualquier problema dentro del plazo establecido (2 horas).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Información de Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier consulta relacionada con nuestra política de cambios y devoluciones, puede contactarnos a través de:
            </p>

            <div className="bg-muted/30 rounded-lg p-6 mt-4">
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Teléfono:</strong> +51 940 241 024</li>
                <li><strong>Correo electrónico:</strong> dnavapasteleria@gmail.com</li>
                <li><strong>Horario de atención:</strong> Lunes a viernes de 8:00 AM a 10:00 PM</li>
                <li><strong>Dirección:</strong> Av. Jorge Díaz Velásquez S/N, Mz. G Lt. 2A, Piso 1, Dpto. 1, AA.HH. UPIS San José – Lurín, Lima</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Modificaciones a Esta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava se reserva el derecho de modificar esta política de cambios y devoluciones en cualquier momento. Cualquier cambio será publicado en esta página y entrará en vigor inmediatamente después de su publicación. Se recomienda a los clientes revisar periódicamente esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Legislación Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política de cambios y devoluciones se rige por las leyes de la República del Perú, incluyendo el Código de Protección y Defensa del Consumidor (Ley N° 29571) y demás normativa aplicable.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
            <strong>Última actualización:</strong> Enero 2026
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
