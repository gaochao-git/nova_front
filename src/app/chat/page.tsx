'use client';

import RootLayout from '@/components/layout/RootLayout';
import ChatWindow from '@/components/business/chat/ChatWindow';
import { Card, Button, Tooltip } from 'antd';
import { ClearOutlined, QuestionCircleOutlined, HistoryOutlined } from '@ant-design/icons';

export default function ChatPage() {
  return (
    <RootLayout>
      <Card
        title={
          <div className="flex items-center gap-2">
            <span>智能运维助手</span>
            <Tooltip title="基于大模型技术，为您提供智能化的运维服务">
              <QuestionCircleOutlined className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
        }
        extra={
          <div className="flex gap-2 items-center">
            <Button 
              icon={<HistoryOutlined />}
              size="small"
              onClick={() => {/* TODO: 显示历史记录 */}}
            >
              历史记录
            </Button>
            <Button 
              icon={<ClearOutlined />}
              size="small"
              onClick={() => {/* TODO: 清空对话 */}}
            >
              清空对话
            </Button>
          </div>
        }
        className="h-full"
        styles={{
          body: {
            padding: '12px',
            height: 'calc(100% - 57px)' // 减去卡片头部高度
          }
        }}
      >
        <ChatWindow />
      </Card>
    </RootLayout>
  );
} 