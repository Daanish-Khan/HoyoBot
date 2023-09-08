"""Geetest client component."""
import asyncio
import base64
import json
import typing

import aiohttp
import aiohttp.web
import yarl

import geetest as geetest_utility

import server

__all__ = ["GeetestClient"]


WEB_LOGIN_URL = yarl.URL("https://sg-public-api.hoyolab.com/account/ma-passport/api/webLoginByPassword")


class GeetestClient():
    """Geetest client component."""

    async def login_with_geetest(
        self, account: str, password: str, session_id: str, geetest: typing.Dict[str, str]
    ) -> typing.Mapping[str, str]:
        """Login with a password and a solved geetest.

        Token type is a bitfield of cookie_token, ltoken, stoken.
        """
        payload = {
            "account": geetest_utility.encrypt_geetest_password(account),
            "password": geetest_utility.encrypt_geetest_password(password),
            "token_type": 6,
        }

        print(payload)

        # we do not want to use the previous cookie manager sessions

        async with aiohttp.ClientSession() as session:
            async with session.post(
                WEB_LOGIN_URL,
                json=payload,
                headers={
                    **geetest_utility.HEADERS,
                    "x-rpc-aigis": f"{session_id};{base64.b64encode(json.dumps(geetest).encode()).decode()}",
                },
            ) as r:
                data = await r.json()
                cookies = {cookie.key: cookie.value for cookie in r.cookies.values()}

        if not data["data"]:
            print(data)

        if data["data"].get("stoken"):
            cookies["stoken"] = data["data"]["stoken"]

        return cookies

    async def login_with_password(self, account: str, password: str, *, port: int = 5000) -> typing.Mapping[str, str]:
        """Login with a password.

        This will start a webserver.
        """
        return await server.login_with_app(self, account, password, port=port)

async def main():   
    client = GeetestClient()
    cookies = await client.login_with_password("dishhsr@gmail.com", "DAANISH!")
    print(cookies)

if __name__ ==  '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())