import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export async function updateUser(authId: string | undefined, discordId: string | undefined): Promise<any> {
	if (authId == undefined || discordId == undefined) { console.log("ERROR: USER NOT PROPERLY AUTHENTICATED") }
	
	return axios({
		method: 'post',
		url: API_URL + "discordauth",
		data: {
			"authid": authId,
			"discordid": discordId
		}
	}).then((response) => {
		return response.data;
	}).catch(function (error) {
		console.log(error);
	});
}

export async function getChallenge(account_id: string | undefined): Promise<any> {
    if (account_id == undefined) { return null }
    
    return axios({
        method: 'get',
        url: API_URL + "challenge",
        params: {accountid: account_id}
    }).then((response) => {
        return response.data;
    }).catch(function (error) {
        console.log(error);
    });
}

