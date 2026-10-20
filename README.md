# Site Institucional — Dra. Rafaela Leão | Advogada (OAB/MA 30234)

Projeto front-end editorial atualizado para a **Dra. Rafaela Leão** (`OAB/MA 30234`), com atuação em **Direito de Família e Direito Previdenciário**, posicionamento em **Assessoria Jurídica Humanizada** e atendimento **online e presencial**.

---

## 1. Estrutura de Pastas do Projeto

```text
site-rafaela-leao/
├── index.html
├── README.md
└── assets/
    ├── img/
    │   ├── rafaela-hero.jpg          (Nova foto principal da Hero na mesa do escritório — 800×999)
    │   ├── rafaela-sorrindo.jpg      (Foto da seção Sobre — recortada sem texto superior — 1134×1387)
    │   ├── rafaela-terno-cinza.jpg   (Foto da seção Conteúdo — recortada sem contador/caixa — 1121×1403)
    │   └── rafaela-estudio.jpg       (Foto adicional de estúdio preservada — 1086×1448)
    └── js/
        └── shader-bg.js              (Módulo WebGL puro de ondas de seda e partículas de luz dourada)
```

---

## 2. Tabela de Renomeação das Fotos (`assets/img/`)

| Arquivo enviado | Destino no projeto (`assets/img/`) | Uso na página |
|---|---|---|
| `1000137291.jpg` | `assets/img/rafaela-hero.jpg` | **Hero principal (`#inicio`)** — posicionada à direita com fusão em degradê e moldura arquitetônica dourada |
| `1000137220.jpg` | `assets/img/rafaela-sorrindo.jpg` | **Seção Sobre (`#sobre`)** — recortada para remover o texto superior do post |
| `1000137217.jpg` | `assets/img/rafaela-terno-cinza.jpg` | **Seção Conteúdo (`#conteudo`)** — recortada para remover o contador `1/7` e a caixa inferior |
| `1000137223.jpg` | `assets/img/rafaela-estudio.jpg` | **Acervo adicional** preservado na pasta `assets/img/` |

> **Observação:** Na versão empacotada (`.zip`), todas as fotos recortadas e limpas já estão salvas dentro de `assets/img/` e o `index.html` referencia exclusivamente caminhos relativos (`assets/img/...`), sem nenhum `base64` embutido.

---

## 3. Destaques da Atualização

1. **Nova Hero Principal (`assets/img/rafaela-hero.jpg`)**:
   - No desktop, as frases principais permanecem à esquerda (`grid-column: 1 / 7`) com total predominância e leitura limpa.
   - A nova foto enviada (`1000137291.jpg`) fica posicionada à direita (`grid-column: 7 / 13`), integrada com naturalidade por meio de uma moldura em arco arquitetônico dourado, halo luminoso quente e degradê multi-camadas nas bordas esquerda e inferior.
2. **Background Shaders WebGL (`assets/js/shader-bg.js`) em Múltiplas Seções**:
   - Shaders ativos e visíveis na **Hero (`#hero-shader`)**, **Áreas de Atuação (`#areas-shader`)**, **Sobre (`#sobre-shader`)**, **Diferenciais (`#diff-shader`)**, **Conteúdo Jurídico (`#content-shader`)** e **Contato Final (`#cta-shader`)**.
   - Inclui fitas orgânicas de seda, cáusticas douradas e partículas de luz flutuantes, com pausa automática via `IntersectionObserver` quando a seção sai da tela (mantendo a performance leve).
3. **Animações e Interações Refinadas**:
   - Inclinação 3D sutil na moldura da Hero, botões magnéticos no desktop, chips de vidro com flutuação contínua, varredura de brilho dourado nos cards e revelação em cascata no scroll.
