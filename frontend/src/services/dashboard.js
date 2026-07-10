import api from './api';


export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data
    }
    catch(e){
        console.error('Erros fetching dashboard stats:', e)
        throw e;
    }
};