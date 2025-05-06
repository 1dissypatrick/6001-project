import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { message } from 'antd';

const useSearchResult = () => {
    const location = useLocation();
    const [checkedList, setCheckedList] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedPageSize, setSelectedPageSize] = useState('20');
    const [selectedSort, setSelectedSort] = useState('Date Added Desc');
    const [fileData, setFileData] = useState([]);
    const [originalFileData, setOriginalFileData] = useState([]);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [clickCounts, setClickCounts] = useState({
        subjects: {},
        educationLevels: {},
        materialTypes: {},
    });
    const username = localStorage.getItem('username');

    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5001/files?all=true');
            setFileData(data.files);
            setOriginalFileData(data.files);
            if (location.state) applyFilters(location.state, data.files);
        } catch (error) {
            message.error('Error fetching resources.');
        } finally {
            setLoading(false);
        }
    }, [location.state]);

    const fetchUserClicks = useCallback(async () => {
        if (!username) return;
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
    }, [username]);

    useEffect(() => {
        fetchFiles();
        fetchUserClicks();
    }, [fetchFiles, fetchUserClicks]);

    const applyFilters = (filters, files) => {
        let filteredFiles = files;
        if (filters.keyword) {
            filteredFiles = filteredFiles.filter(file => 
                file.documentName?.toLowerCase().includes(filters.keyword.toLowerCase())
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

    const applyCombinedFilters = (subjects, level, files) => {
        let filteredFiles = files;
        if (subjects.length > 0) {
            filteredFiles = filteredFiles.filter(file =>
                subjects.some(subject => file.subjects?.includes(subject))
            );
        }
        if (level) {
            filteredFiles = filteredFiles.filter(
                file => file.educationLevel === level
            );
        }
        return filteredFiles;
    };

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

    const handleFileOpen = (file) => {
        handleUserClick('subjects', file.subjects?.[0]);
        handleUserClick('educationLevels', file.educationLevel);
        handleUserClick('materialTypes', file.materialTypes?.[0]);
    };

    const onSearch = (value) => {
        setCheckedList([]);
        setSelectedLevel('');
        if (!value) return setFileData(originalFileData);
        const keyword = value.toLowerCase();
        const filteredFiles = originalFileData
            .filter(file => {
                return file.documentName && file.documentName.toLowerCase().includes(keyword);
            })
            .sort((a, b) => {
                const aIndex = a.documentName.toLowerCase().indexOf(keyword);
                const bIndex = b.documentName.toLowerCase().indexOf(keyword);
                return aIndex - bIndex;
            });
        setFileData(filteredFiles);
    };

    const onChange = (list) => {
        const addedSubjects = list.filter(subject => !checkedList.includes(subject));
        addedSubjects.forEach(subject => handleUserClick('subjects', subject));
        
        setCheckedList(list);
        const filteredFiles = applyCombinedFilters(list, selectedLevel, originalFileData);
        setFileData(filteredFiles);
    };

    const handleMenuClick = (level) => {
        if (level && level !== selectedLevel) {
            handleUserClick('educationLevels', level);
        }
        
        setSelectedLevel(level);
        const filteredFiles = applyCombinedFilters(checkedList, level, originalFileData);
        setFileData(filteredFiles);
    };

    const handlePageSize = (size) => setSelectedPageSize(size);

    const handleSort = (sort) => setSelectedSort(sort);

    const getSortedFiles = useCallback((files) => {
        return [...files].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return selectedSort === 'Date Added Desc' ? dateB - dateA : dateA - dateB;
        });
    }, [selectedSort]);

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
        loading,
        onSearch,
        onChange,
        handleMenuClick,
        handlePageSize,
        handleSort,
        handleRateChange,
        handleFileOpen,
        getSortedFiles,
    };
};

export default useSearchResult;