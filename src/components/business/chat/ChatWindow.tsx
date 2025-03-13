import { useState, useRef, useEffect } from 'react';
import { Input, Button, Space, theme, message, Badge } from 'antd';
import { 
  SendOutlined, 
  AudioOutlined, 
  RobotOutlined, 
  UserOutlined,
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
  LikeFilled,
  DislikeFilled,
  CloudUploadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useTheme } from '@/lib/theme/theme.context';
import { Bubble, Welcome, Attachments, Sender } from '@ant-design/x';
import type { GetProp } from 'antd';
import type { AttachmentsProps } from '@ant-design/x';

interface IMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
  attachments?: GetProp<AttachmentsProps, 'items'>;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachments, setAttachments] = useState<GetProp<AttachmentsProps, 'items'>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const senderRef = useRef<any>(null);
  const { themeMode } = useTheme();
  const { token } = theme.useToken();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage: IMessage = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const assistantMessage: IMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      type: 'assistant',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setAttachments([]);
    setLoading(true);

    // 模拟AI助手回复
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: '我是智能运维助手，正在处理您的请求...',
                timestamp: new Date(),
              }
            : msg
        )
      );
      setLoading(false);
    }, 1000);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      message.success('已复制到剪贴板');
    });
  };

  const handleLike = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, liked: !msg.liked, disliked: false } : msg
    ));
  };

  const handleDislike = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, disliked: !msg.disliked, liked: false } : msg
    ));
  };

  const handleRefresh = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId
        ? { ...msg, content: '正在重新生成回复...', loading: true }
        : msg
    ));

    // 模拟重新生成回复
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId
          ? {
              ...msg,
              content: '这是重新生成的回复内容...',
              loading: false,
              timestamp: new Date(),
            }
          : msg
      ));
    }, 1000);
  };

  const bubbleItems = messages.map(message => ({
    key: message.id,
    role: message.type,
    content: (
      <div>
        <div>{message.content}</div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2">
            <Attachments
              items={message.attachments}
              disabled
              styles={{
                list: {
                  marginTop: 8,
                },
              }}
            />
          </div>
        )}
      </div>
    ),
    loading: loading && message.type === 'assistant' && message.id === messages[messages.length - 1]?.id,
    typing: !loading && message.type === 'assistant',
    avatar: message.type === 'assistant' ? (
      <div className="bg-blue-500 rounded-full p-1">
        <RobotOutlined style={{ color: '#fff' }} />
      </div>
    ) : (
      <div className={`rounded-full p-1 ${themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <UserOutlined style={{ color: themeMode === 'dark' ? '#fff' : '#666' }} />
      </div>
    ),
    footer: (
      <div className="flex items-center justify-between">
        <div className={`text-xs ${
          themeMode === 'dark' ? 'text-white/40' : 'text-gray-400'
        }`}>
          {message.timestamp.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })}
        </div>
        {message.type === 'assistant' && (
          <Space size={token.paddingXXS}>
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />} 
              onClick={() => handleCopy(message.content)}
            />
            <Button 
              type="text" 
              size="small" 
              icon={message.liked ? <LikeFilled /> : <LikeOutlined />}
              onClick={() => handleLike(message.id)}
              className={message.liked ? 'text-blue-500' : ''}
            />
            <Button 
              type="text" 
              size="small" 
              icon={message.disliked ? <DislikeFilled /> : <DislikeOutlined />}
              onClick={() => handleDislike(message.id)}
              className={message.disliked ? 'text-red-500' : ''}
            />
            <Button 
              type="text" 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={() => handleRefresh(message.id)}
              className={`hover:text-blue-500 transition-colors ${
                themeMode === 'dark' ? 'text-white/40' : 'text-gray-400'
              }`}
            />
          </Space>
        )}
      </div>
    )
  }));

  const senderHeader = (
    <Sender.Header
      title="附件"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachments}
        onChange={({ fileList }) => setAttachments(fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? {
                title: '拖拽文件到此处',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传文件',
                description: '点击或拖拽文件到此区域上传',
              }
        }
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </Sender.Header>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto mb-3">
        {messages.length === 0 ? (
          <Welcome
            style={{
              backgroundImage: themeMode === 'dark'
                ? 'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)'
                : 'linear-gradient(97deg, #f2f9fe 0%, #f7f3ff 100%)',
              borderRadius: token.borderRadius,
            }}
            icon={<RobotOutlined style={{ fontSize: 48, color: token.colorPrimary }} />}
            title="您好，我是智能运维助手"
            description="基于大模型技术，为您提供智能化的运维服务。我可以帮助您解决各类运维问题，提供技术支持和建议。"
          />
        ) : (
          <Bubble.List
            items={bubbleItems}
            roles={{
              user: {
                placement: 'end',
                variant: 'filled',
                shape: 'round',
              },
              assistant: {
                placement: 'start',
                variant: themeMode === 'dark' ? 'filled' : 'outlined',
                shape: 'round',
                typing: { interval: 50 },
              }
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={`flex gap-2 p-2 rounded-lg border ${
        themeMode === 'dark' 
          ? 'bg-[#1f1f1f] border-[#303030]' 
          : 'bg-white border-gray-100'
      }`}>
        <Sender
          ref={senderRef}
          header={senderHeader}
          prefix={
            <Badge dot={attachments.length > 0 && !attachmentsOpen}>
              <Button 
                type="text"
                onClick={() => setAttachmentsOpen(!attachmentsOpen)} 
                icon={<LinkOutlined />} 
              />
            </Badge>
          }
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSend}
          actions={
            <Space>
              <Button
                type="text"
                icon={
                  <AudioOutlined 
                    className={`cursor-pointer hover:text-blue-500 transition-colors ${
                      themeMode === 'dark' ? 'text-white/40' : 'text-gray-400'
                    }`}
                  />
                }
                onClick={() => {/* TODO: 实现语音输入 */}}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
              >
                发送
              </Button>
            </Space>
          }
          style={{
            background: themeMode === 'dark' ? '#141414' : '#fff',
            borderColor: themeMode === 'dark' ? '#303030' : token.colorBorder,
          }}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 