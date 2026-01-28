import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TerminosYCondicionesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 max-w-4xl py-16">
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-muted-foreground">
            El acceso y uso de este sitio web se rige por los términos y condiciones descritos a continuación, así como por la legislación que se aplique en la República del Perú. En consecuencia, todas las visitas y todos los contratos y transacciones que realice un cliente (en adelante "el usuario"), en este sitio, así como sus efectos jurídicos, quedarán regidos por estas reglas y sometidas a esa legislación. Los términos y condiciones contenidos en este instrumento formarán parte de todos los actos y contratos que se ejecuten o celebren mediante los sistemas de oferta y comercialización comprendidos en este sitio Web, entre los usuarios de este sitio y NAVARRO JANCACHAGUA JHONN ROBERT, con RUC N° 10212741740, a quien se le denominará en adelante "D'Nava".
          </p>

          <p className="text-muted-foreground">
            A continuación, se exponen dichas condiciones:
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Registro del usuario o cliente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Será requisito necesario para la adquisición de productos y servicios ofrecidos en este sitio, la aceptación de estos Términos y Condiciones, así como el registro por parte del usuario. Se entenderán como conocidos y aceptados estos Términos y Condiciones por el sólo hecho del registro, en el que se incluirá una manifestación expresa del usuario sobre el conocimiento de las presentes condiciones de uso. Asimismo, para el caso del registro telefónico, se entiende como aceptación de las presentes condiciones el proporcionar los datos necesarios para el registro. El registro en www.dnava-api.com es gratuito.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para registrarse, el usuario deberá brindar su nombre, apellidos, y un correo electrónico vigente. El usuario es responsable, en caso de compartir el dispositivo de acceso, de proteger sus claves y accesos frente al uso de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Clave Secreta</h2>
            <p className="text-muted-foreground leading-relaxed">
              El usuario asume totalmente la responsabilidad por el mantenimiento de la confidencialidad de su clave secreta registrada en este sitio web, la cual le permite efectuar compras, solicitar servicios y obtener información. Dicha clave es de uso personal y su entrega a terceros no involucra responsabilidad de D'Nava o de sus relacionadas en caso de mala utilización.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Derechos del usuario de este sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              El usuario gozará de todos los derechos que le reconoce la legislación sobre protección al consumidor vigente en el territorio del Perú, además de los que se le otorgan en estos términos y condiciones. El usuario dispondrá en todo momento de los derechos de información y rectificación de los datos personales. La sola visita de este sitio en el cual se ofrecen bienes y servicios, no impone al consumidor obligación alguna, a menos que haya aceptado las condiciones ofrecidas por la empresa, en la forma indicada en estos términos y condiciones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Procedimiento para hacer uso de este sitio internet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para los productos ofrecidos por medio de este sitio, D'Nava informará, de manera inequívoca y fácilmente accesible, los pasos que deben seguirse para realizar su compra, e informará vía email cuando sea recibida la solicitud del pedido. Esta solicitud pasará por un proceso de validación de datos del usuario, medio de pago, la recolección de productos del pedido en base al stock disponible al día del despacho y luego se cerrará el pedido, emitiéndose el comprobante de pago, el cual será enviado al usuario junto con el despacho de su pedido, o le llegará por correo electrónico luego de facturado el pedido. D'Nava indicará, además, su dirección de correo postal o electrónico y los medios técnicos a disposición del consumidor para identificar y corregir errores en el envío o en sus datos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Medios de pago que se podrán utilizar en este sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los productos y servicios ofrecidos en este sitio, salvo que se señale una forma diferente para casos particulares u ofertas de determinados bienes o servicios, podrán ser pagados bajo las siguientes modalidades:
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Pagos en línea a través de la plataforma Culqi:</strong> Se aceptan tarjetas de débito y crédito Visa y MasterCard. Los montos aprobados serán cobrados a la tarjeta utilizada al momento de la compra. Luego de la entrega del pedido, y en caso que la orden pudiera llegar incompleta por indisponibilidad de algún/os producto/s, se dará inicio al proceso de extorno por el monto diferencial, al medio de pago utilizado en la compra, bajo los plazos establecidos por su entidad financiera.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En caso de anulación del pedido a solicitud del usuario, se dará inicio al proceso de devolución por el monto total de la compra al medio de pago utilizado en la compra y bajo los plazos establecidos por su entidad financiera.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Formación del consentimiento en los pedidos realizado a través de este sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              A través de este sitio web, D'Nava realizará ofertas de productos, que podrán ser aceptadas por vía electrónica, utilizando los mecanismos que el sitio ofrece para ello. Toda aceptación de oferta quedará sujeta a la condición que D'Nava valide la transacción. En consecuencia, para toda operación que se efectúe en este sitio, la confirmación y/o validación y/o verificación por parte de D'Nava, será requisito indispensable para la formación del consentimiento. Para dar por validada la transacción, una vez recibido el pedido, D'Nava verificará:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Que dispone de los productos solicitados en stock.</li>
              <li>Que el medio de pago ofrecido por el usuario es válido.</li>
              <li>Que los datos registrados por el usuario son auténticos y no media dolo ni/o error.</li>
              <li>Que, cuando se trate de ofertas y/o promociones, el pedido respete las condiciones detalladas en las mismas.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En atención a lo señalado en los párrafos anteriores, y como una medida de protección a la seguridad de las transacciones, D'Nava podrá dejar sin efecto los pedidos cuando verifique que no se cumple uno o más de los criterios establecidos precedentemente. En estos casos, y como medida de seguridad para el usuario, D'Nava anulará automáticamente el pedido, procediendo a comunicar este hecho a la entidad financiera emisora de la tarjeta utilizada por el usuario en su solicitud de compra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Despacho de los productos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los productos adquiridos a través de www.dnava-api.com estarán sujetos a las condiciones de entrega elegidas por el usuario y disponibles en el sitio web. La información del lugar de entrega es de exclusiva responsabilidad del usuario. Los pedidos serán atendidos de acuerdo con la disponibilidad publicada en el sitio web.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los plazos elegidos para el despacho y entrega se cuentan desde que D'Nava haya validado la compra. Este plazo se cumplirá siempre y cuando las condiciones de seguridad y acceso lo permitan, y cuando no se presente un caso fortuito o por motivo de fuerza mayor.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los pedidos deberán realizarse con un mínimo de 24 horas de anticipación para garantizar la disponibilidad de los productos y la entrega en la fecha solicitada.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En caso de optar por la opción de Delivery, es responsabilidad del usuario estar presente en la dirección de entrega, o designar al responsable para su recepción. D'Nava esperará un máximo de 30 minutos luego de haberse notificado al usuario la llegada del repartidor a su domicilio. Vencido dicho plazo, D'Nava no se hace responsable de la degradación del producto, pues es perecible.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Durante campañas específicas y temporadas de alta demanda como Día de la Madre, Fiestas Patrias, Navidad y/o situaciones imprevisibles, caso fortuito o de fuerza mayor, D'Nava realizará las entregas sin turno específico y podrá reprogramar los envíos. Los días feriados nacionales no contaremos con servicio de despacho.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cobro del servicio de envío (flete)</h2>
            <p className="text-muted-foreground leading-relaxed">
              El cálculo del flete a cobrar se realiza en función al distrito de entrega. El costo de delivery es de S/ 5.00 para zonas dentro de Lurín. Para otros distritos, el costo será informado al momento de realizar el pedido.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              El monto mínimo de compra para realizar un pedido es de S/ 6.00.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Derecho de Anulación</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava acepta la anulación de pedidos. Para este fin, el usuario debe comunicar la anulación con la debida anticipación: Hasta 12 horas antes de la hora programada de entrega.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Las anulaciones deberán solicitarse llamando a nuestro número de contacto: +51 940 241 024 o escribiendo al correo: dnavapasteleria@gmail.com
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En caso el usuario realizará el pago de su pedido mediante pago en línea, se dará inicio al proceso de devolución por el monto total de la compra al mismo medio de pago utilizado en la transacción, bajo los plazos establecidos por su entidad financiera.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Política de cambios y devoluciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Debido a la naturaleza perecedera de nuestros productos, D'Nava no acepta cambios ni devoluciones de productos una vez entregados, salvo que el producto presente defectos de fabricación o no corresponda al pedido realizado. En estos casos, el usuario deberá comunicarse con nuestro servicio de atención al cliente dentro de las 2 horas siguientes a la entrega del producto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Uso de los datos personales registrados en el sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos referidos en estos términos y condiciones tendrán como finalidad validar los pedidos y mejorar la labor de información y comercialización de los productos prestados por D'Nava. Solo podrán ser entregados a las empresas relacionadas con D'Nava. En ningún caso serán traspasados a terceros. Asimismo, sugerimos a los usuarios revisar la "Política de Privacidad" de este sitio web para mayor información.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Validez de las ofertas contenidas en este sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los precios de los productos disponibles en este sitio, mientras aparezcan en él, solo tendrán vigencia y aplicación en este y no serán necesariamente aplicables a otros canales de venta utilizados por D'Nava, salvo que se indique expresamente. Asimismo, D'Nava podrá modificar cualquier información contenida en este sitio, incluyendo las relacionadas con producto, precios, existencias y condiciones en cualquier momento y sin previo aviso, respetando las compras que han sido aceptadas hasta dicho momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Promociones</h2>
            <p className="text-muted-foreground leading-relaxed">
              www.dnava-api.com es un canal dedicado al giro de venta de productos de panadería y pastelería principalmente, por lo que comercializa productos exclusivamente a usuarios finales o consumidores finales, para ser destinados directamente a satisfacer las necesidades personales y familiares. Por el motivo expresado, el usuario podrá adquirir una cantidad máxima determinada de productos de acuerdo a las restricciones indicadas y publicadas en la web y publicidad, las cuales son vinculantes para su compra. En ese sentido, D'Nava se reserva el derecho de rechazar algún pedido cuando verifique que una o más compras, ya sea con el mismo usuario o dirección de entrega, excede del número total de unidades anunciadas en la oferta o promoción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Otros sitios web</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava no garantiza, avala ni respalda de ninguna forma el acceso a información o contenido de cualquier otro sitio web o portal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">15. Consultas, Sugerencias y Reclamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava valora la opinión de sus clientes. Por ello, se ha habilitado una sección de contacto en el sitio web, que facilitará la comunicación de dudas o comentarios que los usuarios pudieran tener.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Adicionalmente, toda queja o reclamo relacionado con actos o contratos ejecutados o celebrados a través de esta web, deberá ser presentada a Servicio al Cliente, llamando a nuestro número de contacto: +51 940 241 024, o escribiendo al siguiente correo: dnavapasteleria@gmail.com
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Horario de atención: Lunes a viernes de 8:00 AM a 10:00 PM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">16. Capacidad legal para contratar</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los productos y servicios ofrecidos en www.dnava-api.com están disponibles sólo para aquellos individuos que tengan capacidad legal para contratar, según lo dispuesto por la legislación vigente. Si una persona no tiene capacidad legal para contratar, debe abstenerse de utilizar los servicios ofrecidos en el sitio. D'Nava podrá suspender la participación de usuarios que se compruebe carecen de capacidad legal para usar los servicios ofrecidos en el sitio en cualquier momento en forma temporal o definitiva o cuando al registrarse brinden información que sea falsa, inexacta o fraudulenta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">17. Delimitación de responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              D'Nava no se responsabiliza frente a los usuarios o terceros por los daños y perjuicios que sean consecuencia directa o indirecta de la interrupción, suspensión o finalización de los productos ofrecidos por el sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">18. Contenido fotográfico como referencia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las fotos de productos que aparecen en el sitio son referenciales; pueden existir variantes entre la foto mostrada en www.dnava-api.com y el producto recibido. Para un mejor detalle, en la ficha o contenido de los productos se podrá encontrar las características de los mismos. Ante la falta de correspondencia entre la fotografía y el producto, primará la información de las características informadas del producto.
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
