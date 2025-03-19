import{createSlice} from '@reduxjs/toolkit'

const tabSlice = createSlice({
    name:'tab',
    initialState:{
        isCollapse:false,
        tabList:[
            {
                path: '/',
                name: 'home',
                label: 'Home'
            }
        ]
    },
    reducers:{
        collapseMenu: state =>{
            state.isCollapse = !state.isCollapse
        },
        selectMenuList:(state,{payload:val}) =>{
            if(val.name !== 'home'){
                //
                const result = state.tabList.findIndex(item => item.name === val.name)
                if(result === -1){
                state.tabList.push(val)
                }
            }
        }
    
    }
})

//通過調用reducers去修改 
export const{collapseMenu,selectMenuList} = tabSlice.actions
export default tabSlice.reducer