import axios from 'axios';

export async function getChallenge(account_id: string | undefined): Promise<any> {

    if (account_id == undefined) { return null }
    
    return axios({
        method: 'get',
        url: "http://127.0.0.1:5000/challenge",
        params: {accountid: account_id}
    }).then((response) => {
        return response.data;
    }).catch(function (error) {
        console.log(error);
    });
}