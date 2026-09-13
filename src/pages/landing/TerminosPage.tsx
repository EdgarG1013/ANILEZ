import LegalLayout, { Seccion, Subtitulo, Parrafo, Lista } from "../../components/compartido/LegalLayout";

// ─── Términos de Servicio de ANILEZ ──────────────────────────────────────────

export default function TerminosPage() {
  return (
    <LegalLayout
      etiqueta="Legal"
      titulo={
        <>
          Términos de <span className="text-[#946ed9]">Servicio</span>
        </>
      }
      intro="ANILEZ es un proyecto hecho por gusto, en el tiempo libre de una sola persona. Estos términos existen para dejar claras las reglas del juego y protegerte (y protegernos) de malentendidos."
      ultimaActualizacion="13 de septiembre de 2026"
    >
      <Seccion numero="01" titulo="Naturaleza del proyecto">
        <Parrafo>
          <strong className="text-[#f0eefa]">
            ANILEZ es un proyecto de carácter personal, experimental y de código abierto.
          </strong>{" "}
          Se ofrece <strong className="text-[#f0eefa]">"tal cual" (as is)</strong> y según
          disponibilidad, sin compromiso de continuidad. Esto significa que:
        </Parrafo>
        <Lista
          items={[
            "Es desarrollado por una persona independiente como proyecto de hobby, no como un servicio comercial.",
            "Puede experimentar cambios, interrupciones o cese de operaciones en cualquier momento.",
            "No existe un equipo de soporte dedicado, aunque siempre habrá buena disposición para ayudar.",
          ]}
        />
        <Parrafo>
          Al registrarte o usar la plataforma, aceptas estos términos en su totalidad.
        </Parrafo>
      </Seccion>

      <Seccion numero="02" titulo="Limitación de responsabilidad">
        <Parrafo>
          En la máxima medida permitida por la ley aplicable:
        </Parrafo>
        <Lista
          items={[
            <>
              <strong className="text-[#f0eefa]">
                No garantizamos un tiempo de actividad continuo
              </strong>{" "}
              ni la ausencia de errores, interrupciones o fallos del servicio.
            </>,
            <>
              <strong className="text-[#f0eefa]">
                No nos hacemos responsables por la pérdida accidental de listas de seguimiento,
                cuentas o información
              </strong>{" "}
              debida a fallos en el servidor, actualizaciones, migraciones de la base de datos o
              cualquier otro evento técnico.
            </>,
            <>
              No respondemos por daños indirectos, incidentales o consecuentes derivados del uso de
              la plataforma.
            </>,
          ]}
        />
        <Parrafo>
          <strong className="text-[#f0eefa]">Recomendación importante:</strong> utiliza con
          frecuencia la función de exportación de listas (en formato JSON o TXT) que encontrarás en
          Configuración. Mantener una copia de seguridad de tus datos es la mejor protección.
        </Parrafo>
      </Seccion>

      <Seccion numero="03" titulo="Conducta del usuario">
        <Parrafo>
          ANILEZ es un espacio tranquilo para organizar tus listas. Al usarlo, te comprometes a{" "}
          <strong className="text-[#f0eefa]">no</strong>:
        </Parrafo>
        <Lista
          items={[
            "Realizar ataques de cualquier tipo contra la plataforma (denegación de servicio, inyección, fuerza bruta, etc.).",
            "Ejecutar minería de datos o extracción masiva de contenido.",
            "Usar bots automatizados o scripts que saturen el servicio.",
            "Intentar abusar, sobrecargar o eludir los límites de uso de la conexión con la API de Tenrai.",
            "Suplantar la identidad de otros usuarios o intentar acceder a cuentas ajenas.",
          ]}
        />
        <Parrafo>
          El incumplimiento de estas normas puede resultar en la terminación inmediata de tu cuenta
          (ver sección 06).
        </Parrafo>
      </Seccion>

      <Seccion numero="04" titulo="Propiedad intelectual">
        <Subtitulo>Contenido multimedia</Subtitulo>
        <Parrafo>
          Todo el contenido multimedia mostrado en ANILEZ —incluyendo carátulas, nombres de obras,
          sinopsis y demás información de anime y manga—{" "}
          <strong className="text-[#f0eefa]">
            pertenece a sus respectivos autores, estudios y licenciantes
          </strong>
          . Dicho contenido es provisto dinámicamente por la{" "}
          <strong className="text-[#f0eefa]">API de Tenrai</strong> y se muestra únicamente con
          fines informativos. ANILEZ no reclama ningún derecho sobre él.
        </Parrafo>

        <Subtitulo>El código fuente</Subtitulo>
        <Parrafo>
          El código fuente de la aplicación se distribuye como proyecto de código abierto bajo la{" "}
          <strong className="text-[#f0eefa]">Apache License, Version 2.0</strong>. Puedes
          consultarlo, modificarlo y redistribuirlo conforme a los términos de dicha licencia.
        </Parrafo>
      </Seccion>

      <Seccion numero="05" titulo="Cuentas de usuario">
        <Parrafo>
          Eres responsable de mantener la confidencialidad de tu contraseña y de la actividad que
          ocurra en tu cuenta. Nos reservamos el derecho de modificar, suspender o eliminar cuentas
          que contengan información falsa, sean utilizadas con fines ilícitos o violen estos
          términos.
        </Parrafo>
      </Seccion>

      <Seccion numero="06" titulo="Terminación de cuentas">
        <Parrafo>
          Nos reservamos el derecho, como administrador del servicio, de{" "}
          <strong className="text-[#f0eefa]">
            suspender o eliminar el acceso a cualquier usuario
          </strong>{" "}
          que intente comprometer la seguridad del sitio, abuses de la infraestructura o viole las
          normas de uso descritas en estos términos.
        </Parrafo>
        <Parrafo>
          También puedes eliminar tu propia cuenta en cualquier momento desde la configuración de
          tu perfil; al hacerlo, tus datos se borran de forma permanente (consulta la Política de
          Privacidad para conocer el procedimiento).
        </Parrafo>
      </Seccion>

      <Seccion numero="07" titulo="Cambios en estos términos">
        <Parrafo>
          Como proyecto en constante evolución, estos términos pueden actualizarse. Los cambios se
          publicarán en esta misma página con una nueva fecha de actualización. El uso continuado
          de la plataforma después de una modificación implica la aceptación de la versión vigente.
        </Parrafo>
      </Seccion>

      <Seccion numero="08" titulo="Contacto">
        <Parrafo>
          Cualquier duda sobre estos términos puede dirigirse al correo de contacto del proyecto
          publicado en el repositorio oficial de ANILEZ.
        </Parrafo>
      </Seccion>
    </LegalLayout>
  );
}
