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
  CopyOutlined,
  DislikeOutlined,
  DislikeFilled,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  LikeOutlined,
  LikeFilled,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ReloadOutlined,
  RobotOutlined,
  ShareAltOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space, message as antMessage, theme } from 'antd';
// 导入渲染函数
import { renderMarkdown } from '../markdown/MarkdownRenderer';

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
// Dify API configuration
const baseUrl = 'http://127.0.0.1';
const apiKey = 'Bearer app-s1LO3fgBHF0vJc0l9wbmutn8';
const systemPrompt = '你是一个通用AI助手，可以回答各种日常问题。';

function createDifyStream(message: string, inputs = {}, conversationId?: string, files = []) {
  const url = `${baseUrl}/v1/chat-messages`;
  
  const requestBody = {
    inputs: inputs || {},  // 使用传入的inputs或默认为空对象
    query: message,
    response_mode: 'streaming',
    conversation_id: conversationId,
    user: 'abc-123',
    files: files,
    system_prompt: systemPrompt,
  };
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify(requestBody),
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
  const { token } = theme.useToken();
  const themeMode = token.colorBgContainer === '#ffffff' ? 'light' : 'dark';

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
  // 添加会话ID和消息ID的状态
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messageId, setMessageId] = useState<string | undefined>();
  const [taskId, setTaskId] = useState<string | undefined>();

  // ==================== Runtime ====================
  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
      setConversationId(undefined);
      setMessageId(undefined);
      setTaskId(undefined);
    }
  }, [activeKey]);

  // 添加停止消息生成的函数
  const stopMessageGeneration = async () => {
    try {
      if (!taskId) {
        console.error('No task ID available to stop generation');
        return false;
      }
      console.log('taskId:', taskId,"messageId:",messageId);
      
      const response = await fetch(`${baseUrl}/v1/chat-messages/${taskId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'abc-123'  // 使用与其他请求一致的 user
        })
      });
      
      const result = await response.json();
      
      // 根据返回结果判断是否成功停止
      if (result.result === 'success') {
        // 停止成功后将loading设置为false
        setIsLoading(false);
        return true;
      } else {
        console.error('Failed to stop message generation:', result.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Failed to stop message generation:', error);
      return false;
    }
  };


  // ==================== Event ====================
  const onRequest = (message) => {
    // 添加用户消息到聊天
    const userMessage = {
      id: Date.now().toString(),
      message,
      status: 'local',
      type: 'user',
      timestamp: new Date(),
      liked: false,
      disliked: false,
    };
    
    // 添加一个空的AI消息占位符
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      message: '',
      status: 'loading',
      type: 'assistant',
      timestamp: new Date(),
      liked: false,
      disliked: false,
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

  // 处理复制消息内容
  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        antMessage.success('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        antMessage.error('复制失败');
      });
  };

  // 处理点赞
  const handleLike = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, liked: !msg.liked, disliked: false } 
          : msg
      )
    );
  };

  // 处理点踩
  const handleDislike = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, disliked: !msg.disliked, liked: false } 
          : msg
      )
    );
  };

  // 处理重新生成回答
  const handleRefresh = (messageId) => {
    // 找到当前消息的前一条用户消息
    const currentIndex = messages.findIndex(msg => msg.id === messageId);
    if (currentIndex > 0) {
      const userMessage = messages[currentIndex - 1];
      // 删除当前消息及之后的所有消息
      setMessages(prev => prev.slice(0, currentIndex));
      // 重新提交用户消息
      onSubmit(userMessage.message);
    }
  };

  const onSubmit = async (nextQuestion: string) => {
    if (!nextQuestion) return;
    
    setIsLoading(true);
    setLines([]);
    
    // 重置消息ID和任务ID
    setMessageId(undefined);
    setTaskId(undefined);
    
    // 添加用户消息并获取AI消息ID
    const aiMessageId = onRequest(nextQuestion);
    setContent('');
    
    try {
      // 传递附件文件ID列表，如果有的话
      const fileIds = attachedFiles.map(file => file.response?.id).filter(Boolean);
      
      const readableStream = await createDifyStream(nextQuestion, {}, conversationId, fileIds);
      
      if (!readableStream) {
        throw new Error('无法从Dify API获取数据流');
      }
      
      let fullResponse = '';
      let chunkCount = 0;
      
      // 使用一个布尔标志跟踪ID是否已设置
      let idsSet = false;
      
      // 使用 XStream 读取流
      for await (const chunk of XStream({
        readableStream,
      })) {
        chunkCount++;
        setLines((pre) => [...pre, chunk]);
        
        try {
          const parsed = JSON.parse(chunk.data);
          
          // 只在IDs未设置时检查
          if (!idsSet) {
            if (parsed.conversation_id) {
              console.log('设置会话ID:', parsed.conversation_id);
              setConversationId(parsed.conversation_id);
            }
            
            if (parsed.message_id) {
              console.log('设置消息ID:', parsed.message_id);
              setMessageId(parsed.message_id);
            }
            
            if (parsed.task_id) {
              console.log('设置任务ID:', parsed.task_id);
              setTaskId(parsed.task_id);
            }
            
            // 如果所有必要的ID都已收到，标记为已设置
            if (parsed.conversation_id && parsed.message_id && parsed.task_id) {
              idsSet = true;
            }
          }
          
          // 处理回答内容
          if (parsed.event === 'message' && parsed.answer !== undefined) {
            fullResponse += parsed.answer;
            updateAIMessage(aiMessageId, fullResponse);
          }
        } catch (e) {
          console.error(`解析数据块 #${chunkCount} 出错:`, e);
        }
      }
      
    } catch (error) {
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
  const items = messages.map(({ id, message, status, type, timestamp, liked, disliked }) => ({
    key: id,
    loading: status === 'loading',
    role: type === 'user' ? 'local' : 'ai',
    content: message,
    messageRender: renderMarkdown,
    avatar: type === 'assistant' ? (
      <div style={{ background: token.colorPrimary, borderRadius: '50%', padding: 4 }}>
        <RobotOutlined style={{ color: '#fff' }} />
      </div>
    ) : (
      <div style={{ 
        background: themeMode === 'dark' ? token.colorBgElevated : token.colorBgLayout, 
        borderRadius: '50%', 
        padding: 4 
      }}>
        <UserOutlined style={{ color: themeMode === 'dark' ? '#fff' : token.colorTextSecondary }} />
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ 
          fontSize: token.fontSizeSM, 
          color: token.colorTextQuaternary 
        }}>
          {timestamp.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })}
        </div>
        {type === 'assistant' && (
          <Space size={token.paddingXXS}>
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />} 
              onClick={() => handleCopy(message)}
            />
            <Button 
              type="text" 
              size="small" 
              icon={liked ? <LikeFilled /> : <LikeOutlined />}
              onClick={() => handleLike(id)}
              style={liked ? { color: token.colorPrimary } : {}}
            />
            <Button 
              type="text" 
              size="small" 
              icon={disliked ? <DislikeFilled /> : <DislikeOutlined />}
              onClick={() => handleDislike(id)}
              style={disliked ? { color: token.colorError } : {}}
            />
            <Button 
              type="text" 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={() => handleRefresh(id)}
              style={{ 
                color: token.colorTextQuaternary,
                transition: 'color 0.3s'
              }}
            />
          </Space>
        )}
      </div>
    )
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
          onCancel={isLoading ? stopMessageGeneration : undefined}
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