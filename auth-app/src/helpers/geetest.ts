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

async function create_mmt(account: string, password: string) {
    const payload = {
        "account": await encrypt(account),
        "password": await encrypt(password),
        "token_type": 6
    }

    await axios({
        method: 'post',
        url: "http://127.0.0.1:5000/mmt",
        data: payload
    }).then(function (response) {
        console.log(response);
    })
    
}

async function encrypt(text: string) {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(LOGIN_KEY_CERT);

    return encryptor.encrypt(text);
}

export async function test() {
    create_mmt("username", "password");
}

