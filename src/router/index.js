//下載createBrowserRouter用npm i react-router-dom@6.22.2
//createBrowserRouter作為router去寫路徑和子路徑
//Navigate 重定向
import{createBrowserRouter, Navigate} from 'react-router-dom'
//import function 
import Main from '../pages/main'
import Home from '../pages/home'
import Recommendation from '../pages/recommendation/click-base'
import UploadResource from '../pages/uploadResource'
import Review from '../pages/other/review'
import Login from '../pages/login'
import Resource from '../pages/resource'
import Register from '../pages/register'
import Notification from '../pages/notification'
import SearchResult from '../pages/searchResult'
import ViewUploadResource from '../pages/viewUploadResource'
import AiConclusion from '../pages/aiConclusion/gemini-2.0'

const routes = [
    {
        path:'/',
        Component:Main,
        children:[
            {
                //重定向/后default的page
                path:'/',
                element:<Navigate to="home" replace/>
            },
            {
                path:'home',
                Component:Home
            },
            {
                path:'recommendation',
                Component:Recommendation
            },
            {
                path:'uploadResource',
                Component:UploadResource
            },
            {
                path:'viewUploadResource',
                Component:ViewUploadResource
            },
            {
                path:'resource',
                Component:Resource
            },
            {
                path:'aiConclusion',
                Component:AiConclusion
            },
            {
                path:'other',
                children:[
                    
                    {
                        path:'review',
                        Component:Review
                    }
                ]
            }
        ]
    },
    {
        path: '/notification',
        Component:Notification
     },
    {
       path: '/login',
       Component:Login
    },
    {
        path: '/register',
        Component:Register
    },
    {
        path: '/searchResult',
        Component:SearchResult
    }
    
]

export default createBrowserRouter(routes)