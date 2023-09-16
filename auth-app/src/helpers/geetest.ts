import axios from 'axios';
import JSEncrypt from 'JSEncrypt';

const LOGIN_KEY_CERT = import.meta.env.VITE_PUBLIC_KEY;

async function encrypt(text: string) {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(LOGIN_KEY_CERT);

    return encryptor.encrypt(text);
}

// Creates captcha and makes visible to user
export async function initTest(data: {gt: string, challenge: string, new_captcha: string}, sessionId: number, account: string, password: string) {
    window.initGeetest({
        gt: data.gt,
        challenge: data.challenge,
        new_captcha: data.new_captcha,
        api_server: "api-na.geetest.com",
        lang: "en",
        product: "bind",
        https: false   
    }, (captcha: any) => {
        captcha.appendTo("hoyoAuth");
        document.getElementById("hoyoAuth")!.hidden = false;
        document.getElementById("hoyoAuth")!.onclick = () => {
            return captcha.verify();
        };
        captcha.onSuccess(() => {
            loginWithGeetest(sessionId, captcha.getValidate(), account, password);
        })
    }
    )
}

// Login with successful geetest challenge
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
       console.log(response);
    }).catch(function(error) {
        console.log(error);        
    });
}
