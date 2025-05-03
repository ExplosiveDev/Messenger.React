import axios from "axios";


export const UploadMediaService = async (token:string, formData:FormData): Promise<string> => {
    const response = await axios.post(
        `http://192.168.0.100:5187/Files/Upload`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data.id as string;
}