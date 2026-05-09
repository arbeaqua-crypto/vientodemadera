// ==================================================
// VIENTO DE MADERA — Configurador 3D
// Escena tipo salón con mueble paramétrico en el centro
// ==================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// -------- Tonos de madera y acabado --------
const COLORES_MADERA = {
    roble: { color: 0xc8a373, rough: 0.7 },
    nogal: { color: 0x6b4423, rough: 0.55 },
    pino:  { color: 0xa07a4f, rough: 0.75 }
};
const COLORES_ACERO = {
    'negro':         { color: 0x1a1a1a, rough: 0.55, metal: 0.8 },
    'negro-brillo':  { color: 0x0d0d0d, rough: 0.2,  metal: 0.95 },
    'oxido':         { color: 0x6b3a1c, rough: 0.85, metal: 0.55 }
};

// -------- Estado global --------
const state = {
    largoCm: 200,
    anchoCm: 90,
    altoCm: 75,
    madera: 'roble',
    acero: 'negro',
    tipo: 'mesa',
    grupoMueble: null
};

// -------- Setup escena --------
const container = document.getElementById('canvas3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1ea);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(2.8, 1.5, 3.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Environment para reflejos suaves
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// Controles orbit
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.5;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // No bajar bajo el suelo
controls.target.set(0, 0.7, 0);
controls.update();

// -------- Iluminación --------
const ambient = new THREE.HemisphereLight(0xfff4e8, 0xb0a59a, 0.45);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff0d9, 1.2);
sun.position.set(-3, 5, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -5;
sun.shadow.camera.right = 5;
sun.shadow.camera.top = 5;
sun.shadow.camera.bottom = -5;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 15;
sun.shadow.bias = -0.0008;
scene.add(sun);

// Luz cálida de relleno
const fill = new THREE.DirectionalLight(0xffe8c8, 0.3);
fill.position.set(3, 3, -2);
scene.add(fill);

// -------- Salón: suelo + paredes --------
function crearSalon() {
    const grupoSalon = new THREE.Group();

    // Suelo de tarima (color madera clara)
    const sueloTextura = generarTexturaTarima();
    const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.MeshStandardMaterial({
            map: sueloTextura,
            roughness: 0.7,
            metalness: 0.0
        })
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    grupoSalon.add(suelo);

    // Pared trasera
    const paredMat = new THREE.MeshStandardMaterial({
        color: 0xefe9df,
        roughness: 0.95,
        metalness: 0.0
    });
    const paredTrasera = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), paredMat);
    paredTrasera.position.set(0, 2.25, -4);
    paredTrasera.receiveShadow = true;
    grupoSalon.add(paredTrasera);

    // Pared izquierda
    const paredIzq = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), paredMat);
    paredIzq.position.set(-4, 2.25, 0);
    paredIzq.rotation.y = Math.PI / 2;
    paredIzq.receiveShadow = true;
    grupoSalon.add(paredIzq);

    // Plinto / rodapié
    const rodapieMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.6 });
    const rodapieTras = new THREE.Mesh(new THREE.BoxGeometry(12, 0.08, 0.015), rodapieMat);
    rodapieTras.position.set(0, 0.04, -3.99);
    grupoSalon.add(rodapieTras);
    const rodapieIzq = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.08, 12), rodapieMat);
    rodapieIzq.position.set(-3.99, 0.04, 0);
    grupoSalon.add(rodapieIzq);

    // "Cuadro" minimalista en pared trasera
    const cuadro = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.6, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7 })
    );
    cuadro.position.set(2.5, 2.2, -3.97);
    grupoSalon.add(cuadro);
    const cuadroFondo = new THREE.Mesh(
        new THREE.PlaneGeometry(1.05, 1.45),
        new THREE.MeshStandardMaterial({ color: 0xb38c5e, roughness: 0.6 })
    );
    cuadroFondo.position.set(2.5, 2.2, -3.95);
    grupoSalon.add(cuadroFondo);

    // "Lámpara de pie" minimal: cilindro vertical negro
    const palo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 1.7, 16),
        new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.5, metalness: 0.6 })
    );
    palo.position.set(-3, 0.85, -2.5);
    palo.castShadow = true;
    grupoSalon.add(palo);
    const baseLamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.2, 0.04, 24),
        new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.4, metalness: 0.7 })
    );
    baseLamp.position.set(-3, 0.02, -2.5);
    baseLamp.castShadow = true;
    grupoSalon.add(baseLamp);
    const pantalla = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.3, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xf3e6cf, roughness: 0.9, side: THREE.DoubleSide })
    );
    pantalla.position.set(-3, 1.85, -2.5);
    grupoSalon.add(pantalla);

    // Punto de luz cálido a la altura de la lámpara para realismo
    const lampLight = new THREE.PointLight(0xffd9a6, 0.4, 6, 2);
    lampLight.position.set(-3, 1.75, -2.5);
    grupoSalon.add(lampLight);

    // Alfombra suave bajo el mueble (rectangular, gris cálido)
    const alfombra = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x8a7e6f, roughness: 0.95 })
    );
    alfombra.rotation.x = -Math.PI / 2;
    alfombra.position.y = 0.005;
    alfombra.receiveShadow = true;
    grupoSalon.add(alfombra);

    // Borde más oscuro de la alfombra (efecto cenefa)
    const cenefa = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 1.7, 32, 1),
        new THREE.MeshStandardMaterial({ color: 0x5a4f43, roughness: 0.95, side: THREE.DoubleSide })
    );
    cenefa.rotation.x = -Math.PI / 2;
    cenefa.position.y = 0.008;
    cenefa.scale.set(1, 0.7, 1);
    grupoSalon.add(cenefa);

    // Planta minimalista en una esquina (maceta + tronco + hojas esféricas)
    const planta = new THREE.Group();
    const maceta = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.14, 0.32, 24),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 })
    );
    maceta.position.y = 0.16;
    maceta.castShadow = true;
    planta.add(maceta);
    const tronco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.03, 0.7, 12),
        new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.8 })
    );
    tronco.position.y = 0.32 + 0.35;
    planta.add(tronco);
    const matHoja = new THREE.MeshStandardMaterial({ color: 0x4a6240, roughness: 0.85 });
    [
        [0,    0.95, 0,    0.32],
        [0.18, 0.85, 0.05, 0.22],
        [-0.15,0.78, 0.10, 0.20],
        [0.05, 0.75, -0.18,0.24],
        [-0.05,1.05, -0.05,0.22]
    ].forEach(([x, y, z, r]) => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), matHoja);
        h.position.set(x, 0.32 + y, z);
        h.castShadow = true;
        planta.add(h);
    });
    planta.position.set(2.7, 0, -2.7);
    grupoSalon.add(planta);

    return grupoSalon;
}

