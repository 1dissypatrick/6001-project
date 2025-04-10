import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import axios from 'axios';
import './user.css';

const Review = () => {
    const [fileData, setFileData] = useState([]);

    useEffect(() => {
        fetchAllFiles();
    }, []);

    const fetchAllFiles = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/all-files'); // Call the new endpoint
            setFileData(data.files); // Update state with all files
        } catch (error) {
            console.error('Error fetching all files:', error);
        }
    };

    const deleteFile = async (fileId) => {
        try {
            const isConfirmed = window.confirm("Are you sure you want to delete this file?");
            if (!isConfirmed) {
                return; // If not confirmed, exit the function
            }
            
            const response = await axios.delete(`http://localhost:5001/files/${fileId}`);
            console.log(response.data.message); // Log success message
            fetchAllFiles(); // Refresh the file list
        } catch (error) {
            console.error('Error deleting file:', error.response?.data?.message || error.message);
        }}
    

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
        },
        {
            title: 'File Name',
            dataIndex: 'fileName',
            render: (fileName) => (
                <a
                    href={`http://localhost:5001/uploads/${encodeURIComponent(fileName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {fileName}
                </a>
            ),
        },
        {
            title: 'Document Name',
            dataIndex: 'documentName',
        },
        {
            title: 'Subjects',
            dataIndex: 'subjects',
            render: (subjects) => subjects.join(', '), // Join array into a string
        },
        {
            title: 'Material Types',
            dataIndex: 'materialTypes',
            render: (materialTypes) => materialTypes ? materialTypes.join(', ') : 'N/A',
        },
        {
            title: 'Education Level',
            dataIndex: 'educationLevel',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Restrictions',
            render: (rowData) => (
                <div className='flex-box'>
                    <Button
                        type="primary"
                        onClick={() => deleteFile(rowData._id)} // Delete file button
                    >
                        Delete File
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className='user'>
            <Table rowKey="_id" columns={columns} dataSource={fileData} />
        </div>
    );
};

export default Review;
