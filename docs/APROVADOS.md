# Mascotes aprovados: Yoru, Drizzle e Futo

Este é o guia para continuar com os três personagens aprovados, seja em animação ou em 3D. Quem for trabalhar neles (Codex, Claude ou outra pessoa) começa por aqui.

- **Aprovados:** Yoru (fantasminha), Drizzle (nuvem) e Futo (burrito de cobertor).
- **Fora:** Pomu, Musubi, Lumi, Burnie e Loaf. O Loaf ficou "legalzinho", mas não ideal. Ficam no código só como histórico; não use.

## 1. Onde estão

| Personagem | Código | Pacote (16 stickers) | Comando |
|---|---|---|---|
| Yoru | `stickers/yoru.js` (`yoru(e)`, `SET`) | `out/stickers/yoru-set/` | `npm run yoru` |
| Drizzle | `stickers/limbless.js` (`CHARS.drizzle`, `.pack`) | `out/stickers/drizzle-set/` | `npm run packs` |
| Futo | `stickers/limbless.js` (`CHARS.futo`, `.pack`) | `out/stickers/futo-set/` | `npm run packs` |

`npm run packs` também gera `out/stickers/trio.png`, com os três juntos.

- **Imagens fora do Git.** `out/` não vai para o repositório, que é público. As imagens são geradas de novo a partir do código e saem sempre iguais.
- **Tamanho.** Cada sticker é desenhado numa caixa de 740×640 e exportado em PNG transparente:
  - stickers `01..16.png`: 370×320;
  - `main.png`: 240×240;
  - `tab.png`: 96×74.
- **Setup.** `npm install` e o Chromium do Playwright. O render usa Playwright para fotografar o SVG.

```js
const { yoru } = require('./stickers/yoru');
const { CHARS, limbless } = require('./stickers/limbless');
const svg1 = yoru({ caption: 'hi!', eyes: 'dot', mouth: 'smile', flaps: ['down', 'wave'] });
const svg2 = limbless(CHARS.drizzle, { eyes: 'happy', mouth: 'open', weather: 'rainbow' });
const svg3 = limbless(CHARS.futo, { eyes: 'closed', mouth: 'tiny', peek: 'half', extras: ['zz'] });
```

## 2. Regras que não mudam

1. **Nada de braço forçado.**
   - Drizzle e Futo não têm braços nem pernas.
   - O Yoru tem só abas do próprio lençol, que fazem parte da silhueta e não são tubos colados.
   - A atuação vem do que cada um consegue fazer de verdade (seção 4).
2. **Estilo de sticker que vende:**
   - olhos de pontinho;
   - cores pastel chapadas;
   - um contorno só, na cor `INK` de `stickers/kit.js`;
   - borda branca de recorte;
   - legenda curta em inglês.
3. **Nada sai do quadro.** Isso inclui o personagem, os efeitos (gotas, raio, zz) e a legenda, sempre com folga, em todos os quadros de uma animação.
4. **Rosto simétrico.** As bochechas são iguais; só o traço treme.
5. **Paleta fixa.** As cores da seção 3 são as do personagem. Não invente outras.

## 3. Ficha de cada um

As medidas abaixo estão na caixa de 740×640. O pivô é o ponto de apoio em que giram `bow` e `squash`.

### Yoru, o fantasminha que faz hora extra

- **Cores:** corpo `#f4f1ff`, sombra `#d6cdf3`.
- **Forma:** uma cúpula e uma barra ondulada (`sheet()`).
  - Cúpula: centro (370, 352), raio 182 × 178.
  - Barra: 7 pontas arredondadas, que terminam por volta de y = 604.
  - Largura total de ~380 e altura de ~430.
- **Abas (`flap()`):**
  - Saem de (370 ± 168, 448), com 84 de comprimento.
  - Grossura de 36 na raiz e 23 na ponta, que é redonda.
  - Ângulos prontos em `FLAP`: `down`, `droop`, `out`, `wave`, `up`, `back`, `in`. Também aceita um número em graus.
