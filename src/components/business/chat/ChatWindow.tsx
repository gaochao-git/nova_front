import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
  ThoughtChain,
  XStream,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
  TagsOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space, Splitter, Input, Typography, message } from 'antd';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTocDoneRight from 'markdown-it-toc-done-right';
import markdownItMultimdTable from 'markdown-it-multimd-table';

const renderTitle = (icon, title) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);
const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?',
  },
];
const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 722px;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});
const placeholderPromptsItems = [
  {
    key: '1',
    label: renderTitle(
      <FireOutlined
        style={{
          color: '#FF4D4F',
        }}
      />,
      'Hot Topics',
    ),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(
      <ReadOutlined
        style={{
          color: '#1890FF',
        }}
      />,
      'Design Guide',
    ),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];
const senderPromptsItems = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: (
      <FireOutlined
        style={{
          color: '#FF4D4F',
        }}
      />
    ),
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: (
      <ReadOutlined
        style={{
          color: '#1890FF',
        }}
      />
    ),
  },
];
const roles = {
  ai: {
    placement: 'start',
    typing: {
      step: 5,
      interval: 20,
    },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
};

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

// 自定义渲染函数
const renderMarkdown = (content: string) => (
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

// Dify API configuration
const baseUrl = 'http://127.0.0.1';
const apiKey = 'Bearer app-s1LO3fgBHF0vJc0l9wbmutn8';
const systemPrompt = '你是一个通用AI助手，可以回答各种日常问题。';

function createDifyStream(message: string) {
  const url = `${baseUrl}/v1/chat-messages`;
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'streaming',
      user: 'test-user',
      system_prompt: systemPrompt,
    }),
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status}`);
    }
    return response.body;
  });
}

const Independent = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);
  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);
  const [attachedFiles, setAttachedFiles] = React.useState([]);
  const [messages, setMessages] = React.useState([]);

  // Add Dify state
  const [lines, setLines] = React.useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ==================== Runtime ====================
  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  // ==================== Event ====================
  const onRequest = (message) => {
    // 添加用户消息到聊天
    const userMessage = {
      id: Date.now().toString(),
      message,
      status: 'local',
    };
    
    // 添加一个空的AI消息占位符
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      message: '',
      status: 'loading',
    };
    
    setMessages((prev) => [...prev, userMessage, aiMessage]);
    return aiMessage.id;
  };
  
  const updateAIMessage = (id, message) => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === id ? { ...msg, message, status: 'ai' } : msg
      )
    );
  };

  const onSubmit = async (nextQuestion) => {
    if (!nextQuestion) return;
    
    setIsLoading(true);
    setLines([]);
    
    // 添加用户消息并获取AI消息ID
    const aiMessageId = onRequest(nextQuestion);
    setContent('');
    
    try {
      const readableStream = await createDifyStream(nextQuestion);
      
      if (!readableStream) {
        throw new Error('无法从Dify API获取数据流');
      }
      
      let fullResponse = '';
      
      // Use XStream to read the stream
      for await (const chunk of XStream({
        readableStream,
      })) {
        console.log(chunk);
        setLines((pre) => [...pre, chunk]);
        
        try {
          const parsed = JSON.parse(chunk.data);
          if (parsed.answer) {
            fullResponse += parsed.answer;
            updateAIMessage(aiMessageId, fullResponse);
          }
        } catch (e) {
          console.error('解析响应数据出错:', e);
        }
      }
    } catch (error) {
      console.error('读取Dify流时出错:', error);
      setLines([{ data: JSON.stringify({ event: 'error', message: error.message }) }]);
      updateAIMessage(aiMessageId, `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onPromptsItemClick = (info) => {
    onRequest(info.data.description);
  };
  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };
  const onConversationClick = (key) => {
    setActiveKey(key);
  };
  const handleFileChange = (info) => setAttachedFiles(info.fileList);

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon={<img src="/images/image.png" alt="welcome" style={{ width: 24, height: 24 }} />}
        title="Hello, I'm Ant Design X"
        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }
      />
      <Prompts
        title="Do you want?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );
  const items = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message,
    messageRender: renderMarkdown,
  }));
  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button type="text" icon={<PaperClipOutlined />} onClick={() => setHeaderOpen(!headerOpen)} />
    </Badge>
  );
  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? {
                title: 'Drop file here',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );
  const logoNode = (
    <div className={styles.logo}>
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
      />
      <span>Ant Design X</span>
    </div>
  );

  // ==================== Render =================
  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={
            items.length > 0
              ? items
              : [
                  {
                    content: placeholderNode,
                    variant: 'borderless',
                  },
                ]
          }
          roles={roles}
          className={styles.messages}
        />
        {/* 🌟 提示词 */}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} />
        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={attachmentsNode}
          loading={isLoading}
          className={styles.sender}
        />
      </div>
    </div>
  );
};

// 为 window 对象添加类型定义
declare global {
  interface Window {
    messageInstance: any;
    copyMessageShowing: boolean;
  }
}

export default Independent;