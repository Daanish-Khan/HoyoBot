from flask import Flask, request
from flask_cors import CORS, cross_origin
import json
import aiohttp
import base64
from supabase import create_client, Client
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()
supabase = create_client(os.getenv('DB_URL'), os.getenv('DB_SECRET'))

HEADERS = {
    "x-rpc-app_id": "c9oqaq3s3gu8",
    "x-rpc-client_type": "4",
    "x-rpc-sdk_version": "2.14.1",
    "x-rpc-game_biz": "bbs_oversea",
    "x-rpc-source": "v2.webLogin",
    "x-rpc-referrer": "https://www.hoyolab.com",
    "Origin": "https://account.hoyolab.com",
    "Referer": "https://account.hoyolab.com/"
}

@app.route("/userpass", methods = ['GET'])
async def userpass():
    return {"user": "username", "password": "password"}, 200

@app.route("/challenge", methods = ['GET'])
async def challenge():
    response = supabase.table('decrypted_users').select("decrypted_username, decrypted_password").eq('id', request.args.get("accountid")).execute()
    async with aiohttp.ClientSession() as session:
        r = await session.post(
            "https://sg-public-api.hoyolab.com/account/ma-passport/api/webLoginByPassword",
            json={
                "account": response.data[0].get("decrypted_username"),
                "password": response.data[0].get("decrypted_password"),
                "token_type": 6
            },
            headers=HEADERS,
        )
        data = await r.json()
        if data["retcode"] == -3101:
            aigis = json.loads(r.headers["x-rpc-aigis"])
            aigis["data"] = json.loads(aigis["data"])
            return aigis, 200
    return data, 400

@app.route("/login", methods = ['POST'])
async def login():
    async with aiohttp.ClientSession() as session:
        r = await session.post(
            "https://sg-public-api.hoyolab.com/account/ma-passport/api/webLoginByPassword",
            json={
                "account": request.get_json()["account"],
                "password": request.get_json()["password"],
                "token_type": request.get_json()["token_type"],
            },
            headers={
                **HEADERS,
                "x-rpc-aigis": f"{request.get_json()['session_id']};{base64.b64encode(json.dumps(request.get_json()['gt']).encode()).decode()}",
            }
        )

        data = await r.json()

        cookies = {cookie.key: cookie.value for cookie in r.cookies.values()}
    if not data["data"]:
        return data, 400 
    
    if data["data"].get("stoken"):
        cookies["stoken"] = data["data"]["stoken"]
    
    return cookies, 200
