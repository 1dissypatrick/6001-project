import React, { useState, useEffect, useCallback } from 'react';
import { Col, Row, Form, message, Image, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import './index.css';

const { Text } = Typography;

const Recommendation = ({ currentFile }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      if (currentFile) {
        // Content-based recommendations
        const { data } = await axios.post(
          'http://localhost:5002/api/content-recommendations',
          { 
            username,
            currentFileId: currentFile._id 
          }
        );
        setRecommendations(data);
      } else {
        // Click-based recommendations (fallback)
        const { data: files } = await axios.get('http://localhost:5001/files?all=true');
        const { data: userClicks } = username 
          ? await axios.get(`http://localhost:5002/api/user-clicks/${username}`)
          : { data: { subjects: {}, educationLevels: {} } };
        
        const sorted = [...files.files].sort((a, b) => {
          const aSubjectCount = a.subjects.reduce((sum, subject) => 
            sum + (userClicks.subjects[subject] || 0), 0);
          const bSubjectCount = b.subjects.reduce((sum, subject) => 
            sum + (userClicks.subjects[subject] || 0), 0);
          
          const aLevelCount = userClicks.educationLevels[a.educationLevel] || 0;
          const bLevelCount = userClicks.educationLevels[b.educationLevel] || 0;
          
          return (bSubjectCount + bLevelCount) - (aSubjectCount + aLevelCount);
        });
        
        setRecommendations(sorted);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      message.error('Error fetching recommendations');
    } finally {
      setLoading(false);
    }
  }, [username, currentFile]);

  const handleUserClick = async (type, value) => {
    if (!username) return;

    try {
      await axios.post('http://localhost:5002/api/track-click', {
        username,
        type,
        value,
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleFileOpen = (file) => {
    // Track clicks for subjects and education level
    file.subjects.forEach(subject => {
      handleUserClick('subjects', subject);
    });
    handleUserClick('educationLevels', file.educationLevel);
    
    window.open(
      `http://localhost:5001/uploads/${encodeURIComponent(file.fileName)}`,
      '_blank'
    );
  };

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const getRows = (files) => {
    if (!Array.isArray(files)) return [];
    const rows = [];
    for (let i = 0; i < files.length; i += 4) {
      rows.push(files.slice(i, i + 4));
    }
    return rows;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>
        {currentFile 
          ? `Similar to "${currentFile.documentName}"` 
          : 'Recommended Resources'}
      </h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">Loading recommendations...</Text>
        </div>
      ) : recommendations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No recommendations found</Text>
        </div>
      ) : (
        getRows(recommendations).map((row, rowIndex) => (
          <Row gutter={[16, 24]} key={`row-${rowIndex}`}>
            {row.map((file, colIndex) => (
              <Col
                className="gutter-row"
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={`col-${rowIndex}-${colIndex}`}
              >
                <Form className="search-container">
                  {file.coverPage && (
                    <div style={{ 
                      width: '100%', 
                      height: '200px',
                      marginBottom: '15px',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      backgroundColor: '#f5f5f5',
                      cursor: 'pointer'
                    }} onClick={() => handleFileOpen(file)}>
                      <Image
                        width="100%"
                        height="100%"
                        src={`http://localhost:5001/uploads/${encodeURIComponent(file.coverPage)}`}
                        alt="Cover Page"
                        style={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                        preview={false}
                      />
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    flexGrow: 1,
                    width: '100%'
                  }}>
                    <div style={{ marginTop: 'auto' }}>
                      <h3 style={{ 
                        color: '#1890ff',
                        marginBottom: '8px',
                        wordBreak: 'break-word',
                        cursor: 'pointer'
                      }} onClick={() => handleFileOpen(file)}>
                        {file.documentName || file.fileName || 'Untitled Document'}
                      </h3>
                      
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto'
                      }}>
                        <span>
                          <UserOutlined style={{ marginRight: '8px', color: '#666' }} />
                          {file.username || 'N/A'}
                        </span>
                        <span style={{ color: '#999' }}>
                          {file.date ? new Date(file.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Form>
              </Col>
            ))}
          </Row>
        ))
      )}
    </div>
  );
};

export default Recommendation;