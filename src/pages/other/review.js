import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import axios from 'axios';
import './user.css';

const Review = () => {
    const [fileData, setFileData] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/files');
            setFileData(data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    

    const columns = [
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
            render: (materialTypes) => materialTypes ? materialTypes.join(', ') : 'N/A', // Handle undefined material types
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
                    render:(rowData) =>{
                        //有return()就可以用jsx 
                        return(
                            <div className='flex-box'>                        
                                <Button type="primary" >Restrictions</Button>
        
                            </div>
                        )
                    }
                },
    ];

    return (
        <div className='user'>
            <Table rowKey="_id" columns={columns} dataSource={fileData} />
        </div>
    );
};

export default Review;
