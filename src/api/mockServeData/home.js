import Mock from 'mockjs';

let List = [];

export default {
    getStatisticalData: () => {
        for (let i = 0; i < 10; i++) {
            List.push({
                Apple: Mock.Random.float(100, 8000, 0, 0),
                vivo: Mock.Random.float(100, 8000, 0, 0)
            });
        }

        return {
            code: 20000,
            data: {
                videoData: [
                    {
                        name: 'Apple',
                        value: 2999
                    },
                    {
                        name: 'vivo',
                        value: 5999
                    }
                ],
                userData:[
                    {
                        date: '周一',
                        new: 5,
                        active:200
                    },
                    {
                        date: '周二',
                        new: 10,
                        active:500
                    }
                ],
                orderData:{
                    date:['20191001','20191002'],
                    data:List
                },
                tableData:[
                    {
                        name:'Apple',
                        todayBuy:500,
                        monthBuy:3500,
                        totalBuy:22000
                    },
                    {
                        name:'vivo',
                        todayBuy:300,
                        monthBuy:200,
                        totalBuy:24000
                    }
                ]
            }
        };
    }
};