import React, { useEffect, useState } from 'react';
import { Table, message, Image, Button, Popconfirm , Modal, Input} from 'antd';
import axios from 'axios';
import './user.css';

const ViewUploadResource = () => {
    const [fileData, setFileData] = useState([]);
    const [editingFile, setEditingFile] = useState(null);
    const [newDocumentName, setNewDocumentName] = useState('');

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
    const handleEdit = (file) => {
        setEditingFile(file);
        setNewDocumentName(file.documentName);
    };

    const handleUpdate = async () => {
        try {
            await axios.patch(`http://localhost:5001/user/files/${editingFile._id}`, {
                documentName: newDocumentName
            });
            message.success('Document name updated successfully');
            fetchFiles(); // Refresh the file list
            setEditingFile(null);
        } catch (error) {
            console.error('Error updating file:', error);
            message.error('Error updating file');
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await axios.delete(`http://localhost:5001/user/files/${fileId}`);
            message.success('File deleted successfully');
            fetchFiles(); // Refresh the file list
        } catch (error) {
            console.error('Error deleting file:', error);
            message.error('Error deleting file');
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
        {
            title: 'Action',
            dataIndex: '_id',
            render: (fileId, record) => (
                <div className='flex-box'>
                    <Button 
                        type="primary" 
                        onClick={() => handleEdit(record)}
                        style={{ marginRight: 8 }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this file?"
                        onConfirm={() => handleDelete(fileId)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
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
            
            <Modal
                title="Edit Document Name"
                visible={!!editingFile}
                onOk={handleUpdate}
                onCancel={() => setEditingFile(null)}
                okText="Update"
                cancelText="Cancel"
            >
                <Input
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                    placeholder="Enter new document name"
                />
            </Modal>
        </div>
    );
};
export default ViewUploadResource;