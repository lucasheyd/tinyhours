# Revisão visual — Tiny Hours
Data: 05/11/2026  
Base revisada: `a85493e9c1653abb9c2c1341030afa7c75799160`  
Estado: feedback documentado; nenhuma alteração da arte ou dos documentos de direção aplicada por esta revisão.

## Escopo e evidências

Foram lidos [README.md](../README.md), [APROVADOS.md](APROVADOS.md) e [COLECAO_3D.md](COLECAO_3D.md).

Como as imagens geradas não são versionadas, foi montada uma prévia local de seis stickers diretamente do código:
- `stickers/yoru.js`: poses `SET[0]` e `SET[8]` (hi / overtime again).
- `stickers/limbless.js`: Drizzle `pack[0]` e `pack[12]` (hi / love it).
- Mesmo arquivo: Futo `pack[0]` e `pack[9]` (hi / monday).

A prévia usou o SVG original rasterizado com Sharp, em células de 370×320. Os filtros SVG podem diferir do export oficial em Chromium; qualquer artefato apontado precisa ser confirmado no render oficial antes de alterar a engine.

Não foram assistidas animações completas nem inspecionados renders 3D nesta revisão. Não se deve apresentar este relatório como aprovação da qualidade do movimento ou do 3D.

## Direção vigente a preservar

- Elenco aprovado: Yoru, Drizzle e Futo, conforme APROVADOS.
- Yoru e Drizzle seguem em 3D para animações; Futo permanece somente em 2D.
- A decisão atual em COLECAO_3D é **sem coleção**; figurinos são recursos de conteúdo.
- Preservar paletas, olhos pequenos, proporções, contorno e ausência de membros artificiais.
- Esta revisão não autoriza criar coleção, mudar a direção aprovada ou modificar o TIMECARD/Punchy.

## Avaliação por personagem

### Drizzle

Tem a associação visual mais imediata entre forma e emoção: o clima permite comunicar humor com pouca explicação. A silhueta arredondada funciona como sticker.

Próximo acabamento: conferir respiro para sol, arco-íris, gotas e efeitos nos tamanhos finais; preservar a leitura do rosto quando houver clima e texto juntos. Isso é uma recomendação de composição, não um corte confirmado nesta amostra.

### Yoru

Tem a personalidade mais definida: um fantasminha educado e cansado, com elementos de escritório. As poses de aceno e café comunicam a intenção.

Próximo acabamento: melhorar a separação dos detalhes claros da camisa/roupa em relação ao corpo. Na prévia, alguns desses traços ficam muito discretos. Testar contraste sem mudar a paleta ou tornar o contorno pesado.

### Futo

O cobertor comunica conforto, sono e vontade de ficar em casa. É uma boa base para reações em stickers.

Na prévia de `monday`, há um pequeno degrau na lateral direita, próximo à dobra. Reproduzir no export oficial do Chromium e, se persistir, revisar a união/recorte das formas de cobertor. Não ajustar apenas para compensar uma diferença do rasterizador de revisão.

## Coesão do universo

Os três funcionam individualmente. Para aproximá-los de um mesmo mundo, a sugestão é desenvolver uma cena recorrente da lojinha noturna: balcão, janela com chuva, prateleiras e pequenos objetos reconhecíveis.

Antes de produzir um cenário completo, confirmar como a origem da loja no README se conecta ao elenco aprovado. Evitar introduzir vários ambientes e personagens novos sem essa decisão.

## Inconsistência documental encontrada

O README ainda destaca Pomu, Lumi, Gloop e Hop, enquanto APROVADOS orienta continuar com Yoru, Drizzle e Futo. O README também menciona uma possível coleção futura, mas COLECAO_3D registra a decisão mais recente de não haver coleção.

Recomendação:
1. Apresentar o elenco aprovado no início do README.
2. Identificar o elenco antigo e seus vídeos como histórico, sem apagar fontes.
3. Apontar para APROVADOS como referência de continuidade e para a decisão atual de COLECAO_3D.
4. Descrever separadamente recursos implementados, sugestões e estudos antigos.

Essas correções foram identificadas, mas não aplicadas nesta entrega de documentação.

## Ordem sugerida

1. Alinhar o resumo do projeto com as decisões atuais.
2. Confirmar e corrigir os pequenos acabamentos nos stickers.
3. Revisar as 16 poses de cada personagem em fundo claro e escuro, incluindo tamanhos de sticker, avatar e aba.
4. Prototipar uma cena compartilhada da loja com Yoru e Drizzle, respeitando suas formas e movimentos.
5. Fazer uma revisão própria dos renders 3D e depois das animações completas: rosto, contorno, apoios, continuidade e efeitos.

## Critérios de aceite propostos

- Personagem e emoção legíveis sem depender da legenda.
- Roupa e objetos separados visualmente do corpo.
- Nenhum efeito, legenda ou pose encosta na borda ou sai do quadro.
- Sem degraus involuntários ou costuras visíveis nas formas.
- Cada personagem mantém a paleta e a anatomia aprovadas.
- Qualidade de movimento só é aprovada após ver a sequência completa; uma imagem estática não basta.

Este feedback é qualitativo. Não demonstra preferência do público nem prevê alcance nas redes.
