import Mock from 'mockjs'
import homeApi from './mockServeData/home'
import userApi from './mockServeData/user'
//攔截接口
Mock.mock(/home\/getData/, homeApi.getStatisticalData)
//post要標名
Mock.mock(/user\/getUser/, 'get', userApi.getUserList)
//新增和編輯用post
Mock.mock(/user\/addUser/, 'post', userApi.createUser)
Mock.mock(/user\/editUser/, 'post', userApi.updateUser)
Mock.mock(/user\/delUser/, 'post', userApi.deleteUser)