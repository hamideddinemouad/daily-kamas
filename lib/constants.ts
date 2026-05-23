export const SERVER_OPTIONS = [
  "draco",
  "imagiro",
  "orukam",
  "tylezia",
  "hellmina",
  "talkasha",
] as const;

export type ServerOption = (typeof SERVER_OPTIONS)[number];
