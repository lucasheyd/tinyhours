# Stickers: candidatos a mascote

Quatro candidatos, cada um com uma ideia só e as mesmas 8 reações do dia a dia, para comparar de forma justa. Cada um tem ainda um sticker de assinatura com a ideia dele.

| Personagem | Ideia | Sticker de assinatura |
|---|---|---|
| Pomu | o gato do turno da noite, sempre com sono | `5 more min...` |
| Musubi | o onigiri da loja que gruda em você | `stick together!` |
| Yoru | o fantasminha fazendo hora extra, morto por dentro | `overtime again` |
| Lumi | a mariposa que não resiste a uma luz, nem à tela do celular às 3h | `one more video` |

As 8 reações: `hi!`, `ok!`, `thank you`, `sorry...`, `!?`, `good night`, `nope.` e `yay!`.

## Estilo

É mais simples que o dos vídeos, de propósito, porque sticker precisa ser lido em tamanho miniatura:
- olhinhos de ponto e boca pequena;
- uma linha só e cor pastel chapada, com uma sombra suave;
- borda branca de recorte e legenda curta.

Braços e corpo formam uma silhueta só, com juntas macias.

## Gerar

```text
node stickers/build.js
```

Os arquivos saem em `out/stickers/`:
- `<nome>/01..09.png`, em 370×320 com fundo transparente, no tamanho de sticker do LINE;
- `<nome>.png`, a folha de cada personagem;
- `candidatos.png`, com o sticker de assinatura de cada um lado a lado.
