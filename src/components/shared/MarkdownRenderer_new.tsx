import React from 'react';
import { Typography } from 'antd';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTocDoneRight from 'markdown-it-toc-done-right';
import markdownItMultimdTable from 'markdown-it-multimd-table';
import ZabbixChart from './ZabbixChart';
import SSHCommandResult from './SSHCommandResult';

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

// 定义组件处理器接口
interface ComponentHandler {
  startTag: string;
  endTag: string;
  render: (data: string, index: number) => React.ReactNode;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 定义所有组件处理器
  const componentHandlers: ComponentHandler[] = [
    {
      startTag: '<chart_data_start>',
      endTag: '<chart_data_end>',
      render: (data, index) => {
        try {
          const parsedData = JSON.parse(data);
          return <ZabbixChart key={`chart-${index}`} data={parsedData} />;
        } catch (error) {
          console.error('渲染图表组件时出错:', error);
          return (
            <div key={`chart-error-${index}`} style={{ color: 'red' }}>
              渲染图表组件时出错: 数据格式无效
            </div>
          );
        }
      }
    },
    // 添加SSH命令结果组件处理器
    {
      startTag: '<ssh_data_start>',
      endTag: '<ssh_data_end>',
      render: (data, index) => {
        try {
          const parsedData = JSON.parse(data);
          return <SSHCommandResult key={`ssh-${index}`} data={parsedData} />;
        } catch (error) {
          console.error('渲染SSH命令结果组件时出错:', error);
          return (
            <div key={`ssh-error-${index}`} style={{ color: 'red' }}>
              渲染SSH命令结果组件时出错: 数据格式无效
            </div>
          );
        }
      }
    },
    // 可以在这里添加更多组件处理器
    // {
    //   startTag: '<table_data_start>',
    //   endTag: '<table_data_end>',
    //   render: (data, index) => {
    //     try {
    //       const parsedData = JSON.parse(data);
    //       return <CustomTable key={`table-${index}`} data={parsedData} />;
    //     } catch (error) {
    //       console.error('渲染表格组件时出错:', error);
    //       return <div>渲染表格组件时出错</div>;
    //     }
    //   }
    // },
  ];
  
  // 处理所有自定义组件
  let processedContent = content;
  const components: Array<{ placeholder: string, node: React.ReactNode }> = [];
  let componentIndex = 0;
  
  // 处理每种类型的组件
  componentHandlers.forEach(handler => {
    let startIndex = processedContent.indexOf(handler.startTag);
    
    while (startIndex !== -1) {
      const endIndex = processedContent.indexOf(handler.endTag, startIndex + handler.startTag.length);
      if (endIndex === -1) break;
      
      // 提取组件数据
      const componentData = processedContent.substring(
        startIndex + handler.startTag.length, 
        endIndex
      ).trim();
      
      // 创建占位符
      const placeholder = `__COMPONENT_PLACEHOLDER_${componentIndex}__`;
      
      // 替换组件数据为占位符
      processedContent = processedContent.substring(0, startIndex) + 
                         placeholder + 
                         processedContent.substring(endIndex + handler.endTag.length);
      
      // 创建组件
      const componentNode = handler.render(componentData, componentIndex);
      components.push({ placeholder, node: componentNode });
      
      // 查找下一个组件
      startIndex = processedContent.indexOf(handler.startTag);
      componentIndex++;
    }
  });
  
  // 渲染Markdown
  const htmlContent = md.render(processedContent);
  
  // 如果没有组件，直接返回渲染后的Markdown
  if (components.length === 0) {
    return (
      <Typography>
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
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
  }
  
  // 将渲染后的HTML分割，并插入组件
  const contentParts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  components.forEach(({ placeholder, node }, index) => {
    const placeholderIndex = htmlContent.indexOf(placeholder, lastIndex);
    
    if (placeholderIndex !== -1) {
      // 添加占位符之前的HTML
      contentParts.push(
        <div 
          key={`html-${index}`} 
          dangerouslySetInnerHTML={{ 
            __html: htmlContent.substring(lastIndex, placeholderIndex) 
          }} 
        />
      );
      
      // 添加组件
      contentParts.push(node);
      
      lastIndex = placeholderIndex + placeholder.length;
    }
  });
  
  // 添加剩余的HTML
  if (lastIndex < htmlContent.length) {
    contentParts.push(
      <div 
        key="html-final" 
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.substring(lastIndex) 
        }} 
      />
    );
  }
  
  return (
    <Typography>
      <div className="markdown-body">
        {contentParts}
      </div>
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