import { Token } from '../types';

function buildTokenString(token: Token | string) {

	if (typeof token !== 'string') {
		if (token.cookie_v1 != null) {
			token = token.cookie_v1;
		} else {
			token = tokenToString(token);
		}
	}

	return token;

}

function tokenToString(token: Token) {
	return `account_id_v2=${token.account_id_v2};account_mid_v2=${token.account_mid_v2};cookie_token_v2=${token.cookie_token_v2};ltoken_v2=${token.ltoken_v2};ltuid_v2=${token.ltuid_v2}`;
}

export { buildTokenString };