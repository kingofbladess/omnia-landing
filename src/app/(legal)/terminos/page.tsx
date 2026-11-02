import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/LegalHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Términos y Condiciones" };

export default function Terminos() {
  return (
    <>
      <LegalHeader
        title="Términos y Condiciones"
        intro={`Estos Términos regulan el uso del sitio web ${site.domain} (el "Sitio"), operado por ${site.legalName}, RIF ${site.rif}, con domicilio en ${site.city} ("OMNIA", "nosotros"). Al navegar o crear una cuenta en el Sitio aceptas estos Términos. Si no estás de acuerdo, no utilices el Sitio.`}
      />

      <h2>1. Objeto del Sitio</h2>
      <p>
        El Sitio presenta los servicios de OMNIA en materia de centros de datos, desarrollo de software, inteligencia
        artificial, cloud y seguridad, y permite enviar solicitudes de contacto y gestionar una cuenta de usuario. La
        información publicada es referencial y no constituye una oferta vinculante. Toda contratación se formaliza mediante
        una propuesta o contrato específico.
      </p>

      <h2>2. Cuentas de usuario</h2>
      <ul>
        <li>Debes ser mayor de edad y proporcionar datos veraces y actualizados.</li>
        <li>Eres responsable de la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta.</li>
        <li>Debes notificarnos de inmediato cualquier uso no autorizado.</li>
        <li>Podemos suspender o cancelar cuentas que incumplan estos Términos o la ley.</li>
      </ul>

      <h2>3. Uso aceptable</h2>
      <p>Al usar el Sitio te comprometes a no:</p>
      <ul>
        <li>Acceder sin autorización a sistemas, cuentas o datos, ni intentar vulnerar la seguridad del Sitio.</li>
        <li>Introducir código malicioso, realizar ataques de denegación de servicio o extraer datos de forma automatizada.</li>
        <li>Suplantar identidades o enviar información falsa a través de los formularios.</li>
        <li>Usar el Sitio para fines ilícitos, conforme a la Ley Especial contra los Delitos Informáticos y demás normativa aplicable.</li>
      </ul>

      <h2>4. Propiedad intelectual</h2>
      <p>
        La marca OMNIA, logotipos, textos, diseños, código y demás contenidos del Sitio son propiedad de OMNIA o de sus
        licenciantes y están protegidos por la legislación de propiedad intelectual. No se concede ninguna licencia salvo
        el uso personal y no comercial necesario para navegar el Sitio. Las marcas de terceros mencionadas pertenecen a sus
        respectivos titulares.
      </p>

      <h2>5. Herramientas interactivas</h2>
      <p>
        El configurador de infraestructura y cualquier cálculo mostrado en el Sitio son estimaciones ilustrativas. No
        representan una cotización, garantía de rendimiento ni compromiso de disponibilidad. Las condiciones reales se
        definen tras un diagnóstico técnico.
      </p>

      <h2>6. Limitación de responsabilidad</h2>
      <p>
        El Sitio se ofrece &quot;tal cual&quot;. Trabajamos para mantenerlo disponible y seguro, pero no garantizamos que
        esté libre de interrupciones o errores. En la medida permitida por la ley, OMNIA no será responsable por daños
        indirectos derivados del uso o la imposibilidad de uso del Sitio.
      </p>

      <h2>7. Enlaces a terceros</h2>
      <p>El Sitio puede contener enlaces a sitios de terceros sobre los que no tenemos control ni asumimos responsabilidad.</p>

      <h2>8. Privacidad y cookies</h2>
      <p>
        El tratamiento de tus datos se rige por nuestra <Link href="/privacidad">Política de Privacidad</Link> y el uso de
        cookies por nuestra <Link href="/cookies">Política de Cookies</Link>.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        Podemos actualizar estos Términos. Publicaremos la versión vigente en esta página con su fecha de actualización. El
        uso continuado del Sitio implica la aceptación de los cambios.
      </p>

      <h2>10. Ley aplicable y jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes de la República Bolivariana de Venezuela, incluida la Ley sobre Mensajes de
        Datos y Firmas Electrónicas. Cualquier controversia se someterá a los tribunales competentes de {site.city}.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para cualquier consulta sobre estos Términos escríbenos a <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </>
  );
}
