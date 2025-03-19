const routes = [
    {
        path: '/home',
        name: 'home',
        label: 'Home',
        icon: 'HomeOutlined',
        url: '/home/index'
    },
    {
        path: '/recommendation',
        name: 'recommendation',
        label: 'Recommendation',
        icon: 'ReadOutlined',
        url: '/recommendation/index'
    },
    {
        path: '/uploadResource',
        name: 'uploadResource',
        label: 'Upload Resource',
        icon: 'UploadOutlined',
        url: '/uploadResource/index'
    },
    {
        path: '/viewUploadResource',
        name: 'viewUploadResource',
        label: 'View Upload Resource',
        icon: 'EyeOutlined',
        url: '/viewUploadResource/index'
    },
    // {
    //     path: '/resource',
    //     name: 'resource',
    //     label: 'Resource',
    //     icon: 'FolderOpenOutlined',
    //     url: '/resource/index'
    // },
    {
        path: '/aiConclusion',
        name: 'aiConclusion',
        label: 'AiConclusion',
        icon: 'SolutionOutlined',
        url: '/aiConclusion/index'
    }, 
    {
        path: '/other',
        label: 'Admin',
        icon: 'SettingOutlined',
        children: [
            {
                path: '/other/graphicalStatistics',
                name: 'graphicalStatistics',
                label: 'Graphical Statistics',
                icon: 'BarChartOutlined',
            },
            {
                path: '/other/review',
                name: 'review',
                label: 'Review',
                icon: 'FundViewOutlined',
            }
        ]
    }
];

export default routes;
