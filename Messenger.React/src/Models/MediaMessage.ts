import myFile from "./File";
import Message from "./Message";


interface MediaMessage extends Message{
    content:myFile[],
    caption:string,
    mediaType:string
}

export default MediaMessage