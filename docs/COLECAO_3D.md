# Intenção: a próxima coleção pode ser em 3D

Registrado em 03/11/2026. É uma ideia guardada, não uma decisão de lançamento.

## Por que 3D

- O Drizzle em 3D ficou mais legível de longe e em tamanho pequeno do que o desenho 2D. Volume, luz e contorno grosso aparecem bem na miniatura do feed e no avatar.
- O mesmo modelo serve para muita coisa: sticker, vídeo, avatar, GIF, brinquedo e impressão 3D.
- No NFT dá para ter a imagem renderizada e o `.glb` girável. A OpenSea exibe modelos 3D no `animation_url`.
- Os modelos são feitos por código. Assim, os traços (cor, acessório, expressão, clima) podem ser gerados por combinação, como nas coleções em pixel.

## Ponto de atenção: on-chain

Um `.glb` é muito maior que um SVG. Para uma coleção totalmente on-chain, uma opção é guardar o código e os parâmetros do modelo e montar o 3D no navegador, em vez do arquivo pronto. A outra é um modelo híbrido: a imagem on-chain e o `.glb` em armazenamento permanente.

## Ordem combinada

O produto vem primeiro. Os personagens em 3D são testados nas redes e nos stickers. A coleção vem depois, se o público responder.

## Próximos passos

- **Protótipos de coleção em 3D:** vão ser pedidos a outro Claude, pensando nesta intenção.
- **Base técnica:** `three3d/` (three.js, sombreamento toon, contorno por casca invertida, rosto colado por raycast). O Punchy no Blender (`lucasheyd/timecard`, `engine/punchy3d`) é a referência de animação.
- **Personagens prontos em 3D:** Yoru (de terno e gravata) e Drizzle. O Futo saiu do 3D. Ver `docs/APROVADOS.md`.

## Protótipos de NFT em 3D

São 9 exemplos com o Yoru e o Drizzle. O comando `node three3d/nft.js` gera:
- `out/3d/nft/<id>.png`: a imagem do token, 1024×1024 com fundo;
- `out/3d/nft-<id>.glb`: o modelo;
- `out/3d/nft-grid.png`: a grade com todos.

Traços testados:
- **Yoru:** cor do lençol, terno (com ou sem), gravata, chapéu (festa, coroa, gorro), olhos (pontinho ou fechados felizes) e aba acenando.
- **Drizzle:** cor do corpo e clima (sol, tempestade com raio e gotas, arco-íris, neve), além de coroa e olhos.
- **Raros:** as versões douradas (Yoru e Drizzle com coroa).

Ainda falta decidir:
- a lista final de traços e a raridade;
- o contorno, que some nos fundos escuros e precisa de uma borda clara;
- o arco-íris do Drizzle, que precisa aparecer mais.
