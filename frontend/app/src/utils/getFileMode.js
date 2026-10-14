// Monaco language id for a file name.
const LANGUAGES = {
  js: "javascript",
  mjs: "javascript",
  ts: "typescript",
  py: "python",
  java: "java",
  xml: "xml",
  rb: "ruby",
  sass: "scss",
  scss: "scss",
  md: "markdown",
  sql: "mysql",
  json: "json",
  html: "html",
  hbs: "handlebars",
  handlebars: "handlebars",
  go: "go",
  cs: "csharp",
  coffee: "coffeescript",
  litcoffee: "coffeescript",
  css: "css",
  sh: "shell",
  bash: "shell",
  yml: "yaml",
  yaml: "yaml",
};

export const getFileMode = ({ selectedFile }) => {
  const extension = String(selectedFile || "").split(".").pop().toLowerCase();
  return LANGUAGES[extension] || "plaintext";
};

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  mysql: "SQL",
  markdown: "Markdown",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  shell: "Shell",
  yaml: "YAML",
  plaintext: "Düz metin",
};

/** Display name of a Monaco language id ("mysql" → "SQL"). */
export const languageLabel = (language) =>
  LANGUAGE_LABELS[language] || language.charAt(0).toUpperCase() + language.slice(1);
