import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { message } from 'antd';

const useSearchResult = () => {
    const location = useLocation();
    const [checkedList, setCheckedList] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedPageSize, setSelectedPageSize] = useState('20');
    const [selectedSort, setSelectedSort] = useState('Title');
    const [fileData, setFileData] = useState([]);
    const [originalFileData, setOriginalFileData] = useState([]);

    const fetchFiles = useCallback(async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/files?all=true');
            setFileData(data.files);
            setOriginalFileData(data.files);
            if (location.state) applyFilters(location.state, data.files);
        } catch (error) {
            message.error('Error fetching resources.');
        }
    }, [location.state]);

    const applyFilters = (filters, files) => {
        let filteredFiles = files;
        if (filters.keyword) {
            filteredFiles = filteredFiles.filter(file => 
                file.fileName.toLowerCase().includes(filters.keyword.toLowerCase())
            );
        }
        if (filters.subjects?.length > 0) {
            filteredFiles = filteredFiles.filter(file =>
                filters.subjects.some(subject => file.subjects?.includes(subject))
            );
        }
        if (filters.educationLevel) {
            filteredFiles = filteredFiles.filter(
                file => file.educationLevel === filters.educationLevel
            );
        }
        setFileData(filteredFiles);
    };

    useEffect(() => { fetchFiles() }, [fetchFiles]);

    const onSearch = (value) => {
        // Reset filters
        setCheckedList([]);
        setSelectedLevel('');
        
        if (!value) return setFileData(originalFileData);
        
        const keyword = value.toLowerCase();
        const filteredFiles = originalFileData
            .filter(file => {
                // Only search in documentName
                return file.documentName && file.documentName.toLowerCase().includes(keyword);
            })
            .sort((a, b) => {
                // Simple sort by documentName match position
                const aIndex = a.documentName.toLowerCase().indexOf(keyword);
                const bIndex = b.documentName.toLowerCase().indexOf(keyword);
                
                // Earlier matches appear first
                return aIndex - bIndex;
            });
        setFileData(filteredFiles);
    };

    const onChange = (list) => {
        setCheckedList(list);
        const filteredFiles = list.length === 0 ? originalFileData : 
            originalFileData.filter(file => 
                list.some(subject => file.subjects?.includes(subject))
            ).sort((a, b) => 
                list.every(s => a.subjects?.includes(s)) ? -1 : 1
            );
        setFileData(filteredFiles);
    };

    const handleMenuClick = (level) => {
        setSelectedLevel(level);
        setFileData(level ? 
            originalFileData.filter(file => file.educationLevel === level) : 
            originalFileData
        );
    };

    const handlePageSize = (size) => setSelectedPageSize(size);
    const handleSort = (sort) => setSelectedSort(sort);
    
    const handleRateChange = (value, index) => {
        const updatedFiles = [...fileData];
        updatedFiles[index].rating = value;
        setFileData(updatedFiles);
    };

    return {
        checkedList,
        selectedLevel,
        selectedPageSize,
        selectedSort,
        fileData,
        onSearch,
        onChange,
        handleMenuClick,
        handlePageSize,
        handleSort,
        handleRateChange
    };
};

export default useSearchResult;