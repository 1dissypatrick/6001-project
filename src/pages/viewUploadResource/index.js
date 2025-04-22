import React, { useEffect, useState } from 'react';
import { Table, message, Image } from 'antd';
import axios from 'axios';
import './user.css';

const ViewUploadResource = () => {
    const [fileData, setFileData] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const username = localStorage.getItem('username');

            const { data } = await axios.get('http://localhost:5001/files', {
                headers: {
                    username,
                },
            });

            setFileData(data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
            message.error('Error fetching files');
        }
    };

    const columns = [
        {
            title: 'Cover Page',
            dataIndex: 'coverPage',
            render: (coverPage) => (
                coverPage ? (
                    <Image
                        width={100}
                        src={`http://localhost:5001/uploads/${encodeURIComponent(coverPage)}`}
                        alt="Cover"
                        fallback="https://via.placeholder.com/100?text=No+Cover"
                    />
                ) : (
                    <Image
                        width={100}
                        src="https://via.placeholder.com/100?text=No+Cover"
                        alt="No Cover"
                    />
                )
            ),
        },
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
            render: (subjects) => (subjects ? subjects.join(', ') : 'N/A'),
        },
        {
            title: 'Material Types',
            dataIndex: 'materialTypes',
            render: (materialTypes) => (materialTypes ? materialTypes.join(', ') : 'N/A'),
        },
        {
            title: 'Education Level',
            dataIndex: 'educationLevel',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
        },
    ];

    return (
        <div className='user'>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={fileData}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default ViewUploadResource;