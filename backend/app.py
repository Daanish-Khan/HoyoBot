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
	'x-rpc-app_id': 'c9oqaq3s3gu8',
	'x-rpc-client_type': '4',
	'x-rpc-sdk_version': '2.14.1',
	'x-rpc-game_biz': 'bbs_oversea',
	'x-rpc-source': 'v2.webLogin',
	'x-rpc-referrer': 'https://www.hoyolab.com',
	'Origin': 'https://account.hoyolab.com',
	'Referer': 'https://account.hoyolab.com/'
}

@app.route('/challenge', methods = ['GET'])
async def challenge():
	response = supabase.table('decrypted_users').select('decrypted_username, decrypted_password').eq('id', request.args.get('accountid')).execute()
	async with aiohttp.ClientSession() as session:
		r = await session.post(
			'https://sg-public-api.hoyolab.com/account/ma-passport/api/webLoginByPassword',
			json={
				'account': response.data[0].get('decrypted_username'),
				'password': response.data[0].get('decrypted_password'),
				'token_type': 6
			},
			headers=HEADERS,
		)
		data = await r.json()
		if data['retcode'] == -3101:
			aigis = json.loads(r.headers['x-rpc-aigis'])
			aigis['data'] = json.loads(aigis['data'])
			return aigis, 200
	return data, 400

@app.route('/discordauth', methods = ['POST'])
async def discordauth():
	response = supabase.table('users').update({
		"id": request.get_json()['authid']
	}).eq("discord_id", request.get_json()['discordid']).execute()
	
	return {}, 200

@app.route('/login', methods = ['POST'])
async def login():
	response = supabase.table('decrypted_users').select('decrypted_username, decrypted_password, discord_id').eq('id', request.get_json()['account_id']).execute()
	checkinResponse = ''
	async with aiohttp.ClientSession() as session:
		
		r = await session.post(
			'https://sg-public-api.hoyolab.com/account/ma-passport/api/webLoginByPassword',
			json={
				'account': response.data[0].get('decrypted_username'),
				'password': response.data[0].get('decrypted_password'),
				'token_type': request.get_json()['token_type'],
			},
			headers={
				**HEADERS,
				'x-rpc-aigis': f'{request.get_json()["session_id"]};{base64.b64encode(json.dumps(request.get_json()["gt"]).encode()).decode()}',
			}
		)

		data = await r.json()

		cookies = {cookie.key: cookie.value for cookie in r.cookies.values()}
		
		checkin = await session.post(
			'https://sg-public-api.hoyolab.com/event/luna/os/sign',
			json={ 'act_id': 'e202303301540311' },
			headers={
				'Cookie': 'account_id_v2=' + cookies['account_id_v2'] + ';account_mid_v2=' + cookies['account_mid_v2'] + ';cookie_token_v2=' + cookies['cookie_token_v2'] + ';ltoken_v2=' + cookies['ltoken_v2'] + ';ltuid_v2=' + cookies['ltuid_v2'], 
				'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36' 
			}
		)
		checkinResponse = await checkin.json()

	if not data['data']:
		return data, 400 

	if data['data'].get('stoken'):
		cookies['stoken'] = data['data']['stoken']

	supabase.table('tokens').upsert({
		"discord_id": response.data[0].get('discord_id'),
		**cookies
	}).execute()

	supabase.table('users').update({
		"username": None,
		"password": None
	}).eq('id', request.get_json()['account_id']).execute()

	return checkinResponse, 200

@app.route('/registered_with_token', methods = ['GET'])
async def registered_with_token():
	response = supabase.table('tokens').select('*').eq('discord_id', request.args.get('discord_id')).execute()
	if not response.data:
		return "False", 200
	else:
		return str(response.data[0].get('cookie_v1') != None), 200