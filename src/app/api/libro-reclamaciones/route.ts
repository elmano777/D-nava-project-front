import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const DESTINATARIO = "dnavapasteleria@gmail.com";
const REMITENTE = "Libro de Reclamaciones <reclamaciones@mail.dnava-api.com>";

/** Cliente Resend solo cuando hace falta y hay API key (evita fallo en build). */
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY no está configurada. Añádela en .env.local o en las variables de entorno.");
  }
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const resend = getResend();

    const fecha = new Date().toLocaleString("es-PE", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const numeroRegistro = Date.now();

    // Email al negocio
    await resend.emails.send({
      from: REMITENTE,
      to: [DESTINATARIO],
      subject: `Nuevo ${data.tipoReclamacion === "reclamo" ? "Reclamo" : "Queja"} - Hoja N° ${numeroRegistro}`,
      html: `
        <h2>LIBRO DE RECLAMACIONES - HOJA N° ${numeroRegistro}</h2>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <hr />
        <h3>1. Identificación del Consumidor</h3>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:4px 8px"><strong>Nombre:</strong></td><td>${data.nombre}</td></tr>
          <tr><td style="padding:4px 8px"><strong>DNI / CE:</strong></td><td>${data.dni}</td></tr>
          <tr><td style="padding:4px 8px"><strong>Domicilio:</strong></td><td>${data.domicilio}</td></tr>
          <tr><td style="padding:4px 8px"><strong>Teléfono:</strong></td><td>${data.telefono}</td></tr>
          <tr><td style="padding:4px 8px"><strong>E-mail:</strong></td><td>${data.email}</td></tr>
          ${data.nombreTutor ? `<tr><td style="padding:4px 8px"><strong>Apoderado:</strong></td><td>${data.nombreTutor}</td></tr>` : ""}
        </table>
        <h3>2. Bien Contratado</h3>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:4px 8px"><strong>Tipo:</strong></td><td>${data.tipoContratacion === "producto" ? "Producto" : "Servicio"}</td></tr>
          <tr><td style="padding:4px 8px"><strong>Monto reclamado:</strong></td><td>S/ ${data.montoReclamado}</td></tr>
          <tr><td style="padding:4px 8px"><strong>Descripción:</strong></td><td>${data.descripcion}</td></tr>
        </table>
        <h3>3. Detalle de la ${data.tipoReclamacion === "reclamo" ? "Reclamación" : "Queja"}</h3>
        <p><strong>Tipo:</strong> ${data.tipoReclamacion === "reclamo" ? "RECLAMO - Disconformidad relacionada a los productos o servicios." : "QUEJA - Disconformidad no relacionada a los productos o servicios."}</p>
        <p><strong>Detalle:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:4px">${data.detalle}</p>
        <p><strong>Pedido del consumidor:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:4px">${data.pedido}</p>
      `,
    });

    // Email de confirmación al usuario
    await resend.emails.send({
      from: REMITENTE,
      to: [data.email],
      subject: `Confirmación de ${data.tipoReclamacion === "reclamo" ? "reclamo" : "queja"} - D'Nava`,
      html: `
        <h2>Hemos recibido su ${data.tipoReclamacion === "reclamo" ? "reclamo" : "queja"}</h2>
        <p>Estimado/a <strong>${data.nombre}</strong>,</p>
        <p>Le confirmamos que hemos recibido su ${data.tipoReclamacion === "reclamo" ? "reclamo" : "queja"} correctamente.</p>
        <table style="border-collapse:collapse">
          <tr><td style="padding:4px 8px"><strong>N° de registro:</strong></td><td>${numeroRegistro}</td></tr>
          <tr><td style="padding:4px 8px"><strong>Fecha:</strong></td><td>${fecha}</td></tr>
        </table>
        <p>De acuerdo con la normativa vigente, daremos respuesta en un plazo no mayor a <strong>15 días hábiles</strong>.</p>
        <p>La respuesta será enviada a este mismo correo electrónico.</p>
        <br />
        <p>Atentamente,</p>
        <p><strong>D'Nava Panadería y Pastelería</strong><br />
        RUC: 10212741740<br />
        Teléfono: +51 940 241 024</p>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reclamo recibido exitosamente",
        numeroRegistro,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al procesar el reclamo:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar el reclamo",
      },
      { status: 500 },
    );
  }
}
