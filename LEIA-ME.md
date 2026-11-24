# BELL Soluções em Tecnologia no GitHub Pages

O GitHub Pages hospeda os arquivos estáticos em `public/`. O GitHub Actions
consulta o feed público do @slackjeff e publica os seis vídeos mais recentes,
junto com a página. A atualização está agendada a cada 30 minutos e também roda
quando você envia alterações para a branch padrão.

## Publicar

1. Extraia o ZIP e envie o conteúdo para a raiz do repositório. Inclua a pasta
   oculta `.github/`. O arquivo do fluxo precisa ficar em
   `.github/workflows/pages.yml`.
2. No repositório, acesse **Settings → Pages → Build and deployment → Source**
   e selecione **GitHub Actions**.
3. Na aba **Actions**, abra **Publicar a BELL no GitHub Pages** e clique em
   **Run workflow**. Selecione a branch padrão. O endereço do site aparece no
   ambiente `github-pages` após a publicação.

O agendamento pode sofrer atrasos. Em repositórios públicos, o GitHub pode
desativá-lo após 60 dias sem atividade no repositório. Se isso ocorrer, reative
o fluxo na aba **Actions**. Se o YouTube estiver indisponível e as tentativas
falharem, a última publicação bem-sucedida continua no ar. Na primeira
publicação, execute o fluxo novamente quando o feed voltar a responder.

## Testar localmente

Com Python 3 e acesso ao YouTube, execute na raiz do projeto:

```sh
python3 scripts/atualizar-videos.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
```

Abra http://127.0.0.1:8000. Para o site publicado, o próprio GitHub fornece a
hospedagem e executa a atualização. O arquivo gerado `public/youtube-feed.xml`
é publicado pelo fluxo e pode ficar fora do Git.
