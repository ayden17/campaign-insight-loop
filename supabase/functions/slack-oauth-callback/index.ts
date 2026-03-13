import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Get the frontend origin for redirects
    const frontendUrl =
      Deno.env.get("FRONTEND_URL") || "https://ad-whisperer-57.lovable.app";

    if (error) {
      return Response.redirect(
        `${frontendUrl}/settings?slack_error=${encodeURIComponent(error)}`,
        302
      );
    }

    if (!code || !stateParam) {
      return Response.redirect(
        `${frontendUrl}/settings?slack_error=missing_params`,
        302
      );
    }

    // Decode state to get user_id
    let userId: string;
    try {
      const state = JSON.parse(atob(stateParam));
      userId = state.user_id;
    } catch {
      return Response.redirect(
        `${frontendUrl}/settings?slack_error=invalid_state`,
        302
      );
    }

    // Exchange code for token
    const clientId = Deno.env.get("SLACK_CLIENT_ID");
    const clientSecret = Deno.env.get("SLACK_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      throw new Error("Slack credentials not configured");
    }

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/slack-oauth-callback`;

    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.ok) {
      console.error("Slack token exchange failed:", tokenData);
      return Response.redirect(
        `${frontendUrl}/settings?slack_error=${encodeURIComponent(tokenData.error || "token_exchange_failed")}`,
        302
      );
    }

    const botToken = tokenData.access_token;
    const teamId = tokenData.team?.id;
    const teamName = tokenData.team?.name;
    const botUserId = tokenData.bot_user_id;
    const scope = tokenData.scope;

    // Store connection using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: upsertError } = await supabase
      .from("slack_connections")
      .upsert(
        {
          user_id: userId,
          team_id: teamId,
          team_name: teamName,
          bot_access_token: botToken,
          bot_user_id: botUserId,
          scope,
        },
        { onConflict: "user_id,team_id" }
      );

    if (upsertError) {
      console.error("Failed to store slack connection:", upsertError);
      return Response.redirect(
        `${frontendUrl}/settings?slack_error=db_error`,
        302
      );
    }

    // Create #leads-intelligence channel in the client's workspace
    let channelId: string | null = null;
    try {
      const createChannelRes = await fetch(
        "https://slack.com/api/conversations.create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "leads-intelligence",
            is_private: false,
          }),
        }
      );
      const channelData = await createChannelRes.json();

      if (channelData.ok) {
        channelId = channelData.channel.id;
      } else if (channelData.error === "name_taken") {
        // Channel already exists, find it
        const listRes = await fetch(
          "https://slack.com/api/conversations.list?types=public_channel&limit=200",
          {
            headers: { Authorization: `Bearer ${botToken}` },
          }
        );
        const listData = await listRes.json();
        if (listData.ok) {
          const existing = listData.channels?.find(
            (c: { name: string }) => c.name === "leads-intelligence"
          );
          if (existing) channelId = existing.id;
        }
      }

      // Store the channel_id
      if (channelId) {
        await supabase
          .from("slack_connections")
          .update({ channel_id: channelId })
          .eq("user_id", userId)
          .eq("team_id", teamId);

        // Send welcome message
        await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: channelId,
            text: "🎯 *AngelFlows Lead Intelligence* is now connected!\nYou'll receive real-time updates about your leads here.",
          }),
        });
      }
    } catch (channelError) {
      // Non-fatal — connection still works, just no auto-channel
      console.error("Failed to create leads-intelligence channel:", channelError);
    }

    return Response.redirect(
      `${frontendUrl}/settings?slack_connected=true&team=${encodeURIComponent(teamName || "")}`,
      302
    );
  } catch (error) {
    console.error("Error in slack-oauth-callback:", error);
    const frontendUrl =
      Deno.env.get("FRONTEND_URL") || "https://ad-whisperer-57.lovable.app";
    return Response.redirect(
      `${frontendUrl}/settings?slack_error=server_error`,
      302
    );
  }
});
