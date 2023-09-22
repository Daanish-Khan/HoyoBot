import axios from 'axios';
import { supabase } from './supabaseClient';
import { Ref } from 'vue';

const API_URL = import.meta.env.VITE_API_URL;

// Creates captcha and makes visible to user
export async function initTest(data: {gt: string, challenge: string, new_captcha: string}, sessionId: number, accountId: string, successText: Ref) {
    (window as any).initGeetest({
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
            loginWithGeetest(sessionId, captcha.getValidate(), accountId, successText);
        })
    }
    )
}

// Login with successful geetest challenge
async function loginWithGeetest(sessionId: number, gt: string, accountId: string, successText: Ref) {
    const payload = {
        "account_id": accountId,
        "token_type": 6,
        "session_id": sessionId,
        "gt": gt
    }

    axios({
        method: 'post',
        url: API_URL + "login",
        data: payload
    }).then(function (response) {
        console.log(response)
        if (response.status == 200) {
            document.getElementById("hoyoAuth")!.classList.add("v-btn--disabled");
            document.getElementById("hoyoAuth")!.setAttribute("disabled", "disabled");

			console.log(response.data.retcode)
			if (response.data.retcode != -5003) {
				console.log("a")
				successText.value = 'You have been sucessfully authenticated & have been checked in! You can now close this window.';
			}

            document.getElementById("hoyoAuth")!.textContent = "Done!";
            document.getElementById("success")!.style.display = "block";

			supabase.auth.signOut();
        } 
    }).catch(function(error) {
        console.log(error); 
        document.getElementById("hoyoAuth")!.classList.add("v-btn--disabled");
        document.getElementById("hoyoAuth")!.setAttribute("disabled", "disabled");
        document.getElementById("hoyoAuth")!.textContent = "Error!";
        document.getElementById("error")!.style.display = "block";
    });
}
