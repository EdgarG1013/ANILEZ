import LegalLayout, { Seccion, Subtitulo, Parrafo, Lista } from "../../components/compartido/LegalLayout";

// ─── Política de Privacidad de ANILEZ ────────────────────────────────────────

export default function PrivacidadPage() {
  return (
    <LegalLayout
      etiqueta="Legal"
      titulo={
        <>
          Política de <span className="text-[#946ed9]">Privacidad</span>
        </>
      }
      intro="En ANILEZ creemos que tus listas son tuyas y nadie más. Este documento explica, en lenguaje claro y sin letra pequeña tramposa, qué datos recopilamos, por qué los necesitamos y cómo los protegemos."
      ultimaActualizacion="13 de septiembre de 2026"
    >
      <Seccion numero="01" titulo="Datos que recopilamos">
        <Parrafo>
          Recopilamos la mínima cantidad de información necesaria para que la plataforma funcione.
          En concreto, el sistema únicamente almacena:
        </Parrafo>
        <Lista
          items={[
            "Tu nombre de usuario.",
            "Tu dirección de correo electrónico.",
            "Tu foto de perfil.",
          ]}
        />
        <Parrafo>
          No recopilamos datos de ubicación, información de pagos, historial de navegación fuera de
          la plataforma ni ningún otro dato sensible.
        </Parrafo>
      </Seccion>

      <Seccion numero="02" titulo="Métodos de recolección">
        <Parrafo>
          La información anterior se obtiene únicamente en el momento del registro, a través de dos
          vías:
        </Parrafo>
        <Lista
          items={[
            <>
              <strong className="text-[#f0eefa]">Registro tradicional:</strong> al crear una cuenta
              con usuario, correo electrónico y contraseña.
            </>,
            <>
              <strong className="text-[#f0eefa]">Delegación de autenticación:</strong> al iniciar
              sesión mediante Google OAuth o Discord OAuth, se nos transfiere la información básica
              del perfil (nombre, correo y foto) directamente desde esas plataformas.
            </>,
          ]}
        />
      </Seccion>

      <Seccion numero="03" titulo="Uso de la información">
        <Parrafo>
          Tus datos se utilizan <strong className="text-[#f0eefa]">exclusivamente</strong> para:
        </Parrafo>
        <Lista
          items={[
            "Autenticarte en la plataforma y verificar tu identidad.",
            "Gestionar tu sesión de usuario (mantenerte conectado de forma segura).",
            "Crear y mantener tu perfil, para que puedas administrar tus listas personalizadas de anime y manga.",
          ]}
        />
        <Parrafo>
          No utilizamos tus datos con fines publicitarios, de análisis de terceros ni de
          perfilamiento comercial.
        </Parrafo>
      </Seccion>

      <Seccion numero="04" titulo="Integración con terceros">
        <Subtitulo>Inicio de sesión con Google y Discord</Subtitulo>
        <Parrafo>
          Los inicios de sesión mediante Google y Discord están sujetos a las políticas de
          privacidad de dichas plataformas. Cuando te autenticas con ellas, el tratamiento de tus
          credenciales ocurre en sus servidores y bajo sus propios términos. Te recomendamos
          revisarlas:
        </Parrafo>
        <Lista
          items={[
            <a
              key="google"
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#946ed9] hover:text-[#b08ee8] underline underline-offset-2"
            >
              Política de privacidad de Google
            </a>,
            <a
              key="discord"
              href="https://discord.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#946ed9] hover:text-[#b08ee8] underline underline-offset-2"
            >
              Política de privacidad de Discord
            </a>,
          ]}
        />

        <Subtitulo>API de Tenrai</Subtitulo>
        <Parrafo>
          La base de datos de contenido de ANILEZ (títulos, sinopsis, carátulas, fechas de
          estreno y demás información sobre anime y manga) se alimenta dinámicamente de la{" "}
          <strong className="text-[#f0eefa]">API de Tenrai</strong>. Las consultas se realizan para
          mostrar información en pantalla y no están asociadas a tu identidad personal.
        </Parrafo>

        <Subtitulo>Lo que nunca haremos</Subtitulo>
        <Parrafo>
          <strong className="text-[#f0eefa]">
            No vendemos ni compartimos la información personal de los usuarios con anunciantes o
            terceros comerciales.
          </strong>{" "}
          Punto. Tus datos no son un producto.
        </Parrafo>
      </Seccion>

      <Seccion numero="05" titulo="Cookies y almacenamiento local">
        <Parrafo>
          Para que no tengas que iniciar sesión cada vez que entras, ANILEZ utiliza{" "}
          <strong className="text-[#f0eefa]">cookies técnicas y el almacenamiento local de tu
          navegador</strong> con un único propósito:{" "}
          <strong className="text-[#f0eefa]">mantener abierta tu sesión de usuario</strong>.
        </Parrafo>
        <Parrafo>
          No usamos cookies de rastreo, de publicidad ni de perfilado. Tampoco compartimos esa
          información con nadie. Si borras las cookies o el almacenamiento local de tu navegador,
          simplemente tendrás que volver a iniciar sesión.
        </Parrafo>
      </Seccion>

      <Seccion numero="06" titulo="Seguridad de los datos">
        <Parrafo>
          Aplicamos buenas prácticas para proteger tu información: las contraseñas se almacenan de
          forma cifrada (nunca en texto plano), las comunicaciones viajan por conexiones seguras y
          el acceso a la base de datos está restringido. Aun así, ningún sistema es infalible, por
          lo que también te pedimos usar una contraseña única y no compartirla con nadie.
        </Parrafo>
      </Seccion>

      <Seccion numero="07" titulo="Tus derechos: eliminar tu cuenta y tus datos">
        <Parrafo>
          Eres el dueño de tus datos y puedes irte cuando quieras, llevándotelo todo contigo.
          Para <strong className="text-[#f0eefa]">eliminar tu cuenta y borrar tus datos de forma
          permanente</strong> de nuestra base de datos puedes:
        </Parrafo>
        <Lista
          items={[
            "Ir a Configuración dentro de tu panel y usar la opción de eliminar cuenta, o",
            "Escribirnos un correo solicitando la eliminación, y la procesaremos manualmente.",
          ]}
        />
        <Parrafo>
          Al eliminar tu cuenta se borran de forma permanente tu perfil, tus listas, tus grupos y
          cualquier otra información asociada. Este proceso es irreversible, así que si quieres
          conservar tus listas, puedes exportarlas primero desde Configuración.
        </Parrafo>
      </Seccion>

      <Seccion numero="08" titulo="Contacto">
        <Parrafo>
          Si tienes dudas sobre esta política, cómo tratamos tus datos o quieres ejercer cualquier
          derecho sobre ellos, escríbenos al correo de contacto del proyecto publicado en el
          repositorio oficial de ANILEZ.
        </Parrafo>
      </Seccion>
    </LegalLayout>
  );
}
