/*
 * Un día a la vez — lógica del juego.
 * JavaScript puro, sin dependencias: se abre con doble clic o con Live Server.
 *
 * Privacidad: las cartas y el diario NUNCA salen del dispositivo.
 * Si la persona activa "compartir progreso", solo se envían números
 * (día, estado de ánimo, barras, herramientas usadas).
 */
(function () {
  'use strict';

  var CFG = window.UDALV_CONFIG || {};
  var HIST = window.UDALV_STORY;
  var PREFIJO = 'udalv:';

  var STATS = [
    { id: 'calma', nombre: 'Calma' },
    { id: 'animo', nombre: 'Ánimo' },
    { id: 'conexion', nombre: 'Conexión' }
  ];
  var ETIQUETAS_ANIMO = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'];
  var NOMBRES_HERRAMIENTA = {
    respirar: 'Respiración',
    anclar: 'Anclaje 5-4-3-2-1',
    carta: 'Carta al yo del futuro',
    diario: 'Diario'
  };

  /* ---------------------------------------------------------------
   * Almacenamiento local (con respaldo en memoria si el navegador
   * no permite localStorage).
   * ------------------------------------------------------------- */
  var memoria = {};

  function leer(clave, defecto) {
    try {
      var v = window.localStorage.getItem(PREFIJO + clave);
      if (v !== null) return JSON.parse(v);
    } catch (e) { /* se usa la memoria */ }
    return Object.prototype.hasOwnProperty.call(memoria, clave) ? memoria[clave] : defecto;
  }

  function guardar(clave, valor) {
    memoria[clave] = valor;
    try { window.localStorage.setItem(PREFIJO + clave, JSON.stringify(valor)); } catch (e) { /* ignorar */ }
  }

  function borrarTodo() {
    memoria = {};
    try {
      Object.keys(window.localStorage).forEach(function (k) {
        if (k.indexOf(PREFIJO) === 0) window.localStorage.removeItem(k);
      });
    } catch (e) { /* ignorar */ }
  }

  /* ---------------------------------------------------------------
   * Utilidades
   * ------------------------------------------------------------- */
  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'texto') n.textContent = attrs[k];
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
        else n.setAttribute(k, attrs[k]);
      });
    }
    (hijos || []).forEach(function (h) {
      if (h === null || h === undefined) return;
      n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h);
    });
    return n;
  }

  function fechaLarga(iso) {
    try {
      return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return String(iso); }
  }

  function leerUsuario() {
    try {
      var u = new URLSearchParams(window.location.search).get('usuario') || '';
      return u.slice(0, 100);
    } catch (e) { return ''; }
  }

  var usuarioId = leerUsuario();

  /* ---------------------------------------------------------------
   * Conexión opcional con Power Apps / Power Automate
   * ------------------------------------------------------------- */
  function conexionConfigurada() {
    return !!(CFG.FLOW_URL || CFG.PARENT_ORIGIN);
  }

  function compartirActivo() {
    return !!leer('compartir', !!CFG.COMPARTIR_POR_DEFECTO);
  }

  function enviarEvento(evento, datos) {
    if (!conexionConfigurada() || !compartirActivo()) return;

    var payload = { juego: 'un-dia-a-la-vez', usuario: usuarioId, evento: evento, fecha: new Date().toISOString() };
    Object.keys(datos || {}).forEach(function (k) { payload[k] = datos[k]; });

    if (CFG.FLOW_URL) {
      try {
        // text/plain + no-cors evita la petición previa (preflight) que los flujos no responden.
        window.fetch(CFG.FLOW_URL, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(payload)
        }).catch(function () { /* sin conexión: no pasa nada */ });
      } catch (e) { /* ignorar */ }
    }

    if (CFG.PARENT_ORIGIN && window.parent && window.parent !== window) {
      try { window.parent.postMessage({ tipo: 'undiaalavez', payload: payload }, CFG.PARENT_ORIGIN); } catch (e) { /* ignorar */ }
    }
  }

  function registrarHerramienta(nombre) {
    enviarEvento('herramienta_usada', { herramienta: nombre });
  }

  /* ---------------------------------------------------------------
   * Estado del juego
   * ------------------------------------------------------------- */
  function estadoNuevo() {
    return { fase: 'intro', dia: 0, escena: 0, calma: 50, animo: 50, conexion: 50, estados: [] };
  }

  function cargarEstado() {
    var e = leer('estado', null);
    var valido = e && typeof e === 'object' &&
      typeof e.dia === 'number' && typeof e.escena === 'number' &&
      HIST.dias[e.dia] && HIST.dias[e.dia].escenas[e.escena] &&
      STATS.every(function (s) { return typeof e[s.id] === 'number'; });
    if (!valido) return estadoNuevo();
    if (!Array.isArray(e.estados)) e.estados = [];
    return e;
  }

  var estado = cargarEstado();
  var vista = 'intro';
  var ultimaOpcion = null;

  function aplicar(efectos) {
    STATS.forEach(function (s) {
      var d = (efectos && efectos[s.id]) || 0;
      estado[s.id] = Math.max(5, Math.min(100, estado[s.id] + d));
    });
    pintarStats();
  }

  function datosNumericos() {
    return { calma: estado.calma, animo: estado.animo, conexion: estado.conexion };
  }

  /* ---------------------------------------------------------------
   * Panel de estado
   * ------------------------------------------------------------- */
  function iniciarPanel() {
    var p = $('panel-estado');
    p.textContent = '';
    STATS.forEach(function (s) {
      var relleno = el('div', { class: 'barra-relleno', id: 'rel-' + s.id });
      var fondo = el('div', {
        class: 'barra-fondo', id: 'bar-' + s.id, role: 'progressbar',
        'aria-label': s.nombre, 'aria-valuemin': '0', 'aria-valuemax': '100'
      }, [relleno]);
      p.appendChild(el('div', { class: 'stat' }, [el('span', { class: 'stat-nombre', texto: s.nombre }), fondo]));
    });
    pintarStats();
  }

  function pintarStats() {
    STATS.forEach(function (s) {
      var rel = $('rel-' + s.id);
      var bar = $('bar-' + s.id);
      if (!rel || !bar) return;
      rel.style.width = estado[s.id] + '%';
      bar.setAttribute('aria-valuenow', String(estado[s.id]));
    });
  }

  /* ---------------------------------------------------------------
   * Ventanas (ayuda y herramientas)
   * ------------------------------------------------------------- */
  var modalActual = null;

  function abrirModal(titulo, contenido, alCerrar) {
    if (modalActual) cerrarModal();

    var previo = document.activeElement;
    var btnCerrar = el('button', { type: 'button', class: 'btn-cerrar', texto: 'Cerrar' });
    var h = el('h2', { id: 'modal-titulo', texto: titulo, tabindex: '-1' });
    var caja = el('div', {
      class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-titulo'
    }, [el('div', { class: 'modal-cab' }, [h, btnCerrar]), contenido.nodo]);
    var fondo = el('div', { class: 'fondo' }, [caja]);

    function tecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); cerrarModal(); return; }
      if (e.key !== 'Tab') return;
      var f = caja.querySelectorAll('button, [href], input, textarea, select, summary');
      if (!f.length) return;
      var primero = f[0];
      var ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }

    btnCerrar.addEventListener('click', cerrarModal);
    document.addEventListener('keydown', tecla);
    document.body.appendChild(fondo);
    document.body.classList.add('con-modal');
    modalActual = { fondo: fondo, previo: previo, alCerrar: alCerrar, tecla: tecla, limpiar: contenido.limpiar };
    h.focus();
  }

  function cerrarModal() {
    var m = modalActual;
    if (!m) return;
    modalActual = null;
    document.removeEventListener('keydown', m.tecla);
    if (m.limpiar) m.limpiar();
    if (m.fondo.parentNode) m.fondo.parentNode.removeChild(m.fondo);
    document.body.classList.remove('con-modal');
    if (m.previo && m.previo.focus) m.previo.focus();
    if (m.alCerrar) m.alCerrar();
  }

  function abrirHerramienta(nombre, alCerrar) {
    var fabrica = {
      respirar: herramientaRespirar,
      anclar: herramientaAnclar,
      carta: herramientaCarta,
      diario: herramientaDiario
    }[nombre];
    if (!fabrica) { if (alCerrar) alCerrar(); return; }
    abrirModal(NOMBRES_HERRAMIENTA[nombre], fabrica(), alCerrar);
  }

  /* ---------------------------------------------------------------
   * Herramienta 1: respiración guiada (inhala 4 · sostén 4 · exhala 6)
   * ------------------------------------------------------------- */
  function herramientaRespirar() {
    var fases = [
      { t: 'Inhala por la nariz', s: 4, clase: 'in' },
      { t: 'Sostén suavemente', s: 4, clase: 'hold' },
      { t: 'Exhala despacio', s: 6, clase: 'out' }
    ];
    var CICLOS = 4;
    var ciclo = 0;
    var f = 0;
    var resto = 0;
    var timer = null;

    var circulo = el('div', { class: 'aire', 'aria-hidden': 'true' });
    var fase = el('p', { class: 'aire-fase', 'aria-live': 'polite', texto: 'Cuando quieras, empieza.' });
    var cuenta = el('p', { class: 'aire-cuenta', 'aria-hidden': 'true' });
    var btn = el('button', { type: 'button', class: 'btn', texto: 'Empezar' });

    function pintarCuenta() { cuenta.textContent = String(resto); }

    function iniciarFase() {
      var x = fases[f];
      resto = x.s;
      circulo.className = 'aire ' + x.clase;
      circulo.style.transitionDuration = x.s + 's';
      fase.textContent = x.t;
      pintarCuenta();
    }

    function parar() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    function terminar() {
      parar();
      circulo.className = 'aire rest';
      circulo.style.transitionDuration = '1s';
      fase.textContent = 'Bien hecho. Nota cómo se siente tu cuerpo ahora.';
      cuenta.textContent = '';
      btn.textContent = 'Repetir';
      registrarHerramienta('respirar');
    }

    function tick() {
      resto--;
      if (resto > 0) { pintarCuenta(); return; }
      f++;
      if (f >= fases.length) {
        f = 0;
        ciclo++;
        if (ciclo >= CICLOS) { terminar(); return; }
      }
      iniciarFase();
    }

    btn.addEventListener('click', function () {
      if (timer) {
        parar();
        circulo.className = 'aire rest';
        fase.textContent = 'Pausa. Puedes volver cuando quieras.';
        cuenta.textContent = '';
        btn.textContent = 'Empezar';
        return;
      }
      ciclo = 0;
      f = 0;
      btn.textContent = 'Detener';
      iniciarFase();
      timer = window.setInterval(tick, 1000);
    });

    var nodo = el('div', { class: 'herramienta' }, [
      el('p', { class: 'texto-suave', texto: 'Cuatro respiraciones lentas. Sigue el círculo y no te preocupes por hacerlo perfecto.' }),
      circulo, fase, cuenta, btn
    ]);
    return { nodo: nodo, limpiar: parar };
  }

  /* ---------------------------------------------------------------
   * Herramienta 2: anclaje 5-4-3-2-1
   * ------------------------------------------------------------- */
  function herramientaAnclar() {
    var pasos = [
      { n: 5, t: 'Mira a tu alrededor y nombra 5 cosas que puedes ver.' },
      { n: 4, t: 'Encuentra 4 cosas que puedes tocar. Siente su textura o su temperatura.' },
      { n: 3, t: 'Escucha con atención y nombra 3 sonidos, cercanos o lejanos.' },
      { n: 2, t: 'Busca 2 olores que puedas notar, o recuerda 2 olores que te gusten.' },
      { n: 1, t: 'Nota 1 sabor en tu boca, o piensa en un sabor que te reconforte.' }
    ];
    var i = 0;
    var numero = el('p', { class: 'anclaje-num', 'aria-hidden': 'true' });
    var texto = el('p', { class: 'anclaje-txt', 'aria-live': 'polite' });
    var avance = el('p', { class: 'texto-suave' });
    var btn = el('button', { type: 'button', class: 'btn' });

    function pintar() {
      if (i < pasos.length) {
        numero.textContent = String(pasos[i].n);
        texto.textContent = pasos[i].t;
        avance.textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length + '. Tómate el tiempo que necesites.';
        btn.textContent = i < pasos.length - 1 ? 'Listo, siguiente' : 'Listo';
      } else {
        numero.textContent = '✓';
        texto.textContent = 'Estás aquí, en el presente. Si quieres, toma una respiración lenta más.';
        avance.textContent = '';
        btn.textContent = 'Repetir';
      }
    }

    btn.addEventListener('click', function () {
      if (i < pasos.length) {
        i++;
        if (i === pasos.length) registrarHerramienta('anclar');
      } else {
        i = 0;
      }
      pintar();
    });

    pintar();
    return {
      nodo: el('div', { class: 'herramienta' }, [
        el('p', { class: 'texto-suave', texto: 'Este ejercicio ayuda a volver al presente cuando las emociones o los pensamientos van muy rápido.' }),
        numero, texto, avance, btn
      ])
    };
  }

  /* ---------------------------------------------------------------
   * Herramienta 3: carta al yo del futuro (solo en este dispositivo)
   * ------------------------------------------------------------- */
  function herramientaCarta() {
    var cartas = leer('cartas', []);
    var etiqueta = el('label', { 'for': 'carta-txt', texto: 'Escribe unas líneas para quien serás dentro de un tiempo. ¿Qué te gustaría recordarle?' });
    var area = el('textarea', { id: 'carta-txt', rows: '6', maxlength: '3000', placeholder: 'Querido yo del futuro…' });
    var msg = el('p', { class: 'aviso', 'aria-live': 'polite' });
    var btn = el('button', { type: 'button', class: 'btn', texto: 'Guardar carta' });
    var previas = el('div', { class: 'lista' });

    function pintarLista() {
      previas.textContent = '';
      if (!cartas.length) return;
      previas.appendChild(el('h3', { texto: 'Tus cartas guardadas' }));
      cartas.slice().reverse().forEach(function (c) {
        previas.appendChild(el('details', { class: 'item' }, [
          el('summary', { texto: fechaLarga(c.fecha) }),
          el('p', { class: 'texto-libre', texto: c.texto })
        ]));
      });
    }

    btn.addEventListener('click', function () {
      var t = area.value.trim();
      if (!t) { msg.textContent = 'Escribe al menos unas palabras. Con una sola línea basta.'; return; }
      cartas.push({ fecha: new Date().toISOString(), texto: t });
      guardar('cartas', cartas);
      area.value = '';
      msg.textContent = 'Carta guardada en este dispositivo. Estará aquí cuando la necesites.';
      pintarLista();
      registrarHerramienta('carta');
    });

    pintarLista();
    return {
      nodo: el('div', { class: 'herramienta' }, [etiqueta, area, msg, btn, previas])
    };
  }

  /* ---------------------------------------------------------------
   * Herramienta 4: diario (solo en este dispositivo)
   * ------------------------------------------------------------- */
  function herramientaDiario() {
    var entradas = leer('diario', []);
    var valor = 0;
    var grupo = el('div', { class: 'estados', role: 'group', 'aria-label': '¿Cómo te sientes?' });
    var botones = [];

    ETIQUETAS_ANIMO.forEach(function (t, i) {
      var b = el('button', { type: 'button', class: 'estado-btn', 'aria-pressed': 'false', texto: t });
      b.addEventListener('click', function () {
        valor = i + 1;
        botones.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === i)); });
      });
      botones.push(b);
      grupo.appendChild(b);
    });

    var etiqueta = el('label', { 'for': 'diario-txt', texto: '¿Qué pasó hoy? ¿Qué sentiste? Escribe lo que quieras.' });
    var area = el('textarea', { id: 'diario-txt', rows: '5', maxlength: '3000', placeholder: 'Hoy me sentí…' });
    var msg = el('p', { class: 'aviso', 'aria-live': 'polite' });
    var btn = el('button', { type: 'button', class: 'btn', texto: 'Guardar' });
    var btnBorrar = el('button', { type: 'button', class: 'btn peligro', texto: 'Borrar mi diario' });
    var lista = el('div', { class: 'lista' });

    function pintarLista() {
      lista.textContent = '';
      btnBorrar.style.display = entradas.length ? '' : 'none';
      if (!entradas.length) return;
      lista.appendChild(el('h3', { texto: 'Tus últimas anotaciones' }));
      entradas.slice(-10).reverse().forEach(function (en) {
        var etiq = en.valor ? ' · ' + ETIQUETAS_ANIMO[en.valor - 1] : '';
        lista.appendChild(el('details', { class: 'item' }, [
          el('summary', { texto: fechaLarga(en.fecha) + etiq }),
          el('p', { class: 'texto-libre', texto: en.texto || '(sin texto)' })
        ]));
      });
    }

    btn.addEventListener('click', function () {
      var t = area.value.trim();
      if (!t && !valor) { msg.textContent = 'Elige cómo te sientes o escribe unas palabras.'; return; }
      entradas.push({ fecha: new Date().toISOString(), valor: valor, texto: t });
      guardar('diario', entradas);
      area.value = '';
      valor = 0;
      botones.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      msg.textContent = 'Guardado en este dispositivo.';
      pintarLista();
      registrarHerramienta('diario');
    });

    btnBorrar.addEventListener('click', function () {
      if (!window.confirm('¿Borrar todo tu diario de este dispositivo? No se puede deshacer.')) return;
      entradas = [];
      guardar('diario', entradas);
      msg.textContent = 'Diario borrado.';
      pintarLista();
    });

    pintarLista();
    return {
      nodo: el('div', { class: 'herramienta' }, [
        el('p', { class: 'texto-suave', texto: '¿Cómo te sientes ahora?' }),
        grupo, etiqueta, area, msg, btn, btnBorrar, lista
      ])
    };
  }

  /* ---------------------------------------------------------------
   * Ayuda y privacidad
   * ------------------------------------------------------------- */
  function abrirAyuda() {
    var recursos = Array.isArray(CFG.RECURSOS_AYUDA) ? CFG.RECURSOS_AYUDA : [];
    var nodos = [
      el('p', { texto: 'No tienes que cargar con esto en silencio. Hablar con alguien puede ayudar, aunque sea con una sola persona.' }),
      el('p', null, [el('strong', { texto: 'Si hay peligro inmediato para ti o para otra persona, llama ahora a emergencias.' })])
    ];

    if (recursos.length) {
      recursos.forEach(function (r) {
        var partes = [el('strong', { texto: r.nombre })];
        if (r.detalle) partes.push(el('p', { texto: r.detalle }));
        if (r.tel) partes.push(el('a', { href: 'tel:' + String(r.tel).replace(/[^0-9+]/g, ''), texto: 'Llamar al ' + r.tel }));
        nodos.push(el('div', { class: 'recurso' }, partes));
      });
    } else {
      nodos.push(el('p', { texto: 'Busca a una persona de confianza o a los servicios de emergencia de tu zona.' }));
    }

    nodos.push(el('p', { texto: 'Mientras tanto, puedes probar algo para calmar el cuerpo:' }));
    nodos.push(el('button', {
      type: 'button', class: 'btn',
      texto: 'Respirar ahora',
      onclick: function () { cerrarModal(); abrirHerramienta('respirar'); }
    }));
    nodos.push(el('button', {
      type: 'button', class: 'btn secundario',
      texto: 'Anclaje 5-4-3-2-1',
      onclick: function () { cerrarModal(); abrirHerramienta('anclar'); }
    }));

    abrirModal('Necesito ayuda', { nodo: el('div', null, nodos) });
  }

  function abrirPrivacidad() {
    var nodos = [
      el('p', { texto: 'Tu progreso, tus cartas y tu diario se guardan solo en este dispositivo, dentro de tu navegador.' })
    ];

    if (conexionConfigurada()) {
      var chk = el('input', { type: 'checkbox', id: 'chk-priv' });
      chk.checked = compartirActivo();
      chk.addEventListener('change', function () { guardar('compartir', chk.checked); });
      nodos.push(el('p', { texto: 'Si activas “compartir”, la aplicación recibe solo números: el día, cómo te sentiste, las barras de Sol y qué herramientas usaste. Nunca recibe lo que escribes en las cartas ni en el diario.' }));
      nodos.push(el('label', { class: 'compartir' }, [chk, el('span', { texto: 'Compartir mi progreso con la aplicación' })]));
    }

    nodos.push(el('button', {
      type: 'button', class: 'btn peligro',
      texto: 'Borrar todos mis datos de este dispositivo',
      onclick: function () {
        if (!window.confirm('Se borrarán tu progreso, tus cartas y tu diario de este dispositivo. No se puede deshacer. ¿Continuar?')) return;
        borrarTodo();
        estado = estadoNuevo();
        vista = 'intro';
        cerrarModal();
        render();
      }
    }));

    abrirModal('Privacidad y datos', { nodo: el('div', null, nodos) });
  }

  /* ---------------------------------------------------------------
   * Pantallas
   * ------------------------------------------------------------- */
  function mostrar(nodos) {
    var p = $('pantalla');
    p.textContent = '';
    nodos.forEach(function (n) { p.appendChild(n); });
    var h = p.querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    window.scrollTo(0, 0);
  }

  function render() {
    pintarStats();
    var vistas = {
      intro: vistaIntro,
      escena: vistaEscena,
      resultado: vistaResultado,
      cierre: vistaCierre,
      fin: vistaFin
    };
    vistas[vista]();
  }

  function vistaIntro() {
    var enCurso = estado.fase === 'escena' || estado.fase === 'cierre';
    var terminado = estado.fase === 'fin';

    var nodos = [
      el('h2', { texto: 'Acompaña a Sol durante cinco días' }),
      el('p', { texto: 'Sol está pasando por un momento difícil: una etapa de recuperación y tensiones en su familia. En cada escena eliges qué hacer. No hay respuestas “correctas”, no hay “game over” y siempre habrá otra oportunidad.' }),
      el('p', { texto: 'Mientras juegas puedes usar herramientas reales: respiración, anclaje, una carta a tu yo del futuro y un diario. Lo que escribes se queda solo en este dispositivo.' }),
      el('p', { class: 'nota', texto: 'Este juego acompaña, pero no reemplaza a un profesional de la salud ni a un grupo de apoyo. Si estás en un momento muy difícil, el botón “Necesito ayuda” siempre está arriba.' })
    ];

    if (conexionConfigurada()) {
      var chk = el('input', { type: 'checkbox', id: 'chk-compartir' });
      chk.checked = compartirActivo();
      chk.addEventListener('change', function () { guardar('compartir', chk.checked); });
      nodos.push(el('label', { class: 'compartir' }, [
        chk,
        el('span', { texto: 'Quiero compartir mi progreso con la aplicación (solo números, nunca lo que escribo).' })
      ]));
    }

    if (enCurso) {
      nodos.push(el('button', {
        type: 'button', class: 'btn', texto: 'Continuar donde lo dejé',
        onclick: function () { vista = estado.fase === 'cierre' ? 'cierre' : 'escena'; render(); }
      }));
      nodos.push(el('button', {
        type: 'button', class: 'btn secundario', texto: 'Empezar de nuevo',
        onclick: function () {
          if (!window.confirm('Se reiniciará tu progreso en el juego (tus cartas y tu diario se quedan). ¿Empezar de nuevo?')) return;
          empezar();
        }
      }));
    } else if (terminado) {
      nodos.push(el('button', {
        type: 'button', class: 'btn', texto: 'Jugar de nuevo',
        onclick: empezar
      }));
      nodos.push(el('button', {
        type: 'button', class: 'btn secundario', texto: 'Ver cómo terminó',
        onclick: function () { vista = 'fin'; render(); }
      }));
    } else {
      nodos.push(el('button', { type: 'button', class: 'btn', texto: 'Empezar', onclick: empezar }));
    }

    mostrar(nodos);
  }

  function empezar() {
    estado = estadoNuevo();
    estado.fase = 'escena';
    guardar('estado', estado);
    enviarEvento('juego_iniciado', {});
    vista = 'escena';
    render();
  }

  function vistaEscena() {
    var dia = HIST.dias[estado.dia];
    var esc = dia.escenas[estado.escena];

    var nodos = [
      el('p', { class: 'etiqueta', texto: 'Día ' + (estado.dia + 1) + ' de ' + HIST.dias.length + ' · ' + esc.momento }),
      el('h2', { texto: dia.titulo }),
      el('p', { class: 'narracion', texto: esc.texto })
    ];

    if (estado.calma < 40 || estado.animo < 40) {
      nodos.push(el('div', { class: 'banner-suave' }, [
        el('span', { texto: 'Parece un momento pesado. Antes de decidir, puedes hacer una pausa.' }),
        el('button', {
          type: 'button', class: 'btn secundario', texto: 'Respirar un momento',
          onclick: function () { abrirHerramienta('respirar'); }
        })
      ]));
    }

    var lista = el('div', { class: 'opciones', role: 'group', 'aria-label': '¿Qué hace Sol?' });
    esc.opciones.forEach(function (op, i) {
      var hijos = [op.texto];
      if (op.herramienta) hijos.push(el('span', { class: 'chip', texto: 'Herramienta: ' + NOMBRES_HERRAMIENTA[op.herramienta] }));
      lista.appendChild(el('button', {
        type: 'button', class: 'opcion',
        onclick: function () { elegir(i); }
      }, hijos));
    });
    nodos.push(lista);

    mostrar(nodos);
  }

  function elegir(i) {
    var esc = HIST.dias[estado.dia].escenas[estado.escena];
    var op = esc.opciones[i];
    ultimaOpcion = op;

    function seguir() {
      aplicar(op.efectos);
      vista = 'resultado';
      render();
    }

    if (op.herramienta) abrirHerramienta(op.herramienta, seguir);
    else seguir();
  }

  function vistaResultado() {
    mostrar([
      el('p', { class: 'etiqueta', texto: 'Día ' + (estado.dia + 1) + ' de ' + HIST.dias.length }),
      el('h2', { texto: 'Lo que pasó' }),
      el('p', { class: 'eleccion', texto: 'Elegiste: ' + ultimaOpcion.texto }),
      el('p', { class: 'narracion', texto: ultimaOpcion.resultado }),
      el('button', { type: 'button', class: 'btn', texto: 'Continuar', onclick: continuar })
    ]);
  }

  function continuar() {
    var dia = HIST.dias[estado.dia];
    if (estado.escena < dia.escenas.length - 1) {
      estado.escena++;
      estado.fase = 'escena';
      vista = 'escena';
    } else {
      estado.fase = 'cierre';
      vista = 'cierre';
    }
    guardar('estado', estado);
    render();
  }

  function vistaCierre() {
    var dia = HIST.dias[estado.dia];
    var grupo = el('div', { class: 'estados', role: 'group', 'aria-label': '¿Cómo te sientes tú ahora?' });
    ETIQUETAS_ANIMO.forEach(function (t, i) {
      grupo.appendChild(el('button', {
        type: 'button', class: 'estado-btn', texto: t,
        onclick: function () { cerrarDia(i + 1); }
      }));
    });

    mostrar([
      el('p', { class: 'etiqueta', texto: 'Día ' + (estado.dia + 1) + ' de ' + HIST.dias.length }),
      el('h2', { texto: 'Terminó el día: ' + dia.titulo }),
      el('p', { class: 'narracion', texto: 'Pasaste por un día entero con Sol. Eso cuenta, sea como sea que haya ido.' }),
      el('p', { texto: 'Y tú, ¿cómo te sientes ahora? Es opcional.' }),
      grupo,
      el('button', { type: 'button', class: 'btn secundario', texto: 'Omitir', onclick: function () { cerrarDia(0); } })
    ]);
  }

  function cerrarDia(valor) {
    var numeroDia = estado.dia + 1;
    if (valor) estado.estados.push({ dia: numeroDia, valor: valor });

    var datos = datosNumericos();
    datos.dia = numeroDia;
    datos.estado_animo = valor || null;
    enviarEvento('dia_completado', datos);

    if (estado.dia < HIST.dias.length - 1) {
      estado.dia++;
      estado.escena = 0;
      estado.fase = 'escena';
      vista = 'escena';
    } else {
      estado.fase = 'fin';
      vista = 'fin';
      enviarEvento('juego_terminado', datosNumericos());
    }
    guardar('estado', estado);
    render();
  }

  function vistaFin() {
    var mayor = STATS[0];
    STATS.forEach(function (s) { if (estado[s.id] > estado[mayor.id]) mayor = s; });

    var nodos = [
      el('p', { class: 'etiqueta', texto: 'Fin de la semana' }),
      el('h2', { texto: 'Gracias por acompañar a Sol' }),
      el('p', { class: 'narracion', texto: HIST.finales[mayor.id] }),
      el('p', { texto: HIST.finales.comun })
    ];

    if (estado.estados.length) {
      nodos.push(el('p', { class: 'texto-suave', texto: 'Cómo te sentiste tú en cada día:' }));
      nodos.push(el('ul', { class: 'recuento' }, estado.estados.map(function (e) {
        return el('li', { texto: 'Día ' + e.dia + ': ' + ETIQUETAS_ANIMO[e.valor - 1] });
      })));
    }

    nodos.push(el('p', { class: 'nota', texto: HIST.finales.recordatorio }));
    nodos.push(el('button', { type: 'button', class: 'btn', texto: 'Jugar de nuevo', onclick: empezar }));
    nodos.push(el('button', {
      type: 'button', class: 'btn secundario', texto: 'Ver mi diario',
      onclick: function () { abrirHerramienta('diario'); }
    }));

    mostrar(nodos);
  }

  /* ---------------------------------------------------------------
   * Arranque
   * ------------------------------------------------------------- */
  function iniciar() {
    $('btn-ayuda').addEventListener('click', abrirAyuda);
    $('btn-privacidad').addEventListener('click', abrirPrivacidad);
    Array.prototype.forEach.call(document.querySelectorAll('[data-herramienta]'), function (b) {
      b.addEventListener('click', function () { abrirHerramienta(b.getAttribute('data-herramienta')); });
    });
    iniciarPanel();
    render();
  }

  iniciar();
})();
