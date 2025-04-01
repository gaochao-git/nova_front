'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Tabs, Row, Col, Typography, Space, Tag, Avatar, Modal, Form, Select, Upload, Divider, message } from 'antd';
import { SearchOutlined, PlusOutlined, HeartOutlined, EyeOutlined, UserOutlined, StarOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const AgentPage: React.FC = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [activeButton, setActiveButton] = useState('discover'); // Default to discover
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Categories for the agent
  const agentCategories = [
    { key: 'all', name: '全部分类' },
    { key: 'troubleshooting', name: '故障排查' },
    { key: 'log_analysis', name: '日志分析' },
    { key: 'code', name: '代码' },
    { key: 'security_audit', name: '安全审计' },
    { key: 'other', name: '其他' },
  ];

  // Mock data for featured agents with section and category information
  const featuredAgents = [
    {
      id: '1',
      name: '健康助手',
      avatar: '/images/agents/health.png',
      description: 'TA是您贴身的健康助手，随时准备为您的私人健康提供建议',
      likes: '2000+',
      views: '8000+',
      favorites: '500+',
      official: true,
      section: 'discover',
      categories: ['log_analysis', 'all'],
    },
    {
      id: '2',
      name: '互联网黑话大师',
      avatar: '/images/agents/internet.png',
      description: '深谙互联网底层逻辑，在垂直赛道深耕细作，具有全栈思维',
      likes: '300+',
      views: '1000+',
      favorites: '120+',
      official: true,
      section: 'discover',
      categories: ['code', 'other', 'all'],
    },
    {
      id: '3',
      name: '厚涂风小画家',
      avatar: '/images/agents/artist.png',
      description: '一个特别擅长绘制厚涂风格的高手',
      likes: '300+',
      views: '6000+',
      favorites: '200+',
      official: true,
      section: 'discover',
      categories: ['troubleshooting', 'all'],
    },
    // Example of a user's own agent
    {
      id: '4',
      name: '我的助手',
      avatar: '/images/agents/assistant.png',
      description: '我创建的个人助手',
      likes: '5+',
      views: '20+',
      favorites: '0+',
      official: false,
      section: 'my',
      categories: ['log_analysis', 'all'],
    },
    // Example of a favorite agent
    {
      id: '5',
      name: '旅行规划师',
      avatar: '/images/agents/travel.png',
      description: '帮您规划完美旅行路线，提供景点和美食推荐',
      likes: '1500+',
      views: '5000+',
      favorites: '300+',
      official: true,
      section: 'favorites',
      categories: ['log_analysis', 'all'],
    },
    {
      id: '6',
      name: '代码助手',
      avatar: '/images/agents/coding.png',
      description: '解决编程问题，提供代码示例和最佳实践',
      likes: '800+',
      views: '3000+',
      favorites: '100+',
      official: true,
      section: 'favorites',
      categories: ['code', 'all'],
    },
    // Adding Python and Java specific code assistants
    {
      id: '7',
      name: 'Python助手',
      avatar: '/images/agents/python.png',
      description: '专注于Python编程问题，提供代码优化和调试建议',
      likes: '1200+',
      views: '4500+',
      favorites: '200+',
      official: true,
      section: 'discover',
      categories: ['code', 'all'],
    },
    {
      id: '8',
      name: 'Java助手',
      avatar: '/images/agents/java.png',
      description: '帮助解决Java开发中的问题，包括Spring框架和企业级应用开发',
      likes: '950+',
      views: '3800+',
      favorites: '150+',
      official: true,
      section: 'discover',
      categories: ['code', 'all'],
    },
  ];

  // Apply three-level filtering: section, category, and search
  const filteredAgents = featuredAgents.filter(agent => {
    // First-level filter (section)
    // For 'discover', show all agents from all sections
    const sectionMatch = 
      (activeButton === 'discover') ? 
      true : // Show all agents when 'discover' is selected
      (agent.section === activeButton);
    
    // Second-level filter (category)
    const categoryMatch = agent.categories.includes(activeCategory);
    
    // Search filter (name or description)
    const searchMatch = searchValue === '' || 
      agent.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchValue.toLowerCase());
    
    return sectionMatch && categoryMatch && searchMatch;
  });

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCancel = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Form values:', values);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('智能体创建成功！');
      setIsCreateModalVisible(false);
      form.resetFields();
    }, 1500);
  };

  return (
    <div className="agent-page" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ marginBottom: '8px' }}>想法的无限可能</Title>
          <Title level={4} style={{ color: '#6366f1', fontWeight: 'normal' }}>这里有你的最佳创意伙伴</Title>
        </div>
        <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="万千智能，一搜即达" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ borderRadius: '20px', maxWidth: '400px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          style={{ 
            borderRadius: '20px',
            background: activeButton === 'create' ? '#6366f1' : '#fff',
            color: activeButton === 'create' ? '#fff' : '#6366f1',
            borderColor: '#6366f1'
          }}
          onClick={() => setActiveButton('create')}
        >
          创建智能体
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ 
            borderRadius: '20px',
            background: activeButton === 'discover' ? '#6366f1' : '#fff',
            color: activeButton === 'discover' ? '#fff' : '#6366f1',
            borderColor: '#6366f1'
          }}
          onClick={() => setActiveButton('discover')}
        >
          发现智能体
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ 
            borderRadius: '20px',
            background: activeButton === 'my' ? '#6366f1' : '#fff',
            color: activeButton === 'my' ? '#fff' : '#6366f1',
            borderColor: '#6366f1'
          }}
          onClick={() => setActiveButton('my')}
        >
          我的智能体
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ 
            borderRadius: '20px',
            background: activeButton === 'favorites' ? '#6366f1' : '#fff',
            color: activeButton === 'favorites' ? '#fff' : '#6366f1',
            borderColor: '#6366f1'
          }}
          onClick={() => setActiveButton('favorites')}
        >
          我收藏的智能体
        </Button>
      </div>

      <Tabs 
        activeKey={activeCategory} 
        onChange={setActiveCategory} 
        style={{ marginBottom: '24px' }}
      >
        {agentCategories.map(category => (
          <TabPane tab={category.name} key={category.key} />
        ))}
      </Tabs>

      {/* Conditional content based on active button */}
      {activeButton === 'create' ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={4}>创建您自己的智能体</Title>
          <Paragraph>在这里您可以创建自定义的智能体</Paragraph>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={showCreateModal}>
            开始创建
          </Button>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredAgents.map(agent => (
            <Col xs={24} sm={12} md={8} key={agent.id}>
              <Card hoverable style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Avatar 
                    size={64} 
                    src={agent.avatar} 
                    icon={<UserOutlined />} 
                    style={{ 
                      marginRight: '12px',
                      backgroundColor: '#f0f0f0', // Light gray background
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '50%' // Ensure circular shape
                    }}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{agent.name}</Title>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                      {agent.description}
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <span><HeartOutlined /> {agent.likes}</span>
                    <span><EyeOutlined /> {agent.views}</span>
                    <span><StarOutlined /> {agent.favorites}</span>
                  </Space>
                  {agent.official && (
                    <Tag color="blue">官方</Tag>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create Agent Modal */}
      <Modal
        title="创建新智能体"
        open={isCreateModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ categories: ['other'] }}
        >
          <Form.Item
            name="name"
            label="智能体名称"
            rules={[{ required: true, message: '请输入智能体名称' }]}
          >
            <Input placeholder="给您的智能体起个名字" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="智能体描述"
            rules={[{ required: true, message: '请输入智能体描述' }]}
          >
            <TextArea 
              placeholder="描述这个智能体的功能和特点" 
              rows={4} 
            />
          </Form.Item>
          
          <Form.Item
            name="categories"
            label="分类"
            rules={[{ required: true, message: '请选择至少一个分类' }]}
          >
            <Select mode="multiple" placeholder="选择分类">
              {agentCategories.filter(cat => cat.key !== 'all').map(category => (
                <Option key={category.key} value={category.key}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="difyBackendUrl"
            label="Dify后端地址"
            rules={[
              { required: true, message: '请输入Dify后端地址' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input placeholder="例如: https://api.dify.ai/v1" />
          </Form.Item>
          
          <Form.Item
            name="difyApiKey"
            label="Dify API Key"
            rules={[{ required: true, message: '请输入Dify API Key' }]}
          >
            <Input.Password placeholder="输入您的Dify API Key" />
          </Form.Item>
          
          <Divider />
          
          <Form.Item
            name="instructions"
            label="智能体指令"
            rules={[{ required: true, message: '请输入智能体指令' }]}
          >
            <TextArea 
              placeholder="输入详细的指令，告诉智能体应该如何工作" 
              rows={6} 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                borderRadius: '20px',
                background: '#6366f1',
                width: '100%',
                height: '40px'
              }}
            >
              创建智能体
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentPage;
