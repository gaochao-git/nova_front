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
import React, { useEffect, useState, useRef } from 'react';
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
// 导入 Next.js 的 Image 组件
import Image from 'next/image';

const renderTitle = (icon: React.ReactNode, title: string) => (
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
      height: calc(100vh - 64px);
      min-height: 600px;
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
      overflow-y: auto;
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
          fontSize: 16,
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
    typing: false,
    styles: {
      content: {
        borderRadius: 16,
        background: 'rgba(22, 119, 255, 0.1)',
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

/**
 * 获取会话消息列表
 * @param {string} conversationId - 会话ID
 * @returns {Promise<Array>} 会话消息列表
 */
const getConversationMessages = async (conversationId) => {
  try {
    const response = await fetch(
      `${baseUrl}/v1/messages?user=abc-123&conversation_id=${conversationId}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取会话消息失败:', error);
    throw error;
  }
};

// 获取历史会话列表
const getHistoryConversations = async () => {
  try {
    const response = await fetch(`${baseUrl}/v1/conversations?user=abc-123`, {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取历史会话列表失败:', error);
    throw error;
  }
};

/**
 * 提交消息反馈（点赞/点踩）
 * @param {string} messageId - 消息ID
 * @param {string} rating - 反馈类型 ('like' 或 'dislike')
 * @returns {Promise<Object>} 反馈结果
 */
const submitMessageFeedback = async (messageId, rating) => {
  try {
    const response = await fetch(`${baseUrl}/v1/messages/${messageId}/feedbacks`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: rating,
        user: 'abc-123',
        content: `User ${rating} the message`
      })
    });

    if (!response.ok) {
      throw new Error(`反馈提交失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('提交反馈时出错:', error);
    throw error;
  }
};

const Independent = () => {
  // ==================== Style ====================
  const { styles } = useStyle();
  const { token } = theme.useToken();
  const themeMode = token.colorBgContainer === '#ffffff' ? 'light' : 'dark';

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);
  const [activeKey, setActiveKey] = React.useState<string | undefined>(undefined);
  const [attachedFiles, setAttachedFiles] = React.useState([]);
  const [messages, setMessages] = React.useState([]);

  // Add Dify state
  const [lines, setLines] = React.useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // 添加会话ID和消息ID的状态
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messageId, setMessageId] = useState<string | undefined>();
  const [taskId, setTaskId] = useState<string | undefined>();

  // 使用 useRef 跟踪是否已经加载过历史会话
  const historyLoaded = React.useRef(false);

  // 添加状态来跟踪当前悬浮的消息ID
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // ==================== Runtime ====================
  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
      setConversationId(undefined);
      setMessageId(undefined);
      setTaskId(undefined);
    }
  }, [activeKey]);

  // 组件挂载时只加载一次历史会话
  useEffect(() => {
    // 检查是否已经加载过
    if (!historyLoaded.current) {
      console.log('组件挂载，加载历史会话');
      loadHistoryConversations();
      historyLoaded.current = true;
    } else {
      console.log('已经加载过历史会话，跳过');
    }
  }, []);

  // 添加停止消息生成的函数
  const stopMessageGeneration = async () => {
    try {
      if (!taskId) {
        console.error('No task ID available to stop generation');
        return false;
      }
      console.log('taskId:', taskId, "messageId:", messageId);
      
      // 找到当前正在加载的AI消息
      const loadingMessage = messages.find(msg => msg.loading);
      const loadingMessageId = loadingMessage?.id;
      
      const response = await fetch(`${baseUrl}/v1/chat-messages/${taskId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'abc-123'
        })
      });
      
      const result = await response.json();
      
      // 设置isLoading为false
      setIsLoading(false);
      
      // 使用updateAIMessage更新消息内容和loading状态
      if (loadingMessageId && loadingMessage) {
        // 假设updateAIMessage函数会将loading设置为false
        updateAIMessage(loadingMessageId, loadingMessage.message + "\n\n[已被用户停止]");
      }
      
      if (result.result === 'success') {
        return true;
      } else {
        console.error('Failed to stop message generation:', result.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Failed to stop message generation:', error);
      // 即使出错也要设置isLoading为false
      setIsLoading(false);
      return false;
    }
  };

  // 加载历史会话列表
  const loadHistoryConversations = async () => {
    try {
      const result = await getHistoryConversations();
      console.log('获取到的历史会话:', result);
      const conversationItems = result.data.map((conv, index) => ({
        key: conv.id, // 使用id作为key
        label: conv.name || `对话 ${index + 1}`,
        time: new Date(conv.created_at * 1000).toLocaleString(),
      }));
      
      console.log('格式化后的会话项:', conversationItems);
      setConversationsItems(conversationItems);
    } catch (error) {
      console.error('加载历史会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 修改加载会话消息的函数，正确处理用户和助手消息
  const loadConversationMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      console.log(`正在加载会话消息，会话ID: ${conversationId}`);
      
      // 构建完整的绝对URL
      const url = `${baseUrl}/v1/messages?user=abc-123&conversation_id=${conversationId}`;
      console.log(`请求URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': apiKey
        }
      });

      if (!response.ok) {
        console.error(`请求失败，状态码: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`成功加载消息数据:`, result);
      
      // 处理API返回的数据，创建用户和助手消息对
      const formattedMessages = [];
      
      // 遍历API返回的消息
      result.data.forEach(msg => {
        // 添加用户消息
        if (msg.query) {
          formattedMessages.push({
            id: `user-${msg.id}`,
            message: msg.query,
            type: 'user',
            timestamp: new Date(msg.created_at * 1000),
            loading: false,
            isHistory: true,
            liked: false,
            disliked: false
          });
        }
        
        // 添加助手消息（如果有回答）
        if (msg.answer) {
          // 检查是否有反馈信息
          const hasLike = msg.feedback && msg.feedback.rating === 'like';
          const hasDislike = msg.feedback && msg.feedback.rating === 'dislike';
          
          formattedMessages.push({
            id: msg.id,
            message: msg.answer,
            type: 'assistant',
            timestamp: new Date(msg.created_at * 1000),
            loading: false,
            isHistory: true,
            liked: hasLike,
            disliked: hasDislike
          });
        }
      });
      
      // 按时间戳排序
      formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(formattedMessages);
      setConversationId(conversationId);
    } catch (error) {
      console.error('加载消息时出错:', error);
      antMessage.error('加载消息失败');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };


  // 修改会话点击处理函数，添加手动加载消息的功能
  const onConversationClick = (key) => {
    console.log('点击会话:', key);
    if (key !== activeKey) {
      setActiveKey(key);
    }
    
    // 手动加载消息
    if (key && key !== '0') {
      loadConversationMessages(key);
    } else {
      // 如果是新会话或默认会话，清空消息列表
      setMessages([]);
      setConversationId(undefined);
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
      loading: true,  // 直接使用布尔值
      type: 'assistant',
      timestamp: new Date(),
      liked: false,
      disliked: false,
    };
    
    setMessages((prev) => [...prev, userMessage, aiMessage]);
    return aiMessage.id;
  };
  
  const updateAIMessage = (id, content) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, message: content, loading: false } : msg
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

  // 处理消息反馈（点赞/点踩）
  const handleFeedback = async (messageId, feedbackType) => {
    try {
      // 只处理助手消息
      const message = messages.find(msg => msg.id === messageId);
      if (!message || message.type !== 'assistant') return;
      
      // 确定新的状态
      const isLike = feedbackType === 'like';
      const newLikedState = isLike ? !message.liked : false;
      const newDislikedState = !isLike ? !message.disliked : false;
      
      // 更新UI状态
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, liked: newLikedState, disliked: newDislikedState } 
            : msg
        )
      );
      
      // 如果消息有真实ID（不是前端生成的），则提交反馈
      if (typeof message.id === 'string' && !message.id.startsWith('user-')) {
        // 确定API需要的rating参数
        let rating;
        if (isLike) {
          rating = newLikedState ? 'like' : 'unlike';
        } else {
          rating = newDislikedState ? 'dislike' : 'undislike';
        }
        
        const result = await submitMessageFeedback(message.id, rating);
        console.log('反馈提交结果:', result);
      }
    } catch (error) {
      console.error(`处理${feedbackType}反馈时出错:`, error);
      antMessage.error('提交反馈失败');
    }
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
      
      // 在流式响应完成后，更新消息的最终状态
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId ? { 
            ...msg, 
            message: fullResponse,
            loading: false,
            timestamp: new Date()
          } : msg
        )
      );
      
    } catch (error) {
      setLines([{ data: JSON.stringify({ event: 'error', message: error.message }) }]);
      updateAIMessage(aiMessageId, `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onPromptsItemClick = (info) => {
    onSubmit(info.data.description);
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
  const handleFileChange = (info) => setAttachedFiles(info.fileList);

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon={<img src="/images/assistant.png" alt="welcome" style={{ width: 24, height: 24 }} />}
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

  // 为图标设置一致的尺寸样式
  const iconStyle = {
    fontSize: 16, // 设置统一的图标大小
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // 在渲染消息项时应用统一的图标样式
  const items = messages.map(({ id, message, loading, type, timestamp, liked, disliked, isHistory }) => {
    return {
      key: id,
      loading: loading,
      role: type === 'user' ? 'local' : 'ai',
      content: message,
      typing: false,
      messageRender: renderMarkdown,
      avatar: type === 'assistant' ? (
        <div style={{ 
          background: token.colorBgLayout, 
          borderRadius: '50%', 
          padding: 4,
          width: 28, // 固定宽度
          height: 28, // 固定高度
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image 
            src="/images/assistant.png" 
            alt="AI" 
            width={16} 
            height={16} 
          />
        </div>
      ) : (
        <div style={{ 
          background: themeMode === 'dark' ? token.colorBgElevated : token.colorBgLayout, 
          borderRadius: '50%', 
          padding: 4,
          width: 28, // 固定宽度
          height: 28, // 固定高度
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UserOutlined style={{ 
            color: themeMode === 'dark' ? '#fff' : token.colorTextSecondary,
            fontSize: 16 // 固定图标大小
          }} />
        </div>
      ),
      // 添加鼠标事件处理
      onMouseEnter: () => setHoveredMessageId(id),
      onMouseLeave: () => setHoveredMessageId(null),
      footer: (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 8,
          // 只有当消息被悬浮或者已经有反馈时才显示操作按钮
          opacity: hoveredMessageId === id || liked || disliked ? 1 : 0,
          transition: 'opacity 0.3s'
        }}>
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
                onClick={() => handleFeedback(id, 'like')}
                style={liked ? { color: token.colorPrimary } : {}}
              />
              <Button 
                type="text" 
                size="small" 
                icon={disliked ? <DislikeFilled /> : <DislikeOutlined />}
                onClick={() => handleFeedback(id, 'dislike')}
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
    };
  });
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

  console.log('渲染Conversations组件:', {
    items: conversationsItems,
    activeKey,
    onActiveChange: onConversationClick
  });

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