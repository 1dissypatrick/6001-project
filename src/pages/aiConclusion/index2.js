import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useConclusionGenerator } from './hooks/useConclusionGenerator';
import './AiConclusion.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const AiConclusion = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const { generateConclusion, isModelLoading } = useConclusionGenerator();

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target.result);
      message.success(`${file.name} file uploaded successfully`);
    };
    reader.onerror = () => {
      message.error('File reading failed');
    };
    reader.readAsText(file);
    return false;
  };

  const beforeUpload = (file) => {
    const isSupported = [
      'text/plain', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type);
    
    if (!isSupported) {
      message.error('You can only upload TXT, PDF, or Word files!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('File must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const generateConclusionHandler = async () => {
    if (!content.trim()) {
      message.warning('Please input some content first!');
      return;
    }

    if (isModelLoading) {
      message.warning('AI model is still loading. Please wait...');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await generateConclusion(content);
      if (result) {
        setAiResult(result);
      } else {
        message.error('Failed to generate conclusion.');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred while generating the conclusion.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setContent('');
    setAiResult(null);
  };

  return (
    <Layout className="ai-conclusion-container">
      <Content className="content-box">
        <Title level={2} className="title">
          AI Conclusion Generator
        </Title>
        <Text className="subtitle">
          Upload a document or paste your content below to generate an AI-powered conclusion
        </Text>

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
            <div className="left-actions">
              <Upload
                beforeUpload={beforeUpload}
                customRequest={({ file }) => handleUpload(file)}
                showUploadList={false}
                accept=".txt,.pdf,.doc,.docx"
              >
                <Button icon={<UploadOutlined />}>Upload File</Button>
              </Upload>
              <Button 
                onClick={clearAll}
                style={{ marginLeft: 8 }}
              >
                Clear
              </Button>
            </div>
            
            <div className="right-actions">
              <span className="word-count">
                {content.trim() ? content.trim().split(/\s+/).length : 0} words
              </span>
              <Button 
                type="primary" 
                onClick={generateConclusionHandler}
                disabled={!content.trim() || isModelLoading}
                loading={isLoading}
              >
                Generate Conclusion
              </Button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Generating AI conclusion...</Text>
          </div>
        )}

        {aiResult && !isLoading && (
          <Card 
            title="AI Conclusion" 
            className="result-card"
            extra={[
              <Button 
                key="copy"
                onClick={() => {
                  navigator.clipboard.writeText(aiResult);
                  message.success('Conclusion copied to clipboard!');
                }}
              >
                Copy
              </Button>
            ]}
          >
            <div className="result-content">
              <Text>{aiResult}</Text>
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default AiConclusion;