import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/LegalHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Política de Privacidad" };

export default function Privacidad() {
  return (
    <>
      <LegalHeader
        title="Política de Privacidad"
        intro={`En ${site.legalName} respetamos tu privacidad. Esta política explica qué datos personales recopilamos en ${site.domain}, para qué los usamos y cuáles son tus derechos, de acuerdo con los artículos 28 y 60 de la Constitución de la República Bolivariana de Venezuela y la normativa aplicable.`}
      />

      <h2>1. Responsable del tratamiento</h2>
      <p>
        {site.legalName}, RIF {site.rif}, {site.address}. Contacto: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <ul>
        <li>
          <strong>Formulario de contacto:</strong> nombre, correo, empresa, teléfono y el mensaje que nos envías.
        </li>
        <li>
          <strong>Cuenta de usuario:</strong> correo, nombre y contraseña (almacenada cifrada por nuestro proveedor de
          autenticación; nunca la vemos).
        </li>
        <li>
          <strong>Datos técnicos:</strong> cookies necesarias para la sesión y, solo si lo aceptas, cookies de análisis y
          marketing. Ver la <Link href="/cookies">Política de Cookies</Link>.
        </li>
      </ul>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Responder tus solicitudes y preparar propuestas comerciales.</li>
        <li>Crear y gestionar tu cuenta y mantener la seguridad del Sitio.</li>
        <li>Mejorar el Sitio mediante estadísticas, si das tu consentimiento.</li>
        <li>Cumplir obligaciones legales.</li>
      </ul>
      <p>No vendemos ni alquilamos tus datos personales.</p>

      <h2>4. Base del tratamiento</h2>
      <p>
        Tratamos tus datos con tu consentimiento (que puedes retirar en cualquier momento), para ejecutar la relación que
        solicitas con nosotros y para cumplir obligaciones legales.
      </p>

      <h2>5. Proveedores y transferencias</h2>
      <p>
        Usamos proveedores tecnológicos que actúan como encargados del tratamiento, como servicios de hosting (Vercel) y de
        base de datos y autenticación (Supabase). Estos proveedores pueden almacenar datos fuera de Venezuela, aplicando
        medidas de seguridad adecuadas.
      </p>

      <h2>6. Conservación</h2>
      <p>
        Conservamos las solicitudes de contacto mientras sean necesarias para atenderte y hasta 24 meses después del
        último contacto, y los datos de cuenta mientras la cuenta esté activa, salvo obligación legal de conservarlos más
        tiempo.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos cifrado en tránsito (HTTPS), control de acceso por roles y políticas de seguridad a nivel de base de
        datos. Ningún sistema es infalible; si detectamos un incidente que te afecte, te lo notificaremos.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes solicitar acceso, rectificación, actualización o eliminación de tus datos, así como retirar tu
        consentimiento, escribiendo a <a href={`mailto:${site.email}`}>{site.email}</a>. Responderemos en un plazo
        razonable.
      </p>

      <h2>9. Menores de edad</h2>
      <p>El Sitio no está dirigido a menores de edad y no recopilamos sus datos de forma intencionada.</p>

      <h2>10. Cambios</h2>
      <p>Publicaremos cualquier cambio en esta página con su nueva fecha de actualización.</p>
    </>
  );
}
