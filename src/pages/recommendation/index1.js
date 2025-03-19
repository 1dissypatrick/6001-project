import React, { useState, useEffect } from 'react';
import { Col, Row, Form, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import './index.css';

const Recommendation = () => {
  const [fileData, setFileData] = useState([]);
  const [clickCounts, setClickCounts] = useState({
    subjects: {},
    educationLevels: {},
  });
  const [loading, setLoading] = useState(true);

  // Fetch files and clickCounts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data

        // Fetch files from the backend
        const { data: filesData } = await axios.get('http://localhost:5001/files?all=true');
        console.log('API Response:', filesData); // Log the API response

        if (Array.isArray(filesData.files)) {
          setFileData(filesData.files);
        } else {
          console.error('Invalid fileData:', filesData);
          setFileData([]);
        }

        // Fetch clickCounts from the backend
        const { data: clickCountsData } = await axios.get('http://localhost:5002/api/clickCounts');
        if (clickCountsData && typeof clickCountsData === 'object') {
          setClickCounts({
            subjects: clickCountsData.subjects || {},
            educationLevels: clickCountsData.educationLevels || {},
          });
        } else {
          console.error('Invalid clickCounts:', clickCountsData);
          setClickCounts({ subjects: {}, educationLevels: {} });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Error fetching data.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchData();
  }, []);

  // Function to handle user clicks for tracking
  const handleUserClick = async (type, value) => {
    try {
      // Update clickCounts in the backend
      const { data: updatedClickCounts } = await axios.post('http://localhost:5002/api/clickCounts', {
        type,
        value,
      });

      // Update the state with the new clickCounts
      setClickCounts({
        subjects: updatedClickCounts.subjects || {},
        educationLevels: updatedClickCounts.educationLevels || {},
      });

      // Log the updated click counts
      console.log('Updated Click Counts:', updatedClickCounts);
    } catch (error) {
      console.error('Error updating click counts:', error);
      message.error('Error updating click counts.');
    }
  };

  // Sort files based on click counts (subjects and education levels)
  const getSortedFiles = () => {
    if (!Array.isArray(fileData) || fileData.length === 0) {
      console.error('fileData is not valid or empty!');
      return []; // Return an empty array as a fallback
    }

    return [...fileData].sort((a, b) => {
      const aSubjectCount = (clickCounts.subjects[a.subjects?.[0]] || 0);
      const bSubjectCount = (clickCounts.subjects[b.subjects?.[0]] || 0);

      const aLevelCount = (clickCounts.educationLevels[a.educationLevel] || 0);
      const bLevelCount = (clickCounts.educationLevels[b.educationLevel] || 0);

      return bSubjectCount + bLevelCount - (aSubjectCount + aLevelCount);
    });
  };

  // Group files into rows of 4
  const getRows = (files) => {
    if (!Array.isArray(files) || files.length === 0) {
      console.error('fileData is not valid or empty!');
      return []; // Return an empty array as a fallback
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

  // Get sorted files
  const sortedFiles = getSortedFiles();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Recommended Resources</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        getRows(sortedFiles).map((row, rowIndex) => (
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
                  <h3 style={{ color: '#1890ff' }}>
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
                      {file.fileName || 'No File Name'}
                    </button>
                  </h3>
                  <p>
                    <UserOutlined style={{ marginRight: '8px', color: '#666' }} />
                    {file.username || 'N/A'}
                    <span style={{ marginLeft: '8px', color: '#999' }}>
                      {file.date ? new Date(file.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </p>
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