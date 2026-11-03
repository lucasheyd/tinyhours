# Como desenhar corpos fofos (pesquisa e regras)

Os corpos têm sido o ponto fraco dos projetos. Este guia junta o que funciona em chibi, pelúcia, mascote e animação, e o que já está implementado em `art/body.js`. Vale para o Tiny Hours, para projetos anteriores e para os próximos.

## 1. Proporção

- **Cabeça grande.** Em chibi a altura total é de 2 a 4 cabeças; quanto menos cabeças, mais fofo. Bichos fofos usam cabeça igual ao corpo (1:1) ou maior, como filhote.
- **Tronco igual às pernas, ou tronco maior.** Tronco longo e perna curta lembra boneca; perna longa envelhece o personagem.
- **Sem pescoço.** Em 2 cabeças o pescoço some e a cabeça "afunda" no tronco. A ligação precisa estar no lugar certo, com a cabeça na frente do tronco e não equilibrada em cima.
- **Ombro caído e estreito, quadril largo.** Ombro largo deixa o personagem "bruto" e tira a fofura. O formato de pera ou triângulo, com o peso embaixo, é o mais fofo.

## 2. Forma (nada de círculo perfeito)

- **Ovo, pera, feijão, oval quadrado.** Círculo perfeito fica previsível e "de clip-art".
- **Silhueta legível.** O personagem precisa ser reconhecido só pela sombra. Bracinhos saindo da silhueta, pés aparecendo embaixo e rabo e orelhas quebram o contorno.
- **Reta contra curva.** Um lado mais reto (costas, parte de trás do braço) e o outro mais curvo (barriga, palma). A reta dá estrutura e a curva dá carne e maciez.
- **Evite paralelos e tangentes.** Duas linhas paralelas cansam o olho. Contornos que só se encostam também ficam ruins. Ou sobrepõe de verdade, ou separa.

## 3. Volume e maciez

- **Sobreposição.** As formas entram umas nas outras: a cabeça na frente do tronco, o braço saindo de dentro do tronco, o tronco por cima do pé. É isso que dá cara de pelúcia costurada.
- **Sombra da cabeça no peito.** É a dica de profundidade mais barata que existe. Uma meia-lua escura logo abaixo do queixo.
- **Barriga.** Uma mancha mais clara que segue a curva do tronco e fica um pouco abaixo do centro, onde o peso está. Uma linha fina e incompleta em cima da barriga dá o "dobrinha".
- **Sombra de forma.** Uma meia-lua do lado contrário à luz, com hachura, a mesma da cabeça.
- **Linha.** Contorno externo grosso e linhas internas finas (barriga, dedinhos). O traço fica mais grosso do lado da sombra.

## 4. Mãos, pés e barriga

- **Braço:**
  - Tubo grosso. Braço fino envelhece e tira a fofura.
  - Um pouco mais largo perto da mão, como um tacinho.
  - Sempre com uma leve dobra no cotovelo. Braço reto vira palito.
- **Mão:**
  - Uma luva: a massa dos quatro dedos mais um polegar.
  - Em bicho, palma com almofadinha rosa e três bolinhas quando ela está virada para nós, por exemplo acenando.
- **Pernas:**
  - Quase só os pés. Feijões curtos encaixados embaixo do tronco, com as pontas um pouco para fora.
  - Duas dobrinhas de dedo no pé.
- **Sentado:** os pés vão para frente com a sola virada para nós. A sola tem uma almofada grande e três dedinhos, os toe beans. É a pose mais fofa que existe.
- **Detalhe:** só o suficiente para reconhecer a espécie. Detalhe demais mata a fofura.

## 5. Movimento e pose

