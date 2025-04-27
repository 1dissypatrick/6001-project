import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Upload, message, Card, Spin, Space } from 'antd';
import { UploadOutlined, BulbOutlined, KeyOutlined, DeleteOutlined } from '@ant-design/icons';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import './AiConclusion.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const AiConclusion = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeTab, setActiveTab] = useState('conclusion'); // 'conclusion' or 'keywords'

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const extractTextFromPdf = async (arrayBuffer) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to extract text from PDF. The file might be corrupted or password protected.');
    }
  };

  const extractTextFromDocx = async (arrayBuffer) => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  };

  const extractTextFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let text = '';
          const arrayBuffer = e.target.result;
          
          if (file.type === 'application/pdf') {
            text = await extractTextFromPdf(arrayBuffer);
          } 
          else if (file.type.includes('msword') || file.type.includes('wordprocessingml')) {
            text = await extractTextFromDocx(arrayBuffer);
          }
          else {
            text = e.target.result;
          }
          
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      
      if (file.type === 'application/pdf' || file.type.includes('msword') || file.type.includes('wordprocessingml')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'UTF-8');
      }
    });
  };

  const handleUpload = async (file) => {
    setIsFileLoading(true);
    try {
      const text = await extractTextFromFile(file);
      setContent(text);
      message.success(`${file.name} processed successfully`);
    } catch (error) {
      console.error('Error processing file:', error);
      message.error(`Failed to process ${file.name}: ${error.message}`);
    } finally {
      setIsFileLoading(false);
    }
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
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const generateConclusion = async () => {
    if (!content.trim()) {
      message.warning('Please input some content first!');
      return;
    }
  
    setIsLoading(true);
    setActiveTab('conclusion');
    
    try {
      const prompt = `Please analyze the following content and generate a concise, professional conclusion in bullet points:\n\n${content}\n\nConclusion:`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
  
      const data = await response.json();
      setAiResult(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error generating conclusion:', error);
      message.error('Failed to generate conclusion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const findKeywords = async () => {
    if (!content.trim()) {
      message.warning('Please input some content first!');
      return;
    }
  
    setIsLoading(true);
    setActiveTab('keywords');
    
    try {
      const prompt = `Please find the key words of the content:\n\n${content}\n\n`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
  
      const data = await response.json();
      setAiResult(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error finding keywords:', error);
      message.error('Failed to find keywords. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setContent('');
    setAiResult(null);
    setActiveTab('conclusion');
  };

  return (
    <Layout className="ai-conclusion-container">
      <Content className="content-box">
        <Title level={2} className="title">
        AI Content Analyzer
        </Title>
        <Text className="subtitle">
          Upload a document or paste your content below to generate an AI-powered conclusion and find key words
        </Text>

        <div className="main-content">
          <div className="input-container">
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
                disabled={isFileLoading}
              >
                <Button 
                  icon={<UploadOutlined />}
                  loading={isFileLoading}
                >
                  Upload File
                </Button>
              </Upload>
              <Button 
                onClick={clearAll}
                icon={<DeleteOutlined />}
                style={{ marginLeft: 8 }}
                disabled={!content && !aiResult}
              >
                Clear
              </Button>
            </div>
            
            <div className="right-actions">
              <span className="word-count">
                {content.trim() ? content.trim().split(/\s+/).length : 0} words
              </span>
              <Space>
                <Button 
                  type={activeTab === 'keywords' ? 'primary' : 'default'}
                  onClick={findKeywords}
                  disabled={!content.trim() || isFileLoading}
                  loading={isLoading && activeTab === 'keywords'}
                  icon={<KeyOutlined />}
                >
                  Extract Keywords
                </Button>
                <Button 
                  type={activeTab === 'conclusion' ? 'primary' : 'default'}
                  onClick={generateConclusion}
                  disabled={!content.trim() || isFileLoading}
                  loading={isLoading && activeTab === 'conclusion'}
                  icon={<BulbOutlined />}
                >
                  Generate Conclusion
                </Button>
              </Space>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Generating {activeTab === 'conclusion' ? 'conclusion' : 'keywords'}...</Text>
          </div>
        )}

        {aiResult && !isLoading && (
          <Card 
            title={activeTab === 'conclusion' ? "AI Conclusion" : "Key Words"} 
            className="result-card"
            extra={[
              <Button 
                key="copy"
                onClick={() => {
                  navigator.clipboard.writeText(aiResult);
                  message.success('Copied to clipboard!');
                }}
              >
                Copy
              </Button>
            ]}
          >
            <div className="result-content">
              {activeTab === 'keywords' ? (
                <div className="keywords-container">
                  {aiResult.split(',').map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <Text>{aiResult}</Text>
              )}
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default AiConclusion;