import React, { useState } from 'react';
import { UploadOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Form, Input, Checkbox, Dropdown, message, Upload, Space, Divider } from 'antd';
import './user.css';

const CheckboxGroup = Checkbox.Group;

// Options for Subjects
const plainOptions = [
    'Chinese Language Education', 'English Language Education', 'Mathematics Education', 
    'Science Education', 'Social and Humanistic Education', 'Physical Education', 
    'Arts and Humanities', 'History', 'Business and Communication', 
    'Career and Technical Education', 'General Studies',
];

// Options for Materials Types
const materialOptions = [
    'Activity', 'Assessment', 'Case Study', 'Data Set', 'Diagram', 'Game',
    'Interactive', 'Reading', 'Module', 'Primary Source'
];

const UploadResource = () => {
    const [file, setFile] = useState(null); // Store the selected file
    const [coverPage, setCoverPage] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [checkedList, setCheckedList] = useState([]); // Subject selection
    const [materialList, setMaterialList] = useState([]); // Material Types selection
    const [selectedLevel, setSelectedLevel] = useState('');
    const [form] = Form.useForm();

    const handleBeforeUpload = (file) => {
        setFile(file); // Store the selected file
        setFormVisible(true); // Show the form after file selection
        return false; // Prevent automatic upload
    };

    const handleBeforeCoverUpload = (file) => {
        setCoverPage(file);
        return false;
    };

    const handleFormSubmit = async (values) => {
        try {
            if (!file) {
                return message.error('Please select a file!');
            }
            if (!checkedList.length) {
                return message.error('Please select at least one subject!');
            }
            if (!materialList.length) {
                return message.error('Please select at least one material type!');
            }
            if (!selectedLevel) {
                return message.error('Please select an education level!');
            }
            const formData = new FormData();
            formData.append('file', file);
            if (coverPage) {
                formData.append('coverPage', coverPage);
            }
            formData.append('documentName', values.name);
            formData.append('subjects', JSON.stringify(checkedList));
            formData.append('materialTypes', JSON.stringify(materialList));
            formData.append('educationLevel', selectedLevel);
    
            const response = await fetch('http://localhost:5001/upload', {
                method: 'POST',
                headers: {
                    username: localStorage.getItem('username'), // Pass the username in headers
                },
                body: formData,
            });
    
            if (response.ok) {
                message.success('Resource uploaded successfully!');
                setFormVisible(false);
                form.resetFields();
                setFile(null);
                setCoverPage(null);
            } else {
                message.error('Error uploading resource');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error('Error uploading resource');
        }
    };
    

    const handleChangeFile = () => {
        setFormVisible(false);
        setFile(null);
        setCoverPage(null);
    };

    const onChangeSubjects = (list) => setCheckedList(list); // Subject selection handler

    const onChangeMaterials = (list) => setMaterialList(list); // Materials Type selection handler

    const handleMenuClick = (e) => {
        const selectedItem = items.find(item => item.key === e.key); // Find the selected item
        setSelectedLevel(selectedItem.label); // Set the education level to the label (e.g., "Preschool")
    };

    const items = [
        { label: 'Preschool', key: '1' },
        { label: 'Lower Primary', key: '2' },
        { label: 'Upper Primary', key: '3' },
        { label: 'Middle School', key: '4' },
        { label: 'High School', key: '5' },
        { label: 'Community College/Lower Division', key: '6' },
        { label: 'College/Upper Division', key: '7' },
        { label: 'Career/Technical', key: '8' },
    ];

    const menuProps = { items, onClick: handleMenuClick };

    return (
        <div className='user space-between'>
            {!formVisible ? (
                <Upload beforeUpload={handleBeforeUpload}>
                    <Button icon={<UploadOutlined />} type="primary">
                        Click to Upload
                    </Button>
                </Upload>
            ) : (
                <div>
                    <p>
                        <b>Selected File:</b> {file?.name}
                        <Button style={{ marginLeft: '10px' }} onClick={handleChangeFile}>
                            Change File
                        </Button>
                    </p>
                </div>
            )}

            {formVisible && (
                <div style={{ marginTop: '20px' }}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormSubmit}
                    >
                        <Form.Item
                            label="Document Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input placeholder="Enter name" />
                        </Form.Item>

                        <Divider />
                        <p>Cover Page (Optional):</p>
                        <Upload 
                            beforeUpload={handleBeforeCoverUpload}
                            accept="image/*"
                            maxCount={1}
                            showUploadList={true}
                        >
                            <Button icon={<UploadOutlined />}>
                                Click to Upload Cover Image
                            </Button>
                        </Upload>
                        {coverPage && (
                            <div style={{ marginTop: '10px' }}>
                                <p>Selected Cover: {coverPage.name}</p>
                            </div>
                        )}

                        <Divider />
                        
                        <p>Subject:</p>
                        <CheckboxGroup
                            options={plainOptions}
                            value={checkedList}
                            onChange={onChangeSubjects}
                        />

                        <Divider />

                        <p>Material Types:</p>
                        <CheckboxGroup
                            options={materialOptions}
                            value={materialList}
                            onChange={onChangeMaterials}
                        />

                        <Divider />

                        <p>Education Level:</p>
                        <Dropdown menu={menuProps}>
                            <Button>
                                <Space>
                                    {selectedLevel
                                        ? `Selected: ${selectedLevel}` // Show the label (e.g., "Preschool")
                                        : 'Education Level'}
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>

                        <Divider />

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Upload Whole Resource
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default UploadResource;
