import axios from 'axios';

export async function getChallenge(account_id: string) {
    axios({
        method: 'get',
        url: "http://127.0.0.1:5000/challenge",
        params: {account_id: account_id}
    }).then(function (response) {
        return response;
    }).catch(function (error) {
        console.log(error);
    });
}