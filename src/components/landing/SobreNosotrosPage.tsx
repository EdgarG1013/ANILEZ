import LegalLayout, {
  Seccion,
  Parrafo,
} from "../../components/compartido/LegalLayout";

// ─── Página "Sobre Nosotros" de ANILEZ ───────────────────────────────────────

export default function SobreNosotrosPage() {
  return (
    <LegalLayout
      etiqueta="Sobre el proyecto"
      titulo={
        <>
          Sobre <span className="text-[#946ed9]">Nosotros</span>
        </>
      }
      intro="Un proyecto personal, hecho con paciencia (y mucho café), para rastrear, organizar y descubrir anime y manga sin sentirse perdido entre pestañas y menús infinitos."
      ultimaActualizacion="18 de septiembre de 2026"
    >
      <Seccion numero="01" titulo="¿Qué es ANILEZ?">
        <Parrafo>
            ANILEZ es un proyecto personal desarrollado y mantenido actualmente
            por una única persona: <a href="https://github.com/EdgarG1013" target="_blank" rel="noopener noreferrer">
              <strong className="text-[#f0eefa]">EdgarG1013</strong>
            </a>
            , un programador colombiano que decidió construir la plataforma que le
            habría gustado usar. No hay empresa detrás, ni inversores, ni un
            equipo de producto; hay alguien programando en su tiempo libre porque
            de verdad le importa el resultado.
          </Parrafo>
        <Parrafo>
          El propósito es crear una página web moderna enfocada en la
          organización y administración personal de anime y manga, diseñada
          para ofrecer una experiencia{" "}
          <strong className="text-[#f0eefa]">
            moderna, intuitiva y altamente personalizable
          </strong>{" "}
          frente a alternativas tradicionales como MyAnimeList.
        </Parrafo>
      </Seccion>

      <Seccion numero="02" titulo="De dónde nace la idea">
        <Parrafo>
          Las plataformas existentes son muy completas —quizá demasiado—. Sus
          interfaces presentan una gran cantidad de información a la vez, una
          navegación compleja y muy pocas opciones para organizar el contenido
          según las preferencias de cada usuario. Funcionan, pero a costa de
          sentirse laberintos.
        </Parrafo>
        <Parrafo>
          Ese problema, vivido en primera persona, impulsó la creación de una
          alternativa que permitiera{" "}
          <strong className="text-[#f0eefa]">
            crear y organizar listas y grupos de listas
          </strong>{" "}
          exactamente como uno lo desea: a tu manera, sin recovecos ni
          elementos que nunca pediste estar ahí.
        </Parrafo>
      </Seccion>

      <Seccion numero="03" titulo="La preservación de tus listas">
        <Parrafo>
          El segundo gran motivo del proyecto es la conservación de la
          información. Hoy dejamos el seguimiento y la organización de nuestras
          listas en páginas web con servidores en la nube; sin embargo, la gran
          mayoría de las páginas de anime las mantienen grupos pequeños que
          dependen del apoyo de personas interesadas y de la publicidad dentro
          del sitio. Eso significa que{" "}
          <strong className="text-[#f0eefa]">
            en cualquier momento estas páginas pueden cerrar
          </strong>{" "}
          — y con ellas, años de historial y esfuerzo.
        </Parrafo>
        <Parrafo>
          Aunque ANILEZ, siendo honestos, no es la excepción a ese problema en
          este preciso momento, la idea es llevar el proyecto a móvil y construir una solución que
          permita guardar todo de forma local, para que tengas{" "}
          <strong className="text-[#f0eefa]">
            copias de tus listas en todo momento
          </strong>
          , sin importar lo que le pase al sitio.
        </Parrafo>
      </Seccion>

      <Seccion numero="04" titulo="¿De dónde salen los datos?">
        <Parrafo>
          Toda la información de anime y manga que ves en la plataforma es
          provista dinámicamente por la{" "}
          <a href="https://tenrai.org" target="_blank" rel="noopener noreferrer">
            <strong className="text-[#f0eefa]">API de Tenrai</strong>
          </a>
          , que a su
          vez se alimenta de los datos de{" "}
          <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer">
            <strong className="text-[#f0eefa]">MyAnimeList.net</strong>
          </a>
          . Esto nos
          permite mostrar catálogos amplios, actualizados y sin necesidad de
          duplicar el esfuerzo de bases de datos enormes.
        </Parrafo>
        <Parrafo>
          Las carátulas, títulos y sinopsis pertenecen a sus respectivos
          autores, estudios y licenciantes; ANILEZ solo se encarga de
          presentarlos de una forma más agradable de navegar.
        </Parrafo>
      </Seccion>

      <Seccion numero="05" titulo="Estado del proyecto">
        <Parrafo>
          <strong className="text-[#f0eefa]">
            Actualmente la página se encuentra en desarrollo activo.
          </strong>{" "}
          Eso significa que verás cambios con frecuencia, funciones que
          aparecen y otras que se ajustan, y algún que otro detalle pulido
          sobre la marcha.
        </Parrafo>
        <Parrafo>
          Pero hay algo que ya puedes hacer desde hoy mismo:{" "}
          <strong className="text-[#f0eefa]">
            crear copias de seguridad de tu información
          </strong>
          , disponibles para exportar e importar en los formatos JSON y TXT
          desde la sección de Configuración de tu cuenta. Tus listas, tuyas.
        </Parrafo>
      </Seccion>

      <Seccion numero="06" titulo="¿Quieres echar una mano?">
        <Parrafo>
          Si te gusta el proyecto, la mejor forma de apoyarlo es usarlo,
          contárnoslo y mantener una copia de tus listas. Y si eres de los que
          les gusta mirar debajo del capó, el código fuente es de código
          abierto — puedes encontrarlo junto a la información de contacto en el
          repositorio oficial de ANILEZ.
        </Parrafo>
        <Parrafo>
          Gracias por llegar hasta aquí.
        </Parrafo>
      </Seccion>
    </LegalLayout>
  );
}
