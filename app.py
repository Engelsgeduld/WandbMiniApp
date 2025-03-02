import os
import sys
from contextlib import contextmanager

import psycopg2
import wandb
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pandas.api.types import is_float_dtype

dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)


def connect_db():
    return psycopg2.connect(
        dbname=os.environ.get("VITE_DATABASE"),
        user=os.environ.get("VITE_DATABASE_USER"),
        password=os.environ.get("VITE_DATABASE_PASSWORD"),
        host=os.environ.get("VITE_DATABASE_HOST"),
        port=os.environ.get("VITE_DATABASE_PORT"),
    )


@contextmanager
def connection():
    conn = connect_db()
    cursor = conn.cursor()
    try:
        yield conn, cursor
    finally:
        cursor.close()
        conn.close()


def setup_database():
    try:
        with connection() as resource:
            conn, cursor = resource
            cursor.execute(
                "\n"
                "        CREATE TABLE IF NOT EXISTS api_keys (\n"
                "            id SERIAL PRIMARY KEY,\n"
                "            api_key TEXT NOT NULL,\n"
                "            username TEXT NOT NULL\n"
                "        )\n"
            )

            conn.commit()
    except psycopg2.OperationalError as e:
        print(str(e), file=sys.stderr)


setup_database()
app = Flask(__name__)
CORS(app)


@app.route("/get_keys", methods=["GET"])
def get_keys():
    telegram_id = request.args.get("telegram_id")
    try:
        with connection() as resource:
            conn, cursor = resource
            cursor.execute(
                "SELECT api_key, username FROM api_keys WHERE id = %s", (telegram_id,)
            )
            keys = cursor.fetchall()
            return jsonify({"keys": [{"key": k[0], "name": k[1]} for k in keys]})
    except psycopg2.OperationalError as e:
        return jsonify({"message": str(e)}), 500


@app.route("/add_key", methods=["POST"])
def add_key():
    data = request.json

    if not data["api_key"]:
        return jsonify({"message": "API ключ не может быть пустым"}), 400
    try:
        with connection() as resource:
            conn, cursor = resource
            cursor.execute(
                "SELECT EXISTS(SELECT 1 FROM api_keys WHERE id = %s AND api_key = %s);",
                (data["telegram_id"], data["api_key"]),
            )
            exists = cursor.fetchone()[0]
            if exists:
                return jsonify({"message": "Этот API ключ уже существует"}), 409
            user = wandb.Api(api_key=data["api_key"]).viewer
            cursor.execute(
                "INSERT INTO api_keys (api_key, username, id) VALUES (%s, %s, %s)",
                (data["api_key"], user.username, data["telegram_id"]),
            )
            conn.commit()
            return jsonify({"username": user.username}), 200
    except AttributeError:
        return jsonify({"message": "Неверный API ключ"}), 401
    except psycopg2.OperationalError as e:
        return jsonify({"message": str(e)}), 500


@app.route("/delete_key", methods=["POST"])
def delete_api_key():
    data = request.json

    if not data["api_key"]:
        return jsonify({"error": "API ключ обязателен"}), 400

    try:
        with connection() as resource:
            conn, cursor = resource
            cursor.execute(
                "DELETE FROM api_keys WHERE api_key = %s AND id = %s RETURNING username",
                (data["api_key"], data["telegram_id"]),
            )
            result = cursor.fetchone()
            conn.commit()
            if result:
                return jsonify({"message": f"API ключ {data['api_key']} удален"}), 200
            else:
                return jsonify({"error": "API ключ не найден"}), 404
    except psycopg2.OperationalError as e:
        return jsonify({"message": str(e)}), 500


@app.route("/get_projects", methods=["POST"])
def get_projects():
    api_key = request.json.get("api_key")
    try:
        projects = wandb.Api(api_key=api_key).projects()
    except AttributeError:
        return jsonify({"message": "Неверный API ключ"}), 401
    return jsonify({"projects": [(proj.id, proj.name) for proj in projects]})


@app.route("/get_runs", methods=["POST"])
def get_runs():
    api_key = request.json.get("api_key")
    project_id = request.json.get("project_id")
    try:
        runs = list(wandb.Api(api_key=api_key).runs(project_id))
    except AttributeError:
        return jsonify({"message": "Неверный API ключ"}), 401
    return jsonify({"runs_list": [(run.id, run.name) for run in runs]})


@app.route("/get_run_data", methods=["POST"])
def get_run_data():
    api_key = request.json.get("api_key")
    project_id = request.json.get("project_id")
    run_id = request.json.get("run_id")
    try:
        run = wandb.Api(api_key=api_key).run(project_id + "/" + run_id)
    except AttributeError:
        return jsonify({"message": "Неверный API ключ"}), 401
    history = run.history()
    metrics = list(
        filter(
            lambda x: x[0] != "_" and is_float_dtype(history[x]),
            history.columns.values.tolist(),
        )
    )
    metrics_date = []
    for metric in metrics:
        metric_date = history[metric].dropna().values.tolist()
        pack = {
            "title": metric,
            "key": metric,
            "data": metric_date,
            "epochs": list(range(len(metric_date))),
        }
        metrics_date.append(pack)

    run_data = {
        "run_id": run.id,
        "name": run.name,
        "date": run.createdAt,
        "status": run.state,
        "metrics": metrics_date,
    }

    return jsonify({"run_data": run_data}), 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=10000)
