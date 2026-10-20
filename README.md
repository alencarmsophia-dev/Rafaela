# Site Institucional — Dra. Rafaela Leão | Advogada (OAB/MA 30234)

Projeto front-end editorial atualizado para a **Dra. Rafaela Leão** (`OAB/MA 30234`), com foco em **Direito de Família e Direito Previdenciário** e posicionamento em **Assessoria Jurídica Humanizada**.

> **Aviso importante de conformidade OAB:** **Revisar textos com a advogada antes de publicar.** Todo o conteúdo foi redigido em caráter estritamente informativo e sóbrio, em observância ao Provimento nº 205/2021 do Conselho Federal da OAB e ao Código de Ética e Disciplina da Advocacia.

---

## 1. Estrutura de Arquivos do Projeto

```text
site-rafaela-leao/
├── index.html                  # Código-fonte principal (HTML5 + CSS3 + JS centralizado em CONFIG, sem base64)
├── README.md                   # Documentação de implantação, imagens e conformidade OAB
└── assets/
    ├── img/
    │   ├── rafaela-hero.jpg        # Foto principal da Hero (sentada em poltrona de madeira, terno marinho)
    │   ├── rafaela-sorrindo.jpg    # Foto da seção Sobre (sorrindo, terno marinho, já recortada/limpa)
    │   └── rafaela-terno-cinza.jpg # Foto da seção Conteúdo Jurídico (terno cinza-azulado listrado, já limpa)
    └── js/
        └── shader-bg.js        # Fundo animado em WebGL puro (initShaderBackground) com fallback CSS
```

---

## 2. Tabela de Renomeação das Imagens (`assets/img/`)

O código de `index.html` referencia exclusivamente os caminhos relativos abaixo (sem imagens em base64 no arquivo-fonte). Caso esteja montando a pasta manualmente a partir dos arquivos originais enviados, copie-os para `assets/img/` com os seguintes nomes (no pacote `.zip` entregue, as três fotos já estão convertidas e otimizadas em `assets/img/`):

| Arquivo original (referência) | Arquivo enviado (PNG limpo) | Caminho final obrigatório no projeto | Uso no site |
| :--- | :--- | :--- | :--- |
| `1000137223.jpg` | `1000137281.png` | `assets/img/rafaela-hero.jpg` | Moldura em arco na Hero (desktop e mobile) |
| `1000137220.jpg` | `1000137285.png` | `assets/img/rafaela-sorrindo.jpg` | Retrato institucional na seção **Sobre a Advogada** |
| `1000137217.jpg` | `1000137279.png` | `assets/img/rafaela-terno-cinza.jpg` | Retrato editorial na seção **Conteúdo Jurídico em Linguagem Simples** |
| `1000137224.jpg` | — | *(Não entra no site)* | Usada apenas como referência de composição da Hero |
| `1000137227.jpg` | — | *(Não entra no site)* | Usada apenas como fonte de dados reais do Instagram |

### Passo Opcional: Gerar versões `.webp` (cwebp / Squoosh)

Se desejar gerar versões `.webp` futuramente para usar com `<picture>`, execute na raiz do projeto:

```bash
# Usando cwebp (libwebp)
cwebp -q 84 assets/img/rafaela-hero.jpg -o assets/img/rafaela-hero.webp
cwebp -q 84 assets/img/rafaela-sorrindo.jpg -o assets/img/rafaela-sorrindo.webp
cwebp -q 84 assets/img/rafaela-terno-cinza.jpg -o assets/img/rafaela-terno-cinza.webp

# Ou via Squoosh CLI (Node.js)
npx @squoosh/cli --webp '{"quality":84}' assets/img/*.jpg -d assets/img/
```

---

## 3. Configuração Centralizada (`CONFIG` e `data-optional`)

No final do `index.html`, o objeto `CONFIG` centraliza todos os dados da cliente:

```javascript
const CONFIG = {
    firmNameHTML: 'Rafaela <span>Leão</span>',
    firmNamePlain: 'Rafaela Leão | Advogada',
    oabHeader: 'Advogada · OAB/MA 30234',
    oabBadge: 'OAB/MA 30234',
    oabFooter: 'Dra. Rafaela Leão · OAB/MA 30234',
    whatsappNumber: '5599984265286',
    phoneFormatted: '(99) 98426-5286',
    instagramHandle: '@rafaelaleao.adv',
    instagramUrl: 'https://www.instagram.com/rafaelaleao.adv/',
    email: '',
    address: '',
    city: '',
    hours: '',
    defaultWaMessage: 'Olá, Dra. Rafaela! Acessei seu site e gostaria de agendar um atendimento jurídico.'
};
```

- **Omissão inteligente de dados ausentes (`data-optional`):** Enquanto `email`, `address`, `city` ou `hours` estiverem vazios (`''`), todos os elementos HTML marcados com `data-optional="address"`, `data-optional="email"` etc. permanecem automaticamente ocultos (`hidden`). Assim que a advogada desejar informar endereço físico ou e-mail profissional, basta preencher a string correspondente no `CONFIG` e o item aparecerá automaticamente no menu mobile, na seção de contato e no rodapé.

---

## 4. Síntese de Referências Pesquisadas (Awwwards & 21st.dev)

1. **Hafnia Law & Ross Advocaten (Awwwards Honorable Mention):** Contraste entre fundos editoriais quentes (`#F4F0E9` / `#E9E1D5`) e blocos marinho profundos (`#0F1B33`), substituindo o frio corporativo por acolhimento humano.
2. **Tate Law & Stilley Law (Awwwards Nominees):** Hierarquia tipográfica com serifa condensada de alto contraste (`Instrument Serif`) combinada a `Inter` para leitura fluida em telas mobile e desktop.
3. **McAlpine House & Frances To (Awwwards Editorial):** Composição assimétrica com moldura em arco, círculo solar dourado sangrando na borda direita e texto vertical rotacionado (`writing-mode: vertical-rl`).
4. **21st.dev Hero & Spotlight Cards:** Cards de pilares que atravessam a borda inferior da Hero (`translateY(-60px)`) com iluminação radial que acompanha o cursor (`.spotlight-card`) e micro-rotação nos ícones de traço `1.5px`.
5. **21st.dev Paper/Silk Shaders:** Movimento orgânico de baixa frequência em WebGL com máscara de acalmia atrás da coluna de texto principal para preservar contraste WCAG AA/AAA.
