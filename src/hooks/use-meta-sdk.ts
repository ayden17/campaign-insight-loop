import { useEffect } from "react";
import { metaAdsStore } from "@/lib/meta-ads-store";

const APP_ID = "927650746513998";
const API_VERSION = "v25.0";

let _initialized = false;

/**
 * Initializes the Facebook SDK once globally and checks login status.
 * Call this at the app root so Meta session is restored on any page.
 */
export function useMetaSdkInit() {
  useEffect(() => {
    if (_initialized) return;
    _initialized = true;

    const handleStatusChange = (response: { status: string; authResponse?: { accessToken: string; userID: string } }) => {
      if (response.status === "connected" && response.authResponse) {
        const token = response.authResponse.accessToken;
        metaAdsStore.setAccessToken(token);
        // Fetch ad accounts
        window.FB.api(
          "/me/adaccounts",
          { fields: "id,name,account_status,currency", access_token: token } as any,
          (res: any) => {
            if (res?.data) {
              metaAdsStore.setAdAccounts(res.data);
            }
          }
        );
      }
    };

    if (document.getElementById("facebook-jssdk")) {
      if (window.FB) {
        window.FB.getLoginStatus(handleStatusChange);
      }
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        cookie: true,
        xfbml: true,
        version: API_VERSION,
      });
      window.FB.getLoginStatus(handleStatusChange);
    };

    const js = document.createElement("script");
    js.id = "facebook-jssdk";
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.async = true;
    js.defer = true;
    document.body.appendChild(js);
  }, []);
}
