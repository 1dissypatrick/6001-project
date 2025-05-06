import React, { useState, useEffect, useCallback } from 'react';
import { Col, Row, Form, message, Image } from 'antd';
import { UserOutlined} from '@ant-design/icons';
import axios from 'axios';
import './index.css';

const Recommendation = () => {
  const [fileData, setFileData] = useState([]);
  const [clickCounts, setClickCounts] = useState({
    subjects: {},
    educationLevels: {},
    materialTypes: {}, // Added to track materialTypes clicks
  });
  const username = localStorage.getItem('username');

  const fetchData = useCallback(async () => {
    try {
      // Fetch files
      const { data: filesData } = await axios.get('http://localhost:5001/files?all=true');
      setFileData(filesData.files);
  
      // Only fetch user clicks if username exists
      if (username) {
        try {
          const { data: userClicks } = await axios.get(
            `http://localhost:5002/api/user-clicks/${username}`
          );
          setClickCounts(
            userClicks || {
              subjects: {},
              educationLevels: {},
              materialTypes: {}, // Initialize materialTypes
            }
          );
        } catch (error) {
          console.error('Error fetching user clicks:', error);
          // Initialize empty click counts if user not found
          setClickCounts({
            subjects: {},
            educationLevels: {},
            materialTypes: {}, // Initialize materialTypes
          });
        }
      }
    } catch (error) {
      message.error('Error fetching data.');
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUserClick = async (type, value) => {
    if (!username || !value) return; // Skip if no username or value is undefined
  
    try {
      // Update local state immediately for better UX
      setClickCounts((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [value]: (prev[type][value] || 0) + 1,
        },
      }));
  
      // Send to backend
      await axios.post('http://localhost:5002/api/track-click', {
        username,
        type,
        value,
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const getSortedFiles = useCallback(() => {
    return [...fileData].sort((a, b) => {
      const aSubjectCount = clickCounts.subjects[a.subjects?.[0]] || 0;
      const bSubjectCount = clickCounts.subjects[b.subjects?.[0]] || 0;
      const aLevelCount = clickCounts.educationLevels[a.educationLevel] || 0;
      const bLevelCount = clickCounts.educationLevels[b.educationLevel] || 0;
      const aMaterialCount = clickCounts.materialTypes[a.materialTypes?.[0]] || 0; // Count for first materialType
      const bMaterialCount = clickCounts.materialTypes[b.materialTypes?.[0]] || 0; // Count for first materialType
      // Sum all counts for ranking
      return (
        bSubjectCount + bLevelCount + bMaterialCount - (aSubjectCount + aLevelCount + aMaterialCount)
      );
    });
  }, [fileData, clickCounts]);

  const getRows = useCallback((files) => {
    if (!Array.isArray(files)) return [];
    const rows = [];
    for (let i = 0; i < files.length; i += 4) {
      rows.push(files.slice(i, i + 4));
    }
    return rows;
  }, []);

  const handleFileOpen = (file) => {
    handleUserClick('subjects', file.subjects?.[0]);
    handleUserClick('educationLevels', file.educationLevel);
    handleUserClick('materialTypes', file.materialTypes?.[0]); // Track materialTypes click
    window.open(
      `http://localhost:5001/uploads/${encodeURIComponent(file.fileName)}`,
      '_blank'
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Recommended Resources</h2>
      {getRows(getSortedFiles()).map((row, rowIndex) => (
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
                {/* Cover Page at the top */}
                {file.coverPage && (
                  <div style={{ 
                    width: '100%', 
                    height: '200px',
                    marginBottom: '15px',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5'
                  }}>
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
                
                {/* Content container */}
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
                      wordBreak: 'break-word'
                    }}>
                      <button
                        onClick={() => handleFileOpen(file)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#1890ff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 'inherit',
                          fontFamily: 'inherit',
                        }}
                      >
                        {file.documentName || file.fileName || 'Untitled Document'}
                      </button>
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
      ))}
    </div>
  );
};

export default Recommendation;