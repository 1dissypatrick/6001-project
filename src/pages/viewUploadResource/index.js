import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';
import './user.css';

const ViewUploadResource = () => {
    const [fileData, setFileData] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const username = localStorage.getItem('username'); // Retrieve the logged-in username

            const { data } = await axios.get('http://localhost:5001/files', {
                headers: {
                    username, // Send the username in the request headers
                },
            });

            setFileData(data.files); // Update state with the user's files
        } catch (error) {
            console.error('Error fetching files:', error);
            message.error('Error fetching files'); // Notify the user of fetch failure
        }
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username', // Add the username column
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
            render: (subjects) => (subjects ? subjects.join(', ') : 'N/A'), // Handle undefined subjects gracefully
        },
        {
            title: 'Material Types',
            dataIndex: 'materialTypes',
            render: (materialTypes) => (materialTypes ? materialTypes.join(', ') : 'N/A'), // Handle undefined material types
        },
        {
            title: 'Education Level',
            dataIndex: 'educationLevel',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'), // Handle undefined dates
        },
    ];

    return (
        <div className='user'>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={fileData}
                pagination={{ pageSize: 10 }} // Optional: Paginate to show 10 rows per page
            />
        </div>
    );
};

export default ViewUploadResource;
