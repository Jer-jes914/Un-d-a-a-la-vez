/*
 * Historia de "Un día a la vez".
 * Para editar o ampliar el juego basta con cambiar este archivo.
 *
 * Cada opción tiene:
 *   texto       lo que se muestra en el botón
 *   efectos     cambios en calma / animo / conexion (números positivos o negativos)
 *   resultado   lo que ocurre después de elegir
 *   herramienta (opcional) "respirar" | "anclar" | "carta" | "diario"
 *
 * Reglas de la historia: no hay game over, no hay castigos y ninguna opción
 * se presenta como "incorrecta". Las opciones menos útiles se tratan con ternura.
 */
window.UDALV_STORY = {
  personaje: "Sol",
  dias: [
    {
      titulo: "Un amanecer pesado",
      escenas: [
        {
          momento: "Mañana",
          texto: "Sol se despierta antes de que suene la alarma. El cuerpo pesa y la cabeza ya va rápido. En el celular hay un mensaje de Dani, su hermano: “Mamá pregunta si vienes a almorzar el domingo”.",
          opciones: [
            {
              texto: "Abrir la ventana y tomar un vaso de agua",
              efectos: { calma: 8, animo: 5 },
              resultado: "El aire fresco no arregla todo, pero abre un poco de espacio. Fue un primer paso pequeño, y los pasos pequeños cuentan."
            },
            {
              texto: "Quedarse en la cama mirando el celular",
              efectos: { calma: -3, animo: -4 },
              resultado: "A veces el cuerpo necesita quedarse quieto, y está bien. El día seguirá ahí cuando Sol quiera empezarlo."
            },
            {
              texto: "Responder a Dani: “Gracias por avisar, lo pienso”",
              efectos: { conexion: 8, animo: 2 },
              resultado: "No dijo que sí ni que no. Dijo algo, y eso ya es comunicarse."
            }
          ]
        },
        {
          momento: "Noche",
          texto: "Cae la noche y la casa se queda en silencio. Sol siente la cabeza llena: la familia, lo que pasó, lo que viene.",
          opciones: [
            {
              texto: "Probar un ejercicio de respiración",
              herramienta: "respirar",
              efectos: { calma: 10, animo: 3 },
              resultado: "Respirar despacio le avisa al cuerpo que no hay peligro ahora mismo. No hace falta hacerlo perfecto."
            },
            {
              texto: "Escribir en el diario cómo fue el día",
              herramienta: "diario",
              efectos: { animo: 6, calma: 4 },
              resultado: "Poner los pensamientos en palabras les quita un poco de peso, aunque sean pocas líneas."
            },
            {
              texto: "Poner videos hasta que llegue el sueño",
              efectos: { calma: -2, animo: -2 },
              resultado: "El ruido ayuda a no pensar, pero a veces deja los pensamientos esperando hasta mañana. No pasa nada: mañana hay otra oportunidad."
            }
          ]
        }
      ]
    },
    {
      titulo: "Una ola en el camino",
      escenas: [
        {
          momento: "Tarde",
          texto: "Sol camina de vuelta a casa y pasa por una calle que le trae recuerdos de otra época. De pronto llega una urgencia fuerte, como una ola que sube de golpe.",
          opciones: [
            {
              texto: "Pararse, respirar y esperar a que la ola baje",
              herramienta: "respirar",
              efectos: { calma: 12, animo: 4 },
              resultado: "Las urgencias suben, llegan a un pico y bajan, como las olas. Sol no la hizo desaparecer: la acompañó hasta que pasó, y eso es enorme."
            },
            {
              texto: "Escribirle a alguien de confianza: “Estoy en un momento difícil”",
              efectos: { conexion: 12, calma: 5 },
              resultado: "Pedir compañía no es debilidad. Es una de las herramientas más fuertes que existen, y ahora hay alguien más en esto con Sol."
            },
            {
              texto: "Aguantar en silencio y seguir caminando rápido",
              efectos: { calma: -2, animo: 1, conexion: -2 },
              resultado: "Aguantar también es resistir, y cuenta. Pero Sol no tiene que cargar con todo en silencio: la próxima vez puede avisar a alguien."
            }
          ]
        },
        {
          momento: "Noche",
          texto: "Ya en casa, suena el teléfono. Es mamá. Su voz suena tensa: “Solo quiero saber si estás bien”. Sol siente culpa y enojo al mismo tiempo.",
          opciones: [
            {
              texto: "Contestar con calma: “Estoy intentándolo. Gracias por preocuparte”",
              efectos: { conexion: 10, animo: 4 },
              resultado: "No fue una conversación perfecta, y no tenía que serlo. Fue sincera."
            },
            {
              texto: "No contestar. Hoy no hay energía para esa conversación",
              efectos: { calma: 2, conexion: -4 },
              resultado: "Cuidar la propia energía es válido. Sol puede devolver la llamada cuando haya más calma."
            },
            {
              texto: "Contestar a la defensiva y terminar discutiendo",
              efectos: { calma: -8, animo: -6, conexion: -4 },
              resultado: "Las discusiones aparecen cuando hay cansancio y dolor de por medio. Reparar siempre es posible, y no empieza con ser perfecto: empieza con un “perdón, fue un mal momento”."
            }
          ]
        }
      ]
    },
    {
      titulo: "El peso de la culpa",
      escenas: [
        {
          momento: "Mañana",
          texto: "Buscando unos papeles, Sol encuentra una foto vieja de toda la familia. Todos sonríen. De golpe, la culpa por todo lo que pasó se siente enorme.",
          opciones: [
            {
              texto: "Hacer el ejercicio 5-4-3-2-1 para volver al presente",
              herramienta: "anclar",
              efectos: { calma: 10, animo: 3 },
              resultado: "La culpa vive en el pasado. Los sentidos viven en el ahora. Volver a ellos ayuda a que la emoción baje de volumen."
            },
            {
              texto: "Decirse cosas duras: “Todo es mi culpa”",
              efectos: { animo: -8, calma: -5 },
              resultado: "Esa voz suena fuerte, pero no cuenta toda la historia. Se puede asumir lo que pasó sin castigarse sin fin."
            },
            {
              texto: "Guardar la foto y contarle a alguien cómo se siente",
              efectos: { conexion: 8, animo: 5 },
              resultado: "Decir la culpa en voz alta la hace menos pesada. Y Sol descubre que la otra persona también tiene cosas que decir."
            }
          ]
        },
        {
          momento: "Noche",
          texto: "Un conocido de un grupo de apoyo le escribe: “Esta noche hay reunión. Sin presión, ven si quieres”.",
          opciones: [
            {
              texto: "Ir, aunque sea solo a escuchar",
              efectos: { conexion: 12, animo: 6 },
              resultado: "En esa sala nadie necesita explicar mucho. Sol escucha historias que suenan muy parecidas a la suya."
            },
            {
              texto: "Decir que hoy no, pero que quizás la próxima vez",
              efectos: { conexion: 2, calma: 2 },
              resultado: "Un “hoy no” sincero deja la puerta abierta. Eso también es avanzar."
            },
            {
              texto: "Inventar una excusa y salir del chat",
              efectos: { conexion: -6, animo: -3 },
              resultado: "Alejarse es una reacción humana cuando algo da miedo. La invitación sigue ahí, sin prisa."
            }
          ]
        }
      ]
    },
    {
      titulo: "Un mal día",
      escenas: [
        {
          momento: "Mañana",
          texto: "Hoy nada sale bien. Se derrama el café, Sol llega tarde y un comentario cualquiera le cae como una piedra. Todo se siente demasiado.",
          opciones: [
            {
              texto: "Parar un momento y respirar antes de seguir",
              herramienta: "respirar",
              efectos: { calma: 10, animo: 2 },
              resultado: "Una pausa no arregla el día, pero cambia la forma en que Sol lo atraviesa."
            },
            {
              texto: "Decir en voz alta: “Hoy es un día difícil, y está bien”",
              efectos: { animo: 8, calma: 4 },
              resultado: "Nombrar lo que pasa le quita poder. No hay que fingir que todo va bien."
            },
            {
              texto: "Pensar: “Lo hago todo mal, ¿para qué intentarlo?”",
              efectos: { animo: -8, calma: -4 },
              resultado: "Un mal día no es un mal camino. Una piedra en el sendero no borra el sendero entero."
            }
          ]
        },
        {
          momento: "Noche",
          texto: "Alguien toca la puerta. Es Dani, con una bolsa de comida: “Pasaba por aquí”. No pregunta nada.",
          opciones: [
            {
              texto: "Invitar a Dani a pasar y comer juntos",
              efectos: { conexion: 12, animo: 6 },
              resultado: "No hizo falta hablar de todo. A veces la compañía sencilla dice más que cualquier conversación."
            },
            {
              texto: "Agradecer, pero pedir estar a solas un rato",
              efectos: { calma: 4, conexion: 3 },
              resultado: "Decir lo que se necesita, con cariño, también construye confianza."
            },
            {
              texto: "Cerrar la puerta sin decir nada",
              efectos: { conexion: -5, animo: -2 },
              resultado: "A veces el cuerpo se cierra solo. Dani sabe que puede volver a intentarlo otro día, y Sol también."
            }
          ]
        }
      ]
    },
    {
      titulo: "Mirar hacia atrás",
      escenas: [
        {
          momento: "Mañana",
          texto: "Es el último día de esta semana. Hay sol afuera y un poco de calma por dentro. Sol piensa en todo lo que pasó desde el lunes.",
          opciones: [
            {
              texto: "Escribir una carta para su yo del futuro",
              herramienta: "carta",
              efectos: { animo: 10, calma: 3 },
              resultado: "Sol le habla con ternura a quien será dentro de un tiempo. Esa carta queda guardada para cuando haga falta."
            },
            {
              texto: "Anotar tres cosas que salieron bien, por pequeñas que sean",
              herramienta: "diario",
              efectos: { animo: 8, calma: 3 },
              resultado: "Cuesta verlas cuando todo pesa, pero estaban ahí: un vaso de agua, un mensaje, una pausa."
            },
            {
              texto: "Salir a caminar sin prisa",
              efectos: { calma: 8, animo: 4 },
              resultado: "Caminar sin destino ordena la cabeza. Cada paso es un recordatorio de que Sol sigue avanzando."
            }
          ]
        },
        {
          momento: "Tarde",
          texto: "Dani escribe otra vez: “El domingo hay almuerzo. Sin presión. Hay lugar para ti”.",
          opciones: [
            {
              texto: "Decir que sí, con calma",
              efectos: { conexion: 10, animo: 5 },
              resultado: "Un sí dado sin miedo pesa distinto. Sol sabe que puede irse cuando lo necesite, y eso también está bien."
            },
            {
              texto: "Decir que aún no sabe, pero que gracias por la invitación",
              efectos: { conexion: 4, calma: 2 },
              resultado: "No tener la respuesta todavía es una respuesta honesta."
            },
            {
              texto: "Decir que esta vez no",
              efectos: { conexion: 1, calma: 3 },
              resultado: "Un no honesto también construye confianza. Dani lo va a entender."
            }
          ]
        }
      ]
    }
  ],

  finales: {
    calma: "Esta semana Sol aprendió a bajar la intensidad de los momentos difíciles: respirar, hacer una pausa, volver al presente. No siempre funciona a la primera, pero con cada intento se vuelve más fácil.",
    animo: "Esta semana Sol se habló con más ternura y encontró cosas buenas, incluso en los días duros. Esa voz amable también se entrena.",
    conexion: "Esta semana Sol se acercó a otras personas: Dani, mamá, el grupo. Descubrió que no tiene que hacer este camino en soledad.",
    comun: "No hay un puntaje correcto ni una forma perfecta de hacerlo. Hubo días buenos y días duros, y Sol siguió. Eso es lo que importa.",
    recordatorio: "Todo lo que usaste aquí existe en la vida real: respirar, volver al presente, escribir lo que sientes y pedir ayuda. Y si hoy lo necesitas, el botón “Necesito ayuda” siempre está arriba."
  }
};
