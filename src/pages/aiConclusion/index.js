import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './AiConclusion.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const AiConclusion = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target.result);
    };
    reader.readAsText(file);
    return false;
  };

  const beforeUpload = (file) => {
    const isSupported = ['text/plain', 'application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                        .includes(file.type);
    if (!isSupported) {
      message.error('You can only upload TXT, PDF, or Word files!');
    }
    return isSupported;
  };

  const generateConclusion = () => {
    if (!content.trim()) {
      message.warning('Please input some content first!');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing (replace with actual API call)
    setTimeout(() => {
      setAiResult(`AI-generated conclusion for: "${content.substring(0, 5000)}..."`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Layout className="ai-conclusion-container">
      <Content className="content-box">
        <Title level={2} className="title">
          AI Conclusion Generator
        </Title>

        <div className="main-content">
          <div className="input-container">
            <Text strong>Content:</Text>
            <TextArea
              className="text-area"
              autoSize={{ minRows: 8 }}
              value={content}
              onChange={handleContentChange}
              placeholder="Enter your content here or upload a file..."
            />
          </div>

          <div className="actions-row">
            <Upload
              beforeUpload={beforeUpload}
              customRequest={({ file }) => handleUpload(file)}
              showUploadList={false}
              accept=".txt,.pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
            
            <div className="right-actions">
              <span className="word-count">{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
              <Button 
                type="primary" 
                onClick={generateConclusion}
                disabled={!content.trim()}
                loading={isLoading}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-container">
            <Spin size="large" />
            <p>Generating AI conclusion...</p>
          </div>
        )}

        {aiResult && !isLoading && (
          <Card title="AI Conclusion" className="result-card">
            <Text>{aiResult}</Text>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default AiConclusion;