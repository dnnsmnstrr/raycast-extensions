import { Form, Detail, ActionPanel, Action, showToast, LocalStorage, confirmAlert, Alert } from "@raycast/api";
import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { formatText, formatPreviewText } from "./utils"
import Preview from "./Preview"
import { Template, callBackFunction } from "./types"

const FONTS = [
  { id: "titilliumweb", name: "Titillium Web Black" },
  { id: "kalam", name: "Kalam Regular" },
  { id: "impact", name: "Impact" },
  { id: "notosans", name: "Noto Sans Bold" }
]

export default function Command() {
  const [text, setText] = useState<string[] | undefined>([]);
  const [font, setFont] = useState<string>("impact");
  const [templates, setTemplates] = useState<Template[] | undefined>([]);
  const [template, setTemplate] = useState<string | undefined>();
  const [templateData, setTemplateData] = useState<Template | undefined>();
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
      setTemplates(json as Array<Template>);
    }
  }

  function updateUrl() {
    const api = "https://api.memegen.link/images"
    const previewApi = "https://api.memegen.link/images/preview.jpg"
    const textToFormat = text && Array.isArray(text) && text.length && text.some(t => !!t) ? text : templateData?.example?.text
    const shareUrl = `${api}/${template}/${formatText(textToFormat)}.jpg?font=${font}${style ? '&style=' + style : ''}`
    setUrl(shareUrl)
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (templates) {
      const templateData = templates.find(({ id }) => id === template)
      setTemplateData(templateData)
      setStyle('default')
      setText(new Array(templateData?.example?.text.length || 2).fill(""))
    }
  }, [template]);

  useEffect(() => {
    updateUrl();
  }, [templateData, text, style, font])

  const updateText = (index: number) => (line: string) => {
    const newText = text ? [...text] : []
    newText[index] = line
    setText(newText)
  }

  function resetText() {
    setText([])
  }

  async function getConfirmation (callback: callBackFunction, action = 'delete it') {
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
    setStyle('default')
    setFont('impact')
  }

  async function fillExample () {
    if (!templateData) return
    const newText = templateData.example.text.map((line: string, index: number) => (text && text[index]) || line) // only replace empty fields
    setText(newText)
  }

  return (
    <Form
      isLoading={!templates || !templates.length}
      actions={
        <ActionPanel>
          {templateData && url && <Action.Push title="Preview" target={<Preview url={url} template={templateData}/>} />}
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
        onChange={setTemplate}
        storeValue
        autoFocus
      >
        {templates && templates.length && templates.map((template: Template) => (
          <Form.Dropdown.Item key={template.id} value={template.id} title={template.name} />
        ))}
      </Form.Dropdown>
      <Form.Separator />
      {templateData && templateData.example && templateData.example.text.map((example: string, index: number) => {
        return (
          <Form.TextField
            key={'line' + index}
            id={'line' + index}
            title={`Line ${index}`}
            value={text && text.length && text[index] || ""}
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
          {templateData.styles.map((id: string) => (
            <Form.Dropdown.Item key={id} value={id} title={id} />
          ))}
        </Form.Dropdown>
      )}
      <Form.Dropdown id="font" title="Font" value={font} onChange={setFont}>
        {FONTS.map((font) => (
          <Form.Dropdown.Item key={font.id} value={font.id} title={font.name} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
