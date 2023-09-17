import axios from 'axios';

// Creates captcha and makes visible to user
export async function initTest(data: {gt: string, challenge: string, new_captcha: string}, sessionId: number, accountId: string) {
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
        document.getElementById("hoyoAuth")!.onclick = () => {
            return captcha.verify();
        };
        document.getElementById("hoyoAuth")!.classList.remove("v-btn--disabled")
        document.getElementById("hoyoAuth")!.removeAttribute("disabled");
        captcha.onSuccess(async () => {
            loginWithGeetest(sessionId, captcha.getValidate(), accountId);
            document.getElementById("hoyoAuth")!.classList.add("v-btn--disabled");
            document.getElementById("hoyoAuth")!.setAttribute("disabled", "disabled");
            document.getElementById("hoyoAuth")!.textContent = "Done!";
        })
    }
    )
}

// Login with successful geetest challenge
async function loginWithGeetest(sessionId: number, gt: string, accountId: string) {
    const payload = {
        "account_id": accountId,
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
        if (response.status == 200) {
            document.getElementById("alertSuccess")!.style.display = "block";
        } 
    }).catch(function(error) {
        console.log(error); 
        document.getElementById("alertError")!.style.display = "block";
    });
}
