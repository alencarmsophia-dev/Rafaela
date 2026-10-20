/**
 * shader-bg.js — Fundo Animado Sutil em WebGL Puro (Sem Dependências)
 * Projeto: Dra. Rafaela Leão | Advocacia (OAB/MA 30234)
 *
 * Características:
 * - WebGL 1.0 puro (GLSL fragment shader de ondas orgânicas de seda e luz)
 * - Paletas estritamente mapeadas aos tokens do projeto (Hero clara creme/areia/dourado; Contato escuro marinho/dourado)
 * - Zona de acalmia automática atrás da coluna de leitura (H1) para preservar contraste AA/AAA
 * - DPR limitado a 1.5 no desktop e 0.65 no mobile
 * - Limite de 30 FPS em telas mobile (< 768px)
 * - Pausa automática via IntersectionObserver (fora da viewport) e document.hidden
 * - Respeito integral a prefers-reduced-motion (renderiza 1 frame estático)
 * - Fallback gracioso para gradiente CSS em aparelhos mobile fracos (hardwareConcurrency <= 4) ou sem WebGL
 * - Tratamento de webglcontextlost / webglcontextrestored e fade-in suave de 1400ms
 */
(function (global) {
    'use strict';

    var VERTEX_SHADER_SRC = [
        'attribute vec2 aPosition;',
        'varying vec2 vUv;',
        'void main() {',
        '    vUv = aPosition * 0.5 + 0.5;',
        '    gl_Position = vec4(aPosition, 0.0, 1.0);',
        '}'
    ].join('\n');

    var FRAGMENT_SHADER_SRC = [
        'precision mediump float;',
        'varying vec2 vUv;',
        'uniform float uTime;',
        'uniform vec2 uResolution;',
        'uniform vec2 uPointer;',
        'uniform vec3 uColorBase;',
        'uniform vec3 uColorSecondary;',
        'uniform vec3 uColorAccent;',
        'uniform vec3 uColorWarm;',
        'uniform float uCalmLeft;',
        '',
        '// Ruído harmônico suave para movimento editorial de seda',
        'float waveNoise(vec2 p, float t) {',
        '    float n = sin(p.x * 2.1 + t * 0.45) * cos(p.y * 1.8 - t * 0.35);',
        '    n += 0.5 * sin(p.x * 4.2 - p.y * 3.1 + t * 0.28);',
        '    n += 0.25 * cos(p.x * 6.8 + p.y * 5.4 - t * 0.22);',
        '    return n * 0.57;',
        '}',
        '',
        'void main() {',
        '    vec2 uv = vUv;',
        '    float aspect = uResolution.x / max(uResolution.y, 1.0);',
        '    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);',
        '',
        '    // Leve deslocamento pelo cursor no desktop',
        '    vec2 ptr = (uPointer - 0.5) * vec2(aspect, 1.0);',
        '    float ptrDist = length(p - ptr);',
        '    float ptrInfluence = smoothstep(0.65, 0.0, ptrDist) * 0.08;',
        '',
        '    // Distorção orgânica em camadas lentas',
        '    float t = uTime * 0.55;',
        '    float w1 = waveNoise(p * 1.35 + ptrInfluence, t);',
        '    float w2 = waveNoise(p * 2.10 - vec2(w1 * 0.35, t * 0.15), t * 0.8);',
        '    float ribbon = smoothstep(-0.55, 0.65, w1 * 0.6 + w2 * 0.4);',
        '',
        '    // Foco luminoso próximo à moldura em arco (direita superior)',
        '    vec2 haloCenter = vec2(0.24 * aspect, 0.06);',
        '    float halo = smoothstep(0.95, 0.05, length(p - haloCenter));',
        '',
        '    // Zona calma atrás do H1 à esquerda na Hero para leitura impecável',
        '    float calmMask = mix(1.0, smoothstep(0.12, 0.68, uv.x), uCalmLeft);',
        '',
        '    vec3 col = mix(uColorBase, uColorSecondary, ribbon * 0.72);',
        '    col = mix(col, uColorWarm, pow(ribbon, 2.2) * 0.38 * calmMask);',
        '    col = mix(col, uColorAccent, halo * 0.42 * (0.45 + 0.55 * w2) * calmMask);',
        '',
        '    gl_FragColor = vec4(col, 1.0);',
        '}'
    ].join('\n');

    function hexToRgbNormalized(hex) {
        var clean = String(hex || '#F4F0E9').replace('#', '').trim();
        if (clean.length === 3) {
            clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        }
        var num = parseInt(clean, 16);
        if (isNaN(num)) return [0.957, 0.941, 0.914];
        return [
            ((num >> 16) & 255) / 255,
            ((num >> 8) & 255) / 255,
            (num & 255) / 255
        ];
    }

    function compileShader(gl, type, source) {
        var shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vsSource, fsSource) {
        var vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
        var fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return null;

        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        gl.deleteShader(vs);
        gl.deleteShader(fs);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            gl.deleteProgram(prog);
            return null;
        }
        return prog;
    }

    function initShaderBackground(canvas, options) {
        if (!canvas || typeof canvas.getContext !== 'function') return null;

        var opts = options || {};
        var theme = opts.theme === 'dark' ? 'dark' : 'light';
        var isMobile = window.innerWidth < 768;
        var reducedMotionQuery = window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)')
            : { matches: false };

        // Detecção de aparelho mobile de entrada (hardwareConcurrency <= 4 em tela pequena)
        var cores = navigator.hardwareConcurrency || 8;
        var isLowPowerMobile = isMobile && cores <= 4;

        var parent = canvas.parentElement;

        function activateFallback() {
            canvas.style.opacity = '0';
            canvas.style.pointerEvents = 'none';
            if (parent) {
                parent.classList.add('shader-fallback-active');
            }
        }

        if (isLowPowerMobile) {
            activateFallback();
            return { fallback: true, destroy: function () {} };
        }

        // Paletas estritamente alinhadas à seção 4.2 do projeto
        var palettes = {
            light: {
                base: opts.colorBase || '#F4F0E9',      // --cream-100
                secondary: opts.colorSecondary || '#E9E1D5', // --sand-200
                accent: opts.colorAccent || '#E2C88A',  // --gold-300
                warm: opts.colorWarm || '#B7803F',      // --caramel-500
                calmLeft: typeof opts.calmLeft === 'number' ? opts.calmLeft : 0.72,
                targetOpacity: typeof opts.opacity === 'number' ? opts.opacity : 0.46
            },
            dark: {
                base: opts.colorBase || '#0A1426',      // --navy-900
                secondary: opts.colorSecondary || '#16264A', // --navy-700
                accent: opts.colorAccent || '#C4A15A',  // --gold-500
                warm: opts.colorWarm || '#6B3B22',      // --chocolate-600
                calmLeft: typeof opts.calmLeft === 'number' ? opts.calmLeft : 0.25,
                targetOpacity: typeof opts.opacity === 'number' ? opts.opacity : 0.56
            }
        };

        var pal = palettes[theme];
        var gl = null;
        var program = null;
        var posBuffer = null;
        var uniforms = {};
        var rafId = null;
        var isVisible = true;
        var isDocHidden = document.hidden;
        var contextLost = false;
        var startTime = performance.now();
        var lastFrameTime = 0;
        var pointer = { x: 0.65, y: 0.42, targetX: 0.65, targetY: 0.42 };

        function setupGlResources() {
            try {
                gl = canvas.getContext('webgl', {
                    alpha: false,
                    antialias: false,
                    depth: false,
                    stencil: false,
                    preserveDrawingBuffer: false,
                    powerPreference: 'low-power'
                }) || canvas.getContext('experimental-webgl');
            } catch (err) {
                gl = null;
            }

            if (!gl) {
                activateFallback();
                return false;
            }

            program = createProgram(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
            if (!program) {
                activateFallback();
                return false;
            }

            gl.useProgram(program);

            posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
                gl.STATIC_DRAW
            );

            var aPosition = gl.getAttribLocation(program, 'aPosition');
            gl.enableVertexAttribArray(aPosition);
            gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

            uniforms = {
                uTime: gl.getUniformLocation(program, 'uTime'),
                uResolution: gl.getUniformLocation(program, 'uResolution'),
                uPointer: gl.getUniformLocation(program, 'uPointer'),
                uColorBase: gl.getUniformLocation(program, 'uColorBase'),
                uColorSecondary: gl.getUniformLocation(program, 'uColorSecondary'),
                uColorAccent: gl.getUniformLocation(program, 'uColorAccent'),
                uColorWarm: gl.getUniformLocation(program, 'uColorWarm'),
                uCalmLeft: gl.getUniformLocation(program, 'uCalmLeft')
            };

            var cBase = hexToRgbNormalized(pal.base);
            var cSec = hexToRgbNormalized(pal.secondary);
            var cAcc = hexToRgbNormalized(pal.accent);
            var cWarm = hexToRgbNormalized(pal.warm);

            gl.uniform3f(uniforms.uColorBase, cBase[0], cBase[1], cBase[2]);
            gl.uniform3f(uniforms.uColorSecondary, cSec[0], cSec[1], cSec[2]);
            gl.uniform3f(uniforms.uColorAccent, cAcc[0], cAcc[1], cAcc[2]);
            gl.uniform3f(uniforms.uColorWarm, cWarm[0], cWarm[1], cWarm[2]);
            gl.uniform1f(uniforms.uCalmLeft, pal.calmLeft);

            resizeCanvas();
            return true;
        }

        function resizeCanvas() {
            if (!gl || contextLost) return;
            isMobile = window.innerWidth < 768;
            var rawDpr = window.devicePixelRatio || 1;
            var scale = isMobile ? Math.min(rawDpr, 1.25) * 0.6 : Math.min(rawDpr, 1.5);
            var rect = canvas.getBoundingClientRect();
            var w = Math.max(1, Math.floor((rect.width || window.innerWidth) * scale));
            var h = Math.max(1, Math.floor((rect.height || 600) * scale));

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
            gl.viewport(0, 0, canvas.width, canvas.height);
            if (uniforms.uResolution) {
                gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
            }
        }

        function renderSingleFrame(now) {
            if (!gl || !program || contextLost) return;
            var elapsed = (now - startTime) * 0.001;
            pointer.x += (pointer.targetX - pointer.x) * 0.05;
            pointer.y += (pointer.targetY - pointer.y) * 0.05;

            gl.useProgram(program);
            gl.uniform1f(uniforms.uTime, elapsed);
            gl.uniform2f(uniforms.uPointer, pointer.x, 1.0 - pointer.y);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        function loop(now) {
            rafId = null;
            if (!isVisible || isDocHidden || contextLost || reducedMotionQuery.matches) {
                return;
            }

            // Limite de 30 FPS no mobile (~33.3ms por quadro)
            var minDelta = isMobile ? 33.3 : 14.0;
            if (now - lastFrameTime >= minDelta) {
                lastFrameTime = now;
                renderSingleFrame(now);
            }

            rafId = requestAnimationFrame(loop);
        }

        function startLoop() {
            if (reducedMotionQuery.matches) {
                renderSingleFrame(performance.now());
                return;
            }
            if (!rafId && isVisible && !isDocHidden && !contextLost) {
                lastFrameTime = performance.now();
                rafId = requestAnimationFrame(loop);
            }
        }

        function stopLoop() {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        // Inicializar recursos WebGL
        if (!setupGlResources()) {
            return { fallback: true, destroy: function () {} };
        }

        // Fade-in suave de ~1400ms ao carregar
        canvas.style.transition = 'opacity 1400ms cubic-bezier(0.22, 1, 0.36, 1)';
        requestAnimationFrame(function () {
            canvas.style.opacity = String(pal.targetOpacity);
        });

        // Renderiza o primeiro quadro imediatamente e inicia loop conforme preferências
        renderSingleFrame(performance.now());
        startLoop();

        // Eventos de ponteiro (apenas desktop para economizar bateria mobile)
        function onPointerMove(e) {
            if (isMobile) return;
            var rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            pointer.targetX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            pointer.targetY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        }

        window.addEventListener('mousemove', onPointerMove, { passive: true });
        window.addEventListener('resize', resizeCanvas, { passive: true });

        // Pausar quando fora da tela
        var io = null;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        startLoop();
                    } else {
                        stopLoop();
                    }
                });
            }, { threshold: 0.02 });
            io.observe(canvas);
        }

        // Pausar quando a aba estiver oculta
        function onVisibilityChange() {
            isDocHidden = document.hidden;
            if (isDocHidden) {
                stopLoop();
            } else {
                startLoop();
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Tratamento de perda e restauração de contexto WebGL
        function onContextLost(e) {
            e.preventDefault();
            contextLost = true;
            stopLoop();
            activateFallback();
        }

        function onContextRestored() {
            contextLost = false;
            if (parent) parent.classList.remove('shader-fallback-active');
            if (setupGlResources()) {
                canvas.style.opacity = String(pal.targetOpacity);
                startLoop();
            }
        }

        canvas.addEventListener('webglcontextlost', onContextLost, false);
        canvas.addEventListener('webglcontextrestored', onContextRestored, false);

        return {
            fallback: false,
            resize: resizeCanvas,
            destroy: function () {
                stopLoop();
                if (io) io.disconnect();
                window.removeEventListener('mousemove', onPointerMove);
                window.removeEventListener('resize', resizeCanvas);
                document.removeEventListener('visibilitychange', onVisibilityChange);
                canvas.removeEventListener('webglcontextlost', onContextLost);
                canvas.removeEventListener('webglcontextrestored', onContextRestored);
            }
        };
    }

    global.initShaderBackground = initShaderBackground;
})(window);
