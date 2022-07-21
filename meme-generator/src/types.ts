
export type callBackFunction = () => void;

export type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

export interface TemplateExample {
  text: Array<string>;
}
export interface Template {
  id: string;
  name: string;
  styles: Array<string>;
  source: string;
  example: TemplateExample;
}
