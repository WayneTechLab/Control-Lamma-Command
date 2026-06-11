# Wiki source

These Markdown files are the source for the
[**GitHub Wiki**](https://github.com/WayneTechLab/webapp-stack-g1/wiki).

GitHub wikis are backed by a **separate git repository**
(`WayneTechLab/webapp-stack-g1.wiki.git`). Keeping the pages here, in the main
repo, lets us version and review them alongside the code; they are then published
to the wiki repo.

## Pages

| File | Wiki page |
| --- | --- |
| `Home.md` | Landing page |
| `Quick-Start.md` | Quick Start |
| `Architecture-and-Stack.md` | Architecture & Stack |
| `Project-Structure.md` | Project Structure |
| `Environment-Variables.md` | Environment Variables |
| `Security.md` | Security |
| `Setup-Playbook.md` | Setup Playbook (00–12) |
| `Deployment.md` | Deployment |
| `Testing-and-QA.md` | Testing & QA |
| `FAQ.md` | FAQ |
| `_Sidebar.md` | Right-hand navigation |
| `_Footer.md` | Page footer |

## Publishing to the GitHub Wiki

> The wiki must be enabled once: repo **Settings → Features → Wikis**, then create
> the first page in the UI so the `.wiki.git` repo exists.

```bash
# From the repo root:
git clone https://github.com/WayneTechLab/webapp-stack-g1.wiki.git /tmp/wsg1-wiki
cp wiki/*.md /tmp/wsg1-wiki/
cd /tmp/wsg1-wiki
git add -A
git commit -m "docs: sync wiki from main repo"
git push
```

After the first publish, re-run the `cp` + commit + push whenever these files
change.
