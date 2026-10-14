import { toString } from 'mdast-util-to-string';
import { splitFrontmatter } from './frontmatter.js';
import { visit } from 'unist-util-visit';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Root as MdastRoot, Heading } from 'mdast';
import type { Schema } from 'hast-util-sanitize';
import type { CompileOptions, CompileResult, DocFrontmatter, DocHeading, OcpMarkdownPluginId } from './types.js';
import { resolvePlugins } from './plugins/index.js';
import { resolveBrowserCompilePluginList } from './plugins/precompile-plugins.js';
import { containerDirectiveHandler } from './rehype-handlers.js';
import { applyPluggables } from './apply-pluggables.js';

const DEFAULT_PLUGINS: OcpMarkdownPluginId[] = ['gfm', 'slug', 'admonition'];

export { splitFrontmatter } from './frontmatter.js';

/** 从 mdast 提取标题 */
export function extractHeadingsFromMdast(tree: MdastRoot): Omit<DocHeading, 'id'>[] {
  const headings: Omit<DocHeading, 'id'>[] = [];
  visit(tree, 'heading', (node: Heading) => {
    headings.push({
      depth: node.depth,
      text: toString(node).trim(),
    });
  });
  return headings;
}

/** 从编译 HTML 提取 heading id（与 rehype-slug 输出对齐） */
export function extractHeadingIdsFromHtml(html: string, headings: Omit<DocHeading, 'id'>[]): DocHeading[] {
  const idMatches = [...html.matchAll(/<h([1-6])[^>]*\sid="([^"]+)"/g)];
  return headings.map((heading, index) => ({
    ...heading,
    id: idMatches[index]?.[2] ?? slugify(heading.text),
  }));
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildSanitizeSchema(): Schema {
  const schema = structuredClone(defaultSchema) as Schema;

  /** 去掉同名属性旧定义，避免与后续白名单/开放项冲突 */
  function withoutAttr(
    list: NonNullable<Schema['attributes']>[string] | undefined,
    name: string,
  ): NonNullable<Schema['attributes']>[string] {
    return (list ?? []).filter((item) => {
      if (typeof item === 'string') {
        return item !== name;
      }
      return !(Array.isArray(item) && item[0] === name);
    });
  }

  schema.attributes = {
    ...schema.attributes,
    aside: [...(schema.attributes?.aside ?? []), 'className', 'dataAdmonitionType', 'dataAdmonitionTitle'],
    div: [...(schema.attributes?.div ?? []), 'className', 'dataDocDemoId', 'dataDocDemoTitle'],
    details: [...(schema.attributes?.details ?? []), 'className'],
    summary: [...(schema.attributes?.summary ?? []), 'className'],
    pre: [...(schema.attributes?.pre ?? []), 'className', 'dataDocCodeBlock', 'dataLanguage', 'style', 'tabIndex'],
    code: [...(schema.attributes?.code ?? []), 'className', 'dataLanguage', 'style'],
    // defaultSchema 仅允许 footnote 类名；需显式放开文档锚点 / 跨链类
    a: [
      ...withoutAttr(schema.attributes?.a, 'className'),
      ['className', 'doc-heading-anchor', 'doc-cross-link', 'data-footnote-backref'],
      'ariaHidden',
      'tabIndex',
      'dataDocCrossHref',
      'dataDocCrossLink',
    ],
    span: [...(schema.attributes?.span ?? []), 'className', 'dataDocGlossaryTerm', 'style'],
    h1: [...(schema.attributes?.h1 ?? []), 'id', 'className'],
    h2: [...(schema.attributes?.h2 ?? []), 'id', 'className'],
    h3: [...(schema.attributes?.h3 ?? []), 'id', 'className'],
    h4: [...(schema.attributes?.h4 ?? []), 'id', 'className'],
    h5: [...(schema.attributes?.h5 ?? []), 'id', 'className'],
    h6: [...(schema.attributes?.h6 ?? []), 'id', 'className'],
  };
  schema.tagNames = [...(schema.tagNames ?? []), 'aside'];
  return schema;
}

/**
 * 编译 Markdown 为 HTML（SSG 与运行时预览共用入口）
 */
export async function compile(source: string, options: CompileOptions = {}): Promise<CompileResult> {
  const {
    plugins = DEFAULT_PLUGINS,
    sanitize = true,
    autolinkHeadings = true,
  } = options;

  const { frontmatter, body: rawBody } = splitFrontmatter(source);
  const isBrowser = 'window' in globalThis;
  const pluginList = isBrowser
    ? resolveBrowserCompilePluginList(plugins)
    : plugins;
  const resolved = await resolvePlugins(pluginList, { autolinkHeadings });

  let body = rawBody;
  for (const plugin of resolved) {
    if (plugin.preprocess) {
      body = plugin.preprocess(body);
    }
  }

  const remarkPipeline = unified().use(remarkParse);
  for (const plugin of resolved) {
    applyPluggables(remarkPipeline, plugin.remarkPlugins);
  }

  const mdastTree = remarkPipeline.parse(body) as MdastRoot;
  const mdastProcessed = (await remarkPipeline.run(mdastTree)) as MdastRoot;
  const headingStubs = extractHeadingsFromMdast(mdastProcessed);

  const rehypePipeline = unified().use(remarkRehype, {
    allowDangerousHtml: false,
    handlers: {
      containerDirective: containerDirectiveHandler as never,
    },
  });

  for (const plugin of resolved) {
    applyPluggables(rehypePipeline, plugin.rehypePlugins);
  }

  if (sanitize) {
    rehypePipeline.use(rehypeSanitize, buildSanitizeSchema());
  }

  rehypePipeline.use(rehypeStringify);

  const hastTree = await rehypePipeline.run(mdastProcessed);
  const html = String(await rehypePipeline.stringify(hastTree)).trim();
  const headings = extractHeadingIdsFromHtml(html, headingStubs);

  return {
    html,
    frontmatter,
    body: rawBody,
    headings,
  };
}
