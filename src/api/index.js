// 接口
import http from './axious'

export const getData = () =>{
    return http.request({
        url:'/home/getData',
        method:'get',
    })
}

export const getUser = (params) =>{
    return http.request({
        //mock 
        url: '/user/getUser',
        method: 'get',
        params
    })
}

export const addUser = (data) =>{
    return http.request({
        //mock 
        url: '/user/addUser',
        method: 'post',
        data
    })
}

export const editUser = (data) =>{
    return http.request({
        //mock 
        url: '/user/editUser',
        method: 'post',
        data
    })
}

export const delUser = (data) =>{
    return http.request({
        //mock 
        url: '/user/delUser',
        method: 'post',
        data
    })
}