/**
 * shiki 语言别名（仅补充短名与自定义 grammar）
 * 勿添加与 shiki 内置 alias 冲突的项（如 docker ↔ dockerfile）
 */
export const SHIKI_LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  rs: 'rust',
  rb: 'ruby',
  yml: 'yaml',
  md: 'markdown',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  ps: 'powershell',
  ps1: 'powershell',
  pwsh: 'powershell',
  cs: 'csharp',
  'c#': 'csharp',
  'c++': 'cpp',
  h: 'c',
  kt: 'kotlin',
  text: 'plaintext',
  txt: 'plaintext',

  dir: 'tree',
  directory: 'tree',
  'dir-tree': 'tree',
  filesystem: 'tree',
  'fs-tree': 'tree',
  ascii: 'tree',
  struct: 'tree',

  cj: 'cangjie',
  cang: 'cangjie',
};
