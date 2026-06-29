# Wiki source

These Markdown files are the source for the
[**GitHub Wiki**](https://github.com/WayneTechLab/Control-Lamma-Command/wiki).

GitHub wikis are backed by a separate git repository
(`WayneTechLab/Control-Lamma-Command.wiki.git`). Keeping the pages here lets us
version and review them alongside the code before publishing.

## Pages

| File | Wiki page |
| --- | --- |
| `Home.md` | Landing page |
| `Quick-Start.md` | Quick Start |
| `Architecture-and-Stack.md` | Architecture & Stack |
| `Project-Structure.md` | Project Structure |
| `Environment-Variables.md` | Environment Variables |
| `Security.md` | Security |
| `Setup-Playbook.md` | Setup Playbook (00-12) |
| `Deployment.md` | Deployment |
| `Testing-and-QA.md` | Testing & QA |
| `FAQ.md` | FAQ |
| `_Sidebar.md` | Right-hand navigation |
| `_Footer.md` | Page footer |

## Publishing to the GitHub Wiki

> Enable the wiki once in repo Settings, then create the first page in the UI so
> the `.wiki.git` repo exists.

```bash
git clone https://github.com/WayneTechLab/Control-Lamma-Command.wiki.git /tmp/clc-wiki
cp wiki/*.md /tmp/clc-wiki/
cd /tmp/clc-wiki
git add -A
git commit -m "docs: sync wiki from main repo"
git push
```
