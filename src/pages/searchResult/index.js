import React, { useState } from 'react';
import { 
  Input, 
  Checkbox, 
  Divider, 
  Dropdown, 
  Button, 
  Space, 
  Col, 
  Row, 
  Image, 
  Card, 
  Typography, 
  Tag,
  Skeleton,
  Empty,
  Layout,
  Pagination
} from 'antd';
import { 
  DownOutlined, 
  HomeOutlined, 
  BookOutlined,
  ReadOutlined,
  TeamOutlined,
  SolutionOutlined,
  BankOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useSearchResult from './useSearchResult';
import { motion } from 'framer-motion';
import './searchResult.css';

const { Search } = Input;
const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const CheckboxGroup = Checkbox.Group;

const plainOptions = [
  { label: 'Chinese Language Education', value: 'Chinese Language Education' },
  { label: 'English Language Education', value: 'English Language Education' },
  { label: 'Mathematics Education', value: 'Mathematics Education' },
  { label: 'Science Education', value: 'Science Education' },
  { label: 'Social and Humanistic Education', value: 'Social and Humanistic Education' },
  { label: 'Physical Education', value: 'Physical Education' },
  { label: 'Arts and Humanities', value: 'Arts and Humanities' },
  { label: 'History', value: 'History' },
  { label: 'Business and Communication', value: 'Business and Communication' },
  { label: 'Career and Technical Education', value: 'Career and Technical Education' },
  { label: 'General Studies', value: 'General Studies' },
];

const educationLevels = [
  { name: 'Preschool', icon: <SafetyCertificateOutlined />, color: 'magenta' },
  { name: 'Lower Primary', icon: <BookOutlined />, color: 'red' },
  { name: 'Upper Primary', icon: <ReadOutlined />, color: 'volcano' },
  { name: 'Middle School', icon: <TeamOutlined />, color: 'orange' },
  { name: 'High School', icon: <SolutionOutlined />, color: 'gold' },
  { name: 'Community College/Lower Division', icon: <BankOutlined />, color: 'lime' },
  { name: 'College/Upper Division', icon: <ExperimentOutlined />, color: 'green' },
  { name: 'Career/Technical', icon: <TrophyOutlined />, color: 'cyan' }
];

const fileTypeIcons = {
  'pdf': <FilePdfOutlined style={{ color: '#FF0000' }} />,
  'doc': <FileWordOutlined style={{ color: '#2B579A' }} />,
  'docx': <FileWordOutlined style={{ color: '#2B579A' }} />,
  'xls': <FileExcelOutlined style={{ color: '#217346' }} />,
  'xlsx': <FileExcelOutlined style={{ color: '#217346' }} />,
  'jpg': <FileImageOutlined style={{ color: '#DAA520' }} />,
  'jpeg': <FileImageOutlined style={{ color: '#DAA520' }} />,
  'png': <FileImageOutlined style={{ color: '#4B0082' }} />,
  'default': <FileOutlined />
};

const getFileIcon = (filename) => {
  if (!filename) return fileTypeIcons.default;
  const ext = filename.split('.').pop().toLowerCase();
  return fileTypeIcons[ext] || fileTypeIcons.default;
};

const SearchResult = () => {
    const navigate = useNavigate();
    const {
        checkedList,
        selectedLevel,
        fileData,
        onSearch,
        onChange,
        handleMenuClick,
        loading
    } = useSearchResult();
    const [selectedPageSize, setSelectedPageSize] = useState('10');
    const [selectedSort, setSelectedSort] = useState('Date Added Desc');
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageSize = (size) => {
        setSelectedPageSize(size);
        setCurrentPage(1); // Reset to first page when page size changes
    };

    const handleSort = (sort) => {
        setSelectedSort(sort);
        setCurrentPage(1); // Reset to first page when sort changes
    };

    // Sort and paginate fileData
    const sortedData = [...fileData].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return selectedSort === 'Date Added Desc' ? dateB - dateA : dateA - dateB;
    });

    const pageSize = parseInt(selectedPageSize);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const renderResults = () => {
      if (loading) {
        return Array(5).fill(0).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <Skeleton active paragraph={{ rows: 4 }} className="result-skeleton" />
          </motion.div>
        ));
      }

      if (fileData.length === 0) {
        return (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">No resources found. Try adjusting your filters.</Text>
              }
            />
          </motion.div>
        );
      }

      return paginatedData.map((file, index) => (
        <motion.div
          key={file._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="result-card" hoverable>
            <Row gutter={16}>
              {file.coverPage && (
                <Col xs={24} sm={6} md={5} lg={4}>
                  <div className="cover-container">
                    <Image
                      src={`http://localhost:5001/uploads/${encodeURIComponent(file.coverPage)}`}
                      alt="Cover Page"
                      preview={false}
                      className="cover-image"
                    />
                  </div>
                </Col>
              )}
              <Col xs={24} sm={file.coverPage ? 18 : 24} md={file.coverPage ? 19 : 24} lg={file.coverPage ? 20 : 24}>
                <div className="result-content">
                  <div className="result-header">
                    <Title level={4} className="detail-item">
                      <a 
                        href={`http://localhost:5001/uploads/${encodeURIComponent(file.fileName)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {getFileIcon(file.fileName)} {file.documentName || file.fileName || 'Untitled Document'}
                      </a>
                    </Title>
                  </div>
                  
                  <div className="result-details">
                    {file.subjects?.length > 0 && (
                      <div className="detail-item">
                        <Text strong>Subjects: </Text>
                        <Space size={[0, 8]} wrap>
                          <div className='give-gap'>
                            {file.subjects.map(subject => (
                              <Tag key={subject}>{subject}</Tag>
                            ))}
                          </div>
                        </Space>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <Text strong>Education Level: </Text>
                      <div className='give-gap'>
                        {file.educationLevel ? (
                          <Tag 
                            color={educationLevels.find(l => l.name === file.educationLevel)?.color || 'blue'}
                            icon={educationLevels.find(l => l.name === file.educationLevel)?.icon}
                          >
                            {file.educationLevel}
                          </Tag>
                        ) : <Text type="secondary">N/A</Text>}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <Text strong>Material Type: </Text>
                      <div className='give-gap'>
                        {file.materialTypes?.join(', ') || <Text type="secondary">N/A</Text>}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <Text strong>Author: </Text>
                      <div className='give-gap'>
                        {file.username || <Text type="secondary">N/A</Text>}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <Text strong>Date Added: </Text>
                      <div className='give-gap'>
                        {file.date ? new Date(file.date).toLocaleDateString() : <Text type="secondary">N/A</Text>}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>
      ));
    };

    return (
      <div className="search-results-container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="header"
        >
          <div className="header-content">
            <Button 
              type="text" 
              className="back-button"
              onClick={() => navigate('/')} 
              icon={<HomeOutlined />}
            >
              Back to Home
            </Button>
            
            <Title level={3} className="page-title">
              Education Resource Library
            </Title>
            
            <Search
              placeholder="Search for lesson plans, worksheets, and more..."
              allowClear
              enterButton={<Button type="primary" className="action-button">Search</Button>}
              size="large"
              onSearch={onSearch}
              className="search-bar"
            />
          </div>
        </motion.header>

        <Layout className="main-layout">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Sider width={300} className="filter-sider">
              <Card title="Filters" className="filter-card">
                <div className="filter-section">
                  <Title level={5} className="filter-title">
                    Subject Area
                  </Title>
                  <CheckboxGroup 
                    options={plainOptions} 
                    value={checkedList} 
                    onChange={onChange}
                    className="checkbox-group"
                  />
                </div>
                
                <Divider />
                
                <div className="filter-section">
                  <Title level={5} className="filter-title">
                    Education Level
                  </Title>
                  <Dropdown 
                    menu={{ 
                      items: educationLevels.map(level => ({
                        label: (
                          <Space>
                            {level.icon}
                            {level.name}
                          </Space>
                        ),
                        key: level.name
                      })), 
                      onClick: e => handleMenuClick(e.key) 
                    }}
                    trigger={['click']}
                  >
                    <Button block className="dropdown-button">
                      <Space>
                        {selectedLevel || 'All Levels'}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                </div>
              </Card>
            </Sider>
          </motion.div>

          <Content className="results-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="results-card">
                <div className="results-header">
                  <Text strong className="results-count">
                    {fileData.length} {fileData.length === 1 ? 'Resource' : 'Resources'} Found
                  </Text>
                  
                  <Space className="results-controls">
                    <Text>Per page:</Text>
                    <Dropdown 
                      menu={{ 
                        items: [10, 20, 50].map(num => ({
                          label: num,
                          key: num.toString()
                        })), 
                        onClick: e => handlePageSize(e.key) 
                      }}
                      trigger={['click']}
                    >
                      <Button>
                        <Space>
                          {selectedPageSize}
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                    
                    <Text>Sort by:</Text>
                    <Dropdown 
                      menu={{ 
                        items: [
                          { label: 'Date Added (Latest First)', key: 'Date Added Desc' },
                          { label: 'Date Added (Oldest First)', key: 'Date Added Asc' }
                        ], 
                        onClick: e => handleSort(e.key) 
                      }}
                      trigger={['click']}
                    >
                      <Button>
                        <Space>
                          {selectedSort === 'Date Added Desc' ? 'Date Added (Latest First)' : 'Date Added (Oldest First)'}
                          {selectedSort === 'Date Added Desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
                        </Space>
                      </Button>
                    </Dropdown>
                  </Space>
                </div>
                
                <Divider />
                
                <div className="results-list">
                  {renderResults()}
                </div>

                {fileData.length > 0 && (
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={fileData.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    className="pagination"
                    style={{ marginTop: '1.5rem', textAlign: 'center' }}
                  />
                )}
              </Card>
            </motion.div>
          </Content>
        </Layout>
      </div>
    );
};

export default SearchResult;