- **Objetos:** `coffee`, `laptop`, `badge`, segurados entre as abas.
- **Pivô:** (370, 600).
- **Personalidade:** cansado, educado e "fantasma" quando some. Aparece em frases como "overtime again", "brb" e "boo!".

### Drizzle, a nuvenzinha que veste o humor como clima

- **Cores:**
  - corpo `#f2f6ff`, sombra `#c9d5f0`;
  - na tempestade, `#aeb6cc` e `#8d96b0`.
- **Forma:** quatro bolotas e uma base achatada (`parts`).
  - Bolotas: elipses em (250, 438), (340, 372), (452, 382) e (524, 446), com raios de 76 a 112.
  - Base: caixa arredondada em (386, 478), 420 × 128.
- **Rosto:** olhos em (330, 430) e (432, 430); boca em (381, 470).
- **Clima (`weather`):**
  - `sun` (sol atrás, à direita);
  - `rainbow` (arco-íris à direita);
  - `storm` (fica cinza).
- **Extras:** `rain`, `bolt`, `snow`, `fewDrops`.
- **Pivô:** (386, 540).

### Futo, enrolado no cobertor e sem sair da cama

- **Cores:**
  - cobertor `#ffbfcc`, sombra `#f19bb0`, bolinhas `#fff4f6`;
  - rosto `#ffeadb`, com moldura `#ffd9e2`.
- **Forma:** um rolo de cobertor `rbox(370, 420, 152, 184, 2.6)`, um retângulo bem arredondado de 304 × 368.
  - 16 bolinhas no tecido.
  - Uma dobra diagonal do cobertor na frente.
- **Rosto:** na abertura do capuz, uma elipse em (370, 330), com franjinha.
- **`peek`:**
  - `out`: rosto todo de fora;
  - `half`: o cobertor cobre até os olhos;
  - `in`: some dentro, sem rosto.
- **Pivô:** (370, 604).

## 4. Animação (próximo passo, com o Codex)

O caminho é um SVG por quadro, depois uma foto com o Playwright, depois MP4/GIF/APNG com o ffmpeg. É o mesmo de `video/render.js`, que já faz vídeo vertical de 1080×1920 a 24 fps.

**Parâmetros contínuos.** Dá para interpolar quadro a quadro estes parâmetros de `e`:

| Parâmetro | O que faz | Quem usa |
|---|---|---|
| `bow` | gira em graus em torno do pivô (reverência, balanço) | os três |
| `squash` | menor que 1 achata, maior que 1 estica; o volume se mantém, com largura = 1/√squash | os três |
| `float` | sobe em px (flutuar, pulinho) | os três |
| `fade` | opacidade de 0 a 1 ("ghosting", sumir) | os três (feito para o Yoru) |
| `wob` | ondulação da barra, de 0 a 1 (fazer em loop) | Yoru |
| `flaps` | `[esquerda, direita]` em graus; interpole ângulos, não posições, para a ponta andar em arco | Yoru |

**Parâmetros discretos:**
- olhos, boca, `weather` e `peek` trocam de um quadro para o outro;
- para piscar, use `closed` por 2 a 3 quadros, a cada 2 a 4 s;
- o `peek` do Futo precisa virar contínuo para deslizar. Uma ideia é um parâmetro de altura do cobertor dentro de `shape()`.

**Regras de movimento (as mesmas de `docs/CORPOS.md`, 5b):**
- **Aceleração:** toda troca de pose leva de 8 a 10 quadros, com aceleração e desaceleração. Já existe `armTrack()` em `video/frame.js`.
- **Atraso:** a parte solta chega depois do corpo, como a ponta da aba do Yoru e a barra do lençol.
- **Pulo:** comprimir antes de subir, esticar no ar e comprimir ao cair.
- **Ritmo:**
  - o movimento muda a cada quadro;
  - o tremor da linha, se houver, muda a cada 2 quadros.
- **Loop:** o primeiro quadro é igual ao último.

**Ideias por personagem:**
- **Yoru:**
  - boiando para cima e para baixo, com a barra ondulando;
  - aceno com a aba;
  - "brb", sumindo com `fade` até 0 e voltando;
  - susto, com `squash` em 1,1 e `float`.
