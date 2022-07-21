export const escapeSpecialChars = text => {
	let formatted = '';
	const chars = [...text];
	chars.forEach(char => {
		switch (char) {
			case ' ':
				formatted += '_';
				break;
			case '-':
				formatted += '--';
				break;
			case '_':
				formatted += '__';
				break;
			case '?':
				formatted += '~q';
				break;
			case '/':
				formatted += '~s';
				break;
			case '%':
				formatted += '~p';
				break;
			case '#':
				formatted += '~h';
				break;
			case '"':
				formatted += '\'\'';
				break;
			default:
				formatted += char;
		}
	});
	return formatted;
};

export function formatText(lines) {
  if (!lines || !lines.length) return
  console.log(escapeSpecialChars(lines[0]))
  const encoded = lines.map((line) => encodeURIComponent(escapeSpecialChars(line) || " ")).join('/')
  return encoded
}

export function formatPreviewText(lines) {
  if (!lines || !lines.length) return
  return lines.reduce((preview = '', line) => preview + `&text[]=${encodeURIComponent(escapeSpecialChars(line) || " ")}`)
}
