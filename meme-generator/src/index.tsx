import {
  Form,
  Detail,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Toast,
  LocalStorage,
  confirmAlert,
  Alert,
  popToRoot,
} from "@raycast/api";
import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { Template, callBackFunction } from "./types"
import { formatText, formatPreviewText } from "./utils"
import { fetchTemplates } from "./api"
import Preview from "./Preview"

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
  const [template, setTemplate] = useState<string | undefined>('default');
  const [templateData, setTemplateData] = useState<Template | undefined>();
  const [style, setStyle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();

  async function loadTemplates() {
    try {
      const templates = await fetchTemplates();
      setTemplates(templates);
    } catch (err: any) {
      showToast(Toast.Style.Failure, "Something went wrong", err.message);
      popToRoot();
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function updateUrl() {
    const api = "https://api.memegen.link/images"
    const previewApi = "https://api.memegen.link/images/preview.jpg"
    const textToFormat = text && Array.isArray(text) && text.length && text.some(t => !!t) ? text : templateData?.example?.text
    const shareUrl = `${api}/${template}/${formatText(textToFormat)}.jpg?font=${font}${style ? '&style=' + style : ''}`
    setUrl(shareUrl)
  }

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

  function resetFields() {
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
          {template && template !== 'default' && <Action title="Fill example text" onAction={fillExample} />}
          {text && text.length && text.some(t => !!t) && <Action title="Reset fields" onAction={resetFields} icon={Icon.Trash} shortcut={{ modifiers: ["cmd"], key: "backspace" }}/>}
        </ActionPanel>
      }
    >
      <Form.Description text="Select a template and add your own text below" />
      <Form.Dropdown
        id="template"
        title="Template"
        value={template}
        onChange={setTemplate}
        autoFocus
      >
        <Form.Dropdown.Item value="default" title="Choose template" />
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
      {templateData && templateData.styles && templateData.styles.length > 1 && (
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
