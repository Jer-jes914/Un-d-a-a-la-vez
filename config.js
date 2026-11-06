/*
 * Configuración de "Un día a la vez".
 * Aquí se ajusta todo lo que cambia entre una instalación y otra,
 * sin tocar la lógica del juego.
 */
window.UDALV_CONFIG = {
  // URL del flujo de Power Automate ("Cuando se recibe una solicitud HTTP").
  // Si queda vacía, el juego NO envía nada a ningún sitio.
  FLOW_URL: "",

  // Origen de la página que incrusta el juego (por ejemplo "https://tu-sitio.com").
  // Si se rellena, el juego avisa su progreso a esa página con postMessage.
  // Vacío = desactivado.
  PARENT_ORIGIN: "",

  // Estado inicial del interruptor "compartir mi progreso".
  // Déjalo en false: cada persona decide si comparte o no.
  COMPARTIR_POR_DEFECTO: false,

  // Recursos que se muestran en el botón "Necesito ayuda".
  // IMPORTANTE: verifica que estos números sigan vigentes antes de publicar
  // y agrega los de tu país, ciudad u organización.
  RECURSOS_AYUDA: [
    {
      nombre: "Emergencias",
      detalle: "Si hay peligro inmediato para ti o para otra persona.",
      tel: "911"
    },
    {
      nombre: "Línea 147 (Mides, Panamá)",
      detalle: "Apoyo emocional gratuito, las 24 horas. También por WhatsApp: 6694-2747.",
      tel: "147"
    }
  ]
};
