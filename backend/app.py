from flask import Flask, request
from flask_cors import CORS, cross_origin
import json
import aiohttp
import base64


app = Flask(__name__)
CORS(app)

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

@app.route("/mmt", methods = ['POST'])
async def mmnt():
    async with aiohttp.ClientSession() as session:
        r = await session.post(
            "https://sg-public-api.hoyolab.com/account/ma-passport/api/webLoginByPassword",
            json=request.get_json(),
            headers=HEADERS,
        )
        data = await r.json()
        if data["retcode"] == -3101:
            aigis = json.loads(r.headers["x-rpc-aigis"])
            aigis["data"] = json.loads(aigis["data"])
            return aigis, 200
    return {}, 400

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
