import axios from "../../axios/axios";

export const fetchNotes = async(params = {})=>{
    try {
        const res = await axios.get("/notes", { params });
        return res.data
    } catch (error) {
        console.log(error);
    }
}
export const createNotes = async(data)=>{
    try {
        const res = await axios.post("/notes", data);
        return res.data
    } catch (error) {
        console.log(error);
    }
}

export const deleteNote = async(id)=>{
    try {
        const res = await axios.delete(`/notes/delete/${id}`);
        return res.data
    } catch (error) {
        console.log(error);
    }

}
export const updateNote = async(id, data)=>{
   try {
        const res = await axios.patch(`/notes/update/${id}`, data);
        return res.data
    } catch (error) {
        console.log(error);
    }

}
export const searchNotes = async(query, params = {})=>{
    try {
        const res = await axios.get("/notes/search", {
            params: { q: query, ...params },
        });
        return res.data
    } catch (error) {
        console.log(error);
    }
}

export const createShareLink = async(noteId)=>{
    try {
        const res = await axios.post("/shares", { noteId });
        return res.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getSharedNote = async(token)=>{
    try {
        const res = await axios.get(`/shares/${token}`);
        return res.data
    } catch (error) {
        console.log(error);
    }
}

export const joinShare = async(token)=>{
    try {
        const res = await axios.post(`/shares/${token}/join`);
        return res.data
    } catch (error) {
        console.log(error);
    }
}
