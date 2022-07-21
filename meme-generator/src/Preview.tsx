import { Detail, ActionPanel, Action } from "@raycast/api";
import { Template } from "./types"

function Preview({ url, template }: { url: string, template: Template }) {
  return (
    <Detail
      markdown={`<img src="${url}" height="380" />`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Link
            title="Know Your Meme"
            target={template.source}
            text={template.name}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={url} shortcut={{ modifiers: ["cmd"], key: "c" }} />
          <Action.Paste content={url} shortcut={{ modifiers: ["cmd"], key: "v" }} />
          <Action.OpenInBrowser url={url} />
        </ActionPanel>
      }
    />
  );
}

export default Preview;
