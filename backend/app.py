from flask import Flask, request
from flask_cors import CORS, cross_origin
import aiohttp


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
        return data, 200