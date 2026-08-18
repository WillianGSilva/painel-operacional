from flask import Flask, render_template, jsonify
import requests
import os

app = Flask(__name__)

N8N_TRANSFERENCIAS_URL = os.getenv(
    "N8N_TRANSFERENCIAS_URL",
    "http://204.216.191.191:5678/webhook/transferencias-campinas"
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


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