- **Linha de ação.** O corpo segue uma curva, não uma vertical dura. Personagem em pé, reto, parece de madeira.
- **Assimetria.** Um braço diferente do outro, a cabeça levemente inclinada, um pé mais para frente.
- **Comprimir e esticar.** O volume se mantém: quando amassa, alarga. Acontece na queda, no pulo e no susto.
- **Sobreposição de ação.** As partes chegam em tempos diferentes. Orelha, rabo e braço atrasam um pouco em relação ao corpo.
- **Arcos.** Mão e cabeça se movem em curva, nunca em linha reta.
- **Respiração.** A barriga infla bem pouco quando o personagem está parado ou dormindo. Isso dá vida mesmo sem ação.
- **Contexto fofo.** Uma atividade simples, como segurar algo, cochilar ou acenar, aumenta a fofura.

## 6. O que está no código (`art/body.js`)

- **Tronco em pera:**
  - Ombro com 0,5 da largura da cabeça.
  - Quadril com 0,76 da largura da cabeça, ou 0,86 quando sentado.
  - Fundo arredondado e achatado.
  - O topo fica escondido sob a cabeça.
- **Barriga:** mais clara e, no traço da pelagem `belly`, na segunda cor. Tem a linha de dobrinha.
- **Sombra da cabeça no peito, hachura de sombra e colete:** o colete fica recortado pelo tronco e segue a forma dele.
- **Braço:**
  - Tubo de grossura 30 a 35, que cresce na direção da mão, com cotovelo dobrado para fora.
  - Termina numa mão de luva de raio 41 com polegar.
  - A raiz do braço não tem contorno, então ele sai de dentro do tronco sem "costura".
- **Poses de braço:** `down`, `hip`, `wave`, `hold`, `up` e `hug`. Também há `swing`, para balançar, e `breath`, para respirar.
- **Pés:**
  - Em pé: feijões com dedos.
  - Sentado (`sit`): sola com almofadas.
  - Pássaro: três dedinhos laranja.

```js
who('lumi', { pose: { sit: true, arms: ['hug', 'hug'] } })
who('hop',  { pose: { arms: ['hip', 'wave'], swing: Math.sin(f / 4) } })
```

Para conferir: `node art/bodies.js` gera `out/corpos.png`, com o elenco e 4 espécies nas 4 poses.

## 7. Para os projetos em pixel (48×48 e similares)

As mesmas regras, mas em poucos pixels:

- **Tronco:** em pera com 2 a 3 px a mais de cada lado no quadril, sem pescoço. A cabeça cobre 1 a 2 linhas do tronco.
- **Sombra da cabeça:** uma linha de dither ou de tom escuro logo abaixo do queixo.
- **Braço:** de 3 a 4 px de grossura, nunca 1 a 2. A mão é um bloco de 4×4 com 1 px de polegar. O braço sai de dentro do tronco, sem contorno na raiz.
- **Pés:** dois feijões de 5×3 para fora, com o tronco por cima.
- **Silhueta:** precisa ler em preto chapado. Teste com a cor de tinta pura.

## 8. Próximos passos

- Vista 3/4 com tronco virado, braço de trás menor e mais escuro.
- Rabo e orelhas com atraso de movimento (follow-through) nos vídeos.
- Poses de corrida com pés alternando e comprimir/esticar no passo.
- Biblioteca de gestos: dar tchau, bocejar, pular de alegria, se espreguiçar.

## Fontes

- [Clip Studio: Easy steps to creating chibi characters](https://clipstudio.net/how-to-draw/archives/155423)
- [Clip Studio Tips: Animal and human chibis](https://tips.clip-studio.com/en-us/articles/4888)
- [Clip Studio Tips: Drawing cute creatures](https://tips.clip-studio.com/en-us/articles/7175)
- [Creative Bloq: 10 tips for kawaii character design](https://creativebloq.com/character-design/10-tips-kawaii-character-design-514833)
- [Creative Bloq: How to simplify figures for animation](https://www.creativebloq.com/how-to/simplfy-figures-for-animation)
- [AWN Toon Institute: character construction](https://www.awn.com/tooninstitute/lessonplan/charconst.htm)
- [Pixune: the principle of appeal in animation](https://pixune.com/blog/the-principle-of-appeal-in-animation/)
- [Easy Drawing Guides: sitting cartoon dog](https://easydrawingguides.com/how-to-draw-a-sitting-cartoon-dog/)
