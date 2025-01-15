import { createClient } from "redis";

export const publisher = createClient();
export const subscriber = createClient();
export const listener = createClient();
