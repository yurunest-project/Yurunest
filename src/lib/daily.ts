import {
  getDailyRoomUrl,
  ROOM_EXPIRY_BUFFER_MINUTES,
  type PlanDurationKey,
  PLAN_DURATION_MINUTES,
} from "@/lib/constants";

const DAILY_API_URL = "https://api.daily.co/v1";

type DailyRoomResponse = {
  name: string;
  url: string;
  id: string;
};

type CreateRoomInput = {
  durationMinutes: number;
  roomName?: string;
};

function getApiKey() {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error("DAILY_API_KEY is not configured");
  }
  return apiKey;
}

export async function createDailyRoom({
  durationMinutes,
  roomName,
}: CreateRoomInput): Promise<DailyRoomResponse> {
  const name =
    roomName ??
    `yurunest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const exp =
    Math.floor(Date.now() / 1000) +
    (durationMinutes + ROOM_EXPIRY_BUFFER_MINUTES) * 60;

  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      name,
      properties: {
        exp,
        enable_chat: false,
        enable_knocking: true,
        start_video_off: true,
        start_audio_off: false,
        max_participants: 2,
        eject_at_room_exp: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Daily API error: ${error}`);
  }

  return response.json() as Promise<DailyRoomResponse>;
}

export async function createDailyRoomForPlan(plan: PlanDurationKey) {
  const durationMinutes = PLAN_DURATION_MINUTES[plan];
  const room = await createDailyRoom({ durationMinutes });
  return {
    ...room,
    callPath: `/call/${room.name}`,
    callUrl: getDailyRoomUrl(room.name),
    durationMinutes,
  };
}
