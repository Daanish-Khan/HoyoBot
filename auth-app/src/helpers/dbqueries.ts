import axios from 'axios';

export async function getUsernamePassword(sessionId: number): Promise<{user: string, password: string}> {
    axios({
        method: 'get',
        url: "http://127.0.0.1:5000/userpass",
        params: {sessionId: sessionId}
    }).then(function (response) {
        return response.data;
    }).catch(function (error) {
        console.log(error);
    })

    return {user: "", password: ""};
}