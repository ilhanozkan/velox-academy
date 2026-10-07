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
