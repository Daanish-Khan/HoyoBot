import axios from 'axios';
import JSEncrypt from 'JSEncrypt';


const LOGIN_KEY_CERT = import.meta.env.VITE_PUBLIC_KEY;

export async function create_mmt(account: string, password: string) {
    const payload = {
        "account": await encrypt(account),
        "password": await encrypt(password),
        "token_type": 6
    }

    axios({
        method: 'post',
        url: "http://127.0.0.1:5000/mmt",
        data: payload
    }).then(function (response) {
        initTest(response.data.data, response.data.session_id, account, password);
    }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
        }
    })
    
}

async function encrypt(text: string) {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(LOGIN_KEY_CERT);

    return encryptor.encrypt(text);
}

async function initTest(data: {gt: string, challenge: string, new_captcha: string}, session_id: number, account: string, password: string) {
    window.initGeetest({
        gt: data.gt,
        challenge: data.challenge,
        new_captcha: data.new_captcha,
        api_server: "api-na.geetest.com",
        lang: "en",
        product: "bind",
        https: false   
    }, (captcha) => {
        captcha.appendTo("login");
        document.getElementById("login").hidden = false;
        document.getElementById("login").onclick = () => {
            return captcha.verify();
        };
        captcha.onSuccess(() => {
            loginWithGeetest(session_id, captcha.getValidate(), account, password);
        })
    }
    )
}

async function loginWithGeetest(sessionId: number, gt: string, account: string, password: string) {
    const payload = {
        "account": await encrypt(account),
        "password": await encrypt(password),
        "token_type": 6,
        "session_id": sessionId,
        "gt": gt
    }

    axios({
        method: 'post',
        url: "http://127.0.0.1:5000/login",
        data: payload
    }).then(function (response) {
       console.log(response)
    }).catch(function(error) {
        console.log(error.response.data)
        console.log(error.response.status)
    })
}
