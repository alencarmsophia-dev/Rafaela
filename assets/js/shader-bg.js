/**
 * shader-bg.js — Fundos Animados WebGL Multi-Seção (Seda Dourada, Aurora Editorial & Bokeh)
 * Projeto: Dra. Rafaela Leão | Advocacia (OAB/MA 30234)
 *
 * Características:
 * - WebGL 1.0 puro (GLSL fragment shader com fitas de luz de seda, ondas harmônicas e partículas bokeh douradas)
 * - Presets dedicados para Hero (#inicio), Áreas (#areas), Sobre (#sobre), Diferenciais (#diferenciais), Conteúdo (#conteudo) e Contato (#contato-final)
 * - Zona de acalmia configurável (uCalmLeft) para proteger a leitura dos textos à esquerda na Hero
 * - Interatividade fluida ao movimento do mouse no desktop + respiração contínua elegante
 * - Otimização automática: IntersectionObserver pausa câmaras fora da tela, document.hidden pausa em segundo plano
 * - Fallback CSS rico caso WebGL não esteja disponível
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
        'uniform float uIntensity;',
        'uniform float uVariant;',
        '',
        'float hash(vec2 p) {',
        '    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
        '}',
        '',
        'float noise(vec2 p) {',
        '    vec2 i = floor(p);',
        '    vec2 f = fract(p);',
        '    vec2 u = f * f * (3.0 - 2.0 * f);',
        '    return mix(',
        '        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),',
        '        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),',
        '        u.y',
        '    );',
        '}',
        '',
        '// Ondas de seda fluidas e fitas de luz dourada/caramelo',
        'float silkRibbon(vec2 p, float t, float freq) {',
        '    float w = sin(p.x * freq + t * 0.65 + cos(p.y * (freq * 0.85) - t * 0.48) * 1.35);',
        '    w += 0.55 * cos(p.y * (freq * 1.3) - p.x * 1.4 + t * 0.52);',
        '    w += 0.30 * sin((p.x + p.y) * (freq * 1.7) - t * 0.38);',
        '    return w * 0.54;',
        '}',
        '',
        '// Brilho suave de bokeh flutuante',
        'float bokehLayer(vec2 uv, float t, float scale) {',
        '    vec2 grid = uv * scale;',
        '    vec2 id = floor(grid);',
        '    vec2 gv = fract(grid) - 0.5;',
        '    float rnd = hash(id);',
        '    vec2 offset = vec2(sin(t * (0.4 + rnd * 0.6) + rnd * 6.28), cos(t * (0.35 + rnd * 0.5) + rnd * 6.28)) * 0.28;',
        '    float d = length(gv - offset);',
        '    float radius = 0.08 + 0.14 * sin(t * 0.8 + rnd * 12.0) * 0.5 + 0.07;',
        '    float spark = smoothstep(radius, radius * 0.15, d) * smoothstep(0.35, 0.92, rnd);',
        '    return spark;',
        '}',
        '',
        'void main() {',
        '    vec2 uv = vUv;',
        '    float aspect = uResolution.x / max(uResolution.y, 1.0);',
        '    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);',
        '',
        '    // Interação magnética com o cursor',
        '    vec2 ptr = (uPointer - 0.5) * vec2(aspect, 1.0);',
        '    float ptrDist = length(p - ptr);',
        '    float ptrWave = smoothstep(0.85, 0.0, ptrDist);',
        '    vec2 warpedP = p + normalize(p - ptr + vec2(0.0001)) * ptrWave * 0.075 * sin(uTime * 1.1);',
        '',
        '    float t = uTime * 0.72 + uVariant * 3.7;',
        '    float n1 = noise(warpedP * 1.9 + vec2(t * 0.18, -t * 0.12));',
        '    float s1 = silkRibbon(warpedP + n1 * 0.28, t, 2.2);',
        '    float s2 = silkRibbon(warpedP * 1.45 - vec2(s1 * 0.35, t * 0.16), t * 0.88, 2.8);',
        '    float ribbon = smoothstep(-0.68, 0.72, s1 * 0.58 + s2 * 0.42);',
        '    float crest = pow(max(0.0, 1.0 - abs(s1 * 0.7 + s2 * 0.5)), 3.2);',
        '',
        '    // Focos luminosos (direita na Hero, orgânico nas demais seções)',
        '    vec2 haloPos = mix(vec2(0.24 * aspect, 0.04), vec2(sin(t * 0.22) * 0.28 * aspect, cos(t * 0.18) * 0.18), clamp(uVariant, 0.0, 1.0));',
        '    float halo = smoothstep(1.08, 0.02, length(warpedP - haloPos));',
        '    float haloSecondary = smoothstep(0.95, 0.05, length(warpedP - vec2(-0.28 * aspect, -0.18)));',
        '',
        '    // Partículas bokeh douradas sutis',
        '    float bokeh = bokehLayer(warpedP + vec2(t * 0.04, t * 0.06), t, 4.2) * 0.45;',
        '    bokeh += bokehLayer(warpedP * 1.3 - vec2(t * 0.03, -t * 0.04), t * 1.1, 6.5) * 0.30;',
        '',
        '    // Protege a predominância das frases à esquerda na Hero mantendo o lado direito rico',
        '    float calmMask = mix(1.0, smoothstep(0.04, 0.58, uv.x), uCalmLeft);',
        '    float leftSoftGlow = (1.0 - calmMask) * 0.38;',
        '    float activeMask = clamp(calmMask + leftSoftGlow, 0.28, 1.0) * uIntensity;',
        '',
        '    vec3 col = mix(uColorBase, uColorSecondary, ribbon * 0.85);',
        '    col = mix(col, uColorWarm, (pow(ribbon, 1.7) * 0.52 + haloSecondary * 0.24) * activeMask);',
        '    col = mix(col, uColorAccent, (crest * 0.58 + halo * 0.48 + ptrWave * 0.22) * activeMask);',
        '    col += uColorAccent * bokeh * 0.28 * activeMask;',
        '',
        '    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
        '}'
    ].join('\n');

    function hexToRgbNormalized(hex) {
        var clean = String(hex || '#F4EFE6').replace('#', '').trim();
        if (clean.length === 3) {
            clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        }
        var num = parseInt(clean, 16);
        if (isNaN(num)) return [0.957, 0.937, 0.902];
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
        var theme = opts.theme || 'light';
        var isMobile = window.innerWidth < 768;
        var reducedMotionQuery = window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)')
            : { matches: false };

        var parent = canvas.parentElement;

        function activateFallback() {
            canvas.style.opacity = '0';
            canvas.style.pointerEvents = 'none';
            if (parent) {
                parent.classList.add('shader-fallback-active');
            }
        }

        // Presets ricos que dão vida às seções claras, amendoadas e marinho
        var palettes = {
            light: {
                base: opts.colorBase || '#F3ECE1',
                secondary: opts.colorSecondary || '#E4D5C1',
                accent: opts.colorAccent || '#D8B36A',
                warm: opts.colorWarm || '#B57B3A',
                calmLeft: typeof opts.calmLeft === 'number' ? opts.calmLeft : 0.58,
                intensity: typeof opts.intensity === 'number' ? opts.intensity : 1.05,
                variant: typeof opts.variant === 'number' ? opts.variant : 0.0,
                targetOpacity: typeof opts.opacity === 'number' ? opts.opacity : 0.82
            },
            warm: {
                base: opts.colorBase || '#EBE1D2',
                secondary: opts.colorSecondary || '#DAC7B0',
                accent: opts.colorAccent || '#C99E52',
                warm: opts.colorWarm || '#9C6228',
                calmLeft: typeof opts.calmLeft === 'number' ? opts.calmLeft : 0.15,
                intensity: typeof opts.intensity === 'number' ? opts.intensity : 0.95,
                variant: typeof opts.variant === 'number' ? opts.variant : 1.0,
                targetOpacity: typeof opts.opacity === 'number' ? opts.opacity : 0.72
            },
            dark: {
                base: opts.colorBase || '#0A1426',
                secondary: opts.colorSecondary || '#172A52',
                accent: opts.colorAccent || '#D4AF63',
                warm: opts.colorWarm || '#8A5229',
                calmLeft: typeof opts.calmLeft === 'number' ? opts.calmLeft : 0.12,
                intensity: typeof opts.intensity === 'number' ? opts.intensity : 1.1,
                variant: typeof opts.variant === 'number' ? opts.variant : 2.0,
                targetOpacity: typeof opts.opacity === 'number' ? opts.opacity : 0.78
            }
        };

        var pal = palettes[theme] || palettes.light;
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
        var pointer = { x: 0.68, y: 0.45, targetX: 0.68, targetY: 0.45 };

        function setupGlResources() {
            try {
                gl = canvas.getContext('webgl', {
                    alpha: false,
                    antialias: false,
                    depth: false,
                    stencil: false,
                    preserveDrawingBuffer: false,
                    powerPreference: 'default'
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
                uCalmLeft: gl.getUniformLocation(program, 'uCalmLeft'),
                uIntensity: gl.getUniformLocation(program, 'uIntensity'),
                uVariant: gl.getUniformLocation(program, 'uVariant')
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
            gl.uniform1f(uniforms.uIntensity, pal.intensity);
            gl.uniform1f(uniforms.uVariant, pal.variant);

            resizeCanvas();
            return true;
        }

        function resizeCanvas() {
            if (!gl || contextLost) return;
            isMobile = window.innerWidth < 768;
            var rawDpr = window.devicePixelRatio || 1;
            var scale = isMobile ? Math.min(rawDpr, 1.25) * 0.65 : Math.min(rawDpr, 1.5);
            var rect = canvas.getBoundingClientRect();
            var w = Math.max(1, Math.floor((rect.width || window.innerWidth) * scale));
            var h = Math.max(1, Math.floor((rect.height || 640) * scale));

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
            pointer.x += (pointer.targetX - pointer.x) * 0.06;
            pointer.y += (pointer.targetY - pointer.y) * 0.06;

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

            var minDelta = isMobile ? 33.3 : 16.0;
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

        if (!setupGlResources()) {
            return { fallback: true, destroy: function () {} };
        }

        canvas.style.transition = 'opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1)';
        requestAnimationFrame(function () {
            canvas.style.opacity = String(pal.targetOpacity);
        });

        renderSingleFrame(performance.now());
        startLoop();

        function onPointerMove(e) {
            if (isMobile || !isVisible) return;
            var rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            pointer.targetX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            pointer.targetY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        }

        window.addEventListener('mousemove', onPointerMove, { passive: true });
        window.addEventListener('resize', resizeCanvas, { passive: true });

        var io = null;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        resizeCanvas();
                        startLoop();
                    } else {
                        stopLoop();
                    }
                });
            }, { threshold: 0.01, rootMargin: '120px 0px' });
            io.observe(canvas);
        }

        function onVisibilityChange() {
            isDocHidden = document.hidden;
            if (isDocHidden) {
                stopLoop();
            } else {
                startLoop();
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange);

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
