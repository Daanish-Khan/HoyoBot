import axios from 'axios';
import JSEncrypt from 'JSEncrypt';

const LOGIN_KEY_CERT = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4PMS2JVMwBsOIrYWRluY
wEiFZL7Aphtm9z5Eu/anzJ09nB00uhW+ScrDWFECPwpQto/GlOJYCUwVM/raQpAj
/xvcjK5tNVzzK94mhk+j9RiQ+aWHaTXmOgurhxSp3YbwlRDvOgcq5yPiTz0+kSeK
ZJcGeJ95bvJ+hJ/UMP0Zx2qB5PElZmiKvfiNqVUk8A8oxLJdBB5eCpqWV6CUqDKQ
KSQP4sM0mZvQ1Sr4UcACVcYgYnCbTZMWhJTWkrNXqI8TMomekgny3y+d6NX/cFa6
6jozFIF4HCX5aW8bp8C8vq2tFvFbleQ/Q3CU56EWWKMrOcpmFtRmC18s9biZBVR/
8QIDAQAB
-----END PUBLIC KEY-----
`

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
        initTest(response.data.data, response.data.session_id, account, password)
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
    })
}
