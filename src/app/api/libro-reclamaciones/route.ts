import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Formatear la fecha actual
    const fecha = new Date().toLocaleString("es-PE", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Crear el contenido del email
    const emailContent = `
LIBRO DE RECLAMACIONES - HOJA N° ${Date.now()}
FECHA: ${fecha}

===========================================
PROVEEDOR: NAVARRO JANCACHAGUA JHONN ROBERT
RUC: 10212741740
DOMICILIO: Av. Jorge Díaz Velásquez S/N, Mz. G Lt. 2A, Piso 1, Dpto. 1, AA.HH. UPIS San José – Lurín, Lima
===========================================

1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE
-------------------------------------------
NOMBRE: ${data.nombre}
DNI / CE: ${data.dni}
DOMICILIO: ${data.domicilio}
TELÉFONO: ${data.telefono}
E-MAIL: ${data.email}
${data.nombreTutor ? `PADRE, MADRE O APODERADO: ${data.nombreTutor}` : ""}

2. IDENTIFICACIÓN DEL BIEN CONTRATADO
-------------------------------------
TIPO: ${data.tipoContratacion === "producto" ? "PRODUCTO" : "SERVICIO"}
MONTO RECLAMADO: S/ ${data.montoReclamado}
DESCRIPCIÓN: ${data.descripcion}

3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR
--------------------------------------------------
TIPO: ${data.tipoReclamacion === "reclamo" ? "RECLAMO" : "QUEJA"}

${data.tipoReclamacion === "reclamo"
  ? "RECLAMO: Disconformidad relacionada a los productos o servicios."
  : "QUEJA: Disconformidad no relacionada a los productos o servicios; o malestar o descontento respecto a la atención al público."}

DETALLE:
${data.detalle}

PEDIDO DEL CONSUMIDOR:
${data.pedido}

===========================================
INFORMACIÓN IMPORTANTE:
- La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
- El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.
===========================================

Este reclamo fue enviado desde: www.dnava-api.com
Fecha y hora de recepción: ${fecha}
    `.trim();

    // En un entorno de producción, aquí enviarías el email
    // Por ahora, guardaremos en un log o archivo
    console.log("NUEVO RECLAMO RECIBIDO:");
    console.log(emailContent);

    // Aquí iría la lógica de envío de email
    // Opción 1: Usar nodemailer (necesitarías configurar SMTP)
    // Opción 2: Usar un servicio como SendGrid, Resend, etc.
    // Opción 3: Guardar en base de datos

    // Por ahora, simulamos el envío exitoso
    // TODO: Implementar envío real de email

    // Enviar email de confirmación al usuario
    const confirmacionUsuario = `
Estimado/a ${data.nombre},

Hemos recibido su ${data.tipoReclamacion === "reclamo" ? "reclamo" : "queja"} correctamente.

Número de registro: ${Date.now()}
Fecha de recepción: ${fecha}

De acuerdo con la normativa vigente, daremos respuesta a su ${data.tipoReclamacion === "reclamo" ? "reclamo" : "queja"} en un plazo no mayor a 15 días hábiles.

La respuesta será enviada a este mismo correo electrónico.

Atentamente,
D'Nava Panadería y Pastelería
RUC: 10212741740
Teléfono: +51 940 241 024
    `.trim();

    console.log("\nCONFIRMACIÓN AL USUARIO:");
    console.log(confirmacionUsuario);

    return NextResponse.json(
      {
        success: true,
        message: "Reclamo recibido exitosamente",
        numeroRegistro: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al procesar el reclamo:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar el reclamo",
      },
      { status: 500 }
    );
  }
}
