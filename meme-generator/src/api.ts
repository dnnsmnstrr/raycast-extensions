import { LocalStorage } from "@raycast/api";
import { Template } from "./types";
import fetch from "node-fetch";

export async function fetchTemplates(): Promise<Template[]> {
  let apiUrl = "https://api.memegen.link/templates";
  const item = await LocalStorage.getItem<string>("templates");

  if (item) {
    return JSON.parse(item)
  } else {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    return (await response.json()) as Template[];
  }
  throw new Error("No templates found");
}
