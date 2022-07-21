import { Form, Detail, ActionPanel, Action, showToast, LocalStorage, confirmAlert, Alert } from "@raycast/api";
import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { formatText, formatPreviewText } from "./utils"
const DEBUG = false

const FONTS = [
  { id: "titilliumweb", name: "Titillium Web Black" },
  { id: "kalam", name: "Kalam Regular" },
  { id: "impact", name: "Impact" },
  { id: "notosans", name: "Noto Sans Bold" }
]

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

function Preview({ url, template }) {

  return (
    <Detail
      markdown={`<img src="${url}" height="400" />`}
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


export default function Command() {
  const [text, setText] = useState<string[]>([]);
  const [font, setFont] = useState<string>("impact");
  const [templates, setTemplates] = useState<string[] | undefined>([]);
  const [template, setTemplate] = useState<string | undefined>();
  const [templateData, setTemplateData] = useState<object | undefined>();
  const [style, setStyle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();

  async function loadTemplates() {
    const item = await LocalStorage.getItem<string>("templates");
    if (item) {
      setTemplates(JSON.parse(item))
    } else {
      const response = await fetch("https://api.memegen.link/templates")
      const json = await response.json();
      await LocalStorage.setItem("templates", JSON.stringify(json));
      setTemplates(response)
    }
  }

  function updateUrl() {
    const api = "https://api.memegen.link/images"
    const previewApi = "https://api.memegen.link/images/preview.jpg"
    const shareUrl = `${api}/${template}/${formatText(text && text.length ? text : templateData?.example?.text)}.jpg?font=${font}${style ? '&style=' + style : ''}`
    const previewUrl = `${previewApi}?template=${template}${formatPreviewText(text && text.length ? text : templateData?.example?.text)}`
    setUrl(shareUrl)
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const templateData = templates.find(({ id }) => id === template)
    setTemplateData(templateData)
    setStyle('default')
  }, [template]);

  useEffect(() => {
    updateUrl();
  }, [templateData, text, style, font])

  const updateText = index => line => {
    const newText = [...text]
    newText[index] = line
    setText(newText)
  }

  function resetText() {
    setText([])
  }

  function changeTemplate(id) {
    resetText()
    setTemplate(id)
  }

  async function getConfirmation (callback, action = 'delete it') {
    const options: Alert.Options = {
      title: "Text entered",
      message: `You have entered some text, are you sure you want to ${action}?`,
      primaryAction: {
        title: "Yes",
        onAction: callback,
      },
    };
    await confirmAlert(options);
  }

  async function resetFields() {
    if (text && text.length) {
      getConfirmation(resetText)
    } else {
      resetText()
    }
    setStyle()
    setFont('impact')
  }

  async function fillExample () {
    const newText = templateData.example.text.map((line, index) => text[index] || line) // only replace empty fields
    setText(newText)
  }

  return (
    <Form
      isLoading={!templates || !templates.length}
      actions={
        <ActionPanel>
          <Action.Push title="Preview" target={<Preview url={url} template={templateData}/>} />
          <Action title="Fill example text" onAction={fillExample} />
          <Action title="Reset fields" onAction={resetFields} />
        </ActionPanel>
      }
    >
      <Form.Description text="Select a template and add your own text below" />
      <Form.Dropdown
        id="template"
        title="Template"
        value={template}
        onChange={changeTemplate}
        storeValue
        autoFocus
      >
        {templates.length && templates.map(template => (
          <Form.Dropdown.Item key={template.id} value={template.id} title={template.name} />
        ))}
      </Form.Dropdown>
      <Form.Separator />
      {templateData && templateData.example && templateData.example.text.map((example, index) => {
        return (
          <Form.TextField
            key={'line' + index}
            id={'line' + index}
            title={`Line ${index}`}
            value={text && text[index]}
            onChange={updateText(index)}
            placeholder={example}
          />
        )
      })}
      {templateData && templateData.styles && templateData.styles.length && (
        <Form.Dropdown
          id="styles"
          title="Style"
          value={style}
          onChange={setStyle}
        >
          {templateData.styles.map(id => (
            <Form.Dropdown.Item key={id} value={id} title={id} />
          ))}
        </Form.Dropdown>
      )}
      <Form.Dropdown id="font" title="Font" value={font} onChange={setFont}>
        {FONTS.map((font) => (
          <Form.Dropdown.Item key={font.id} value={font.id} title={font.name} />
        ))}
      </Form.Dropdown>
      {DEBUG && <Form.Description text={url} />}
    </Form>
  );
}