// Genera una textura procedural de tarima con líneas verticales
function generarTexturaTarima() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base
    ctx.fillStyle = '#d4b78a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Tablas horizontales (varía tono y separación)
    const tablas = 8;
    const altoTabla = 1024 / tablas;
    for (let i = 0; i < tablas; i++) {
        const tono = 200 + Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${tono - 20},${tono - 50},${tono - 90})`;
        ctx.fillRect(0, i * altoTabla, 1024, altoTabla - 2);

        // Vetas
        ctx.strokeStyle = `rgba(80, 50, 20, 0.15)`;
        ctx.lineWidth = 1;
        for (let j = 0; j < 40; j++) {
            const y = i * altoTabla + Math.random() * altoTabla;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                256, y + (Math.random() - 0.5) * 8,
                768, y + (Math.random() - 0.5) * 8,
                1024, y + (Math.random() - 0.5) * 12
            );
            ctx.stroke();
        }

        // Separación entre tablas (línea oscura)
        ctx.fillStyle = 'rgba(40, 25, 10, 0.6)';
        ctx.fillRect(0, (i + 1) * altoTabla - 2, 1024, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

scene.add(crearSalon());

// -------- Mapa modelo → tipo de mueble --------
const TIPO_POR_MODELO = {
    'mesa-roble':         'mesa',
    'mesa-nogal':         'mesa',
    'mesa-pino':          'mesa',
    'estanteria-loft':    'estanteria-pie',
    'mueble-atelier':     'mueble-bajo',
    'estanteria-pared':   'estanteria-pared',
    'mesita-lumen':       'mesita-cajon',
    'mesa-centro-forge':  'mesa-centro',
    'mesa-centro-round':  'mesa-centro-redonda'
};

// -------- Helpers de materiales --------
function getMatMadera() {
    const m = COLORES_MADERA[state.madera] || COLORES_MADERA.roble;
    return new THREE.MeshStandardMaterial({ color: m.color, roughness: m.rough, metalness: 0.0 });
}
function getMatAcero() {
    const m = COLORES_ACERO[state.acero] || COLORES_ACERO.negro;
    return new THREE.MeshStandardMaterial({ color: m.color, roughness: m.rough, metalness: m.metal });
}
function meshSombras(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

// -------- Constructores por tipo --------
function construirMesa(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorTablero = 0.05;
    const seccionPata = 0.04;
    const retranqueo = 0.05;
    const alturaPata = H - grosorTablero;

    // Tablero
    const tab = meshSombras(new THREE.BoxGeometry(L, grosorTablero, A), matMad);
    tab.position.y = H - grosorTablero / 2;
    grupo.add(tab);

    // 4 patas en esquinas
    const pataGeo = new THREE.BoxGeometry(seccionPata, alturaPata, seccionPata);
    [
        [ L/2 - retranqueo - seccionPata/2,  alturaPata/2,  A/2 - retranqueo - seccionPata/2],
        [-L/2 + retranqueo + seccionPata/2,  alturaPata/2,  A/2 - retranqueo - seccionPata/2],
        [ L/2 - retranqueo - seccionPata/2,  alturaPata/2, -A/2 + retranqueo + seccionPata/2],
        [-L/2 + retranqueo + seccionPata/2,  alturaPata/2, -A/2 + retranqueo + seccionPata/2]
    ].forEach(([x, y, z]) => {
        const p = meshSombras(pataGeo, matAce);
        p.position.set(x, y, z);
        grupo.add(p);
    });

    // Tirantes inferiores paralelos al largo
    if (L > 0.7 && A > 0.4) {
        const tg = new THREE.BoxGeometry(L - 2 * (retranqueo + seccionPata), 0.02, 0.02);
        const t1 = meshSombras(tg, matAce);
        t1.position.set(0, 0.08, A/2 - retranqueo - seccionPata/2);
        grupo.add(t1);
        const t2 = meshSombras(tg, matAce);
        t2.position.set(0, 0.08, -A/2 + retranqueo + seccionPata/2);
        grupo.add(t2);
    }
    return grupo;
}

function construirEstanteriaPie(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorBalda = 0.04;
    const seccionMontante = 0.03;

    // 4 montantes verticales (esquinas)
    const montGeo = new THREE.BoxGeometry(seccionMontante, H, seccionMontante);
    [
        [ L/2 - seccionMontante/2,  H/2,  A/2 - seccionMontante/2],
        [-L/2 + seccionMontante/2,  H/2,  A/2 - seccionMontante/2],
        [ L/2 - seccionMontante/2,  H/2, -A/2 + seccionMontante/2],
        [-L/2 + seccionMontante/2,  H/2, -A/2 + seccionMontante/2]
    ].forEach(([x, y, z]) => {
        const m = meshSombras(montGeo, matAce);
        m.position.set(x, y, z);
        grupo.add(m);
    });

    // Baldas: 5 niveles distribuidos uniformemente
    const numBaldas = 5;
    const baldaGeo = new THREE.BoxGeometry(L - 0.02, grosorBalda, A - 0.02);
    for (let i = 0; i < numBaldas; i++) {
        const t = i / (numBaldas - 1);
        const y = grosorBalda / 2 + t * (H - grosorBalda);
        const b = meshSombras(baldaGeo, matMad);
        b.position.y = y;
        grupo.add(b);
    }
    return grupo;
}

function construirMuebleBajo(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorBalda = 0.04;
    const seccionMontante = 0.03;

    // 4 montantes
    const montGeo = new THREE.BoxGeometry(seccionMontante, H, seccionMontante);
    [
        [ L/2 - seccionMontante/2,  H/2,  A/2 - seccionMontante/2],
        [-L/2 + seccionMontante/2,  H/2,  A/2 - seccionMontante/2],
        [ L/2 - seccionMontante/2,  H/2, -A/2 + seccionMontante/2],
        [-L/2 + seccionMontante/2,  H/2, -A/2 + seccionMontante/2]
    ].forEach(([x, y, z]) => {
        const m = meshSombras(montGeo, matAce);
        m.position.set(x, y, z);
        grupo.add(m);
    });

    // 3 baldas (suelo + media + tapa)
    const baldaGeo = new THREE.BoxGeometry(L - 0.02, grosorBalda, A - 0.02);
    [grosorBalda/2, H/2, H - grosorBalda/2].forEach(y => {
        const b = meshSombras(baldaGeo, matMad);
        b.position.y = y;
        grupo.add(b);
    });

    // Pletina decorativa inferior frontal
    const plet = meshSombras(new THREE.BoxGeometry(L - 0.02, 0.03, 0.006), matAce);
    plet.position.set(0, 0.05, A/2);
    grupo.add(plet);
    return grupo;
}

function construirEstanteriaPared(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorBalda = 0.04;

    // 3 baldas suspendidas, separación uniforme. H aquí marca alto total (incluye separaciones)
    const numBaldas = 3;
    const sep = H / (numBaldas);
    const baldaGeo = new THREE.BoxGeometry(L, grosorBalda, A);
    for (let i = 0; i < numBaldas; i++) {
        const y = sep / 2 + i * sep;
        const b = meshSombras(baldaGeo, matMad);
        b.position.y = y;
        grupo.add(b);

        // Escuadras (2 por balda, en los extremos hacia atrás)
        const escGeoH = new THREE.BoxGeometry(0.012, 0.04, A * 0.7);
        const escGeoV = new THREE.BoxGeometry(0.012, 0.18, 0.04);
        const offsets = [-(L/2) + 0.15, (L/2) - 0.15];
        offsets.forEach(x => {
            const eh = meshSombras(escGeoH, matAce);
            eh.position.set(x, y - grosorBalda/2 - 0.02, -0.05);
            grupo.add(eh);
            const ev = meshSombras(escGeoV, matAce);
            ev.position.set(x, y - grosorBalda/2 - 0.11, -A/2 + 0.02);
            grupo.add(ev);
        });
    }
    return grupo;
}

function construirMesitaCajon(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorTablero = 0.04;

    // Tablero superior
    const tab = meshSombras(new THREE.BoxGeometry(L, grosorTablero, A), matMad);
    tab.position.y = H - grosorTablero / 2;
    grupo.add(tab);

    // Cajón central (frente y laterales en madera)
    const cajonAlto = 0.13;
    const cajonY = H - grosorTablero - cajonAlto/2 - 0.01;
    const cajon = meshSombras(new THREE.BoxGeometry(L - 0.06, cajonAlto, A - 0.06), matMad);
    cajon.position.y = cajonY;
    grupo.add(cajon);

    // Tirador
    const tir = meshSombras(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12), matAce);
    tir.rotation.z = Math.PI / 2;
    tir.position.set(0, cajonY, A/2 - 0.025);
    grupo.add(tir);

    // 4 patas tubulares finas
    const seccionPata = 0.025;
    const alturaPata = H - grosorTablero;
    const pataGeo = new THREE.BoxGeometry(seccionPata, alturaPata, seccionPata);
    [
        [ L/2 - seccionPata/2,  alturaPata/2,  A/2 - seccionPata/2],
        [-L/2 + seccionPata/2,  alturaPata/2,  A/2 - seccionPata/2],
        [ L/2 - seccionPata/2,  alturaPata/2, -A/2 + seccionPata/2],
        [-L/2 + seccionPata/2,  alturaPata/2, -A/2 + seccionPata/2]
    ].forEach(([x, y, z]) => {
        const p = meshSombras(pataGeo, matAce);
        p.position.set(x, y, z);
        grupo.add(p);
    });
    return grupo;
}

function construirMesaCentro(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorTablero = 0.05;

    // Tablero
    const tab = meshSombras(new THREE.BoxGeometry(L, grosorTablero, A), matMad);
    tab.position.y = H - grosorTablero / 2;
    grupo.add(tab);

    // Patas en U: 2 a izquierda y 2 a derecha unidas por una pletina horizontal abajo y subida vertical
    const grosorPletina = 0.008;
    const anchoPletina = 0.08;
    const alturaPata = H - grosorTablero;

    // Pletina vertical izquierda (lateral)
    const lateralIzq = meshSombras(new THREE.BoxGeometry(grosorPletina, alturaPata, anchoPletina), matAce);
    lateralIzq.position.set(-L/2 + 0.05, alturaPata/2, 0);
    grupo.add(lateralIzq);
    const lateralDer = meshSombras(new THREE.BoxGeometry(grosorPletina, alturaPata, anchoPletina), matAce);
    lateralDer.position.set(L/2 - 0.05, alturaPata/2, 0);
    grupo.add(lateralDer);

    // Pies horizontales (apoyo en el suelo) en cada lateral
    [(-L/2 + 0.05), (L/2 - 0.05)].forEach(x => {
        const pie = meshSombras(new THREE.BoxGeometry(0.18, 0.015, anchoPletina), matAce);
        pie.position.set(x, 0.0075, 0);
        grupo.add(pie);
    });
    return grupo;
}

function construirMesaCentroRedonda(L, A, H, matMad, matAce) {
    const grupo = new THREE.Group();
    const grosorTablero = 0.04;
    const radio = Math.max(L, A) / 2; // tomamos el mayor como diámetro

    // Tablero circular
    const tab = meshSombras(new THREE.CylinderGeometry(radio, radio, grosorTablero, 64), matMad);
    tab.position.y = H - grosorTablero / 2;
    grupo.add(tab);

    // Trípode central: 3 patas inclinadas desde un nodo central
    const alturaPata = H - grosorTablero;
    const longPata = Math.sqrt(alturaPata * alturaPata + (radio * 0.55) * (radio * 0.55));
    const pataGeo = new THREE.CylinderGeometry(0.018, 0.018, longPata, 16);
    for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        const px = Math.cos(ang) * radio * 0.55;
        const pz = Math.sin(ang) * radio * 0.55;

        const p = meshSombras(pataGeo, matAce);
        p.position.set(px / 2, alturaPata / 2, pz / 2);
        // Alinear el cilindro desde el centro superior (0, alturaPata, 0) al pie (px, 0, pz)
        const dir = new THREE.Vector3(px, -alturaPata, pz).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().multiplyScalar(-1));
        p.quaternion.copy(quat);
        // recalcular posición para que el extremo superior quede en el centro de la mesa
        p.position.set(px / 2, alturaPata / 2, pz / 2);
        grupo.add(p);
    }

    // Nodo central de unión bajo el tablero
    const nodo = meshSombras(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16), matAce);
    nodo.position.y = alturaPata - 0.02;
    grupo.add(nodo);
    return grupo;
}

const BUILDERS = {
    'mesa':                   construirMesa,
    'estanteria-pie':         construirEstanteriaPie,
    'mueble-bajo':            construirMuebleBajo,
    'estanteria-pared':       construirEstanteriaPared,
    'mesita-cajon':           construirMesitaCajon,
    'mesa-centro':            construirMesaCentro,
    'mesa-centro-redonda':    construirMesaCentroRedonda
};

// -------- Reconstruir mueble --------
function construirMueble() {
    if (state.grupoMueble) {
        scene.remove(state.grupoMueble);
        state.grupoMueble.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }

    const L = state.largoCm / 100;
    const A = state.anchoCm / 100;
    const H = state.altoCm  / 100;

    const matMad = getMatMadera();
    const matAce = getMatAcero();

    const tipo = state.tipo || 'mesa';
    const builder = BUILDERS[tipo] || BUILDERS['mesa'];
    const grupo = builder(L, A, H, matMad, matAce);

    // Caso especial estantería de pared: la subimos a la altura de pared (1m)
    if (tipo === 'estanteria-pared') {
        grupo.position.y = 1.0;
    }

    state.grupoMueble = grupo;
    scene.add(grupo);

    // Ajustar target de cámara según altura del mueble
    const yTarget = (tipo === 'estanteria-pared') ? 1.4 : H * 0.55;
    controls.target.set(0, yTarget, 0);
    controls.update();
}

construirMueble();

// -------- Resize responsive --------
function resizeRenderer() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Observador para el caso del panel desplegándose
const ro = new ResizeObserver(resizeRenderer);
ro.observe(container);

// -------- Loop --------
function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// -------- Escuchar inputs --------
function leerInputs() {
    state.largoCm = parseInt(document.getElementById('medLargo').value) || state.largoCm;
    state.anchoCm = parseInt(document.getElementById('medAncho').value) || state.anchoCm;
    state.altoCm  = parseInt(document.getElementById('medAlto').value)  || state.altoCm;
    state.madera  = document.getElementById('selMadera').value || state.madera;
    state.acero   = document.getElementById('selAcero').value || state.acero;
    construirMueble();
}

['medLargo', 'medAncho', 'medAlto', 'selMadera', 'selAcero'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', leerInputs);
});

// Inicializar con el modelo recibido por URL si existe
if (window.__MODELO_INICIAL) {
    state.madera = window.__MODELO_INICIAL.madera || 'roble';
    state.tipo = TIPO_POR_MODELO[window.__MODELO_INICIAL.id] || 'mesa';
    leerInputs();
}
