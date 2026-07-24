import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
axios.defaults.withCredentials = true

let refreshPromise = null

const refreshAccessToken = async () => {
     console.log("REFRESH TOKEN API CALLED");
    if (!refreshPromise) {
        refreshPromise = axios.post('/api/v1/users/refresh-token')
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
    
}

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
         console.log("INTERCEPTOR HIT");
        console.log(error.config.url);
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/api/v1/users/login') &&
            !originalRequest.url?.includes('/api/v1/users/register') &&
            !originalRequest.url?.includes('/api/v1/users/refresh-token')
        ) {
            originalRequest._retry = true
            try {
                await refreshAccessToken()
                return axios(originalRequest)
            } catch (refreshError) {
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export const AppContext = createContext()

export const AppProvider = ({ children })=>{

    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const location = useLocation()
    const navigate = useNavigate()

    const fetchCurrentUser = async ()=>{
        try {
            const { data } = await axios.get('/api/v1/users/current-user')
            if(data.success){
                setUser(data.data)
            }else{
                setUser(null)
            }
        } catch (error) {
            setUser(null)
        } finally {
            setAuthLoading(false)
        }
    }

    const login = async ({ email, username, password })=>{
        const { data } = await axios.post('/api/v1/users/login', { email, username, password })
        if(data.success){
            setUser(data.data.user)
            toast.success(data.message || "Logged in successfully")
            return data.data.user
        }
        throw new Error(data.message || "Login failed")
    }

    const register = async (formData)=>{
        const { data } = await axios.post('/api/v1/users/register', formData)
        if(data.success){
            toast.success(data.message || "Registered successfully")
            return data.data
        }
        throw new Error(data.message || "Registration failed")
    }

    const logout = async ()=>{
        try {
            await axios.post('/api/v1/users/logout')
        } catch (error) {
            console.error(error)
        } finally {
            setUser(null)
            setIsAdmin(false)
            setFavoriteMovies([])
            toast.success("Logged out successfully")
            navigate('/')
        }
    }

    const fetchIsAdmin = async ()=>{
        try {
            const {data} = await axios.get('/api/admin/is-admin')
            setIsAdmin(!!data.isAdmin)

            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            setIsAdmin(false)
            console.error(error)
        }
    }

    const fetchShows = async ()=>{
        try {
            const { data } = await axios.get('/api/show/all')
            if(data.success){
                setShows(data.shows)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchFavoriteMovies = async ()=>{
        try {
            const { data } = await axios.get('/api/user/favorites')

            if(data.success){
                setFavoriteMovies(data.movies)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchCurrentUser()
        fetchShows()
    },[])

    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        }else{
            setIsAdmin(false)
            setFavoriteMovies([])
        }
    },[user])

    const value = {
        axios,
        fetchIsAdmin,
        user,
        setUser,
        authLoading,
        login,
        register,
        logout,
        navigate,
        isAdmin,
        shows, 
        favoriteMovies,
        fetchFavoriteMovies,
        image_base_url
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)
