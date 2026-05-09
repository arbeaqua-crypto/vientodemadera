// ==================================================
// VIENTO DE MADERA — JS base
// ==================================================

document.addEventListener('DOMContentLoaded', function () {

    // Año en el footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Prerrellenar formulario si llegamos del configurador 3D
    const qp = new URLSearchParams(window.location.search);
    if (qp.get('modelo')) {
        const modelo = qp.get('modelo') || '';
        const medidas = qp.get('medidas') || '';
        const madera = qp.get('madera') || '';
        const acabado = qp.get('acabado') || '';
        const tipoSel = document.querySelector('#contactForm select[name="tipo"]');
        if (tipoSel) {
            // Intento mapear el modelo a una categoría del select
            const m = modelo.toLowerCase();
            let opcion = '';
            if (m.includes('mesa de centro') || m.includes('mesita')) opcion = m.includes('mesita') ? 'Mesita de noche' : 'Mesa de centro';
            else if (m.includes('mesa')) opcion = 'Mesa de comedor';
            else if (m.includes('estanter') || m.includes('mueble')) opcion = 'Estantería / mueble de estantes';
            if (opcion) {
                Array.from(tipoSel.options).forEach(o => { if (o.text === opcion) o.selected = true; });
            }
        }
        const textarea = document.querySelector('#contactForm textarea[name="mensaje"]');
        if (textarea) {
            textarea.value =
                'Hola, vengo del configurador 3D y me interesa esta configuración:\n\n' +
                '· Modelo: ' + modelo + '\n' +
                '· Medidas: ' + medidas + '\n' +
                '· Madera: ' + madera + '\n' +
                '· Acabado: ' + acabado + '\n\n' +
                'Por favor, enviadme presupuesto y plazo. Gracias.';
        }
    }

    // Formulario de contacto (envío básico — pendiente de backend)
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const datos = Object.fromEntries(new FormData(form).entries());

            // Validación mínima
            if (!datos.nombre || datos.nombre.trim().length < 2) {
                alert('Por favor, indícanos tu nombre.');
                return;
            }
            if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
                alert('Por favor, indícanos un email válido.');
                return;
            }
            if (!datos.mensaje || datos.mensaje.trim().length < 10) {
                alert('Cuéntanos un poquito más sobre tu proyecto.');
                return;
            }

            // De momento, fallback a mailto hasta conectar con backend
            const cuerpo =
                'Nombre: ' + datos.nombre + '\n' +
                'Email: ' + datos.email + '\n' +
                'Teléfono: ' + (datos.telefono || '-') + '\n' +
                'Tipo de mueble: ' + (datos.tipo || '-') + '\n\n' +
                'Mensaje:\n' + datos.mensaje;
            const asunto = 'Consulta web — ' + (datos.tipo || 'Mueble a medida');
            window.location.href =
                'mailto:info@vientodemadera.com' +
                '?subject=' + encodeURIComponent(asunto) +
                '&body=' + encodeURIComponent(cuerpo);
        });
    }

    // Smooth scroll para anchors internos
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            const id = a.getAttribute('href');
            if (id.length > 1) {
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

});
