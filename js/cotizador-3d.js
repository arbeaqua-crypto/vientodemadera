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
    grupoMueble: null
};

// -------- Setup escena --------
const container = document.getElementById('canvas3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f1ea);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(3.5, 1.8, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
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

// -------- Mueble paramétrico (mesa con 4 patas) --------
function construirMueble() {
    if (state.grupoMueble) {
        scene.remove(state.grupoMueble);
        state.grupoMueble.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }

    const grupo = new THREE.Group();

    // Conversión cm → metros
    const L = state.largoCm / 100;
    const A = state.anchoCm / 100;
    const H = state.altoCm  / 100;

    // Material madera
    const matMad = COLORES_MADERA[state.madera] || COLORES_MADERA.roble;
    const matMadera = new THREE.MeshStandardMaterial({
        color: matMad.color,
        roughness: matMad.rough,
        metalness: 0.0
    });

    // Material acero
    const matAce = COLORES_ACERO[state.acero] || COLORES_ACERO.negro;
    const matAcero = new THREE.MeshStandardMaterial({
        color: matAce.color,
        roughness: matAce.rough,
        metalness: matAce.metal
    });

    // Tablero superior (madera maciza, ~5 cm de grosor)
    const grosorTablero = 0.05;
    const tablero = new THREE.Mesh(
        new THREE.BoxGeometry(L, grosorTablero, A),
        matMadera
    );
    tablero.position.y = H - grosorTablero / 2;
    tablero.castShadow = true;
    tablero.receiveShadow = true;
    grupo.add(tablero);

    // Patas — tubo cuadrado 4×4 cm en las esquinas, retranqueadas 5 cm
    const seccionPata = 0.04;
    const retranqueo = 0.05;
    const alturaPata = H - grosorTablero;
    const pataGeo = new THREE.BoxGeometry(seccionPata, alturaPata, seccionPata);

    const pos = [
        [ L/2 - retranqueo - seccionPata/2,  alturaPata/2,  A/2 - retranqueo - seccionPata/2],
        [-L/2 + retranqueo + seccionPata/2,  alturaPata/2,  A/2 - retranqueo - seccionPata/2],
        [ L/2 - retranqueo - seccionPata/2,  alturaPata/2, -A/2 + retranqueo + seccionPata/2],
        [-L/2 + retranqueo + seccionPata/2,  alturaPata/2, -A/2 + retranqueo + seccionPata/2]
    ];
    pos.forEach(([x, y, z]) => {
        const p = new THREE.Mesh(pataGeo, matAcero);
        p.position.set(x, y, z);
        p.castShadow = true;
        grupo.add(p);
    });

    // Tirante perimetral inferior (sólo si el mueble es ancho/largo)
    if (L > 0.7 && A > 0.4) {
        const alturaTirante = Math.max(0.02, alturaPata * 0.05);
        const grosorTirante = 0.02;
        const yTirante = 0.08; // a 8 cm del suelo

        // Tirantes paralelos al largo
        const tiranteLargoGeo = new THREE.BoxGeometry(L - 2 * (retranqueo + seccionPata), alturaTirante, grosorTirante);
        const tA = new THREE.Mesh(tiranteLargoGeo, matAcero);
        tA.position.set(0, yTirante, A/2 - retranqueo - seccionPata/2);
        tA.castShadow = true;
        grupo.add(tA);
        const tB = new THREE.Mesh(tiranteLargoGeo, matAcero);
        tB.position.set(0, yTirante, -A/2 + retranqueo + seccionPata/2);
        tB.castShadow = true;
        grupo.add(tB);
    }

    state.grupoMueble = grupo;
    scene.add(grupo);
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
    leerInputs();
}
