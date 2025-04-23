import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import OpenAI from 'openai';
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

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const extractTextFromPdf = async (arrayBuffer) => {
    try {
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Combine text items
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

  const client = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

const generateConclusion = async () => {
  if (!content.trim()) return message.warning('Please input content first!');

  setIsLoading(true);
  try {
    const prompt = `Generate a concise professional conclusion:\n\n${content}`;
    
    const response = await client.chat.completions.create({  // Correct OpenAI API syntax
      model: "gpt-3.5-turbo",  // Cheaper than GPT-4
      messages: [
        { 
          role: "system", 
          content: "You generate professional document conclusions." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150  // Reduce token usage
    });

    setAiResult(response.choices[0].message.content);
  } catch (error) {
    message.error(`Error: ${error.message}`);
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
              <Button 
                type="primary" 
                onClick={generateConclusion}
                disabled={!content.trim() || isFileLoading}
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