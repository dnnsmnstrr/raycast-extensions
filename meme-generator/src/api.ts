import { LocalStorage, showToast, Toast } from "@raycast/api";
import { Template } from "./types";
import fetch from "node-fetch";

export async function fetchTemplates(forceRefresh: boolean = false): Promise<Template[]> {
  let apiUrl = "https://api.memegen.link/templates";
  const item = await LocalStorage.getItem<string>("templates");

  if (item && !forceRefresh) {
    return JSON.parse(item)
  } else {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    const templates: Template[] = await response.json();
    await showToast({ title: "Downloaded templates", message: `${templates.length} templates currently available` });
    return templates;
  }
  throw new Error("No templates found");
}
