import React, { useState, useEffect } from 'react';
import { Col, Row, Form, message, Image } from 'antd';
import { UserOutlined } from '@ant-design/icons'; // Import the User icon
import axios from 'axios';
import './index.css'; // Adjust or remove this if you don't have any specific styles yet

const Recommendation = () => {
  const [fileData, setFileData] = useState([]);
  const [clickCounts, setClickCounts] = useState(() => {
    // Load clickCounts from localStorage if it exists
    const savedClickCounts = localStorage.getItem('clickCounts');
    return savedClickCounts ? JSON.parse(savedClickCounts) : {
      subjects: {},
      educationLevels: {},
    };
  });

  // Function to fetch files
  const fetchFiles = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/files?all=true');
      setFileData(data.files);
    } catch (error) {
      message.error('Error fetching resources.');
    }
  };

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Save clickCounts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('clickCounts', JSON.stringify(clickCounts));
  }, [clickCounts]);

  // Function to handle user clicks for tracking
  const handleUserClick = (type, value) => {
    setClickCounts((prevCounts) => {
      const updatedCounts = {
        ...prevCounts,
        [type]: {
          ...prevCounts[type],
          [value]: (prevCounts[type][value] || 0) + 1, // Increment the count
        },
      };
      return updatedCounts;
    });
  };

  // Sort files based on click counts (subjects and education levels)
  const getSortedFiles = () => {
    return [...fileData].sort((a, b) => {
      const aSubjectCount = (clickCounts.subjects[a.subjects?.[0]] || 0); // Primary subject
      const bSubjectCount = (clickCounts.subjects[b.subjects?.[0]] || 0);

      const aLevelCount = (clickCounts.educationLevels[a.educationLevel] || 0);
      const bLevelCount = (clickCounts.educationLevels[b.educationLevel] || 0);

      // Sort by total click counts (subject clicks + education level clicks)
      return bSubjectCount + bLevelCount - (aSubjectCount + aLevelCount);
    });
  };

  // Group files into rows of 4
  const getRows = (files) => {
    if (!Array.isArray(files) || files.length === 0) {
      console.error('fileData is not valid or empty!');
      return [];
    }
    const rows = [];
    for (let i = 0; i < files.length; i += 4) {
      rows.push(files.slice(i, i + 4));
    }
    return rows;
  };

  // Function to handle file opening
  const handleFileOpen = (file) => {
    // Track clicks for sorting purposes
    handleUserClick('subjects', file.subjects?.[0]);
    handleUserClick('educationLevels', file.educationLevel);

    // Open the file in a new tab
    window.open(`http://localhost:5001/uploads/${encodeURIComponent(file.fileName)}`, '_blank');
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
                    backgroundColor: '#f5f5f5' // Fallback background
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
                
                {/* Content container pushed to bottom */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  flexGrow: 1,
                  width: '100%'
                }}>
                  <div style={{ marginTop: 'auto' }}>
                  <p style={{ marginBottom: '4px' }}>
                  {/* Document name */}
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
                  
                  {/* Username and date */}
                  

                    </p>
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