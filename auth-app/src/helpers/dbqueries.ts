import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

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