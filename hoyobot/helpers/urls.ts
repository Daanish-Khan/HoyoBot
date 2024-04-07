class gameURLs {
	readonly CHECK_IN_URL: string;
	readonly CODE_REDEEM_URL: string;

	constructor(urls) {
		this.CHECK_IN_URL = urls.CHECK_IN_URL;
		this.CODE_REDEEM_URL = urls.CODE_REDEEM_URL;
	}
}

const HYV_URLS = {
	GAME_REGION_URL: 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken',
};

const HSR_URLS = new gameURLs({
	CHECK_IN_URL: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
	CODE_REDEEM_URL: 'https://sg-hkrpg-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
});

const GENSHIN_URLS = new gameURLs({
	CHECK_IN_URL: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
	CODE_REDEEM_URL: 'https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
});

function getGameURLS(game: string): gameURLs {
	return game === 'hsr' ? HSR_URLS : GENSHIN_URLS;
}

export { HYV_URLS, getGameURLS };