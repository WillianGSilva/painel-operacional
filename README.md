# Painel Operacional

Dashboard responsivo com três áreas:

- Transferências para Campinas
- Performance dos Portadores
- Notas em Aberto

A primeira área já está conectada ao webhook do n8n.

## Rodar localmente

```bash
pip install -r requirements.txt
python app.py
```

Acesse:

```text
http://localhost:5000
```

## Render

Build command:

```text
pip install -r requirements.txt
```

Start command:

```text
gunicorn app:app
```

Variável de ambiente:

```text
N8N_TRANSFERENCIAS_URL=http://204.216.191.191:5678/webhook/transferencias-campinas
```

## Importante

O front não consulta diretamente o n8n. O navegador chama `/api/transferencias` no Flask e o Flask consulta o n8n.

Os dados só são atualizados quando o usuário clica em **Atualizar dados**.
