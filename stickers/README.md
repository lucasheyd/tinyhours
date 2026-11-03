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

## Yoru, o escolhido (16 stickers)

O responsável escolheu o Yoru. Ele foi redesenhado com coerência de fantasma:
- **Braços:** não são tubos colados no corpo. São abas do próprio lençol, parte da mesma silhueta.
- **Atuação:** usa o que um fantasma faz: reverência, murchar, esticar de susto, flutuar e sumir ficando transparente, em `nope.` e `brb`.
- **Regra para os próximos personagens:** só desenhar membros que combinam com o corpo, sem forçar mãos e braços onde eles não existem.

O pacote tem 16 stickers. Às 8 reações do dia a dia somam-se as piadas de escritório e de fantasma: `overtime again`, `boo!`, `brb`, `i'm dead lol`, `on my way!`, `meeting again?`, `it's fine.` e `clocked out!`.

```text
node stickers/build-yoru.js
```

Saída em `out/stickers/yoru-set/`:
- `01..16.png`, em 370×320;
- `main.png`, em 240×240;
- `tab.png`, em 96×74.

A folha com os 16 fica em `out/stickers/yoru-set.png`.

## Rodada 2: personagens sem braço forçado

Na primeira rodada, Pomu, Musubi e Lumi foram recusados porque os braços pareciam colados no corpo. A regra agora é que cada personagem age com o que o corpo dele tem:

| Personagem | Ideia | Como age |
|---|---|---|
| Loaf | gato em pose de pão, com as patas sempre escondidas | orelhas (em pé, deitadas, atentas) e rabo (acena, sobe, enrola) |
| Futo | enrolado no cobertor, não quer sair da cama | espia pela metade, se esconde inteiro, balança |
| Burnie | fatia de pão, sempre um pouco queimado (*burnt out*) | fumacinha, migalhas, manteiga, pula da torradeira, fica mais tostado |
| Drizzle | nuvenzinha que mostra o humor no tempo | chuva, tempestade, sol, arco-íris |

```text
node stickers/build-round2.js   # -> out/stickers/round2/
```