- **Drizzle:**
  - respirando, com cada bolota inflando com um pequeno atraso. Para isso é preciso uma escala por bolota em `parts`;
  - chuva caindo em loop;
  - relâmpago, com um flash de 2 quadros;
  - arco-íris crescendo.
- **Futo:**
  - se remexendo, com `bow` ±6 em loop;
  - espiando, com o cobertor descendo até os olhos;
  - pulinho de "yay!";
  - cochilo, com o zz subindo.

**Antes de entregar:**
- Faça uma checagem de borda em todos os quadros. A ideia é a de `art/check-frame.js`: nenhum pixel com alfa na borda de 2 px.
- Veja a animação inteira, não só um quadro.
- Antes de exportar sticker animado para o LINE (ou para a Telegram), confira as especificações na página oficial: formato, duração, quadros e tamanho máximo. Elas ainda não foram confirmadas aqui.

## 5. 3D (outro tipo de sticker e conteúdo, como o Punchy)

O Punchy 3D é feito no Blender 4.5 LTS, com Python, pelo kit `engine/punchy3d` do repositório `lucasheyd/timecard`:
- a entrada é `build_actor_scene`;
- a sequência por quadro é pose base, expressão, gestos e contatos, e depois `keyframe`/`audit`;
- cada episódio guarda a fonte `.blend`, o MP4, os stems e os hashes.

Para o Tiny Hours, a sugestão é um kit próprio aqui, por exemplo `three3d/`, sem mexer no `timecard`.

**Modelagem:**
- **Yoru:**
  - Gire o perfil da cúpula com a parede reta (torno/lathe).
  - A barra é deslocada em 7 pontas arredondadas.
  - As abas são cápsulas que afinam e se fundem no corpo, via remesh/voxel ou metaball, para não ter costura.
  - Subdivisão suave.
- **Drizzle:**
  - Metaballs: 4 bolas e uma cápsula achatada embaixo, convertidas em malha.
  - Adereços de clima separados: gotas, raio, sol e um arco-íris feito com segmentos de toro.
- **Futo:**
  - Cilindro ou caixa bem arredondada, com a costura em espiral do rolo no topo.
  - Capuz aberto para o rosto e a dobra do cobertor na frente.
  - Bolinhas como textura.
- **Rosto:**
  - Decalques chapados na superfície: olhos de pontinho e boca.
  - Expressões por shape keys ou troca de textura. Os olhos continuam pequenos.

**Visual:**
- Sombreamento toon ou chapado, com as cores da seção 3.
- Contorno na cor `INK`, por exemplo uma casca invertida (solidify).
- Uma luz suave e pouca especularidade.
- **Sticker 3D:** render transparente, exportado em 370×320 como os outros, com a borda branca de recorte feita no 2D por cima.

**Regras que continuam valendo:**
- não colocar braços nem pés;
- pivô embaixo, no centro;
- nada sai do quadro;
- rosto simétrico.

**Formatos:**
- `.blend` como fonte, se seguir o caminho do Punchy;
- ou `.glb` (three.js), que também abre na web.

**Status:** os três estão em 3D (three.js). O molde comum fica em `three3d/lib.js`, com um script por personagem: `node three3d/yoru.js`, `node three3d/futo.js` e `node three3d/drizzle.js`. Cada um gera os arquivos `-front.png`, `-34.png` e `.glb`. O Drizzle, por exemplo, gera `out/3d/drizzle-front.png`, `drizzle-34.png` e `drizzle.glb`. Ele é feito de esferas, uma cápsula e o contorno por casca invertida, com o rosto colado na superfície por raycast. O Yoru é um lençol torneado com 7 pontas na barra e abas em cápsula. O Futo é um rolo de cobertor arredondado, com capuz, dobra na frente e bolinhas.

O script usa o Playwright já instalado na máquina. Se o `npm install` baixar outra versão dentro de `node_modules`, apague `node_modules/playwright*`.
