import React from 'react';
import { Typography, Card } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// 使用React.memo包装组件，避免不必要的重渲染
const SSHCommandResult = React.memo(({ data }) => {
  // 确保数据存在且有效
  if (!data || !data.command || !data.result) {
    return <div>无效的SSH命令结果数据</div>;
  }

  return (
    <Card 
      size="small" 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CodeOutlined style={{ marginRight: 8 }} />
          <Text strong>SSH命令: {data.command}</Text>
          {data.hostname && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              @{data.hostname}
            </Text>
          )}
        </div>
      }
      style={{ marginBottom: 16, borderLeft: '3px solid #1890ff' }}
    >
      <Paragraph>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: 12, 
          borderRadius: 4,
          maxHeight: '400px',
          overflow: 'auto',
          margin: 0,
          fontSize: '13px',
          fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace'
        }}>
          {data.result}
        </pre>
      </Paragraph>
      {data.executionTime && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          执行时间: {data.executionTime}
        </Text>
      )}
    </Card>
  );
});

export default SSHCommandResult; 