import User from "../User";

interface UserLoginRequest{
    user:User,
    token:string,
};

export default UserLoginRequest;