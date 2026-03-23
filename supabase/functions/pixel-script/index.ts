import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pixelId = url.pathname.split("/").pop();

  if (!pixelId) {
    return new Response("Missing pixel ID", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  // Serve tracking JS
  const script = `
(function(){
  var PIXEL_ID = "${pixelId}";
  var ENDPOINT = "${supabaseUrl}/functions/v1/identify-visitor";
  var LS_KEY = "_pxl_uid_" + PIXEL_ID;

  function getUid(){
    var uid = localStorage.getItem(LS_KEY);
    if(!uid){
      uid = 'v_' + Math.random().toString(36).substr(2,12) + Date.now().toString(36);
      localStorage.setItem(LS_KEY, uid);
    }
    return uid;
  }

  function send(ip){
    var data = {
      pixel_id: PIXEL_ID,
      visitor_uid: getUid(),
      page_url: window.location.href,
      referrer: document.referrer || null,
      ip_address: ip || null
    };
    if(navigator.sendBeacon){
      navigator.sendBeacon(ENDPOINT, JSON.stringify(data));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", ENDPOINT, true);
      xhr.setRequestHeader("Content-Type","application/json");
      xhr.send(JSON.stringify(data));
    }
  }

  // Get IP then send
  fetch("https://api.ipify.org?format=json")
    .then(function(r){return r.json()})
    .then(function(d){send(d.ip)})
    .catch(function(){send(null)});
})();
`;

  return new Response(script, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
    },
  });
});
