import React, { useState, useEffect, useCallback } from 'react';
import { Col, Row, Form, message, Image } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import './index.css';

const Recommendation = () => {
  const [fileData, setFileData] = useState([]);
  const [clickCounts, setClickCounts] = useState({
    subjects: {},
    educationLevels: {},
    materialTypes: {},
  });
  const username = localStorage.getItem('username');

  const fetchData = useCallback(async () => {
    try {
      const { data: filesData } = await axios.get('http://localhost:5001/files?all=true');
      setFileData(filesData.files);
  
      if (username) {
        try {
          const { data: userClicks } = await axios.get(
            `http://localhost:5002/api/user-clicks/${username}`
          );
          setClickCounts(
            userClicks || {
              subjects: {},
              educationLevels: {},
              materialTypes: {},
            }
          );
        } catch (error) {
          console.error('Error fetching user clicks:', error);
          setClickCounts({
            subjects: {},
            educationLevels: {},
            materialTypes: {},
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
    if (!username || !value) return;
  
    try {
      setClickCounts((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [value]: (prev[type][value] || 0) + 1,
        },
      }));
  
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
      const aMaterialCount = clickCounts.materialTypes[a.materialTypes?.[0]] || 0;
      const bMaterialCount = clickCounts.materialTypes[b.materialTypes?.[0]] || 0;
      return (
        bSubjectCount + bLevelCount + bMaterialCount - (aSubjectCount + aLevelCount + aMaterialCount)
      );
    });
  }, [fileData, clickCounts]);

  const getRows = useCallback((files) => {
    if (!Array.isArray(files)) return [];
    const rows = [];
    for (let i = 0; i < files.length; i += 6) {
      rows.push(files.slice(i, i + 6));
    }
    return rows;
  }, []);

  const handleFileOpen = (file) => {
    handleUserClick('subjects', file.subjects?.[0]);
    handleUserClick('educationLevels', file.educationLevel);
    handleUserClick('materialTypes', file.materialTypes?.[0]);
    window.open(
      `http://localhost:5001/uploads/${encodeURIComponent(file.fileName)}`,
      '_blank'
    );
  };

  return (
    <div className="recommendation-container">
      <h2>Recommended Resources</h2>
      {getRows(getSortedFiles()).map((row, rowIndex) => (
        <Row gutter={[16, 24]} key={`row-${rowIndex}`}>
          {row.map((file, colIndex) => (
            <Col
              className="gutter-row"
              xs={24}
              sm={12}
              md={6}
              lg={4}
              key={`col-${rowIndex}-${colIndex}`}
            >
              <Form className="search-container">
                {file.coverPage && (
                  <div className="cover-image-container">
                    <Image
                      width="100%"
                      height="100%"
                      src={`http://localhost:5001/uploads/${encodeURIComponent(file.coverPage)}`}
                      alt="Cover Page"
                      preview={false}
                    />
                  </div>
                )}
                <div className="content-container">
                  <div className="content-inner">
                    <h3>
                      <button onClick={() => handleFileOpen(file)}>
                        {file.documentName || file.fileName || 'Untitled Document'}
                      </button>
                    </h3>
                    <div className="meta-info">
                      <span>
                        <UserOutlined /> {file.username || 'N/A'}
                      </span>
                      <span>
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