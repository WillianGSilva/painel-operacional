from flask import Flask, render_template, jsonify
import requests
import os

app = Flask(__name__)

N8N_TRANSFERENCIAS_URL = os.getenv(
    "N8N_TRANSFERENCIAS_URL",
    "http://204.216.191.191:5678/webhook/transferencias-campinas"
)

N8N_TRANSFERENCIAS_DETALHE_URL = os.getenv(
    "N8N_TRANSFERENCIAS_DETALHE_URL",
    "http://204.216.191.191:5678/webhook/transferencias-detalhe"
)

N8N_PERFORMANCE_PORTADORES_URL = os.getenv(
    "N8N_PERFORMANCE_PORTADORES_URL",
    "http://204.216.191.191:5678/webhook/performance-portadores"
)

N8N_PERFORMANCE_ROMANEIO_DETALHE_URL = os.getenv(
    "N8N_PERFORMANCE_ROMANEIO_DETALHE_URL",
    "http://204.216.191.191:5678/webhook/performance-romaneio-detalhe"
)

N8N_COMPOSICAO_SUBREGIOES_URL = os.getenv(
    "N8N_COMPOSICAO_SUBREGIOES_URL",
    "http://204.216.191.191:5678/webhook/composicao-subregioes"
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/transferencias")
def api_transferencias():
    try:
        response = requests.get(N8N_TRANSFERENCIAS_URL, timeout=60)
        response.raise_for_status()

        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({
            "erro": True,
            "mensagem": "A consulta demorou mais do que o esperado."
        }), 504

    except requests.exceptions.RequestException as exc:
        return jsonify({
            "erro": True,
            "mensagem": "Não foi possível consultar o n8n.",
            "detalhe": str(exc)
        }), 502

    except ValueError:
        return jsonify({
            "erro": True,
            "mensagem": "O n8n retornou uma resposta inválida."
        }), 502


@app.route("/api/transferencias/detalhe")
def api_transferencias_detalhe():
    from flask import request

    romaneio = (request.args.get("romaneio") or "").strip()

    if not romaneio:
        return jsonify({
            "erro": True,
            "mensagem": "Romaneio não informado."
        }), 400

    try:
        response = requests.get(
            N8N_TRANSFERENCIAS_DETALHE_URL,
            params={"romaneio": romaneio},
            timeout=60
        )
        response.raise_for_status()
        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({
            "erro": True,
            "mensagem": "A consulta do detalhe demorou mais do que o esperado."
        }), 504

    except requests.exceptions.RequestException as exc:
        return jsonify({
            "erro": True,
            "mensagem": "Não foi possível consultar o detalhe no n8n.",
            "detalhe": str(exc)
        }), 502

    except ValueError:
        return jsonify({
            "erro": True,
            "mensagem": "O n8n retornou uma resposta inválida no detalhe."
        }), 502


@app.route("/api/performance")
def api_performance():
    from flask import request
    params = {
        "data_inicio": (request.args.get("data_inicio") or "").strip(),
        "data_fim": (request.args.get("data_fim") or "").strip(),
        "unidade": (request.args.get("unidade") or "").strip(),
        "portador": (request.args.get("portador") or "").strip(),
    }

    try:
        response = requests.get(
            N8N_PERFORMANCE_PORTADORES_URL,
            params=params,
            timeout=90
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.Timeout:
        return jsonify({"erro": True, "mensagem": "A consulta de performance demorou mais do que o esperado."}), 504
    except requests.exceptions.RequestException as exc:
        return jsonify({"erro": True, "mensagem": "Não foi possível consultar a performance no n8n.", "detalhe": str(exc)}), 502
    except ValueError:
        return jsonify({"erro": True, "mensagem": "O n8n retornou uma resposta inválida na performance."}), 502


@app.route("/api/performance/detalhe")
def api_performance_detalhe():
    from flask import request
    romaneio = (request.args.get("romaneio") or "").strip()

    if not romaneio:
        return jsonify({"erro": True, "mensagem": "Romaneio não informado."}), 400

    try:
        response = requests.get(
            N8N_PERFORMANCE_ROMANEIO_DETALHE_URL,
            params={"romaneio": romaneio},
            timeout=90
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.Timeout:
        return jsonify({"erro": True, "mensagem": "A consulta do romaneio demorou mais do que o esperado."}), 504
    except requests.exceptions.RequestException as exc:
        return jsonify({"erro": True, "mensagem": "Não foi possível consultar o romaneio no n8n.", "detalhe": str(exc)}), 502
    except ValueError:
        return jsonify({"erro": True, "mensagem": "O n8n retornou uma resposta inválida no detalhe de performance."}), 502



@app.route("/api/composicao-subregioes")
def api_composicao_subregioes():
    from flask import request

    unidade = (request.args.get("unidade") or "").strip().upper()

    if not unidade:
        return jsonify({"erro": True, "mensagem": "Unidade não informada."}), 400

    try:
        response = requests.get(
            N8N_COMPOSICAO_SUBREGIOES_URL,
            params={"unidade": unidade},
            timeout=90
        )
        response.raise_for_status()
        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({
            "erro": True,
            "mensagem": "A consulta de composição demorou mais do que o esperado."
        }), 504

    except requests.exceptions.RequestException as exc:
        return jsonify({
            "erro": True,
            "mensagem": "Não foi possível consultar a composição no n8n.",
            "detalhe": str(exc)
        }), 502

    except ValueError:
        return jsonify({
            "erro": True,
            "mensagem": "O n8n retornou uma resposta inválida na composição."
        }), 502

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
