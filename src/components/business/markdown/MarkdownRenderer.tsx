import React from 'react';
import { Typography } from 'antd';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTocDoneRight from 'markdown-it-toc-done-right';
import markdownItMultimdTable from 'markdown-it-multimd-table';

// 配置 markdown-it 和插件
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch (__) {}
    }
    return md.utils.escapeHtml(str);
  }
});

// 使用增强的表格插件
md.use(markdownItMultimdTable, {
  multiline: true,
  rowspan: true,
  headerless: false,
  multibody: true,
  aotolabel: true,
});

md.use(markdownItAnchor);
md.use(markdownItTocDoneRight);

// 自定义 fence 渲染器来添加复制按钮
const defaultFence = md.renderer.rules.fence!;
md.renderer.rules.fence = function(tokens, idx, options, env, self) {
  const token = tokens[idx];
  const code = token.content;
  
  // 获取默认渲染的代码块
  const rawHtml = defaultFence(tokens, idx, options, env, self);
  
  // 添加复制按钮
  return `
    <div style="position: relative;">
      ${rawHtml}
      <button class="copy-btn" 
              style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #d9d9d9; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #666; cursor: pointer;"
              onclick="
                navigator.clipboard.writeText(this.getAttribute('data-code'))
                  .then(() => {
                    this.textContent = '已复制';
                    setTimeout(() => {
                      this.textContent = '复制';
                    }, 2000);
                  });
              "
              data-code="${code.replace(/"/g, '&quot;')}">复制</button>
    </div>
  `;
};

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <Typography>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{
          __html: md.render(content),
        }}
      />
      <style jsx global>{`
        pre {
          position: relative;
          padding-top: 40px;
        }
        .copy-btn:hover {
          color: #40a9ff;
          border-color: #40a9ff;
        }
        /* 简单的表格样式 */
        .markdown-body table {
          display: block;
          width: 100%;
          overflow-x: auto;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .markdown-body table th,
        .markdown-body table td {
          border: 1px solid #dfe2e5;
          padding: 8px 12px;
          text-align: left;
        }
        .markdown-body table th {
          background-color: #f6f8fa;
          font-weight: 600;
        }
        .markdown-body table tr:nth-child(2n) {
          background-color: #f8f8f8;
        }
      `}</style>
    </Typography>
  );
};

// 导出组件和渲染函数
export default MarkdownRenderer;
export const renderMarkdown = (content: string) => <MarkdownRenderer content={content} />; 